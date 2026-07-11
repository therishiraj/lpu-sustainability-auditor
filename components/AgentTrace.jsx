'use client';

import { ChevronRight, Search } from 'lucide-react';
import { PIPELINE_STEPS } from '@/lib/pipelineSteps';
import { formatDuration } from '@/lib/format';

const STATUS_DOT = {
  done: 'bg-moss',
  degraded: 'bg-amber',
  error: 'bg-coral',
  running: 'bg-amber',
  idle: 'bg-ink-700',
};

export default function AgentTrace({ steps = {} }) {
  return (
    <div className="rounded-lg border border-panel-line bg-panel-raised p-5 md:p-6 shadow-instrument">
      <h3 className="text-sm font-mono uppercase tracking-wider text-ink-500 mb-4">
        Agent trace
      </h3>
      <div className="space-y-2">
        {PIPELINE_STEPS.map((step) => {
          const state = steps[step.id];
          if (!state) return null;
          return (
            <details key={step.id} className="group rounded-md border border-panel-line2 bg-panel-inset">
              <summary className="flex items-center gap-3 cursor-pointer select-none px-4 py-3 list-none">
                <ChevronRight
                  size={15}
                  className="text-ink-500 transition-transform duration-200 group-open:rotate-90 flex-shrink-0"
                />
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[state.status] || 'bg-ink-700'}`} />
                <span className="text-sm text-ink-100 font-medium">{step.label}</span>
                <span className="text-xs text-ink-500 font-mono ml-auto" data-numeric="true">
                  {formatDuration(state.duration_ms)}
                </span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-xs text-ink-500 mb-3">{step.role}</p>

                {state.searchQueries && state.searchQueries.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-500 mb-1.5">
                      <Search size={12} />
                      Search queries issued
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {state.searchQueries.map((q, i) => (
                        <span
                          key={i}
                          className="text-xs font-mono text-amber bg-amber/10 border border-amber/20 rounded px-2 py-0.5"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {state.error ? (
                  <pre className="text-xs font-mono text-coral bg-coral/5 border border-coral/20 rounded p-3 overflow-x-auto">
                    {state.error}
                  </pre>
                ) : (
                  <pre className="text-xs font-mono text-ink-300 bg-panel-bg border border-panel-line rounded p-3 overflow-x-auto max-h-96">
                    {JSON.stringify(state.output, null, 2)}
                  </pre>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
