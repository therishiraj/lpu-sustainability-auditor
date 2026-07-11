# LPU Sustainability Auditor

A multi-agent AI system that audits a university's campus resource usage (electricity, water, waste, green cover, solar) and benchmarks it against **real peer universities' public sustainability disclosures** — found live on the web, not fabricated — then produces a committee-ready report.

This is a portfolio/coursework project built to demonstrate genuine agentic AI patterns: tool use, multi-agent role separation, a reflection/self-critique loop, and persisted memory across runs. It is **not** a single-prompt wrapper around an LLM.

## Why this isn't just a records/ERP dashboard

A normal campus sustainability dashboard shows you *your own numbers*. This system does three things a plain dashboard can't:

1. **It goes and finds out what your peers are actually doing**, live, via real web search — not a static, hand-entered comparison table that goes stale the day it's written.
2. **It argues with itself before it shows you anything.** A dedicated Critique Agent reviews the benchmarking analysis specifically looking for unsupported claims, unfair comparisons, and a score that doesn't follow from its own reasoning — and it's allowed to actually change the output, not just rubber-stamp it.
3. **All arithmetic is deterministic.** Every per-capita figure and every month-over-month/year-over-year delta is computed in plain JavaScript before any model ever sees it. The LLMs are only ever asked to interpret and judge numbers, never to compute them — which is also why the numbers in the final report are trustworthy in a way a single "summarize this spreadsheet" prompt isn't.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                 │
│  Dashboard (React / Next.js client components)                       │
│  ─ Sidebar: run-new-audit + run history (localStorage)                │
│  ─ Pipeline visualizer: 5-station live status                        │
│  ─ Hero stats, trend chart, report, citations, agent trace           │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ POST /api/run-audit
                                 │ (NDJSON stream, one JSON object per line)
┌───────────────────────────────▼───────────────────────────────────────┐
│                    app/api/run-audit/route.js                         │
│         Next.js Route Handler (serverless, Node runtime)              │
│         Opens a ReadableStream, calls the orchestrator,                │
│         forwards every "step" event to the browser as it happens.     │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────────┐
│                    lib/agents/orchestrator.js                         │
│   Runs the 5 agents in sequence, times each one, emits a               │
│   structured step event (label, role, status, duration, output)        │
│   after every step. Degrades gracefully if peer research fails.       │
└───┬──────────┬──────────┬──────────┬──────────┬────────────────────────┘
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐
│Ingestion│ │  Peer   │ │Benchmark-│ │Critique │ │ Report  │
│& Normal-│ │Research │ │ing & Gap │ │(reflect-│ │Writing  │
│ization  │ │(web_    │ │Analysis  │ │ion step)│ │Agent    │
│Agent    │ │search   │ │Agent     │ │Agent    │ │         │
│(Haiku)  │ │tool)    │ │          │ │         │ │         │
│         │ │(Sonnet) │ │(Sonnet)  │ │(Sonnet) │ │(Sonnet) │
└────┬────┘ └────┬────┘ └────┬─────┘ └────┬────┘ └────┬────┘
     │           │           │            │           │
     │           │  live web │            │           │
     │           ▼  search   │            │           │
     │      ┌──────────┐     │            │           │
     │      │ Anthropic│     │            │           │
     │      │web_search│     │            │           │
     │      │server    │     │            │           │
     │      │tool      │     │            │           │
     │      └──────────┘     │            │           │
     └───────────┴───────────┴────────────┴───────────┘
                              │
                    lib/metrics.js (pure JS)
              per-capita figures, MoM/YoY deltas —
           computed once here, never by an LLM
                              │
                    data/lpu-usage.json
              sample monthly campus resource data
