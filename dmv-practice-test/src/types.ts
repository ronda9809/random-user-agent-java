// Shared type definitions for the DMV practice test app.

// The 13 handbook topics. Declared as a runtime array so the app can iterate
// them (e.g. for topic drills); the `Topic` type is derived from it so the list
// stays the single source of truth.
export const TOPICS = [
  'Road Signs',
  'Right of Way',
  'Speed Limits',
  'Lane Changes',
  'Parking',
  'Freeway Driving',
  'Alcohol & Drugs',
  'Pedestrians & Cyclists',
  'School Zones',
  'Emergency Vehicles',
  'Following Distance',
  'Distracted Driving',
  'Traffic Signals',
] as const

export type Topic = (typeof TOPICS)[number]

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
  /**
   * Which questions were answered correctly in this attempt. Used so "Retry my
   * mistakes" can drop a question once her most recent answer to it is right.
   * Optional for backward-compatibility with results saved before this existed.
   */
  correctQuestionIds?: string[]
}

export type TestModeId = 'original' | 'renewal' | 'practice' | 'study'

/**
 * Per-session overrides layered on top of a mode. Lets sources like Endless,
 * Topic drills, and Retry reuse the existing modes while tweaking length, and
 * powers the optional timed-exam feature.
 */
export interface SessionOptions {
  /** Override the mode's question count for this session. */
  countOverride?: number | 'all'
  /** If set, run a countdown of this many seconds; auto-submit at zero. */
  timedSeconds?: number
}
