// Top-level app: a tiny state machine between Home, Test, and Result screens.

import { useEffect, useState } from 'react'
import type { AnswerRecord, Question, TestBank, TestModeId, TestResult } from './types'
import { TEST_MODES } from './config/scoring'
import { gradeTest } from './lib/grading'
import { loadHistory, saveResult, clearHistory } from './lib/storage'
import Header from './components/Header'
import Home from './components/Home'
import TestRunner from './components/TestRunner'
import ResultScreen from './components/ResultScreen'

type Screen =
  | { name: 'home' }
  | { name: 'test'; test: TestBank; mode: TestModeId; sessionKey: number }
  | {
      name: 'result'
      result: TestResult
      questions: Question[]
      answers: Record<string, AnswerRecord>
      test: TestBank
      mode: TestModeId
      attemptNumber: number
    }

export default function App() {
  const [history, setHistory] = useState<TestResult[]>([])
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  // Load saved history once on startup.
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  function startTest(test: TestBank, mode: TestModeId) {
    setScreen({ name: 'test', test, mode, sessionKey: Date.now() })
    window.scrollTo(0, 0)
  }

  function submitTest(
    test: TestBank,
    mode: TestModeId,
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
      attemptNumber,
    })
    window.scrollTo(0, 0)
  }

  function goHome() {
    setScreen({ name: 'home' })
    window.scrollTo(0, 0)
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
      <Header subtitle={subtitle} />

      {screen.name === 'home' && (
        <Home history={history} onStart={startTest} onClearHistory={handleClearHistory} />
      )}

      {screen.name === 'test' && (
        <TestRunner
          key={screen.sessionKey}
          test={screen.test}
          mode={screen.mode}
          onSubmit={(questions, answers) =>
            submitTest(screen.test, screen.mode, questions, answers)
          }
          onExit={goHome}
        />
      )}

      {screen.name === 'result' && (
        <ResultScreen
          result={screen.result}
          questions={screen.questions}
          answers={screen.answers}
          attemptNumberForTest={screen.attemptNumber}
          onRetake={() => startTest(screen.test, screen.mode)}
          onHome={goHome}
        />
      )}

      <footer className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-gray-400">
        Practice tool only — not affiliated with the California DMV. Questions are original,
        handbook-based study material. Always confirm current rules at dmv.ca.gov.
      </footer>
    </div>
  )
}
