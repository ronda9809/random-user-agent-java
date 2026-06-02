// Landing screen: a readiness meter, Endless Practice, quick options (retry /
// topic drills / timed), focused topic drills, and history — with the detailed
// per-exam / per-mode picker tucked into a collapsible "More options" panel.

import { useMemo, useState } from 'react'
import type { SessionOptions, TestBank, TestModeId, Topic, TestResult } from '../types'
import { TOPICS } from '../types'
import { TEST_MODES, DEFAULT_MODE, correctNeededToPass, allowedMistakes } from '../config/scoring'
import { TEST_BANKS, QUESTION_COUNT } from '../data'
import {
  buildEndlessBank,
  buildRetryBank,
  buildTopicBank,
  topicQuestionCount,
} from '../lib/sources'
import { computeReadiness, type ReadinessLevel } from '../lib/readiness'
import HistoryPanel from './HistoryPanel'

interface HomeProps {
  history: TestResult[]
  onStart: (test: TestBank, mode: TestModeId, options?: SessionOptions) => void
  onClearHistory: () => void
}

const READINESS_STYLES: Record<ReadinessLevel, { box: string; title: string; bar: string }> = {
  ready: { box: 'border-green-300 bg-green-50', title: 'text-green-800', bar: 'bg-green-500' },
  almost: { box: 'border-amber-300 bg-amber-50', title: 'text-amber-900', bar: 'bg-amber-400' },
  'keep-practicing': { box: 'border-red-200 bg-red-50', title: 'text-red-800', bar: 'bg-red-400' },
  'no-data': { box: 'border-gray-200 bg-white', title: 'text-gray-700', bar: 'bg-gray-300' },
}

/** A relevant icon for each topic drill. */
const TOPIC_ICONS: Record<Topic, string> = {
  'Road Signs': '🛑',
  'Right of Way': '🔀',
  'Speed Limits': '🚗',
  'Lane Changes': '↔️',
  Parking: '🅿️',
  'Freeway Driving': '🛣️',
  'Alcohol & Drugs': '🍺',
  'Pedestrians & Cyclists': '🚶',
  'School Zones': '🏫',
  'Emergency Vehicles': '🚑',
  'Following Distance': '📏',
  'Distracted Driving': '📱',
  'Traffic Signals': '🚦',
}

