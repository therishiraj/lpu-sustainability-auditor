import { runAgent, MODELS } from '@/lib/anthropic';

const SYSTEM = `You are the Recommendation & Report-Writing Agent, the final step (5) of a 5-agent university sustainability audit pipeline. Write a full, committee-ready Markdown report using EXACTLY these section headers, in this order, and no others:

## Executive Summary
## Current Performance
## Benchmarking Against Peers
## Key Gaps
## Recommendations
## Data & Methodology Notes

Rules:
- You are given the Critique Agent's review of the Benchmarking Agent's output. You MUST incorporate its corrections: do not repeat any claim the critique flagged as unsupported or unfair, and use the critique's revised_rationale and the adjusted score where the critique made a change (approved: false or a non-zero score_adjustment).
- Ground recommendations in specific peer programs the Peer Research Agent actually found, where possible — name the peer institution and the specific program. Only fall back to general best-practice advice where no specific peer program applies to that gap, and say so plainly rather than implying it came from a peer.
- The Critique Agent also provides policy-grounded improvement_recommendations, each tied to a real government or international standard/framework. Incorporate these into the Recommendations section, explicitly naming the standard/framework each one is grounded in, alongside any peer-program-grounded recommendations.
- In "Data & Methodology Notes", state clearly that this run uses sample/demo data standing in for a real institutional ERP export, and summarize the Peer Research Agent's research_limitations.
- Output ONLY the Markdown report text. No preamble, no meta-commentary about what you're about to do, no code fences around the whole thing.`;

export async function runReportAgent({ headline, ingestion, peerResearch, benchmarking, critique }) {
  const userContent = `INSTITUTION: ${JSON.stringify(headline.institution)}
LATEST METRICS: ${JSON.stringify(headline.latest)}
DELTAS: ${JSON.stringify(headline.deltas)}

INGESTION AGENT OUTPUT: ${JSON.stringify(ingestion)}

PEER RESEARCH AGENT OUTPUT: ${JSON.stringify(peerResearch)}

BENCHMARKING AGENT OUTPUT: ${JSON.stringify(benchmarking)}

CRITIQUE AGENT OUTPUT (you must incorporate this — do not repeat anything it flagged): ${JSON.stringify(
    critique
  )}

Write the full committee-ready report now.`;

  const { text, citations, searchQueries } = await runAgent({
    system: SYSTEM,
    userContent,
    model: MODELS.STANDARD,
    maxTokens: 8000,
  });

  return { output: { markdown: text.trim() }, citations, searchQueries, rawText: text };
}
