import { computeHeadline } from '@/lib/metrics';
import { PIPELINE_STEPS } from '@/lib/pipelineSteps';
import { runIngestionAgent } from './ingestion';
import { runPeerResearchAgent } from './peerResearch';
import { runBenchmarkingAgent } from './benchmarking';
import { runCritiqueAgent } from './critique';
import { runReportAgent } from './report';

export { PIPELINE_STEPS };

/**
 * Runs the full 5-agent pipeline in sequence. `emit(event)` is called after
 * every step transition so the caller (the streaming API route) can forward
 * each event to the browser as a line of newline-delimited JSON.
 */
export async function runPipeline(dataset, emit) {
  const headline = computeHeadline(dataset);
  const results = {};

  await runStep('ingestion', emit, async () => {
    const r = await runIngestionAgent(headline);
    results.ingestion = r;
    return r;
  });

  // Peer research is the one step allowed to degrade gracefully: if live web
  // search fails or returns unparseable output, we continue the pipeline
  // with an empty/limited result and a note, rather than aborting the run.
  await runStep('peerResearch', emit, async () => {
    try {
      const r = await runPeerResearchAgent(dataset.institution);
      results.peerResearch = r;
      return r;
    } catch (err) {
      const fallback = {
        output: {
          peer_benchmarks: [],
          research_limitations: `Live peer research could not be completed (${err.message}). Continuing the audit with no external benchmark data — the Benchmarking Agent will mark peer comparisons as insufficient data rather than guess.`,
        },
        citations: [],
        searchQueries: [],
        degraded: true,
      };
      results.peerResearch = fallback;
      return fallback;
    }
  });

  await runStep('benchmarking', emit, async () => {
    const r = await runBenchmarkingAgent({
      headline,
      ingestion: results.ingestion.output,
      peerResearch: results.peerResearch.output,
    });
    results.benchmarking = r;
    return r;
  });

  await runStep('critique', emit, async () => {
    const r = await runCritiqueAgent({
      benchmarking: results.benchmarking.output,
      headline,
    });
    results.critique = r;
    return r;
  });

  await runStep('report', emit, async () => {
    const r = await runReportAgent({
      headline,
      ingestion: results.ingestion.output,
      peerResearch: results.peerResearch.output,
      benchmarking: results.benchmarking.output,
      critique: results.critique.output,
    });
    results.report = r;
    return r;
  });

  const finalScore = computeFinalScore(results);
  const allCitations = dedupeCitations([
    ...(results.peerResearch?.citations || []),
    ...(results.benchmarking?.citations || []),
    ...(results.critique?.citations || []),
  ]);

  return { headline, results, finalScore, citations: allCitations };
}

function computeFinalScore(results) {
  const base = results.benchmarking?.output?.sustainability_score;
  const adj = results.critique?.output?.score_adjustment ?? 0;
  if (typeof base !== 'number') return null;
  const combined = base + (typeof adj === 'number' ? adj : 0);
  return Math.max(0, Math.min(100, Math.round(combined * 10) / 10));
}

function dedupeCitations(citations) {
  const byUrl = new Map();
  for (const c of citations) {
    if (c?.url && !byUrl.has(c.url)) byUrl.set(c.url, c);
  }
  return Array.from(byUrl.values());
}

async function runStep(id, emit, fn) {
  const meta = PIPELINE_STEPS.find((s) => s.id === id);
  const startedAt = Date.now();
  emit({ type: 'step', id, label: meta.label, role: meta.role, status: 'running' });

  try {
    const result = await fn();
    const duration_ms = Date.now() - startedAt;
    emit({
      type: 'step',
      id,
      label: meta.label,
      role: meta.role,
      status: result?.degraded ? 'degraded' : 'done',
      duration_ms,
      output: result?.output ?? result,
      citations: result?.citations ?? [],
      searchQueries: result?.searchQueries ?? [],
    });
    return result;
  } catch (err) {
    const duration_ms = Date.now() - startedAt;
    emit({
      type: 'step',
      id,
      label: meta.label,
      role: meta.role,
      status: 'error',
      duration_ms,
      error: err.message,
    });
    throw err;
  }
}