```

Each agent is one call to the Anthropic Messages API (`lib/anthropic.js`), with its own narrow system prompt, defined in its own file under `lib/agents/`. No agent does another agent's job, and no agent does arithmetic.

## The 5 agents

| # | Agent | Model tier | Job |
|---|-------|-----------|-----|
| 1 | Ingestion & Normalization | Haiku (fast/cheap) | Turns pre-computed metrics into a plain-language trend summary, anomalies, and data-quality concerns |
| 2 | Peer Research | Sonnet + live `web_search` | Finds real, current, public sustainability disclosures from comparable and aspirational peer universities |
| 3 | Benchmarking & Gap Analysis | Sonnet | Produces a per-metric comparison, strengths, gaps, and a 0–100 sustainability score with a fairness-aware rationale |
| 4 | Critique (reflection) | Sonnet | Actively hunts for unsupported claims, unfair comparisons, or a score inconsistent with its own rationale — can adjust the score |
| 5 | Recommendation & Report | Sonnet | Writes the final Markdown report, required to incorporate the critique's corrections |

## Local setup

**Requirements:** Node.js 18.18+ (Next.js 14 requirement), npm, an Anthropic API key.

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
cp .env.example .env.local
# then edit .env.local and paste your key:
# ANTHROPIC_API_KEY=sk-ant-...

# 3. Run it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Run new audit**, and watch the 5 stations light up as each agent finishes. The very first run will take somewhere between 20–60 seconds depending on how much the Peer Research Agent needs to search.

To sanity-check the production build before deploying:

```bash
npm run build
npm run start
```

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Add New → Project**, import the repo. Vercel auto-detects Next.js — no build settings need to change.
3. Add exactly one environment variable: **`ANTHROPIC_API_KEY`** (Project Settings → Environment Variables). This is read server-side only in `lib/anthropic.js` and is never sent to the browser.
4. Deploy.

**One thing to know about serverless duration:** the API route sets `export const maxDuration = 300` (seconds) in `app/api/run-audit/route.js`, since the pipeline makes 5 sequential Claude calls including live web research. Vercel's **Hobby plan caps functions at 60 seconds regardless of this setting** — if the pipeline is timing out on Hobby, either upgrade to Pro (300s, or up to 800s with Fluid Compute) or reduce `maxSearches` in `lib/agents/peerResearch.js` to speed up step 2.

No database, no other environment variables, no extra infrastructure — run history lives entirely in the visitor's browser via `localStorage`.

## Swapping in real institutional data

Everything the pipeline reasons about comes from one file: `data/lpu-usage.json`. It's clearly marked as sample data standing in for a real university ERP export. To use real data:

1. Replace `institution` with your institution's real `student_population`, `hostel_capacity`, and `campus_area_acres`.
2. Replace the `monthly` array with real monthly figures in the same shape:
   ```json
   { "month": "YYYY-MM", "electricity_kwh": 0, "water_kl": 0, "waste_kg": 0,
     "waste_diverted_pct": 0, "green_cover_pct": 0, "hostel_occupancy_pct": 0,
     "solar_generation_kwh": 0 }
   ```
3. Keep at least 13 consecutive months if you want a genuine year-over-year delta on the latest month (`lib/metrics.js` computes this automatically whenever a matching prior-year month exists in the dataset; with fewer than 13 months it correctly reports `yoyMonth: null` instead of guessing).
4. That's it — `lib/metrics.js` derives every per-capita and delta figure automatically, and every agent downstream reads from that, not from the raw file.

For a real deployment you'd eventually swap `data/lpu-usage.json` for a call into your institution's actual ERP/BMS export pipeline instead of a static file — the rest of the system doesn't need to change.

## Suggested extensions

- **Real database for history.** `localStorage` is per-browser and per-device by design (zero infrastructure, per this project's constraints). A real deployment used by more than one committee member would want run history in Postgres/Supabase/etc. so everyone sees the same history.
- **Cron-scheduled autonomous runs.** Add a Vercel Cron Job hitting `/api/run-audit` monthly so the audit runs itself against fresh ERP data without anyone clicking a button.
- **Run-over-run diffing.** The data is already there in history — a dedicated "compare two runs" view (which metrics moved, whether the Critique Agent's concerns changed) would be a natural next agent or a pure-UI feature.
- **Structured citations from peer research directly into the score rationale**, so a reader can jump from a specific claim in the Benchmarking Agent's reasoning straight to the source URL that supports it.
- **A 6th agent** that periodically re-checks whether previously-cited peer programs are still live/accurate, since public disclosures change.

## Project structure

```
app/
  layout.js                 root layout, IBM Plex fonts
  page.js                   dashboard — client component, owns all run state
  globals.css                Tailwind + instrument-panel base styles
  api/run-audit/route.js     streaming NDJSON route handler
lib/
  anthropic.js               Anthropic SDK wrapper, web_search + JSON parsing helpers
  metrics.js                 deterministic per-capita + MoM/YoY delta calculations
  pipelineSteps.js            shared step metadata (server + client)
  format.js                   score bands, number/date formatting
  runHistory.js                localStorage read/write for run history
  agents/
    ingestion.js, peerResearch.js, benchmarking.js, critique.js, report.js
    orchestrator.js           runs + times the 5 agents, emits step events
components/
  Header.jsx, Sidebar.jsx, HeroStats.jsx, PipelineVisualizer.jsx,
  TrendChart.jsx, ReportView.jsx, CitationsList.jsx, AgentTrace.jsx,
  StateScreens.jsx (empty + error states)
data/
  lpu-usage.json              sample/demo monthly campus data
```

## Known limitation

`npm audit` will report a couple of advisories inherited from Next.js 14.2.x's own internal dependency tree (not from any dependency this project chose directly). This project intentionally targets **Next.js 14 App Router** per its own design constraints; fully clearing those advisories means moving to Next.js 15/16, which is a reasonable follow-up but out of scope here. Everything at the top level (`next`, `postcss`, etc.) is pinned to the latest available patch on the 14.x line.
