'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText } from 'lucide-react';

export default function ReportView({ markdown }) {
  if (!markdown) return null;

  return (
    <div className="rounded-lg border border-panel-line bg-panel-raised p-5 md:p-8 shadow-instrument">
      <div className="flex items-center gap-2 mb-5">
        <FileText size={16} className="text-moss" />
        <h3 className="text-sm font-mono uppercase tracking-wider text-ink-500">
          Committee report
        </h3>
      </div>
      <div className="report-body max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
