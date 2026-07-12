'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const METRICS = {
  electricity: { key: 'electricity_kwh', label: 'Electricity', unit: 'kWh', color: '#F7941D' },
  water: { key: 'water_kl', label: 'Water', unit: 'kL', color: '#1671C9' },
  wasteDiverted: { key: 'waste_diverted_pct', label: 'Waste diverted', unit: '%', color: '#1671C9' },
  solarShare: { key: 'solar_share_pct', label: 'Solar share', unit: '%', color: '#F7941D' },
};

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-md border border-panel-line2 bg-panel-inset px-3 py-2 shadow-instrument">
      <div className="text-xs text-ink-500 font-mono mb-1">{label}</div>
      <div className="text-sm font-mono font-semibold" style={{ color: metric.color }}>
        {val?.toLocaleString('en-IN')} {metric.unit}
      </div>
    </div>
  );
}

export default function TrendChart({ monthlyMetrics }) {
  const [active, setActive] = useState('electricity');
  const metric = METRICS[active];

  const data = useMemo(
    () => (monthlyMetrics || []).map((m) => ({ label: m.label, value: m[metric.key] })),
    [monthlyMetrics, metric.key]
  );

  return (
    <div className="rounded-lg border border-panel-line bg-panel-raised p-5 md:p-6 shadow-instrument">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-medium text-ink-100">
          12-month trend <span className="text-ink-500 font-normal">— {metric.label}</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(METRICS).map(([id, m]) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${
                active === id
                  ? 'border-current bg-panel-inset'
                  : 'border-panel-line2 text-ink-500 hover:text-ink-300 hover:border-panel-line2'
              }`}
              style={active === id ? { color: m.color } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 md:h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#233028" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#5B6D64"
              tick={{ fill: '#8CA098', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: '#233028' }}
              tickLine={false}
            />
            <YAxis
              stroke="#5B6D64"
              tick={{ fill: '#8CA098', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={54}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip content={<CustomTooltip metric={metric} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2}
              fill="url(#trendFill)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
