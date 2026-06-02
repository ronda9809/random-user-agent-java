// Computes a simple "are you ready?" signal from saved test history, so the
// home screen can tell the user when they're consistently passing vs. when they
// should keep practicing. Pure function — easy to reason about and tweak.

import type { TestResult } from '../types'

export type ReadinessLevel = 'ready' | 'almost' | 'keep-practicing' | 'no-data'

export interface Readiness {
  level: ReadinessLevel
  /** Headline shown to the user. */
  title: string
  /** One-line explanation / encouragement. */
  detail: string
  /** Average score across the recent attempts considered (0–100), or null. */
  recentAverage: number | null
  /** How many of the recent attempts passed. */
  recentPassed: number
  /** How many recent attempts were considered. */
  recentCount: number
}

/** Number of most-recent graded attempts the meter looks at. */
const WINDOW = 5
/** Need this many recent attempts before we'll call someone "ready". */
const MIN_FOR_READY = 3

/**
 * Decide readiness from history (newest first, as stored).
 * - ready: last few attempts consistently pass with a comfortable margin.
 * - almost: passing most of the time but not yet rock-solid.
 * - keep-practicing: frequently below the line.
 */
export function computeReadiness(history: TestResult[]): Readiness {
  const recent = history.slice(0, WINDOW)
  const recentCount = recent.length

  if (recentCount === 0) {
    return {
      level: 'no-data',
      title: 'Take a test to begin',
      detail: 'Your readiness will appear here once you complete a few exams.',
      recentAverage: null,
      recentPassed: 0,
      recentCount: 0,
    }
  }

  const recentPassed = recent.filter((r) => r.passed).length
  const recentAverage = Math.round(
    recent.reduce((sum, r) => sum + r.scorePercent, 0) / recentCount,
  )
  const passRate = recentPassed / recentCount

  // Ready: enough attempts, all (or nearly all) passing, strong average.
  if (recentCount >= MIN_FOR_READY && passRate >= 0.8 && recentAverage >= 88) {
    return {
      level: 'ready',
      title: "You're ready! 🎉",
      detail: `You've passed ${recentPassed} of your last ${recentCount} tests with a ${recentAverage}% average. Go book that appointment with confidence.`,
      recentAverage,
      recentPassed,
      recentCount,
    }
  }

  // Almost: passing more often than not, or a solid average.
  if (passRate >= 0.6 || recentAverage >= 80) {
    return {
      level: 'almost',
      title: 'Almost there',
      detail: `Recent average ${recentAverage}% (${recentPassed}/${recentCount} passed). A few more clean runs — especially on your weak topics — and you'll be set.`,
      recentAverage,
      recentPassed,
      recentCount,
    }
  }

  return {
    level: 'keep-practicing',
    title: 'Keep practicing',
    detail: `Recent average ${recentAverage}% (${recentPassed}/${recentCount} passed). Use Study mode and Topic drills on what's tripping you up, then retest.`,
    recentAverage,
    recentPassed,
    recentCount,
  }
}
