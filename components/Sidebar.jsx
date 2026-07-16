'use client';

import {
  Play,
  Loader2,
  Inbox,
  History,
  LayoutDashboard,
  BarChart3,
  FileText,
  GitBranch,
  Leaf,
  Trophy,
} from 'lucide-react';

import { formatTimestamp, scoreBand } from '@/lib/format';

export default function Sidebar({
  runs,
  currentRunId,
  onSelectRun,
  onRunNew,
  isRunning,
}) {
  return (
    <aside className="w-full md:w-80 md:flex-shrink-0 bg-white border-r border-gray-200 shadow-sm">

      <div className="flex flex-col h-full p-6">

        {/* Project Card */}

        <div className="rounded-2xl bg-gradient-to-br from-[#F7941D] to-[#EA7B00] text-white p-5 shadow-lg">

          <div className="flex items-center gap-3 mb-3">

            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">

              <Leaf size={24} />

            </div>

            <div>

              <h2 className="font-bold text-lg">
                Sustainability AI
              </h2>

              <p className="text-sm text-orange-100">
                Smart Campus Governance
              </p>

            </div>

          </div>

          <button
            onClick={onRunNew}
            disabled={isRunning}
            className="
            w-full
            mt-4
            rounded-xl
            bg-white
            text-[#F7941D]
            font-semibold
            py-3
            transition
            hover:scale-[1.02]
            hover:shadow-md
            disabled:opacity-60
            disabled:cursor-not-allowed
            flex
            justify-center
            items-center
            gap-2
            "
          >
            {isRunning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Running Audit...
              </>
            ) : (
              <>
                <Play size={18} />
                Run New Audit
              </>
            )}
          </button>

        </div>

        {/* Navigation */}

        <div className="mt-8">

          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-semibold">
            Dashboard
          </p>

          <div className="space-y-2">

            <div className="flex items-center gap-3 rounded-xl bg-orange-50 text-[#F7941D] px-4 py-3 font-semibold">
              <LayoutDashboard size={18} />
              Overview
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100 transition">
              <BarChart3 size={18} />
              Analytics
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100 transition">
              <Trophy size={18} />
              Peer Benchmark
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100 transition">
              <FileText size={18} />
              Reports
            </div>

            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100 transition">
              <GitBranch size={18} />
              Agent Pipeline
            </div>

          </div>

        </div>

        {/* History */}

        <div className="mt-8 flex-1 flex flex-col min-h-0">

          <div className="flex items-center gap-2 mb-4">

            <History
              size={18}
              className="text-[#F7941D]"
            />

            <h3 className="font-semibold text-gray-800">
              Audit History
            </h3>

          </div>

          {runs.length === 0 ? (

            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-12 px-4 text-center">

              <Inbox
                size={28}
                className="text-gray-400 mb-3"
              />

              <p className="text-sm text-gray-500">
                No audit history available.
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Run your first sustainability audit.
              </p>

            </div>

          ) : (

            <div className="space-y-3 overflow-y-auto pr-2">

              {runs.map((run) => {

                const active = run.id === currentRunId;

                const band = scoreBand(run.finalScore);

                return (

                  <button
                    key={run.id}
                    onClick={() => onSelectRun(run.id)}
                    className={`
                      w-full
                      rounded-xl
                      border
                      p-4
                      text-left
                      transition-all
                      duration-200
                      ${
                        active
                          ? 'border-[#F7941D] bg-orange-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-[#F7941D] hover:shadow'
                      }
                    `}
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-gray-500">
                        {formatTimestamp(run.timestamp)}
                      </span>

                      <span
                        className="rounded-lg px-2 py-1 text-xs font-bold"
                        style={{
                          color: band.hex,
                          backgroundColor: `${band.hex}18`,
                        }}
                      >
                        {run.finalScore ?? '--'}
                      </span>

                    </div>

                    <div className="mt-3 text-sm font-semibold text-gray-800">
                      {run.latestMonth}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {band.label}
                    </div>

                  </button>

                );

              })}

            </div>

          )}

        </div>

      </div>

    </aside>
  );
}
