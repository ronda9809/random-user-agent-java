// The test-taking experience: one question per screen, progress, flagging,
// skipping, a question navigator, and submission. In study/practice immediate-
// feedback mode the correct answer is revealed right after answering.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { AnswerRecord, Question, SessionOptions, TestBank, TestModeId } from '../types'
import { TEST_MODES } from '../config/scoring'
import { buildQuestionSet } from '../lib/select'

interface TestRunnerProps {
  test: TestBank
  mode: TestModeId
  options: SessionOptions
  onSubmit: (questions: Question[], answers: Record<string, AnswerRecord>) => void
  onExit: () => void
}

export default function TestRunner({ test, mode, options, onSubmit, onExit }: TestRunnerProps) {
  const modeConfig = TEST_MODES[mode]
  const count = options.countOverride ?? modeConfig.questionCount

  // Build the question set once per mount so it stays stable during the session.
  const questions = useMemo(
    () => buildQuestionSet(test.questions, count, true),
    [test, count],
  )

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>(() => {
    const init: Record<string, AnswerRecord> = {}
    for (const q of questions) init[q.id] = { questionId: q.id, selected: null, flagged: false }
    return init
  })
  // Tracks which questions have had their answer "locked in" for study mode feedback.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [showNavigator, setShowNavigator] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // --- Optional countdown timer -------------------------------------------
  const [remaining, setRemaining] = useState<number | null>(options.timedSeconds ?? null)
  const submittedRef = useRef(false)
  // Keep the latest answers reachable from the timer callback without resetting it.
  const answersRef = useRef(answers)
  answersRef.current = answers

  function finish(finalAnswers: Record<string, AnswerRecord>) {
    if (submittedRef.current) return
    submittedRef.current = true
    onSubmit(questions, finalAnswers)
  }

  useEffect(() => {
    if (options.timedSeconds == null) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r == null) return r
        if (r <= 1) {
          clearInterval(id)
          finish(answersRef.current)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.timedSeconds])

  const q = questions[current]
  const answer = answers[q.id]
  const isRevealed = modeConfig.immediateFeedback && !!revealed[q.id]
  const answeredCount = Object.values(answers).filter((a) => a.selected !== null).length
  const flaggedCount = Object.values(answers).filter((a) => a.flagged).length

  function select(choiceIndex: number) {
    // In immediate-feedback mode, once revealed the answer is locked.
    if (isRevealed) return
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { ...prev[q.id], selected: choiceIndex },
    }))
    if (modeConfig.immediateFeedback) {
      setRevealed((prev) => ({ ...prev, [q.id]: true }))
    }
  }

  function toggleFlag() {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { ...prev[q.id], flagged: !prev[q.id].flagged },
    }))
  }

  function go(index: number) {
    setCurrent(Math.max(0, Math.min(questions.length - 1, index)))
    setShowNavigator(false)
  }

  const isLast = current === questions.length - 1

  function handleSubmit() {
    finish(answers)
  }

  const lowTime = remaining != null && remaining <= 30
  const timeLabel =
    remaining == null
      ? null
      : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
          <span>
            Question {current + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-3">
            {timeLabel != null && (
              <span
                className={`rounded-full px-2 py-0.5 font-mono font-semibold tabular-nums ${
                  lowTime ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
                aria-label="Time remaining"
              >
                ⏱ {timeLabel}
              </span>
            )}
            <span>
              {answeredCount} answered · {flaggedCount} flagged
            </span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-dmv-blue transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-dmv-blue">
            {q.topic}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize text-gray-600">
            {q.difficulty}
          </span>
          {answer.flagged && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-800">
              ⚑ Flagged
            </span>
          )}
        </div>

        <h2 className="mb-4 text-lg font-semibold text-gray-900">{q.question}</h2>

        <div className="space-y-2.5">
          {q.choices.map((choice, i) => {
            const selected = answer.selected === i
            const isCorrect = i === q.correct_answer
            let stateClasses = 'border-gray-200 bg-white hover:border-dmv-lightblue'
            if (isRevealed) {
              if (isCorrect) stateClasses = 'border-green-500 bg-green-50'
              else if (selected) stateClasses = 'border-red-400 bg-red-50'
              else stateClasses = 'border-gray-200 bg-white opacity-70'
            } else if (selected) {
              stateClasses = 'border-dmv-blue bg-blue-50'
            }
            return (
              <button
                key={i}
                onClick={() => select(i)}
                disabled={isRevealed}
                className={`flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition ${stateClasses}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                    selected ? 'border-dmv-blue text-dmv-blue' : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-gray-900">{choice}</span>
                {isRevealed && isCorrect && (
                  <span className="ml-auto font-bold text-green-600">✓</span>
                )}
                {isRevealed && selected && !isCorrect && (
                  <span className="ml-auto font-bold text-red-500">✕</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Immediate feedback (study/practice mode only) */}
        {isRevealed && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
            <div className="font-semibold text-dmv-blue">
              {answer.selected === q.correct_answer ? 'Correct!' : 'Not quite.'}
            </div>
            <p className="mt-1 text-gray-700">{q.explanation}</p>
            <p className="mt-2 text-xs italic text-gray-500">Reference: {q.handbook_reference}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => go(current - 1)}
          disabled={current === 0}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          onClick={toggleFlag}
          className={`rounded-lg border px-4 py-2 text-sm font-medium ${
            answer.flagged
              ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
              : 'border-gray-300 bg-white text-gray-700'
          }`}
        >
          {answer.flagged ? '⚑ Unflag' : '⚑ Flag for review'}
        </button>
        <button
          onClick={() => setShowNavigator((s) => !s)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
        >
          Review all
        </button>

        <div className="ml-auto flex gap-2">
          {!isLast && (
            <button
              onClick={() => go(current + 1)}
              className="rounded-lg bg-dmv-blue px-5 py-2 text-sm font-semibold text-white hover:bg-dmv-lightblue"
            >
              {answer.selected === null ? 'Skip →' : 'Next →'}
            </button>
          )}
          {isLast && (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Submit test
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button onClick={onExit} className="text-xs text-gray-400 underline hover:text-gray-600">
          Quit and return to menu
        </button>
      </div>

      {/* Question navigator */}
      {showNavigator && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Jump to a question</h3>
            <div className="flex gap-3 text-xs text-gray-500">
              <span><span className="mr-1 inline-block h-3 w-3 rounded bg-dmv-blue align-middle" />Answered</span>
              <span><span className="mr-1 inline-block h-3 w-3 rounded bg-yellow-300 align-middle" />Flagged</span>
              <span><span className="mr-1 inline-block h-3 w-3 rounded border border-gray-300 bg-white align-middle" />Skipped</span>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
            {questions.map((qq, i) => {
              const a = answers[qq.id]
              let cls = 'border-gray-300 bg-white text-gray-700'
              if (a.flagged) cls = 'border-yellow-400 bg-yellow-300 text-yellow-900'
              else if (a.selected !== null) cls = 'border-dmv-blue bg-dmv-blue text-white'
              return (
                <button
                  key={qq.id}
                  onClick={() => go(i)}
                  className={`h-9 rounded border text-sm font-medium ${cls} ${
                    i === current ? 'ring-2 ring-dmv-gold' : ''
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="mt-4 w-full rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
          >
            Submit test now
          </button>
        </div>
      )}

      {/* Submit confirmation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Submit your test?</h3>
            <p className="mt-2 text-sm text-gray-600">
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <> Unanswered questions will be marked incorrect.</>
              )}
              {flaggedCount > 0 && <> You still have {flaggedCount} flagged.</>}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                Keep working
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
