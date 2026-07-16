'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Users,
  Leaf,
  Building2,
} from 'lucide-react';

import { scoreBand, formatNumber } from '@/lib/format';
import { monthLabel } from '@/lib/metrics';

function DeltaChip({ delta }) {
  if (delta === null || delta === undefined) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
        <Minus size={14} />
        First Audit
      </div>
    );
  }

  const positive = delta > 0;
  const flat = delta === 0;

  const Icon = flat ? Minus : positive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold
      ${
        flat
          ? 'bg-gray-100 text-gray-600'
          : positive
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      <Icon size={14} />

      {positive ? '+' : ''}

      {delta} pts
    </div>
  );
}

export default function HeroStats({
  finalScore,
  scoreDelta,
  latest,
  institution,
}) {
  const band = scoreBand(finalScore);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {/* Sustainability Score */}

      <div className="rounded-2xl bg-gradient-to-br from-[#F7941D] to-[#EA7B00] p-6 text-white shadow-lg">

        <div className="flex justify-between items-start">

          <div>

            <p className="uppercase tracking-widest text-xs opacity-80">
              Sustainability Score
            </p>

            <h2 className="mt-3 text-5xl font-bold">
              {finalScore ?? '--'}
            </h2>

            <p className="mt-1 text-orange-100">
              out of 100
            </p>

          </div>

          <div className="rounded-xl bg-white/20 p-3">
            <Leaf size={28} />
          </div>

        </div>

        <div className="mt-6 flex flex-wrap gap-2 items-center">

          <span
            className="rounded-full bg-white px-3 py-1 text-xs font-bold"
            style={{
              color: band.hex,
            }}
          >
            {band.label}
          </span>

          <DeltaChip delta={scoreDelta} />

        </div>

      </div>

      {/* Latest Month */}

      <StatCard
        icon={CalendarDays}
        title="Latest Dataset"
        value={latest ? monthLabel(latest.month) : '--'}
        subtitle="Most Recent Audit Month"
      />

      {/* Student Population */}

      <StatCard
        icon={Building2}
        title="Student Population"
        value={
          institution
            ? formatNumber(institution.student_population)
            : '--'
        }
        subtitle="Registered Students"
      />

      {/* Present Population */}

      <StatCard
        icon={Users}
        title="Campus Presence"
        value={
          latest
            ? formatNumber(latest.present_population)
            : '--'
        }
        subtitle={
          latest
            ? `${latest.hostel_occupancy_pct}% Hostel Occupancy`
            : ''
        }
      />

    </section>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="uppercase tracking-wider text-xs font-semibold text-gray-500">
            {title}
          </p>

          <h3
            className="mt-3 text-3xl font-bold text-gray-800"
            data-numeric="true"
          >
            {value}
          </h3>

        </div>

        <div className="rounded-xl bg-orange-100 p-3">

          <Icon
            size={24}
            className="text-[#F7941D]"
          />

        </div>

      </div>

      {subtitle && (
        <p className="mt-5 text-sm text-gray-500">
          {subtitle}
        </p>
      )}

    </div>
  );
}
