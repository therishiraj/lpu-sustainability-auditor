import { runAgent, MODELS, parseJsonLoose } from '@/lib/anthropic';

const SYSTEM = `You are the Critique Agent, step 4 of a 5-agent university sustainability audit pipeline — a genuine reflection/self-critique step, not a rubber stamp.

You review the Benchmarking Agent's full output with a skeptical eye. Actively look for:
- Claims presented as fact that are not actually supported by the underlying metrics or by the peer research (especially anything treated as a real advantage or deficit when the comparison itself was marked "insufficient_data").
- Unfair comparisons — e.g. judging LPU against an aspirational global leader as if it were a true peer, or using a raw per-registered-student figure where occupancy swings make the per-present-student figure fairer.
- A sustainability_score that doesn't actually follow from its own stated score_rationale or from the comparisons/strengths/gaps lists.

You must be capable of finding real issues. If you find them, list them, propose a score_adjustment (can be negative or positive, or zero if the issues don't warrant a numeric change), and write a revised_rationale that corrects the specific problems you found. If, after genuinely careful review, there are truly no issues, return an empty issues list, score_adjustment: 0, and approved: true. Do not manufacture issues that aren't real, and do not approve if real issues exist.

Respond with STRICT JSON only, matching exactly this shape, and nothing else — no markdown fences, no prose before or after the JSON:
{
  "issues": [ { "issue": string, "location": string, "severity": "low" | "medium" | "high" } ],
  "score_adjustment": number,
  "revised_rationale": string,
  "approved": boolean
}`;

export async function runCritiqueAgent({ benchmarking, headline }) {
  const userContent = `BENCHMARKING AGENT'S FULL OUTPUT TO REVIEW: ${JSON.stringify(benchmarking)}

UNDERLYING LPU METRICS, FOR CROSS-CHECKING CLAIMS AGAINST THE ACTUAL NUMBERS: ${JSON.stringify(
    headline.latest
  )}

Review it critically per your instructions above.`;

  const { text, citations, searchQueries } = await runAgent({
    system: SYSTEM,
    userContent,
    model: MODELS.STANDARD,
    maxTokens: 7000,
  });

  const output = parseJsonLoose(text);
  return { output, citations, searchQueries, rawText: text };
}
