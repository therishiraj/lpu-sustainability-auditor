'use client';

import { Sprout, Play, AlertOctagon, RotateCcw } from 'lucide-react';

export function EmptyState({ onRunNew }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 md:py-28 px-4 rounded-lg border border-dashed border-panel-line2 bg-panel-raised/40">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-moss/30 bg-moss/10 text-moss mb-5">
        <Sprout size={26} strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-semibold text-ink-100 mb-2">No audits run yet</h2>
      <p className="text-sm text-ink-500 max-w-md mb-6 leading-relaxed">
        Run the 5-agent pipeline against this month&apos;s campus data. It normalizes the numbers,
        researches real peer universities on the live web, benchmarks LPU against them, critiques
        its own analysis, and writes a committee-ready report — usually in under a minute.
      </p>
      <button
        onClick={onRunNew}
        className="flex items-center gap-2 rounded-md bg-moss/15 border border-moss/40 text-moss px-5 py-2.5 text-sm font-medium hover:bg-moss/25 hover:shadow-glowMoss transition-all"
      >
        <Play size={16} strokeWidth={2.5} />
        Run first audit
      </button>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4 rounded-lg border border-coral/30 bg-coral/5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-coral/40 bg-coral/10 text-coral mb-5">
        <AlertOctagon size={26} strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-semibold text-ink-100 mb-2">The audit didn&apos;t complete</h2>
      <p className="text-sm text-ink-500 max-w-md mb-6 leading-relaxed font-mono">
        {message || 'An unexpected error stopped the pipeline.'}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md bg-coral/15 border border-coral/40 text-coral px-5 py-2.5 text-sm font-medium hover:bg-coral/25 hover:shadow-glowCoral transition-all"
      >
        <RotateCcw size={16} strokeWidth={2.5} />
        Try again
      </button>
    </div>
  );
}
