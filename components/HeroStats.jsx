'use client';

import { TrendingUp, TrendingDown, Minus, CalendarDays, Users } from 'lucide-react';
import { scoreBand, formatNumber } from '@/lib/format';
import { monthLabel } from '@/lib/metrics';

function DeltaChip({ delta }) {
  if (delta === null || delta === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-ink-500 text-sm font-mono" data-numeric="true">
        <Minus size={14} />
        First run
      </span>
    );
  }
  const positive = delta > 0;
  const flat = delta === 0;
  const Icon = flat ? Minus : positive ? TrendingUp : TrendingDown;
  const colorClass = flat ? 'text-ink-500' : positive ? 'text-moss' : 'text-coral';
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-mono ${colorClass}`} data-numeric="true">
      <Icon size={14} />
      {positive ? '+' : ''}
      {delta} pts vs. last run
    </span>
  );
}

export default function HeroStats({ finalScore, scoreDelta, latest, institution }) {
  const band = scoreBand(finalScore);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div className="col-span-2 lg:col-span-1 rounded-lg border border-panel-line bg-panel-raised p-5 shadow-instrument">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
          Sustainability score
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-5xl font-semibold font-mono leading-none"
            style={{ color: band.hex }}
            data-numeric="true"
          >
            {finalScore ?? '—'}
          </span>
          <span className="text-ink-500 text-sm">/ 100</span>
        </div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-medium rounded-full px-2 py-0.5"
            style={{ color: band.hex, backgroundColor: `${band.hex}1A` }}
          >
            {band.label}
          </span>
          <DeltaChip delta={scoreDelta} />
        </div>
      </div>

      <StatCard
        icon={CalendarDays}
        label="Latest data month"
        value={latest ? monthLabel(latest.month) : '—'}
      />

      <StatCard
        icon={Users}
        label="Student population"
        value={institution ? formatNumber(institution.student_population) : '—'}
      />

      <StatCard
        icon={Users}
        label="Present this month"
        value={latest ? formatNumber(latest.present_population) : '—'}
        sub={latest ? `${latest.hostel_occupancy_pct}% hostel occupancy` : null}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-lg border border-panel-line bg-panel-raised p-5 shadow-instrument flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-500 mb-2">
        <Icon size={13} />
        {label}
      </div>
      <div className="text-2xl font-semibold text-ink-100 font-mono" data-numeric="true">
        {value}
      </div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
    </div>
  );
}
