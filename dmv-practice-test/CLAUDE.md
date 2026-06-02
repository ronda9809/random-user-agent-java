# CLAUDE.md — project guide for AI agents

A local web app that simulates the **California DMV driver knowledge (written) test**,
built to help someone prepare for a **license renewal** (the owner's license lapsed for
a few years, so a written test is required — see "Domain facts" below).

Not affiliated with the DMV. All questions are **original**, handbook-based study material.

## Commands

Run from this `dmv-practice-test/` directory:

```bash
npm install        # first time
npm run dev        # local dev server (Vite)
npm run build      # type-check + production build -> dist/
npm run build:phone# single self-contained dist-phone/index.html (works offline via file://)
npm run deploy     # build + wrangler pages deploy (needs CLOUDFLARE_API_TOKEN + _ACCOUNT_ID)
npm run typecheck  # tsc only
```

## Where things live

| Path | What |
| --- | --- |
| `src/config/scoring.ts` | **Single source of truth for test length & scoring.** Edit `TEST_MODES` (questionCount, passThresholdPercent), `DEFAULT_MODE`, `MAX_DMV_ATTEMPTS`. |
| `src/data/test1.json` … `test4.json` | The 4 question banks — 36 questions each, 144 total. |
| `src/data/index.ts` | Registers the banks. Add a `test5.json` here to add a test. |
| `src/lib/grading.ts` | Pure scoring + weak-topic logic. |
| `src/lib/select.ts` | Builds a session: shuffles question order **and** answer-choice order. |
| `src/lib/storage.ts` | localStorage history (key `ca-dmv-practice:history:v1`). |
| `src/components/` | `Home`, `TestRunner`, `ResultScreen`, `HistoryPanel`, `Header`. |
| `src/types.ts` | Shared types (`Question`, `TestResult`, `TestModeId`, …). |
| `VALIDATION.md` + `validation-prompt.txt` | How to fact-check questions against dmv.ca.gov using Playwright MCP. |
| `NOTES.md` | Source citations & DMV scoring assumptions. |

## Question schema

Each question in `src/data/*.json`:

```json
{
  "id": "t1-q1",
  "question": "…",
  "choices": ["…", "…", "…", "…"],
  "correct_answer": 0,
  "explanation": "…",
  "topic": "Speed Limits",
  "difficulty": "easy",
  "handbook_reference": "California Driver's Handbook — …"
}
```

Conventions:
- **4 answer choices** per question.
- `correct_answer` is the **0-based index** into `choices`. By convention the keyed
  answer is index `0` in the JSON — the app **shuffles choice order at runtime**, so the
  correct option is not always first. Keep keys at `0` unless you have a reason not to.
- Choice texts within a question must be **unique**.
- `topic` must be one of the 13 in `src/types.ts` (`Topic`).

Quick integrity check after editing questions:
```bash
node -e 'for(const f of ["test1","test2","test3","test4"]){const d=require(`./src/data/${f}.json`);for(const q of d.questions){if(q.choices.length!==4||q.correct_answer<0||q.correct_answer>=q.choices.length||new Set(q.choices).size!==4)console.log("BAD",q.id)}}console.log("checked")'
```

## Domain facts / decisions baked in

- **Renewal test mode is the default**: 20 questions, **can miss up to 5** (15 correct to
  pass) — `passThresholdPercent: 75`. A shorter senior renewal allows 3; the adult/original
  allowance is 5, which fits a lapsed-license applicant.
- The real renewal test is ~18–25 questions depending on version; content is identical
  regardless of count, so the count is just session length.
- **Skips**: the UI lets you skip and return; unanswered at submit counts as a mistake.
- A CA license expired ~1yr+ usually requires the written test in person; a multi-year
  lapse may be treated like a new application and may also require a **drive test** (this
  app can't simulate the drive test). Confirm specifics via the renewal notice / DMV.
- Passing standard ~83% generally; renewal here uses the miss-5 (75%) framing per the
  owner's first-hand recollection.

## Validating against the DMV

This content was written from the California Driver Handbook but **could not be checked
against `dmv.ca.gov` from the cloud build environment** (network-locked + the DMV blocks
bots). To verify locally, follow `VALIDATION.md` (install Playwright MCP, then paste
`validation-prompt.txt`).

## Phone artifact note

`npm run build:phone` builds a classic (non-module) IIFE bundle and moves the inline
script to the end of `<body>` via `scripts/strip-module.mjs`, so the single
`dist-phone/index.html` runs when opened directly from the filesystem (`file://`) on a
phone. Don't "simplify" it back to a `type="module"` script — that breaks file:// use.
