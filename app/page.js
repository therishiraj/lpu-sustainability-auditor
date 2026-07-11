'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sprout } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import HeroStats from '@/components/HeroStats';
import PipelineVisualizer from '@/components/PipelineVisualizer';
import TrendChart from '@/components/TrendChart';
import ReportView from '@/components/ReportView';
import CitationsList from '@/components/CitationsList';
import AgentTrace from '@/components/AgentTrace';
import { EmptyState, ErrorState } from '@/components/StateScreens';
import { loadRuns, saveRun } from '@/lib/runHistory';

export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  const [runs, setRuns] = useState([]);
  const [currentRunId, setCurrentRunId] = useState(null);
  const [status, setStatus] = useState('empty'); // 'empty' | 'running' | 'error' | 'viewing'
  const [liveSteps, setLiveSteps] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const stored = loadRuns();
    setRuns(stored);
    if (stored.length > 0) {
      setCurrentRunId(stored[0].id);
      setStatus('viewing');
    }
    setHydrated(true);
  }, []);

  const handleRunAudit = useCallback(async () => {
    setStatus('running');
    setErrorMessage(null);
    setLiveSteps({});

    let stepsAccumulator = {};

    try {
      const res = await fetch('/api/run-audit', { method: 'POST' });
      if (!res.ok || !res.body) {
        throw new Error(`The audit request failed (status ${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completeEvent = null;
      let streamError = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);
          if (event.type === 'step') {
            stepsAccumulator = { ...stepsAccumulator, [event.id]: event };
            setLiveSteps(stepsAccumulator);
          } else if (event.type === 'complete') {
            completeEvent = event;
          } else if (event.type === 'error') {
            streamError = event.error;
          }
        }
      }

      if (streamError) throw new Error(streamError);
      if (!completeEvent) throw new Error('The pipeline stream ended unexpectedly.');

      const newRun = {
        id: `run_${Date.now()}`,
        timestamp: new Date().toISOString(),
        finalScore: completeEvent.finalScore,
        latestMonth: completeEvent.headline.latest.month,
        headline: completeEvent.headline,
        report: completeEvent.report,
        citations: completeEvent.citations,
        steps: stepsAccumulator,
      };

      const updated = saveRun(newRun);
      setRuns(updated);
      setCurrentRunId(newRun.id);
      setStatus('viewing');
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  }, []);

  const handleSelectRun = useCallback((id) => {
    setCurrentRunId(id);
    setStatus('viewing');
  }, []);

  const currentRun = runs.find((r) => r.id === currentRunId) || null;
  const currentIndex = runs.findIndex((r) => r.id === currentRunId);
  const previousRun = currentIndex >= 0 ? runs[currentIndex + 1] : null;
  const scoreDelta =
    currentRun &&
    previousRun &&
    typeof currentRun.finalScore === 'number' &&
    typeof previousRun.finalScore === 'number'
      ? Math.round((currentRun.finalScore - previousRun.finalScore) * 10) / 10
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          runs={runs}
          currentRunId={currentRunId}
          onSelectRun={handleSelectRun}
          onRunNew={handleRunAudit}
          isRunning={status === 'running'}
        />

        <main className="flex-1 min-w-0 p-4 md:p-8 space-y-6">
          {!hydrated && (
            <div className="flex items-center gap-2 text-ink-500 text-sm py-24 justify-center">
              <Sprout size={16} className="animate-pulse" />
              Loading…
            </div>
          )}

          {hydrated && status === 'empty' && <EmptyState onRunNew={handleRunAudit} />}

          {hydrated && status === 'running' && (
            <div className="space-y-4 animate-rise">
              <PipelineVisualizer steps={liveSteps} />
              <p className="text-sm text-ink-500 text-center font-mono">
                Auditing Lovely Professional University (LPU)… this streams live as each agent finishes.
              </p>
            </div>
          )}

          {hydrated && status === 'error' && (
            <div className="space-y-6 animate-rise">
              <PipelineVisualizer steps={liveSteps} />
              <ErrorState message={errorMessage} onRetry={handleRunAudit} />
            </div>
          )}

          {hydrated && status === 'viewing' && currentRun && (
            <div className="space-y-6 animate-rise">
              <PipelineVisualizer steps={currentRun.steps} />

              <HeroStats
                finalScore={currentRun.finalScore}
                scoreDelta={scoreDelta}
                latest={currentRun.headline?.latest}
                institution={currentRun.headline?.institution}
              />

              <TrendChart monthlyMetrics={currentRun.headline?.monthlyMetrics} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ReportView markdown={currentRun.report} />
                </div>
                <div>
                  <CitationsList citations={currentRun.citations} />
                </div>
              </div>

              <AgentTrace steps={currentRun.steps} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
