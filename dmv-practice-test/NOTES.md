# Source & Scoring Assumptions

This document records the research behind the test rules and scoring, so the
assumptions are transparent and easy to update if DMV rules change.

_Research date: June 2026. Always confirm current rules at
[dmv.ca.gov](https://www.dmv.ca.gov/) — the app's footer says the same._

## Primary source

The questions and rules are based on the **California Driver's Handbook** (the
official study guide), supplemented by the DMV's testing-process pages. All
questions are **original** restatements of handbook concepts — no copyrighted
third-party question bank was copied.

## Confirmed DMV rules (Class C, non-commercial)

| Rule                         | Value                                   | Notes |
| ---------------------------- | --------------------------------------- | ----- |
| Question type                | Multiple choice                         | Official |
| Original/first-time license  | **36 questions**, need **30 correct**   | ≈83% |
| Renewal (when test required) | **18 questions**                        | First half of the original set |
| Permit / under-18            | 46 questions, need 38 correct           | ≈83% (not a default mode here, but the same threshold) |
| Passing score                | **≈83%** (30 of 36)                     | The app defaults to 83% |
| Attempts allowed             | **3** before reapplying                 | `MAX_DMV_ATTEMPTS` |

### Renewal nuance

California has **eliminated the written knowledge test for most renewals** —
e.g., drivers 70+ and those with clean records often renew without a test. A
renewal knowledge test is generally required only for first-time California
drivers, those new to the state, or renewal customers with poor driving
records. The renewal notice tells the driver whether a test is needed. The app
includes a Renewal mode (18 questions) for the cases where a test **is**
required.

## Scoring decisions in this app

- **Default pass threshold: 83%.** Official DMV materials state the standard as
  30 of 36 (≈83%). The product brief mentioned an **80%** baseline; rather than
  hard-code one interpretation, the threshold lives in
  [`src/config/scoring.ts`](./src/config/scoring.ts) as `passThresholdPercent`
  and can be changed to 80 (or anything) in one place.
- **Test length is configurable per mode** (`questionCount`) specifically
  because **original (36) and renewal (18) differ**. This was an explicit
  requirement.
- **"Correct needed to pass" is always computed** as
  `ceil(threshold% × questionCount)`, so changing either value keeps the math
  consistent.
- **Feedback timing** mirrors the real exam: graded modes hide answers until
  submission; Study Mode reveals them immediately for learning.

## Sources

- California DMV — Prepare for Knowledge and Drive Tests:
  <https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/preparing-for-knowledge-and-drive-tests/>
- California DMV — Driver's Handbook (Section 3: The Testing Process):
  <https://www.dmv.ca.gov/portal/handbook/california-driver-handbook/the-testing-process/>
- California DMV — Driver's Handbook hub:
  <https://www.dmv.ca.gov/portal/driver-handbooks/>
- California DMV — Written Knowledge Test Requirement Eliminated for Most
  Renewals:
  <https://www.dmv.ca.gov/portal/news-and-media/news-releases/written-knowledge-test-requirement-eliminated-for-most-california-drivers-license-renewals/>

> If the DMV updates question counts or thresholds, edit `src/config/scoring.ts`
> and this file — no other code changes are required.
