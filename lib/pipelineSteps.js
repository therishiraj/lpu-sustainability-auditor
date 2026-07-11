// Shared step metadata for the 5-agent pipeline. Imported server-side by the
// orchestrator (to label emitted events) and client-side by the pipeline
// visualizer (to render idle stations before any run has started).
export const PIPELINE_STEPS = [
  {
    id: 'ingestion',
    label: 'Ingestion & Normalization',
    shortLabel: 'Ingestion',
    role: "Reads raw monthly usage data and pre-computed per-capita metrics, summarizes the trend, and flags anomalies.",
    icon: 'Database',
  },
  {
    id: 'peerResearch',
    label: 'Peer Research',
    shortLabel: 'Peer Research',
    role: "Searches the live web for peer and aspirational universities' public sustainability disclosures.",
    icon: 'Globe',
  },
  {
    id: 'benchmarking',
    label: 'Benchmarking & Gap Analysis',
    shortLabel: 'Benchmarking',
    role: "Compares LPU's metrics against peer findings and produces a sustainability score.",
    icon: 'Scale',
  },
  {
    id: 'critique',
    label: 'Critique (Reflection)',
    shortLabel: 'Critique',
    role: 'Reviews the benchmarking output for unsupported claims, unfair comparisons, or score inconsistencies.',
    icon: 'ShieldAlert',
  },
  {
    id: 'report',
    label: 'Recommendation & Report',
    shortLabel: 'Report',
    role: "Writes the committee-ready report, incorporating the critique's corrections.",
    icon: 'FileText',
  },
];
