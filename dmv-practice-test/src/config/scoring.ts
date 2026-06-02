// ============================================================================
// SCORING & TEST CONFIGURATION
// ----------------------------------------------------------------------------
// This is the single place to change how tests are scored and how long they
// are. Everything here is intentionally easy to edit for a non-developer.
//
// Sources & assumptions (see NOTES.md for full citations):
//   - California's Class C knowledge test for ORIGINAL (first-time) applicants
//     has 36 questions; you must answer 30 correctly to pass (~83%).
//   - RENEWAL applicants (when a test is required at all) take the first
//     18 questions.
//   - The DMV's stated passing standard is ~83% (30/36). The product brief
//     mentioned an 80% baseline, so 80% is provided as an easy alternative —
//     just change `passThresholdPercent` below.
//   - Applicants get 3 attempts before the application becomes invalid and
//     they must reapply.
// ============================================================================

import type { TestModeId } from '../types'

export interface TestModeConfig {
  id: TestModeId
  label: string
  description: string
  /**
   * How many questions to draw from the selected test bank.
   * Use a number to cap the length, or 'all' to use the whole bank.
   */
  questionCount: number | 'all'
  /** Passing threshold as a percentage (0-100). */
  passThresholdPercent: number
  /**
   * If true, the correct answer + explanation is revealed immediately after
   * each question (study/practice). If false, feedback is withheld until the
   * test is submitted (real-exam simulation).
   */
  immediateFeedback: boolean
  /** Whether this mode counts toward saved history / improvement tracking. */
  trackHistory: boolean
}

/** Number of attempts the real DMV allows before you must reapply. */
export const MAX_DMV_ATTEMPTS = 3

/**
 * Test modes. Edit `questionCount` and `passThresholdPercent` here to match
 * whatever rules apply to your situation.
 */
export const TEST_MODES: Record<TestModeId, TestModeConfig> = {
  original: {
    id: 'original',
    label: 'Original License Test',
    description:
      'First-time California license. 36 questions, 83% required to pass — mirrors the real DMV exam. No feedback until you submit.',
    questionCount: 36,
    passThresholdPercent: 83, // 30 of 36 correct
    immediateFeedback: false,
    trackHistory: true,
  },
  renewal: {
    id: 'renewal',
    label: 'Renewal Test',
    description:
      'License renewal (when a knowledge test is required). 18 questions, 83% required to pass. No feedback until you submit.',
    questionCount: 18,
    passThresholdPercent: 83, // ~15 of 18 correct
    immediateFeedback: false,
    trackHistory: true,
  },
  practice: {
    id: 'practice',
    label: 'Practice Test',
    description:
      'A full-length 36-question simulated exam for practice. Results are tracked so you can watch your scores improve. No feedback until you submit.',
    questionCount: 36,
    passThresholdPercent: 83,
    immediateFeedback: false,
    trackHistory: true,
  },
  study: {
    id: 'study',
    label: 'Study Mode',
    description:
      'Learn as you go. The correct answer and explanation appear immediately after each question. Not scored as a real attempt.',
    questionCount: 'all',
    passThresholdPercent: 83,
    immediateFeedback: true,
    trackHistory: false,
  },
}

export const DEFAULT_MODE: TestModeId = 'original'

/** Compute how many correct answers are needed to pass, given a total. */
export function correctNeededToPass(total: number, thresholdPercent: number): number {
  return Math.ceil((thresholdPercent / 100) * total)
}
