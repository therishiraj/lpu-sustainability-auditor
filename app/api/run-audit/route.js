import dataset from '@/data/lpu-usage.json';
import { runPipeline } from '@/lib/agents/orchestrator';

// The Anthropic SDK needs the Node.js runtime, not the Edge runtime.
export const runtime = 'nodejs';

// Serverless function time budget. The pipeline makes 5 sequential Claude
// calls, one of which does live web research, so give it real headroom.
// Vercel Hobby caps functions at 60s regardless of this value — Pro/Enterprise
// plans can use up to 300s (or 800s with Fluid Compute). See README.
export const maxDuration = 300;

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const emit = (event) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
      };

      try {
        emit({ type: 'start', startedAt: new Date().toISOString() });
        const result = await runPipeline(dataset, emit);
        emit({
          type: 'complete',
          finalScore: result.finalScore,
          citations: result.citations,
          report: result.results.report?.output?.markdown ?? null,
          headline: result.headline,
        });
      } catch (err) {
        emit({ type: 'error', error: err.message || 'The audit pipeline failed.' });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
