// localStorage persistence for test history. No backend required.

import type { TestResult } from '../types'

const STORAGE_KEY = 'ca-dmv-practice:history:v1'

/** Read all saved results, newest first. Tolerant of corrupt/empty storage. */
export function loadHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as TestResult[]
  } catch {
    return []
  }
}

/** Append a result and persist. Returns the updated list (newest first). */
export function saveResult(result: TestResult): TestResult[] {
  const history = loadHistory()
  const updated = [result, ...history]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Storage full or unavailable — fail silently; the in-memory result still shows.
  }
  return updated
}

/** Remove all saved history. */
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Results for one specific test bank, oldest first (for trend charts). */
export function resultsForTest(history: TestResult[], testId: string): TestResult[] {
  return history
    .filter((r) => r.testId === testId)
    .slice()
    .reverse()
}
