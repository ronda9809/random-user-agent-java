// Shared type definitions for the DMV practice test app.

export type Topic =
  | 'Road Signs'
  | 'Right of Way'
  | 'Speed Limits'
  | 'Lane Changes'
  | 'Parking'
  | 'Freeway Driving'
  | 'Alcohol & Drugs'
  | 'Pedestrians & Cyclists'
  | 'School Zones'
  | 'Emergency Vehicles'
  | 'Following Distance'
  | 'Distracted Driving'
  | 'Traffic Signals'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  id: string
  question: string
  choices: string[]
  /** Zero-based index into `choices` of the correct option. */
  correct_answer: number
  explanation: string
  topic: Topic
  difficulty: Difficulty
  handbook_reference: string
}

export interface TestBank {
  id: string
  title: string
  description: string
  questions: Question[]
}

/** A user's answer to a single question during a test session. */
export interface AnswerRecord {
  questionId: string
  /** Index of the chosen option, or null if skipped/unanswered. */
  selected: number | null
  flagged: boolean
}

/** Saved result of a completed test, persisted to localStorage. */
export interface TestResult {
  id: string
  testId: string
  testTitle: string
  mode: TestModeId
  /** ISO timestamp of completion. */
  completedAt: string
  totalQuestions: number
  correctCount: number
  wrongCount: number
  scorePercent: number
  passed: boolean
  passThresholdPercent: number
  /** Per-topic correct/total breakdown. */
  topicBreakdown: Record<string, { correct: number; total: number }>
  /** Snapshot of which questions were missed, for later review. */
  missedQuestionIds: string[]
}

export type TestModeId = 'original' | 'renewal' | 'practice' | 'study'
