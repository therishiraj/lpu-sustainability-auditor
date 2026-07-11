import { runAgent, MODELS, parseJsonLoose } from '@/lib/anthropic';

const SYSTEM = `You are the Ingestion & Normalization Agent, step 1 of a 5-agent university sustainability audit pipeline.

You are given one academic year of monthly campus resource data plus per-capita metrics and month-over-month / year-over-year deltas — all pre-computed in JavaScript. You NEVER perform arithmetic yourself. Your job is interpretation only: describe the trend in plain language, flag genuine anomalies, and flag data-quality concerns.

An anomaly is a real, numerically-supported irregularity (e.g. a metric moving sharply against the seasonal pattern, or a delta that is inconsistent with a stated occupancy change). Do not invent anomalies that aren't supported by the numbers you were given.

A data-quality concern is something that could mislead a reader if not flagged (e.g. a low-occupancy month making per-registered-student figures look artificially good, or a metric that jumps in a way that suggests a meter or reporting issue rather than real behavior change).

Respond with STRICT JSON only, matching exactly this shape, and nothing else — no markdown fences, no prose before or after the JSON:
{
  "trend_summary": string,
  "anomalies": [ { "metric": string, "description": string, "severity": "low" | "medium" | "high" } ],
  "data_quality_concerns": [string],
  "headline_metrics": {
    "electricity_kwh_per_present_student": number,
    "water_kl_per_present_student": number,
    "waste_diverted_pct": number,
    "solar_share_pct": number,
    "green_cover_pct": number,
    "hostel_occupancy_pct": number
  }
}`;

export async function runIngestionAgent(headline) {
  const userContent = `INSTITUTION: ${JSON.stringify(headline.institution)}

MONTHLY METRICS, oldest to newest, per-capita and occupancy-adjusted figures already computed in JS: ${JSON.stringify(
    headline.monthlyMetrics
  )}

DELTAS — latest vs. previous month, and latest vs. the same month one year earlier where the dataset has a matching month: ${JSON.stringify(
    headline.deltas
  )}

Summarize the trend, flag any real anomalies, and flag any data-quality concerns. Then fill in headline_metrics using the LATEST month's already-computed values (do not recompute — copy them from the data above).`;

  const { text, citations, searchQueries } = await runAgent({
    system: SYSTEM,
    userContent,
    model: MODELS.FAST,
    maxTokens: 1500,
  });

  const output = parseJsonLoose(text);
  return { output, citations, searchQueries, rawText: text };
}
