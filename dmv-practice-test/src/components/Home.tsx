// Landing screen: choose a mode and a test, and see your history at a glance.

import { useState } from 'react'
import type { TestBank, TestModeId, TestResult } from '../types'
import { TEST_MODES, DEFAULT_MODE, correctNeededToPass } from '../config/scoring'
import { TEST_BANKS } from '../data'
import HistoryPanel from './HistoryPanel'

interface HomeProps {
  history: TestResult[]
  onStart: (test: TestBank, mode: TestModeId) => void
  onClearHistory: () => void
}

export default function Home({ history, onStart, onClearHistory }: HomeProps) {
  const [mode, setMode] = useState<TestModeId>(DEFAULT_MODE)
  const modeConfig = TEST_MODES[mode]

  const effectiveCount = (test: TestBank) =>
    modeConfig.questionCount === 'all'
      ? test.questions.length
      : Math.min(modeConfig.questionCount, test.questions.length)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-dmv-blue">Choose your test mode</h2>
        <p className="mb-4 text-sm text-gray-600">
          California's real exam is 36 questions for an original license (18 for a renewal),
          and you need about 83% to pass. Modes and scoring can be changed in{' '}
          <code className="rounded bg-gray-100 px-1">src/config/scoring.ts</code>.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {Object.values(TEST_MODES).map((m) => {
            const selected = m.id === mode
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-lg border-2 p-3 text-left transition ${
                  selected
                    ? 'border-dmv-blue bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-dmv-lightblue'
                }`}
                aria-pressed={selected}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{m.label}</span>
                  {selected && (
                    <span className="rounded-full bg-dmv-blue px-2 py-0.5 text-xs text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">{m.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                    {m.questionCount === 'all' ? 'All questions' : `${m.questionCount} questions`}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                    Pass: {m.passThresholdPercent}%
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                    {m.immediateFeedback ? 'Answers shown instantly' : 'Graded at the end'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-dmv-blue">Choose a test</h2>
        <div className="grid gap-3">
          {TEST_BANKS.map((test) => {
            const count = effectiveCount(test)
            const need = correctNeededToPass(count, modeConfig.passThresholdPercent)
            const attempts = history.filter((h) => h.testId === test.id)
            const best = attempts.reduce<number | null>(
              (acc, h) => (acc === null ? h.scorePercent : Math.max(acc, h.scorePercent)),
              null,
            )
            return (
              <div
                key={test.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-gray-900">{test.title}</div>
                  <div className="text-sm text-gray-600">{test.description}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {count} questions · need {need} correct to pass
                    {attempts.length > 0 && (
                      <>
                        {' '}· taken {attempts.length}×
                        {best !== null && ` · best ${best}%`}
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onStart(test, mode)}
                  className="shrink-0 rounded-lg bg-dmv-blue px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-dmv-lightblue"
                >
                  Start
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <HistoryPanel history={history} onClearHistory={onClearHistory} />
    </div>
  )
}
