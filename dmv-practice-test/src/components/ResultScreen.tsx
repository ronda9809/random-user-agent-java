// Post-test results: pass/fail, score breakdown, weak topics, study
// recommendations, and a detailed review of every question (right & wrong).

import { useState } from 'react'
import type { AnswerRecord, Question, TestResult } from '../types'
import { weakTopics } from '../lib/grading'
import { correctNeededToPass } from '../config/scoring'

interface ResultScreenProps {
  result: TestResult
  questions: Question[]
  answers: Record<string, AnswerRecord>
  attemptNumberForTest: number
  onRetake: () => void
  onHome: () => void
}

export default function ResultScreen({
  result,
  questions,
  answers,
  attemptNumberForTest,
  onRetake,
  onHome,
}: ResultScreenProps) {
  const [reviewFilter, setReviewFilter] = useState<'missed' | 'all'>('missed')
  const needed = correctNeededToPass(result.totalQuestions, result.passThresholdPercent)
  const canMiss = result.totalQuestions - needed
  const weak = weakTopics(result)

  const reviewQuestions =
    reviewFilter === 'missed'
      ? questions.filter((q) => result.missedQuestionIds.includes(q.id))
      : questions

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Pass/fail banner */}
      <div
        className={`mb-6 rounded-xl p-6 text-center text-white shadow ${
          result.passed ? 'bg-green-600' : 'bg-red-500'
        }`}
      >
        <div className="text-sm font-medium uppercase tracking-wide opacity-90">
          {result.testTitle} · Attempt {attemptNumberForTest}
        </div>
        <div className="mt-1 text-4xl font-extrabold">
          {result.passed ? 'PASSED' : 'NOT PASSED'}
        </div>
        <div className="mt-2 text-5xl font-black">{result.scorePercent}%</div>
        <div className="mt-2 text-sm opacity-95">
          {result.correctCount} correct · {result.wrongCount} wrong · needed {needed} of{' '}
          {result.totalQuestions} to pass (could miss up to {canMiss})
        </div>
        {!result.passed && (
          <p className="mx-auto mt-3 max-w-md text-sm opacity-95">
            Keep practicing! Review the explanations below, focus on your weak topics, and try
            again. On the real exam you get 3 attempts before you must reapply.
          </p>
        )}
      </div>

      {/* Score stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Correct" value={result.correctCount} tone="green" />
        <Stat label="Wrong" value={result.wrongCount} tone="red" />
        <Stat label="Score" value={`${result.scorePercent}%`} tone="blue" />
      </div>

      {/* Weak topics + recommendations */}
      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-dmv-blue">What to study next</h2>
        {weak.length === 0 ? (
          <p className="text-sm text-gray-600">
            Excellent — you answered every topic correctly! Take another exam to keep your skills
            sharp.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-600">
              These topics gave you the most trouble. Review the related handbook sections, then
              retake the test.
            </p>
            <div className="space-y-2">
              {weak.map((t) => (
                <div key={t.topic} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm font-medium text-gray-800">{t.topic}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${
                        t.percent >= 80 ? 'bg-green-500' : t.percent >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-gray-500">
                    {t.correct}/{t.total} ({t.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Detailed review */}
      <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-dmv-blue">Review answers</h2>
          <div className="flex rounded-lg border border-gray-200 p-0.5 text-sm">
            <button
              onClick={() => setReviewFilter('missed')}
              className={`rounded px-3 py-1 font-medium ${
                reviewFilter === 'missed' ? 'bg-dmv-blue text-white' : 'text-gray-600'
              }`}
            >
              Missed ({result.wrongCount})
            </button>
            <button
              onClick={() => setReviewFilter('all')}
              className={`rounded px-3 py-1 font-medium ${
                reviewFilter === 'all' ? 'bg-dmv-blue text-white' : 'text-gray-600'
              }`}
            >
              All ({result.totalQuestions})
            </button>
          </div>
        </div>

        {reviewQuestions.length === 0 ? (
          <p className="text-sm text-gray-600">No missed questions — perfect score on the review!</p>
        ) : (
          <ol className="space-y-4">
            {reviewQuestions.map((q) => {
              const selected = answers[q.id]?.selected ?? null
              const correct = selected === q.correct_answer
              return (
                <li key={q.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-dmv-blue">
                      {q.topic}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {correct ? '✓ Correct' : '✕ Incorrect'}
                    </span>
                  </div>
                  <p className="mb-2 font-semibold text-gray-900">{q.question}</p>
                  <ul className="space-y-1 text-sm">
                    {q.choices.map((c, i) => {
                      const isAnswer = i === q.correct_answer
                      const isYours = i === selected
                      return (
                        <li
                          key={i}
                          className={`rounded px-2 py-1 ${
                            isAnswer
                              ? 'bg-green-50 font-medium text-green-800'
                              : isYours
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + i)}. {c}
                          {isAnswer && ' ✓ (correct answer)'}
                          {isYours && !isAnswer && ' ← your answer'}
                          {isYours && isAnswer && ' ← your answer'}
                        </li>
                      )
                    })}
                    {selected === null && (
                      <li className="px-2 py-1 italic text-gray-400">You skipped this question.</li>
                    )}
                  </ul>
                  <div className="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-700">
                    <span className="font-semibold">Why: </span>
                    {q.explanation}
                  </div>
                  <p className="mt-1 text-xs italic text-gray-500">
                    Reference: {q.handbook_reference}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRetake}
          className="flex-1 rounded-lg bg-dmv-blue px-5 py-3 font-semibold text-white hover:bg-dmv-lightblue"
        >
          Retake this test
        </button>
        <button
          onClick={onHome}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to menu
        </button>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: 'green' | 'red' | 'blue'
}) {
  const tones = {
    green: 'text-green-600',
    red: 'text-red-500',
    blue: 'text-dmv-blue',
  }
  return (
    <div className="rounded-xl bg-white p-4 text-center shadow-sm">
      <div className={`text-2xl font-extrabold ${tones[tone]}`}>{value}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  )
}
