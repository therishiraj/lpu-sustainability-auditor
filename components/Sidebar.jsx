'use client';

import { Play, Loader2, Inbox } from 'lucide-react';
import { formatTimestamp, scoreBand } from '@/lib/format';

export default function Sidebar({ runs, currentRunId, onSelectRun, onRunNew, isRunning }) {
  return (
    <aside className="md:w-72 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-panel-line bg-panel-raised/40">
      <div className="p-4 md:p-5 flex flex-col gap-4 md:sticky md:top-0 md:h-[calc(100vh-65px)]">
        <button
          onClick={onRunNew}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 rounded-md bg-moss/15 border border-moss/40 text-moss px-4 py-2.5 text-sm font-medium hover:bg-moss/25 hover:shadow-glowMoss disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-moss/15 disabled:hover:shadow-none transition-all"
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Audit running…
            </>
          ) : (
            <>
              <Play size={16} strokeWidth={2.5} />
              Run new audit
            </>
          )}
        </button>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-500 mb-2 px-1">
            Run history
          </div>

          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-4 rounded-md border border-dashed border-panel-line2 text-ink-500">
              <Inbox size={20} strokeWidth={1.5} />
              <p className="text-xs leading-relaxed">
                No audits yet. Run one to start building score history.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5 overflow-y-auto pr-1 md:max-h-[calc(100vh-220px)]">
              {runs.map((run) => {
                const band = scoreBand(run.finalScore);
                const active = run.id === currentRunId;
                return (
                  <li key={run.id}>
                    <button
                      onClick={() => onSelectRun(run.id)}
                      className={`w-full text-left rounded-md border px-3 py-2.5 transition-colors ${
                        active
                          ? 'border-moss/50 bg-moss/10'
                          : 'border-transparent hover:border-panel-line2 hover:bg-panel-inset'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-300 font-mono" data-numeric="true">
                          {formatTimestamp(run.timestamp)}
                        </span>
                        <span
                          className="flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-mono font-semibold"
                          style={{
                            color: band.hex,
                            backgroundColor: `${band.hex}1A`,
                          }}
                          data-numeric="true"
                        >
                          {run.finalScore ?? '—'}
                        </span>
                      </div>
                      <div className="text-xs text-ink-500 mt-1">
                        {run.latestMonth} · {band.label}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
