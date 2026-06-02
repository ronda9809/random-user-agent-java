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
 * Return a copy of a question with its answer choices shuffled and
 * `correct_answer` remapped to the new position. This keeps the correct option
 * from always sitting in the same slot.
 */
export function shuffleChoices(q: Question): Question {
  const order = shuffle(q.choices.map((_, i) => i))
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    correct_answer: order.indexOf(q.correct_answer),
  }
}

/**
 * Build the list of questions for a session.
 * - `count` 'all' uses every question (study mode).
 * - A numeric `count` caps the length; if the bank has fewer, all are used.
 * - When `randomize` is true the order is shuffled so retakes feel fresh.
 * - Answer choices within each question are always shuffled so the correct
 *   answer is not always in the same position.
 */
export function buildQuestionSet(
  questions: Question[],
  count: number | 'all',
  randomize: boolean,
): Question[] {
  const ordered = randomize ? shuffle(questions) : questions.slice()
  const limited = count === 'all' ? ordered : ordered.slice(0, Math.min(count, ordered.length))
  return limited.map(shuffleChoices)
}
