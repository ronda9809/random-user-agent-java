// Loads all local JSON test banks and exposes them as typed objects.

import type { TestBank } from '../types'
import test1 from './test1.json'
import test2 from './test2.json'
import test3 from './test3.json'
import test4 from './test4.json'

export const TEST_BANKS: TestBank[] = [
  test1 as TestBank,
  test2 as TestBank,
  test3 as TestBank,
  test4 as TestBank,
]

export function getTestBank(id: string): TestBank | undefined {
  return TEST_BANKS.find((t) => t.id === id)
}
