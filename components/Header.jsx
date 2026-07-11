'use client';

import { Sprout, Radio } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-panel-line bg-panel-raised/60 backdrop-blur supports-[backdrop-filter]:bg-panel-raised/40">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-moss/40 bg-moss/10 text-moss">
            <Sprout size={18} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold tracking-tight text-ink-100">
              LPU Sustainability Auditor
            </h1>
            <p className="text-xs text-ink-500">
              Campus resource audit &amp; peer benchmarking, powered by an agentic AI pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto rounded-full border border-panel-line2 bg-panel-inset px-3 py-1.5">
          <Radio size={13} className="text-moss" strokeWidth={2.5} />
          <span className="text-xs font-mono text-ink-300 tracking-wide">
            5-agent pipeline · live web research
          </span>
        </div>
      </div>
    </header>
  );
}
