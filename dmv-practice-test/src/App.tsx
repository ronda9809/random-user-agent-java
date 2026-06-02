// Top-level app: a tiny state machine between Home, Test, and Result screens.

import { useEffect, useState } from 'react'
import type {
  AnswerRecord,
  Question,
  SessionOptions,
  TestBank,
  TestModeId,
  TestResult,
} from './types'
import { TEST_MODES } from './config/scoring'
import { gradeTest } from './lib/grading'
import { loadHistory, saveResult, clearHistory } from './lib/storage'
import Header from './components/Header'
import Home from './components/Home'
import TestRunner from './components/TestRunner'
import ResultScreen from './components/ResultScreen'

type Screen =
  | { name: 'home' }
  | { name: 'test'; test: TestBank; mode: TestModeId; options: SessionOptions; sessionKey: number }
  | {
      name: 'result'
      result: TestResult
      questions: Question[]
      answers: Record<string, AnswerRecord>
      test: TestBank
      mode: TestModeId
      options: SessionOptions
      attemptNumber: number
    }

export default function App() {
  const [history, setHistory] = useState<TestResult[]>([])
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const [confirmLeave, setConfirmLeave] = useState(false)

  // Load saved history once on startup.
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  function startTest(test: TestBank, mode: TestModeId, options: SessionOptions = {}) {
    setScreen({ name: 'test', test, mode, options, sessionKey: Date.now() })
    window.scrollTo(0, 0)
  }

  function submitTest(
    test: TestBank,
    mode: TestModeId,
    options: SessionOptions,
    questions: Question[],
    answers: Record<string, AnswerRecord>,
  ) {
    const modeConfig = TEST_MODES[mode]
    const result = gradeTest({
      testId: test.id,
      testTitle: test.title,
      mode,
      questions,
      answers,
      passThresholdPercent: modeConfig.passThresholdPercent,
    })

    // Only graded modes (not study mode) are saved to history.
    let updatedHistory = history
    if (modeConfig.trackHistory) {
      updatedHistory = saveResult(result)
      setHistory(updatedHistory)
    }
    const attemptNumber = updatedHistory.filter((h) => h.testId === test.id).length || 1

    setScreen({
      name: 'result',
      result,
      questions,
      answers,
      test,
      mode,
      options,
      attemptNumber,
    })
    window.scrollTo(0, 0)
  }

  function goHome() {
    setConfirmLeave(false)
    setScreen({ name: 'home' })
    window.scrollTo(0, 0)
  }

  // Going home from inside a running test discards progress, so confirm first.
  function requestHome() {
    if (screen.name === 'test') {
      setConfirmLeave(true)
    } else {
      goHome()
    }
  }

  function handleClearHistory() {
    clearHistory()
    setHistory([])
  }

  const subtitle =
    screen.name === 'test' || screen.name === 'result'
      ? `${screen.test.title} · ${TEST_MODES[screen.mode].label}`
      : undefined

  return (
    <div className="min-h-screen bg-dmv-gray">
      <Header subtitle={subtitle} onHome={requestHome} />

      {screen.name === 'home' && (
        <Home history={history} onStart={startTest} onClearHistory={handleClearHistory} />
      )}

      {screen.name === 'test' && (
        <TestRunner
          key={screen.sessionKey}
          test={screen.test}
          mode={screen.mode}
          options={screen.options}
          onSubmit={(questions, answers) =>
            submitTest(screen.test, screen.mode, screen.options, questions, answers)
          }
          onExit={requestHome}
        />
      )}

      {screen.name === 'result' && (
        <ResultScreen
          result={screen.result}
          questions={screen.questions}
          answers={screen.answers}
          attemptNumberForTest={screen.attemptNumber}
          onRetake={() => startTest(screen.test, screen.mode, screen.options)}
          onHome={goHome}
        />
      )}

      {confirmLeave && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Leave this test?</h3>
            <p className="mt-2 text-sm text-gray-600">
              You're in the middle of a test. If you leave now, this attempt won't be saved.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmLeave(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
              >
                Keep going
              </button>
              <button
                onClick={goHome}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Leave test
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-gray-400">
        Practice tool only — not affiliated with the California DMV. Questions are original,
        handbook-based study material. Always confirm current rules at dmv.ca.gov.
      </footer>
    </div>
  )
}
