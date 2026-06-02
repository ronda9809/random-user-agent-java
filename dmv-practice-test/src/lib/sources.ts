// Builders for "synthetic" test banks drawn from the whole question pool:
//   - Endless practice: a fresh random session from every bank.
//   - Topic drill:      only one topic, for focused study.
//   - Retry mistakes:   only questions previously missed (from saved history).
//
// Each returns a TestBank shaped exactly like the JSON banks, so the rest of the
// app (TestRunner, grading, history) treats them identically. The TestRunner
// shuffles and slices on its own, so we just supply the candidate questions.

import type { Question, TestBank, TestResult, Topic } from '../types'
import { ALL_QUESTIONS, getQuestionById } from '../data'

export const ENDLESS_ID = 'endless'
export const RETRY_ID = 'retry'
export const TOPIC_ID_PREFIX = 'topic:'

/** Stable id for a topic drill, e.g. "topic:Road Signs". */
export function topicBankId(topic: Topic): string {
  return `${TOPIC_ID_PREFIX}${topic}`
}

/** A fresh Endless session — the TestRunner randomizes order and picks N. */
export function buildEndlessBank(): TestBank {
  return {
    id: ENDLESS_ID,
    title: 'Endless Practice',
    description:
      'A fresh, randomly mixed session drawn from every question in the pool. Take it as many times as you like — you will rarely see the same test twice.',
    questions: ALL_QUESTIONS,
  }
}

/** A drill containing only the questions for one topic. */
export function buildTopicBank(topic: Topic): TestBank {
  return {
    id: topicBankId(topic),
    title: `Topic Drill — ${topic}`,
    description: `Focused practice on ${topic} questions only.`,
    questions: ALL_QUESTIONS.filter((q) => q.topic === topic),
  }
}

/** How many questions a topic has available (for showing counts in the UI). */
export function topicQuestionCount(topic: Topic): number {
  return ALL_QUESTIONS.filter((q) => q.topic === topic).length
}

/**
 * Question ids that are still "unmastered": the user's MOST RECENT answer to
 * them was wrong (or unanswered). A question that was missed earlier but later
 * answered correctly drops off the list, so the set of mistakes shrinks as she
 * improves. Newest mistakes first.
 *
 * `history` is newest-first (as stored), so the first time we see an id decides
 * its latest outcome.
 */
export function unmasteredQuestionIds(history: TestResult[]): string[] {
  const latestWasCorrect = new Map<string, boolean>()
  for (const r of history) {
    // correct first, so an id correct & missed in the same attempt can't happen,
    // but if it somehow did, correct wins for that (latest) attempt.
    for (const id of r.correctQuestionIds ?? []) {
      if (!latestWasCorrect.has(id)) latestWasCorrect.set(id, true)
    }
    for (const id of r.missedQuestionIds) {
      if (!latestWasCorrect.has(id)) latestWasCorrect.set(id, false)
    }
  }
  const ids: string[] = []
  for (const [id, correct] of latestWasCorrect) {
    if (!correct) ids.push(id)
  }
  return ids
}

/**
 * Build a "Retry my mistakes" bank from saved history. Returns null if the user
 * has no outstanding mistakes (so the UI can disable the option).
 */
export function buildRetryBank(history: TestResult[]): TestBank | null {
  const questions: Question[] = []
  for (const id of unmasteredQuestionIds(history)) {
    const q = getQuestionById(id)
    if (q) questions.push(q)
  }
  if (questions.length === 0) return null
  return {
    id: RETRY_ID,
    title: 'Retry My Mistakes',
    description: `Re-quiz yourself on the ${questions.length} question${
      questions.length === 1 ? '' : 's'
    } you have missed in past tests, with the explanation shown after each one.`,
    questions,
  }
}
