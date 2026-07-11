const STORAGE_KEY = 'lpu-sustainability-auditor:runs';
const MAX_RUNS = 25;

export function loadRuns() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (_err) {
    return [];
  }
}

export function saveRun(run) {
  if (typeof window === 'undefined') return [];
  const existing = loadRuns();
  const next = [run, ...existing].slice(0, MAX_RUNS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (_err) {
    // Storage full or unavailable — keep the run in memory for this session
    // even if it can't be persisted.
  }
  return next;
}

export function clearRuns() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (_err) {
    // ignore
  }
}
