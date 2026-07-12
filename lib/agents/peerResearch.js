import { runAgent, MODELS, parseJsonLoose } from '@/lib/anthropic';
import { getCachedPeerInstitution, setCachedPeerInstitution } from '@/lib/cache';
import { PEER_CANDIDATES } from '@/lib/peer-candidates';

const BATCH_SIZE = 4;

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const SYSTEM = `You are the Peer Research Agent, step 2 of a 5-agent university sustainability audit pipeline. You have access to a real, live web_search tool — use it, more than once.
You will be given a fixed list of named institutions to research. Research ONLY the institutions given to you in this request — do not substitute or add others.
For each one, find REAL, CURRENT, PUBLIC sustainability disclosures or programs: electricity, water, waste diversion, green cover, solar generation, or an overall sustainability ranking/report (e.g. UI GreenMetric, NIRF).
Rules:
- Only report facts you actually found via search. Do not fabricate precise numbers you did not verify.
- If you could not verify a specific metric for an institution, omit it from verified_metrics rather than guessing.
- Prefer official university sustainability reports, sustainability office pages, or reputable ranking bodies over blogs or aggregators.
- Issue a distinct search for each institution in the list — do not stop after one query.
- Return the real URLs you used as source_urls.
Respond with STRICT JSON only, matching exactly this shape, and nothing else — no markdown fences, no prose before or after the JSON:
{
  "peer_benchmarks": [
    {
      "institution": string,
      "summary": string,
      "programs": [ { "name": string, "description": string } ],
      "source_urls": [string],
      "verified_metrics": [ { "metric": string, "value": number, "unit": string, "source_url": string } ]
    }
  ],
  "research_limitations": string
}`;

async function researchBatch(batch) {
  const userContent = `Research real, current, public sustainability disclosures for EXACTLY these institutions, one entry each:
${batch.map((b, i) => `${i + 1}. ${b.name}`).join('\n')}
For each, search for their sustainability report, sustainability office page, or ranking data. Note specific named programs where found, and extract any verifiable numeric metrics (electricity, water, waste diversion, solar share, green cover) with real source URLs. If you cannot verify a number for an institution, do not include it — do not guess.`;

  const { text, citations, searchQueries } = await runAgent({
    system: SYSTEM,
    userContent,
    model: MODELS.STANDARD,
    useWebSearch: true,
    maxSearches: 8,
    maxTokens: 6000, // smaller batches need less headroom per call than one giant 15-institution call
  });
  const output = parseJsonLoose(text);
  return { output, citations, searchQueries };
}

export async function runPeerResearchAgent() {
  const toResearch = [];
  const cachedResults = [];

  for (const candidate of PEER_CANDIDATES) {
    const cached = await getCachedPeerInstitution(candidate.name);
    if (cached) {
      cachedResults.push(cached);
    } else {
      toResearch.push(candidate);
    }
  }

  const freshResults = [];
  const allCitations = [];
  const allSearchQueries = [];
  const limitationsNotes = [];

  for (const batch of chunk(toResearch, BATCH_SIZE)) {
    try {
      const { output, citations, searchQueries } = await researchBatch(batch);
      allCitations.push(...citations);
      allSearchQueries.push(...searchQueries);
      if (output.research_limitations) limitationsNotes.push(output.research_limitations);

      for (const entry of output.peer_benchmarks || []) {
        const match = batch.find(
          (b) => b.name.toLowerCase() === (entry.institution || '').toLowerCase()
        );
        const enriched = { ...entry, type: match?.type || 'comparable' };
        freshResults.push(enriched);
        await setCachedPeerInstitution(enriched.institution, enriched);
      }
    } catch (err) {
      console.warn('Peer research batch failed:', batch.map((b) => b.name), err);
      limitationsNotes.push(
  `Could not retrieve verified data for: ${batch.map((b) => b.name).join(', ')} (${err?.message || 'unknown research error'}).`
);
    }
  }

  const peer_benchmarks = [...cachedResults, ...freshResults];

  return {
    output: {
      peer_benchmarks,
      research_limitations: limitationsNotes.length
        ? limitationsNotes.join(' ')
        : 'All candidate peer institutions were successfully researched.',
    },
    citations: allCitations,
    searchQueries: allSearchQueries,
    rawText: JSON.stringify({ peer_benchmarks }, null, 2),
    fromCache: toResearch.length === 0,
  };
}
