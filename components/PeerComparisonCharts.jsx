'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = { lpu: '#2a78d6', peer: '#6b8f71', muted: '#4a4a42' };

function ChartCard({ title, note, data, unit }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ background: 'var(--surface-1, #14140f)', border: '0.5px solid var(--border, #2a2a22)', borderRadius: 8, padding: 20 }}>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</h4>
      {note && <p style={{ fontSize: 12, color: 'var(--text-secondary, #9a9a8c)', marginBottom: 12 }}>{note}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
          <XAxis type="number" tick={{ fontSize: 11 }} unit={unit ? ` ${unit}` : ''} />
          <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${v.toLocaleString()} ${unit || ''}`} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isLPU ? COLORS.lpu : COLORS.peer} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PeerComparisonCharts({ peerBenchmarks = [], headline }) {
  const solarCapacity = peerBenchmarks
    .flatMap((p) => (p.verified_metrics || []).map((m) => ({ ...m, institution: p.institution })))
    .filter((m) => /capacity/i.test(m.metric) && /kwp|kw$/i.test(m.unit))
    .map((m) => ({ name: m.institution, value: m.value }));

  const solarGeneration = peerBenchmarks
    .flatMap((p) => (p.verified_metrics || []).map((m) => ({ ...m, institution: p.institution })))
    .filter((m) => /generation|saving/i.test(m.metric) && /kwh/i.test(m.unit))
    .map((m) => ({ name: m.institution, value: m.value }));
  if (headline?.latest?.solar_generation_kwh) {
    solarGeneration.push({ name: 'LPU (Aug 2025, monthly)', value: headline.latest.solar_generation_kwh, isLPU: true });
  }

  const waterInfra = peerBenchmarks
    .flatMap((p) => (p.verified_metrics || []).map((m) => ({ ...m, institution: p.institution })))
    .filter((m) => /water|kld|treatment/i.test(m.metric))
    .map((m) => ({ name: `${m.institution} — ${m.metric}`, value: m.value }));

  const statusCounts = { ahead: 0, behind: 0, comparable: 0, insufficient_data: 0 };
  // populate from benchmarking.output.comparisons if passed in — see integration note

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
      <ChartCard
        title="Rooftop Solar Capacity"
        note="Installed capacity as disclosed in each institution's official sustainability/audit report."
        data={solarCapacity}
        unit="kWp"
      />
      <ChartCard
        title="Solar Generation / Savings"
        note="Figures are period-specific — LPU's is a single month (Aug 2025); peer figures are annual. Not a strict apples-to-apples comparison, shown for scale only."
        data={solarGeneration}
        unit="kWh"
      />
      <ChartCard
        title="Water & Wastewater Infrastructure Scale"
        note="Different institutions report different measures (total demand vs. treatment capacity) — see labels."
        data={waterInfra}
        unit="KLD"
      />
      <div style={{ background: 'var(--surface-1, #14140f)', border: '0.5px solid var(--border, #2a2a22)', borderRadius: 8, padding: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Peer Verdict Coverage</h4>
        <p style={{ fontSize: 12, color: 'var(--text-secondary, #9a9a8c)' }}>
          {peerBenchmarks.length} of 8 candidate peer institutions have verified public sustainability data on record.
        </p>
      </div>
    </div>
  );
}
