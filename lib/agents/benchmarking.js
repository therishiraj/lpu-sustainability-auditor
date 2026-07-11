import { runAgent, MODELS, parseJsonLoose } from '@/lib/anthropic';

const SYSTEM = `You are the Benchmarking & Gap Analysis Agent, step 3 of a 5-agent university sustainability audit pipeline.

You are given the target institution's normalized metrics (from the Ingestion Agent) and real peer research findings (from the Peer Research Agent). Produce a per-metric comparison, a strengths list, a gaps list, an overall sustainability_score (0-100), and a rationale for that score.

Reason carefully about fairness before scoring:
- A low-occupancy month (e.g. a semester break) makes per-registered-student water/electricity figures look artificially good and per-present-student figures more meaningful — prefer the occupancy-adjusted ("per_present_student") figures when judging efficiency, and say so explicitly when it changes your read.
- Where the Peer Research Agent found no verifiable number for a metric at a given peer, or only found information about an aspirational global leader rather than a true peer, mark that specific comparison "insufficient_data" rather than guessing a number or treating the aspirational leader as if it were a fair peer.
- Do not present a peer's general reputation or mission-statement language as if it were a quantified result.

Respond with STRICT JSON only, matching exactly this shape, and nothing else — no markdown fences, no prose before or after the JSON:
{
  "comparisons": [
    { "metric": string, "lpu_value": string, "peer_comparison": "ahead" | "behind" | "comparable" | "insufficient_data", "reasoning": string }
  ],
  "strengths": [string],
  "gaps": [string],
  "sustainability_score": number,
  "score_rationale": string
}`;

export async function runBenchmarkingAgent({ headline, ingestion, peerResearch }) {
  const userContent = `LPU LATEST-MONTH SNAPSHOT (occupancy-adjusted per-capita figures included): ${JSON.stringify(
    headline.latest
  )}

DELTAS: ${JSON.stringify(headline.deltas)}

INGESTION AGENT FINDINGS (trend summary, anomalies, data-quality concerns): ${JSON.stringify(ingestion)}

PEER RESEARCH AGENT FINDINGS (real, web-sourced): ${JSON.stringify(peerResearch)}

Produce the per-metric comparison, strengths, gaps, an overall sustainability_score from 0-100, and a rationale. Be explicit in your reasoning about which comparisons rest on solid peer data versus which are insufficient_data, and about how occupancy affects fairness of the comparison where relevant.`;

  const { text, citations, searchQueries } = await runAgent({
    system: SYSTEM,
    userContent,
    model: MODELS.STANDARD,
    maxTokens: 3000,
  });

  const output = parseJsonLoose(text);
  return { output, citations, searchQueries, rawText: text };
}
