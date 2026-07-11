import { runAgent, MODELS, parseJsonLoose } from '@/lib/anthropic';

const SYSTEM = `You are the Peer Research Agent, step 2 of a 5-agent university sustainability audit pipeline. You have access to a real, live web_search tool — use it, more than once.

Your job is to find REAL, CURRENT, PUBLIC sustainability disclosures or programs from universities that are genuinely comparable to the target institution (similar scale, similar country/region context, or otherwise defensible peers), plus 1-2 aspirational global sustainability leaders — clearly labeled as aspirational, not treated as peers.

Rules:
- Only report facts you actually found via search. Do not fabricate precise numbers (exact kWh, exact percentages, exact rankings) that you did not verify in a search result.
- If you could not verify something, say so plainly in "research_limitations" rather than guessing or rounding a vague claim into a false-precision number.
- Prefer official university sustainability reports, sustainability office pages, or reputable ranking bodies (e.g. UI GreenMetric, QS/THE sustainability rankings) over blogs, aggregators, or forum posts.
- Issue several distinct searches covering different candidate peer institutions — do not stop after one query.
- Return the real URLs you used as source_urls.

Respond with STRICT JSON only, matching exactly this shape, and nothing else — no markdown fences, no prose before or after the JSON:
{
  "peer_benchmarks": [
    {
      "institution": string,
      "type": "comparable" | "aspirational_global_leader",
      "summary": string,
      "programs": [ { "name": string, "description": string } ],
      "source_urls": [string]
    }
  ],
  "research_limitations": string
}`;

export async function runPeerResearchAgent(institution) {
  const userContent = `Target institution: ${institution.name}, located in ${institution.location}, approximately ${institution.student_population} students, ${institution.campus_area_acres}-acre campus.

Find 3-5 genuinely comparable universities (similar scale and/or region — large multidisciplinary Indian or South Asian universities are reasonable candidates, but use your own judgment about what counts as a fair comparison) with real public sustainability disclosures covering things like electricity, water, waste diversion, green cover, solar generation, or an overall sustainability ranking/report. Add 1-2 aspirational global sustainability leader universities known for strong, well-documented sustainability programs, clearly labeled as aspirational rather than peers.

For each institution, note specific named programs or disclosures where you actually found them, and return the real source URLs.`;

  const { text, citations, searchQueries } = await runAgent({
    system: SYSTEM,
    userContent,
    model: MODELS.STANDARD,
    useWebSearch: true,
    maxSearches: 8,
    maxTokens: 8000,
  });

  const output = parseJsonLoose(text);
  return { output, citations, searchQueries, rawText: text };
}