export default function Home({ history, onStart, onClearHistory }: HomeProps) {
  const [mode, setMode] = useState<TestModeId>(DEFAULT_MODE)
  const [timed, setTimed] = useState(false)
  const [endlessLen, setEndlessLen] = useState<20 | 36>(20)
  const modeConfig = TEST_MODES[mode]

  const readiness = useMemo(() => computeReadiness(history), [history])
  const retryBank = useMemo(() => buildRetryBank(history), [history])
  const rStyle = READINESS_STYLES[readiness.level]

  const effectiveCount = (test: TestBank) =>
    modeConfig.questionCount === 'all'
      ? test.questions.length
      : Math.min(modeConfig.questionCount, test.questions.length)

  // Start a session, adding a 1-minute-per-question timer when the "timed"
  // toggle is on and the mode is a graded (non-immediate-feedback) one.
  function start(test: TestBank, m: TestModeId, base: SessionOptions = {}) {
    const cfg = TEST_MODES[m]
    const cnt = base.countOverride ?? cfg.questionCount
    const opts: SessionOptions = { ...base }
    if (timed && typeof cnt === 'number' && !cfg.immediateFeedback) {
      opts.timedSeconds = cnt * 60
    }
    onStart(test, m, opts)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Readiness meter */}
      <section className={`mb-5 rounded-xl border p-4 ${rStyle.box}`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={`text-base font-bold ${rStyle.title}`}>{readiness.title}</h2>
          {readiness.recentAverage != null && (
            <span className={`text-2xl font-black ${rStyle.title}`}>{readiness.recentAverage}%</span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-700">{readiness.detail}</p>
        {readiness.recentCount > 0 && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full ${rStyle.bar}`}
              style={{ width: `${readiness.recentAverage ?? 0}%` }}
            />
          </div>
        )}
      </section>

      {/* Endless practice hero — the primary, default way to practice */}
      <section className="mb-5 rounded-xl bg-dmv-blue p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">♾️ Endless Practice</h2>
            <p className="mt-1 text-sm text-blue-100">
              A fresh, randomly mixed test pulled from all{' '}
              <strong>{QUESTION_COUNT} questions</strong> every time. The best way to keep
              practicing until it's second nature.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-blue-100">Length:</span>
              {([20, 36] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setEndlessLen(n)}
                  className={`rounded-full px-3 py-1 font-medium transition ${
                    endlessLen === n ? 'bg-white text-dmv-blue' : 'bg-white/15 text-white'
                  }`}
                  aria-pressed={endlessLen === n}
                >
                  {n} questions
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => start(buildEndlessBank(), endlessLen === 20 ? 'renewal' : 'original')}
            className="shrink-0 rounded-lg bg-dmv-gold px-6 py-3 text-base font-bold text-dmv-blue shadow hover:brightness-105"
          >
            Start Endless →
          </button>
        </div>
      </section>

      {/* Quick options: retry mistakes · timed toggle */}
      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <div className="font-semibold text-gray-900">🔁 Retry mistakes</div>
            <div className="text-xs text-gray-600">
              {retryBank
                ? `${retryBank.questions.length} still to master`
                : 'Nothing to retry yet'}
            </div>
          </div>
          <button
            onClick={() => retryBank && onStart(retryBank, 'study', { countOverride: 'all' })}
            disabled={!retryBank}
            className="shrink-0 rounded-lg bg-dmv-blue px-4 py-2 text-sm font-semibold text-white hover:bg-dmv-lightblue disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start
          </button>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <div className="font-semibold text-gray-900">⏱ Timed mode</div>
            <div className="text-xs text-gray-600">1 min/question countdown</div>
          </div>
          <input
            type="checkbox"
            checked={timed}
            onChange={(e) => setTimed(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-dmv-blue"
          />
        </label>
      </section>

      {/* Topic drills */}
      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-dmv-blue">🎯 Drill a single topic</h2>
        <p className="mb-3 text-sm text-gray-600">
          Focus on one area at a time. Topic drills show the correct answer and explanation right
          after each question, so they're great for shoring up weak spots.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() =>
                onStart(buildTopicBank(topic), 'study', {
                  countOverride: Math.min(15, topicQuestionCount(topic)),
                })
              }
              className="flex items-start gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-800 transition hover:border-dmv-lightblue hover:bg-blue-50"
            >
              <span aria-hidden className="text-lg leading-none">
                {TOPIC_ICONS[topic]}
              </span>
              <span>
                {topic}
                <span className="block text-xs font-normal text-gray-400">
                  {topicQuestionCount(topic)} questions
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Advanced: individual exams + other modes, collapsed to save space */}
      <details className="mb-6 rounded-xl bg-white shadow-sm">
        <summary className="cursor-pointer select-none rounded-xl p-5 text-lg font-bold text-dmv-blue">
          More options — pick a specific exam or mode
        </summary>
        <div className="border-t border-gray-100 p-5">
          <p className="mb-4 text-sm text-gray-600">
            By default the app uses the <strong>Renewal Test</strong> (20 questions, miss up to 5).
            You can switch modes — a full 36-question exam, a study mode that shows answers as you
            go — and start any individual exam below.
          </p>

          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Test mode</h3>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
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
                  </div>
                </button>
              )
            })}
          </div>

          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">
            Individual exams
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
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
                <div key={test.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
                  <div>
                    <div className="font-semibold text-gray-900">{test.title}</div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {count} questions · need {need} (can miss {canMiss})
                      {attempts.length > 0 && (
                        <>
                          {' '}· taken {attempts.length}×{best !== null && ` · best ${best}%`}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => start(test, mode)}
                    className="rounded-lg bg-dmv-blue px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-dmv-lightblue"
                  >
                    Start
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </details>

      <HistoryPanel history={history} onClearHistory={onClearHistory} />
    </div>
  )
}
