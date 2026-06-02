# Validating the question bank against the official California DMV

The cloud environment that built this app **cannot reach `dmv.ca.gov`** (locked-down
network + the DMV blocks automated requests). **Claude Code running locally on your
own machine can**, because it uses your normal network and can drive a real browser.

This file is a ready-to-run procedure to have a local Claude Code agent verify every
question against the official **California Driver Handbook** (the document the real
test is based on) and confirm the test format/scoring.

---

## What is "authoritative"

- **Question content & rules** → the **California Driver Handbook** is the source of
  truth. Validate the 144 questions in `src/data/*.json` against it.
- **Test format (question count, allowed mistakes, whether a drive test is required
  for a lapsed license)** → this is operational DMV info that varies by case. Best
  confirmed on `dmv.ca.gov` and, ultimately, on the **renewal notice** / by calling
  the Santa Clara field office.

---

## Step 1 — Get the repo locally

```bash
git clone https://github.com/ronda9809/random-user-agent-java.git
cd random-user-agent-java
git checkout claude/dmv-practice-test-app-G17gb
cd dmv-practice-test
```

## Step 2 — Give Claude Code a real browser (Playwright MCP)

Prerequisite: Node.js 18+.

```bash
claude mcp add --transport stdio playwright -- npx -y @playwright/mcp@latest
```

This launches a real Chromium that Claude controls, so it can load pages that block
bots. (There is no official Chrome-extension equivalent for Claude Code; this is the
supported approach.)

## Step 3 — Run the validation

Start Claude Code in the `dmv-practice-test` folder and paste the prompt below
(also saved as `validation-prompt.txt`).

---

### The prompt to paste

> You have the Playwright MCP available. I need you to fact-check this DMV practice
> test against official California sources.
>
> 1. Using Playwright, open https://www.dmv.ca.gov/portal/driver-handbooks/ and find
>    the current official **California Driver Handbook** (English). Read the relevant
>    sections. If a PDF is offered, download it locally and read that.
> 2. Also open the DMV pages on the knowledge test and license renewal to confirm:
>    the number of questions, how many mistakes are allowed to pass, the passing
>    percentage, the number of attempts, and the rules when a license has been
>    **expired for several years** (is the written test required? is it treated like
>    a new/original application? is a behind-the-wheel drive test required?).
> 3. Open every file in `src/data/test1.json` … `test4.json` (144 questions). For
>    each question, verify the `question`, the keyed correct answer (`correct_answer`
>    is the index into `choices`), and the `explanation` against the handbook. Flag
>    anything inaccurate, outdated, ambiguous, or where a distractor is arguably also
>    correct.
> 4. Verify the scoring config in `src/config/scoring.ts` (question counts and pass
>    thresholds) matches what the DMV actually does for a renewal vs. an original /
>    lapsed-license applicant.
> 5. Produce a report: a table of any discrepancies with the exact handbook citation,
>    then, with my approval, apply fixes to the JSON/config and rebuild
>    (`npm run build` and `npm run build:phone`).
>
> Cite the specific handbook section or DMV URL for every correction. Do not change a
> question unless you can cite a source. Be conservative: if the handbook is silent or
> ambiguous, leave the question and note it.

---

## Faster alternative (no browser, if the PDF is reachable)

Local Claude Code can often just download the handbook PDF and read it directly:

```bash
# Ask Claude, or run manually — adjust the URL to the current official PDF:
curl -L -o ca-handbook.pdf "https://www.dmv.ca.gov/portal/file/california-driver-handbook-pdf/"
```

Then tell Claude: *"Read `ca-handbook.pdf` and validate every question in
`src/data/*.json` against it; report discrepancies with page citations."*
(Claude's Read tool handles PDFs ~20 pages per call.) If that download 403s, fall
back to the Playwright method above.

---

## After validation

Commit any fixes and rebuild the single-file artifact:

```bash
npm run build:phone   # regenerates dist-phone/index.html for the phone
```
