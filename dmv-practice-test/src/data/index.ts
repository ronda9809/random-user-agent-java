// Loads all local JSON test banks and exposes them as typed objects, plus a
// flattened question pool used by the Endless / Topic-drill / Retry modes.

import type { Question, TestBank } from '../types'
import test1 from './test1.json'
import test2 from './test2.json'
import test3 from './test3.json'
import test4 from './test4.json'
import test5 from './test5.json'
import test6 from './test6.json'
import test7 from './test7.json'
import test8 from './test8.json'
import test9 from './test9.json'
import test10 from './test10.json'

export const TEST_BANKS: TestBank[] = [
  test1 as TestBank,
  test2 as TestBank,
  test3 as TestBank,
  test4 as TestBank,
  test5 as TestBank,
  test6 as TestBank,
  test7 as TestBank,
  test8 as TestBank,
  test9 as TestBank,
  test10 as TestBank,
]

export function getTestBank(id: string): TestBank | undefined {
  return TEST_BANKS.find((t) => t.id === id)
}

/** Every question across every bank — the pool for Endless/Topic/Retry modes. */
export const ALL_QUESTIONS: Question[] = TEST_BANKS.flatMap((b) => b.questions)

/** Total number of original questions available. */
export const QUESTION_COUNT = ALL_QUESTIONS.length

const QUESTION_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]))

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BY_ID.get(id)
}
