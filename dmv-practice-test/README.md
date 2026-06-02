# California DMV Practice Knowledge Test

A clean, mobile-friendly practice-test app that simulates the **California DMV
driver knowledge (written) test**. Built for someone preparing for the real exam
(e.g., in Santa Clara County / anywhere in California): take full simulated
exams, get an instant pass/fail result, review every mistake with explanations
and handbook references, and track your scores improving over time.

> Not affiliated with the California DMV. All questions are **original**,
> handbook-based study material — no copyrighted question banks are reproduced.

---

## Quick start

You need [Node.js](https://nodejs.org/) 18+ installed.

```bash
cd dmv-practice-test
npm install
npm run dev
```

Then open the URL it prints (usually <http://localhost:5173>) in your browser.
That's it — no login, no backend, no internet required after install.

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # preview the production build
npm run typecheck  # TypeScript check only
```

---

## How to use it

1. **Pick a mode** (top of the home screen):
   - **Original License Test** — 36 questions, 83% to pass. Mirrors the real
     first-time exam. No feedback until you submit.
   - **Renewal Test** — 18 questions, 83% to pass (the renewal exam is shorter).
   - **Practice Test** — full 36-question simulated exam, results tracked.
   - **Study Mode** — every question, with the correct answer + explanation shown
     **immediately**. Great for learning. Not scored as an attempt.
2. **Pick one of the 4 tests** and press **Start**.
3. Answer one question per screen. You can **flag** questions, **skip** them, use
   **Review all** to jump around, then **Submit** at the end.
4. See your **pass/fail**, score, number correct/wrong, **weak topics**, study
   recommendations, and a **detailed review** of every question.
5. Your scores are saved on your device, and the home screen shows your
   **improvement over time** per test.

---

## What the test simulates (and how to change it)

California's Class C knowledge test (researched from official DMV sources — see
[`NOTES.md`](./NOTES.md) for citations and assumptions):

| Mode                | Questions | Pass mark | Feedback        |
| ------------------- | --------- | --------- | --------------- |
| Original license    | 36        | 83%       | At the end only |
| Renewal             | 18        | 83%       | At the end only |
| Practice            | 36        | 83%       | At the end only |
| Study               | all       | 83%       | Immediate       |

Applicants get **3 attempts** before the application becomes invalid and they
must reapply (shown on the results screen; configurable as `MAX_DMV_ATTEMPTS`).

### Everything scoring-related is in one file

Open **[`src/config/scoring.ts`](./src/config/scoring.ts)** and edit:

- `questionCount` — how many questions each mode uses (`'all'` or a number).
  This is intentionally configurable because **CA rules differ for original vs.
  renewal applicants** (36 vs. 18 questions).
- `passThresholdPercent` — the passing percentage. Defaults to **83%** (the
  DMV's standard, 30/36). The product brief mentioned an **80%** baseline — to
  use that instead, just change this number; the app recomputes "correct needed
  to pass" automatically.
- `immediateFeedback` — whether answers are revealed instantly (study/practice)
  or withheld until submission (real-exam simulation).
- `trackHistory` — whether a mode's results are saved to history.

No other code needs to change.

---

## Project structure

```
dmv-practice-test/
├── README.md
├── NOTES.md                    # source & DMV scoring assumptions (citations)
├── package.json
├── src/
│   ├── config/scoring.ts       # ← edit test length & pass threshold here
│   ├── data/
│   │   ├── test1.json … test4.json   # the 4 question banks (36 questions each)
│   │   └── index.ts
│   ├── lib/
│   │   ├── grading.ts          # pure scoring logic
│   │   ├── select.ts           # builds/shuffles a session's questions
│   │   └── storage.ts          # localStorage history
│   ├── components/             # Home, TestRunner, ResultScreen, etc.
│   ├── types.ts
│   └── App.tsx
└── ...
```

## Question bank format

Each question in `src/data/testN.json` follows this schema:

```json
{
  "id": "t1-q1",
  "question": "A speed limit sign shows the:",
  "choices": ["...", "...", "..."],
  "correct_answer": 0,
  "explanation": "Why the right answer is right...",
  "topic": "Speed Limits",
  "difficulty": "easy",
  "handbook_reference": "California Driver's Handbook — Speed Limits"
}
```

- `correct_answer` is the **zero-based index** into `choices`.
- 4 tests × 36 questions = **144 original questions**, covering all required
  topics: road signs, right of way, speed limits, lane changes, parking, freeway
  driving, alcohol/drugs, pedestrians/cyclists, school zones, emergency vehicles,
  following distance, distracted driving, and traffic signals.

To add questions, just append more objects to a test's `questions` array (keep
`id`s unique). To add a whole new test, create `test5.json` and register it in
`src/data/index.ts`.

---

## Tech

React + TypeScript + Vite + Tailwind CSS. Local JSON question bank. Results
persisted in `localStorage`. No backend.
