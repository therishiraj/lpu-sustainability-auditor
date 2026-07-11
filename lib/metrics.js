/**
 * Deterministic metrics module.
 *
 * Every number an agent reasons about — per-capita figures, month-over-month
 * deltas, year-over-year deltas — is computed here in plain JavaScript.
 * Agents never do arithmetic; they receive these numbers pre-computed and are
 * only asked to interpret them. This file is effectively the "tool" the
 * Ingestion Agent calls before it ever talks to the model.
 */

function round(value, decimals) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function safeDiv(numerator, denominator) {
  if (!denominator) return null;
  return numerator / denominator;
}

function pctDelta(from, to) {
  if (from === null || from === undefined || to === null || to === undefined) return null;
  if (from === 0) return null;
  return round(((to - from) / Math.abs(from)) * 100, 2);
}

function shiftMonth(monthStr, offset) {
  const [year, month] = monthStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + offset, 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function monthLabel(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  return `${MONTH_LABELS[month - 1]} '${String(year).slice(2)}`;
}

/**
 * Adds per-capita and occupancy-adjusted per-capita fields to every monthly
 * record. "Present population" accounts for hostel occupancy swings (break
 * months vs. full-semester months) so the Benchmarking Agent has a fairer
 * denominator available than raw enrolled headcount.
 */
export function deriveMonthlyMetrics(dataset) {
  const { student_population, hostel_capacity } = dataset.institution;
  const dayScholars = Math.max(student_population - hostel_capacity, 0);

  return dataset.monthly.map((m) => {
    const presentPopulation = Math.round(
      (hostel_capacity * m.hostel_occupancy_pct) / 100 + dayScholars
    );
    const solarSharePct = round(safeDiv(m.solar_generation_kwh, m.electricity_kwh) * 100, 2);
    const wasteDivertedKg = round((m.waste_kg * m.waste_diverted_pct) / 100, 0);

    return {
      ...m,
      label: monthLabel(m.month),
      present_population: presentPopulation,
      electricity_kwh_per_student: round(safeDiv(m.electricity_kwh, student_population), 2),
      electricity_kwh_per_present_student: round(safeDiv(m.electricity_kwh, presentPopulation), 2),
      water_kl_per_student: round(safeDiv(m.water_kl, student_population), 3),
      water_kl_per_present_student: round(safeDiv(m.water_kl, presentPopulation), 3),
      waste_kg_per_student: round(safeDiv(m.waste_kg, student_population), 2),
      waste_kg_per_present_student: round(safeDiv(m.waste_kg, presentPopulation), 2),
      waste_diverted_kg: wasteDivertedKg,
      solar_share_pct: solarSharePct,
    };
  });
}

const DELTA_FIELDS = [
  'electricity_kwh',
  'water_kl',
  'waste_kg',
  'waste_diverted_pct',
  'green_cover_pct',
  'solar_share_pct',
  'hostel_occupancy_pct',
  'electricity_kwh_per_present_student',
  'water_kl_per_present_student',
  'waste_kg_per_present_student',
];

/**
 * Computes month-over-month and (where a matching prior-year month exists in
 * the dataset) year-over-year percentage deltas for the headline fields.
 */
export function computeDeltas(monthlyMetrics) {
  const latest = monthlyMetrics[monthlyMetrics.length - 1];
  const previous = monthlyMetrics.length > 1 ? monthlyMetrics[monthlyMetrics.length - 2] : null;

  const targetYoyMonth = shiftMonth(latest.month, -12);
  const yoy = monthlyMetrics.find((m) => m.month === targetYoyMonth) || null;

  const mom = {};
  const yoyDeltas = {};
  for (const field of DELTA_FIELDS) {
    mom[field] = previous ? pctDelta(previous[field], latest[field]) : null;
    yoyDeltas[field] = yoy ? pctDelta(yoy[field], latest[field]) : null;
  }

  return {
    latestMonth: latest.month,
    previousMonth: previous ? previous.month : null,
    yoyMonth: yoy ? yoy.month : null,
    mom,
    yoy: yoyDeltas,
  };
}

/**
 * Compact headline object: latest snapshot + deltas, the exact shape fed to
 * the Ingestion Agent and used to drive the hero stat strip in the UI.
 */
export function computeHeadline(dataset) {
  const monthlyMetrics = deriveMonthlyMetrics(dataset);
  const deltas = computeDeltas(monthlyMetrics);
  const latest = monthlyMetrics[monthlyMetrics.length - 1];

  return {
    institution: dataset.institution,
    monthlyMetrics,
    deltas,
    latest,
  };
}
