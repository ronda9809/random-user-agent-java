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
      <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="mb-1 text-base font-bold text-amber-900">
          Renewing a license that's been expired a while?
        </h2>
        <p className="text-sm text-amber-900/90">
          If your California license has been expired for about a year or more, the DMV usually
          has you <strong>apply in person and pass the written test</strong>, and a multi-year
          lapse is often handled like a new application — meaning the <strong>full 36-question
          test (30 correct to pass)</strong>, and sometimes a behind-the-wheel drive test too.
          So practice the <strong>Full Knowledge Test (36 Q)</strong> below — it covers everything
          on the shorter renewal version as well. Confirm your exact requirements on your renewal
          notice or with the DMV when you book your Santa Clara appointment.
        </p>
      </section>

      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-dmv-blue">Choose your test mode</h2>
        <p className="mb-4 text-sm text-gray-600">
          The full California exam is 36 questions (30 correct to pass, ~83%); the short renewal
          version is 18 questions (15 to pass). All questions come from the California Driver
          Handbook.
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
