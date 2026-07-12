export function scoreBand(score) {
  if (score === null || score === undefined) {
    return { label: 'N/A', tone: 'ink', hex: '#78848F' };
  }
  if (score >= 75) return { label: 'Strong', tone: 'moss', hex: '#1671C9' };
  if (score >= 55) return { label: 'Developing', tone: 'amber', hex: '#F7941D' };
  return { label: 'Needs attention', tone: 'coral', hex: '#DC3B2E' };
}

export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDelta(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(ms) {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
