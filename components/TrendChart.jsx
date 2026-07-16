'use client';

import { useState, useMemo } from 'react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import {
  Zap,
  Droplets,
  Recycle,
  Sun,
  TrendingUp,
} from 'lucide-react';

const METRICS = {
  electricity: {
    key: 'electricity_kwh',
    label: 'Electricity',
    unit: 'kWh',
    color: '#F7941D',
    icon: Zap,
  },

  water: {
    key: 'water_kl',
    label: 'Water',
    unit: 'kL',
    color: '#1671C9',
    icon: Droplets,
  },

  wasteDiverted: {
    key: 'waste_diverted_pct',
    label: 'Waste Diverted',
    unit: '%',
    color: '#26A65B',
    icon: Recycle,
  },

  solarShare: {
    key: 'solar_share_pct',
    label: 'Solar Share',
    unit: '%',
    color: '#F7C325',
    icon: Sun,
  },
};

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-xl">

      <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
        {label}
      </p>

      <p
        className="text-lg font-bold"
        style={{ color: metric.color }}
      >
        {payload[0].value?.toLocaleString('en-IN')} {metric.unit}
      </p>

    </div>
  );
}

export default function TrendChart({ monthlyMetrics }) {
  const [active, setActive] = useState('electricity');

  const metric = METRICS[active];

  const data = useMemo(
    () =>
      (monthlyMetrics || []).map((m) => ({
        label: m.label,
        value: m[metric.key],
      })),
    [monthlyMetrics, metric.key]
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">

              <TrendingUp
                className="text-[#F7941D]"
                size={22}
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                Sustainability Trends
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                12-month environmental performance analytics
              </p>

            </div>

          </div>

        </div>

        {/* Metric Buttons */}

        <div className="flex flex-wrap gap-3">

          {Object.entries(METRICS).map(([id, item]) => {

            const Icon = item.icon;

            return (

              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 transition-all duration-200

                ${
                  active === id
                    ? 'border-[#F7941D] bg-orange-50 shadow'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >

                <Icon
                  size={17}
                  style={{
                    color: item.color,
                  }}
                />

                <span
                  className={`text-sm font-medium ${
                    active === id
                      ? 'text-[#F7941D]'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </span>

              </button>

            );

          })}

        </div>

      </div>

      {/* Chart */}

      <div className="mt-8 h-[340px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={data}
            margin={{
              top: 15,
              right: 25,
              left: 10,
              bottom: 10,
            }}
          >

            <defs>

              <linearGradient
                id="gradientFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor={metric.color}
                  stopOpacity={0.45}
                />

                <stop
                  offset="100%"
                  stopColor={metric.color}
                  stopOpacity={0.02}
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              stroke="#E8E8E8"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{
                fill: '#555',
                fontSize: 13,
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={{
                stroke: '#DDDDDD',
              }}
            />

            <YAxis
              tick={{
                fill: '#555',
                fontSize: 13,
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v) =>
                v >= 1000
                  ? `${Math.round(v / 1000)}k`
                  : v
              }
            />

            <Tooltip
              content={<CustomTooltip metric={metric} />}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={4}
              fill="url(#gradientFill)"
              dot={{
                r: 4,
                fill: metric.color,
                strokeWidth: 2,
                stroke: '#fff',
              }}
              activeDot={{
                r: 7,
              }}
              animationDuration={700}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </section>
  );
}
