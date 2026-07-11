'use client';

import {
  Database,
  Globe,
  Scale,
  ShieldAlert,
  FileText,
  Check,
  AlertTriangle,
  X,
  Circle,
} from 'lucide-react';
import { PIPELINE_STEPS } from '@/lib/pipelineSteps';
import { formatDuration } from '@/lib/format';

const ICONS = { Database, Globe, Scale, ShieldAlert, FileText };

const RING_STYLES = {
  idle: 'border-panel-line2 text-ink-700 bg-panel-inset',
  running: 'border-amber text-amber bg-panel-raised shadow-glowAmber animate-pulseRing',
  done: 'border-moss text-moss bg-panel-raised shadow-glowMoss',
  degraded: 'border-amber text-amber bg-panel-raised shadow-glowAmber',
  revised: 'border-amber text-amber bg-panel-raised shadow-glowAmber',
  error: 'border-coral text-coral bg-panel-raised shadow-glowCoral',
};

const BADGE_STYLES = {
  done: 'text-moss',
  degraded: 'text-amber',
  revised: 'text-amber',
  error: 'text-coral',
  running: 'text-amber',
  idle: 'text-ink-700',
};

function deriveDisplayStatus(stepId, stepState) {
  if (!stepState) return 'idle';
  if (stepState.status === 'done' && stepId === 'critique') {
    const out = stepState.output;
    const adjusted = out && (out.approved === false || (out.score_adjustment ?? 0) !== 0);
    if (adjusted) return 'revised';
  }
  return stepState.status;
}

function StatusBadge({ status }) {
  if (status === 'running') {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber" />
      </span>
    );
  }
  if (status === 'done') return <Check size={14} strokeWidth={3} />;
  if (status === 'degraded' || status === 'revised') return <AlertTriangle size={14} strokeWidth={2.5} />;
  if (status === 'error') return <X size={14} strokeWidth={3} />;
  return <Circle size={10} className="fill-current" />;
}

function statusText(status, stepState) {
  switch (status) {
    case 'running':
      return 'Running…';
    case 'done':
      return stepState?.duration_ms ? formatDuration(stepState.duration_ms) : 'Done';
    case 'degraded':
      return 'Degraded';
    case 'revised':
      return 'Revised';
    case 'error':
      return 'Error';
    default:
      return 'Idle';
  }
}

export default function PipelineVisualizer({ steps = {} }) {
  return (
    <div
      className="rounded-lg border border-panel-line bg-panel-raised p-5 md:p-6 shadow-instrument"
      role="group"
      aria-label="Agent pipeline status"
    >
      <div className="flex flex-col md:flex-row md:items-start">
        {PIPELINE_STEPS.map((step, i) => {
          const stepState = steps[step.id];
          const status = deriveDisplayStatus(step.id, stepState);
          const Icon = ICONS[step.icon] || Database;
          const isLast = i === PIPELINE_STEPS.length - 1;
          const connectorFilled =
            status === 'done' || status === 'degraded' || status === 'revised' || status === 'error';

          return (
            <div key={step.id} className="flex md:flex-1 md:flex-col">
              <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 md:w-full">
                <div
                  className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-shadow duration-300 ${RING_STYLES[status]}`}
                  title={step.role}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="flex-1 md:flex-none md:text-center md:mt-2 min-w-0">
                  <div className="text-sm font-medium text-ink-100 truncate">{step.shortLabel}</div>
                  <div
                    className={`flex items-center gap-1.5 md:justify-center text-xs font-mono mt-0.5 ${BADGE_STYLES[status]}`}
                    data-numeric="true"
                  >
                    <StatusBadge status={status} />
                    <span>{statusText(status, stepState)}</span>
                  </div>
                </div>
              </div>

              {!isLast && (
                <div
                  className="ml-6 my-1 h-6 w-px md:ml-0 md:my-0 md:h-px md:w-full md:mt-6 md:flex-shrink-0 bg-panel-line relative overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className={`absolute inset-0 origin-top md:origin-left bg-moss transition-transform duration-500 ease-out ${
                      connectorFilled ? 'scale-y-100 md:scale-x-100' : 'scale-y-0 md:scale-x-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
