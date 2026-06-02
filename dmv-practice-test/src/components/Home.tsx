// Landing screen: choose a mode and a test, and see your history at a glance.

import { useState } from 'react'
import type { TestBank, TestModeId, TestResult } from '../types'
import { TEST_MODES, DEFAULT_MODE, correctNeededToPass, allowedMistakes } from '../config/scoring'
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
        <h2 className="mb-1 text-base font-bold text-amber-900">How the test is scored</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900/90">
          <li>
            The renewal test is about <strong>20 questions</strong>, and you can{' '}
            <strong>miss up to 5</strong> and still pass (you need 15 correct).
          </li>
          <li>
            <strong>Skips:</strong> you can skip a question and come back to it later. A skip only
            counts against you if you <strong>leave it blank when you submit</strong> — then it's
            a mistake. So make sure nothing is left unanswered.
          </li>
          <li>
            The exact count and allowance vary slightly by test version (renewal often allows 3,
            original up to 5). It's all the same Driver Handbook material — aim to miss as few as
            possible. When you book the Santa Clara appointment you can confirm if a drive test is
            also needed.
          </li>
        </ul>
      </section>

      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-dmv-blue">Choose your test mode</h2>
        <p className="mb-4 text-sm text-gray-600">
          The renewal test is about 18–25 questions (set to 20 here); the full pool is 36. Either
          way you need ~83% to pass, and all questions come from the California Driver Handbook.
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
                    {m.questionCount === 'all'
                      ? `Pass: ${m.passThresholdPercent}%`
                      : `Can miss ${allowedMistakes(m.questionCount, m.passThresholdPercent)}`}
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
            const canMiss = allowedMistakes(count, modeConfig.passThresholdPercent)
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
                    {count} questions · need {need} correct (can miss {canMiss})
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
