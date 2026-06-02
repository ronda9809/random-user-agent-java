// Pure grading logic — no React, no storage. Easy to reason about and test.

import type { AnswerRecord, Question, TestResult, TestModeId } from '../types'
import { correctNeededToPass } from '../config/scoring'

export interface GradeInput {
  testId: string
  testTitle: string
  mode: TestModeId
  questions: Question[]
  answers: Record<string, AnswerRecord>
  passThresholdPercent: number
}

/** Grade a completed test and produce a saveable result. */
export function gradeTest(input: GradeInput): TestResult {
  const { questions, answers, passThresholdPercent } = input

  let correctCount = 0
  const missedQuestionIds: string[] = []
  const topicBreakdown: Record<string, { correct: number; total: number }> = {}

  for (const q of questions) {
    const bucket = (topicBreakdown[q.topic] ??= { correct: 0, total: 0 })
    bucket.total += 1

    const ans = answers[q.id]
    const isCorrect = ans != null && ans.selected === q.correct_answer
    if (isCorrect) {
      correctCount += 1
      bucket.correct += 1
    } else {
      missedQuestionIds.push(q.id)
    }
  }

  const totalQuestions = questions.length
  const wrongCount = totalQuestions - correctCount
  const scorePercent =
    totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 1000) / 10
  const needed = correctNeededToPass(totalQuestions, passThresholdPercent)
  const passed = correctCount >= needed

  return {
    id: `${input.testId}-${Date.now()}`,
    testId: input.testId,
    testTitle: input.testTitle,
    mode: input.mode,
    completedAt: new Date().toISOString(),
    totalQuestions,
    correctCount,
    wrongCount,
    scorePercent,
    passed,
    passThresholdPercent,
    topicBreakdown,
    missedQuestionIds,
  }
}

/** Topics sorted weakest-first (lowest accuracy), excluding fully-correct ones. */
export function weakTopics(result: TestResult): Array<{
  topic: string
  correct: number
  total: number
  percent: number
}> {
  return Object.entries(result.topicBreakdown)
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    }))
    .filter((t) => t.correct < t.total)
    .sort((a, b) => a.percent - b.percent)
}
