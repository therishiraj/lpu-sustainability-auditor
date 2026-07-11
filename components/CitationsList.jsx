'use client';

import { ExternalLink, Link2Off } from 'lucide-react';

export default function CitationsList({ citations = [] }) {
  return (
    <div className="rounded-lg border border-panel-line bg-panel-raised p-5 md:p-6 shadow-instrument">
      <h3 className="text-sm font-mono uppercase tracking-wider text-ink-500 mb-4">
        Sources found by the Peer Research Agent
      </h3>

      {citations.length === 0 ? (
        <div className="flex items-center gap-2 text-ink-500 text-sm py-4">
          <Link2Off size={16} />
          No citations were returned for this run.
        </div>
      ) : (
        <ul className="space-y-2">
          {citations.map((c, i) => (
            <li key={c.url + i}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 text-sm text-ink-300 hover:text-amber transition-colors"
              >
                <ExternalLink
                  size={14}
                  className="flex-shrink-0 mt-0.5 text-ink-500 group-hover:text-amber transition-colors"
                />
                <span className="truncate">{c.title || c.url}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
