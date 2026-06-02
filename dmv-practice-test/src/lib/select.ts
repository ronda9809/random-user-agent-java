// Helpers for building a test session's question set from a bank.

import type { Question } from '../types'

/** Fisher-Yates shuffle that returns a new array (does not mutate input). */
export function shuffle<T>(items: T[]): T[] {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Build the list of questions for a session.
 * - `count` 'all' uses every question (study mode).
 * - A numeric `count` caps the length; if the bank has fewer, all are used.
 * - When `randomize` is true the order is shuffled so retakes feel fresh.
 */
export function buildQuestionSet(
  questions: Question[],
  count: number | 'all',
  randomize: boolean,
): Question[] {
  const ordered = randomize ? shuffle(questions) : questions.slice()
  if (count === 'all') return ordered
  return ordered.slice(0, Math.min(count, ordered.length))
}
