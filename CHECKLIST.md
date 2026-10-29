# CHECKLIST.md — Celebration & Event Planner (PromptWars Challenge 05)

> Progress tracker. Companion to `PROJECT_SPEC.md` (the spec is the source of truth; this file is the to-do list).
> The AI agent must tick items (`- [x]`) as they are completed and must not tick anything that isn't actually done and verified.

**Hard deadline: 1 Nov 2026, 11:59 PM IST. Target submission: 31 Oct.**

---

## 0. Repo Structure (fixed, do not change without reason)

Clean `frontend/` + `backend/` split inside one repo, on **one branch (`main`)**.

```
event-planner/
├── README.md
├── PROJECT_SPEC.md
├── CHECKLIST.md
├── .gitignore
├── .env.example
├── package.json              # root scripts: dev, build, start, test, lint
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js          # starts server
│       ├── app.js            # express app (importable by tests)
│       ├── config/           # env + eventConfig (all constants)
│       ├── routes/
│       ├── controllers/
│       ├── services/         # rulesEngine/, geminiService.js, cache.js, icsService.js
│       ├── prompts/
│       ├── schemas/          # zod schemas
│       ├── middleware/
│       └── __tests__/
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        ├── components/
        ├── hooks/
        ├── styles/
        └── __tests__/
```

- [x] Structure created exactly as above
- [x] Root `package.json` scripts work: `npm run dev`, `npm run build`, `npm start`, `npm test`, `npm run lint`
- [x] In production, Express serves `frontend/dist` → **one live URL**

---

# 🗂️ BUILD SESSIONS — Prompt-by-Prompt Plan

> Each session ends with a ✅ **YOU TEST** checkpoint before moving to the next.
> After you verify, say "done" or "next" and we proceed.

---

## SESSION 1 — Project Scaffold & Setup
**What gets built:** Folder structure, package configs, git files, ESLint/Prettier, CI workflow.

### Phase 1 — Setup
- [x] Create GitHub repo, set to **Public**
- [x] Only branch is `main` (verify: `git branch -a` shows one)
- [x] `.gitignore` covers: `node_modules`, `dist`, `.env`, `*.log`, `coverage`, OS/editor files
- [x] `.env.example` with: `GEMINI_API_KEY=`, `GEMINI_MODEL=`, `PORT=`, `CORS_ORIGIN=`, `NODE_ENV=`
- [x] Real `.env` created locally, **never committed** (check `git log -p` for leaked keys)
- [x] Gemini API key created in Google AI Studio; free-tier Flash model name noted in `.env.example`
- [x] ESLint + Prettier configured for both folders
- [x] Vitest coverage reporting configured; `npm test -- --coverage` (or documented equivalent) works
- [x] GitHub Actions workflow at `.github/workflows/ci.yml` runs lint and tests on pushes / pull requests to `main`
- [x] First commit pushed

> ✅ **YOU TEST:** Run `npm run lint` and `npm test` — both should exit cleanly. Check folder structure matches the tree above.

---

## SESSION 2 — Backend: Config & Zod Schema
**What gets built:** `eventConfig.js` with all constants + zod request schema.

- [x] Express app split into `app.js` / `index.js`
- [x] Env config loader (fails fast if required vars missing in production)
- [x] `eventConfig.js` with all budget percentages, timeline offsets, vendor lists, metro / tier-2 / tier-3 cost thresholds, and other configurable constants
- [x] zod schema for plan request (rejects past dates, bad budget, guests outside 1–2000, unknown fields, notes > 500 chars)
- [x] `GET /api/health` returns `{ "status": "ok" }`
- [x] Central error handler with consistent error shape

> ✅ **YOU TEST:** Hit `GET http://localhost:4000/api/health` → gets `{"status":"ok"}`. Try sending a bad POST body (past date, negative budget) and confirm it returns a 400 with a proper error shape.

---

## SESSION 3 — Rules Engine: Budget Allocation
**What gets built:** Budget allocation module with priority shifts, floors, add-ons, and rounding.

- [x] Rules engine: **budget allocation** (priorities shift, floors, contingency ≥ 5%, sums exactly to budget)
- [x] Rules engine: **function add-ons** (Haldi / Mehndi / Sangeet each add one budget line and relevant timeline tasks)
- [x] Rules engine: **trade-off suggestions** (deterministic, priority-aware, preserve budget sum and allocation constraints)
- [x] Unit tests: allocation sums to input; priority shifts; floors; contingency ≥ 5%; add-ons preserve total; trade-offs valid

> ✅ **YOU TEST:** Run `npm test` — all budget unit tests pass. Confirm for a ₹8,00,000 wedding with 150 guests, budget rows sum exactly to 800000.

---

## SESSION 4 — Rules Engine: Timeline, Vendors & Warnings
**What gets built:** Timeline milestones, vendor checklist, warnings, and panic mode logic.

- [x] Rules engine: **timeline** (offsets back from event date, drops past milestones, compressed-timeline mode)
- [x] Rules engine: **vendor checklist** (filters by priorities, venue preference, dietary needs)
- [x] Rules engine: **warnings** (city-tier-aware per-guest budget, close date, outdoor/season risk)
- [x] Rules engine: **panic mode grouping** for events fewer than 14 days away (today / this week / can skip)
- [x] Unit tests: past milestones handled; close dates compressed; under-14-day panic mode; add-on tasks; city-tier differences; Lucknow = tier-2; unknown city = default

> ✅ **YOU TEST:** Run `npm test` — all rules-engine tests pass. Try an event 7 days away and confirm `panicMode.enabled: true` with tasks split into 3 groups.

---

## SESSION 5 — Backend API: `/api/plan` (Rules Only)
**What gets built:** Full `POST /api/plan` endpoint returning the deterministic plan (no AI yet).

- [x] `POST /api/plan` returns rules-only plan (all sections: budget, timeline, vendors, warnings, tradeoffs, budgetHealth, panicMode)
- [x] API tests (supertest): happy path; validation 400; rate-limit 429; correct error shape
- [x] Rate limiter middleware: `helmet`, CORS allow-list, JSON body limit (~10 KB), `10 req/min/IP`

> ✅ **YOU TEST:** `POST /api/plan` with the sample body from the spec → returns full plan JSON with `aiEnhanced: false`. Validation errors return 400. Headers include Helmet security headers.

---

## SESSION 6 — Gemini Layer
**What gets built:** `geminiService.js`, prompt files, output validation, fallback, cache.

- [ ] `geminiService.js` using `@google/genai`, key read from env, server-side only
- [ ] Prompt files in `backend/src/prompts/` (system instruction + user context builder)
- [ ] Notes field wrapped as untrusted data, with prompt-injection guard line
- [ ] Structured JSON output (response schema) + zod validation of the LLM response
- [ ] Timeout (~15s), `maxOutputTokens`, one retry on invalid JSON
- [ ] **Fallback:** on any Gemini failure return rules-only plan with `aiEnhanced: false`
- [ ] In-memory cache (hash of normalised input, short TTL)
- [ ] Tests with Gemini **mocked**: success, malformed JSON, timeout, error → fallback
- [ ] Manual test with the real key: 3 different event types give sensible output

> ✅ **YOU TEST:** With a real API key, `POST /api/plan` returns `aiEnhanced: true` and the `ai` block has summary/themeIdeas. Temporarily set a bad key → returns full plan with `aiEnhanced: false` and a clear notice. Run `npm test` — all mocked Gemini tests pass.

---

## SESSION 7 — Frontend: Scaffold + Event Form
**What gets built:** Vite + React app, API wrapper, the complete EventForm with presets and add-ons.

- [ ] Vite + React app scaffolded in `frontend/`
- [ ] API wrapper with loading / error handling
- [ ] Preset buttons at the top of the form: **Wedding**, **Kids' birthday**, **Diwali meet**
- [ ] **Single-page EventForm** with grouped semantic `<fieldset>` sections, inline validation, accessible labels/errors, and presets at the top
- [ ] Function add-on toggles for **Haldi**, **Mehndi**, and **Sangeet** (visible only for weddings)
- [ ] Form state saved to `localStorage` (wrapped in try/catch)
- [ ] Responsive layout down to 320px

> ✅ **YOU TEST:** Open the app in browser. Click each preset → form populates correctly. Fill the form and submit → spinner shows → plan JSON arrives. Resize to 320px — form is usable. Refresh page — form values are restored from localStorage.

---

## SESSION 8 — Frontend: Dashboard (Budget, Timeline, Vendors)
**What gets built:** The plan dashboard — budget table, timeline milestones, vendor checklist, warnings, progress bar.

- [ ] **BudgetTable** (category, %, amount, rationale; totals row)
- [ ] **Timeline** (milestones with dates and tasks)
- [ ] **VendorChecklist** (tick items, checklist state saved in `localStorage`)
- [ ] **Warnings** panel
- [ ] **ProgressBar** (% of tasks/vendors completed)
- [ ] **AI insights** panel (summary, theme ideas, tips, risks) with a clear "AI-generated" label
- [ ] Notice banner when `aiEnhanced: false`
- [ ] Sticky section navigation for one scrolling dashboard; no tab interface
- [ ] Sample-plan demo mode loads a prebuilt plan without calling the API

> ✅ **YOU TEST:** Generate a plan → all sections appear on one scrolling page. Tick vendor/task checkboxes → progress bar updates → refresh → ticks are still there. Click "Try a sample" → sample plan loads instantly with no network call. Sticky nav links scroll to sections correctly.

---

## SESSION 9 — Frontend: Standout Features
**What gets built:** What-if sliders, panic mode view, refine chips, budget health meter, trade-off suggestions.

- [ ] **Budget health meter + cost per guest:** health status has text/icon as well as colour
- [ ] **Deterministic trade-off suggestions:** displayed with source/destination category, % moved, amount
- [ ] **What-if sliders:** adjust guest count, decor spend, food spend → totals recompute instantly, **no API call**
- [ ] **Panic mode view:** event < 14 days → "Book today", "This week", "Can skip" sections displayed prominently
- [ ] **Refine chips:** "Make it cheaper", "More vegetarian", "Add live music" → updates inputs, recomputes plan, at most one Gemini call
- [ ] Clear label showing what the refine chip changed

> ✅ **YOU TEST:** Move a what-if slider → totals update instantly without any network request (check DevTools Network tab). Set an event date < 14 days → Panic mode section appears. Click a refine chip → form updates visibly and plan refreshes. Budget health shows text + icon (not just colour).

---

## SESSION 10 — Exports & WhatsApp
**What gets built:** Copy plan, print/PDF stylesheet, .ics calendar export, WhatsApp inquiry links.

- [ ] Export: **copy plan as text** (fallback if clipboard API unavailable)
- [ ] Export: **print stylesheet** (hides controls, print-friendly layout) for Save as PDF
- [ ] Export: **Download calendar (.ics)** for dated timeline milestones (no heavy library)
- [ ] **WhatsApp vendor inquiries:** each vendor row has a link opening `wa.me` with URL-encoded pre-written message (event date, guest count, city, vendor budget share; no private notes)
- [ ] Export tests: `.ics` valid and text is escaped; WhatsApp URL properly encoded; copy fallback works

> ✅ **YOU TEST:** Click "Copy plan" → paste in Notepad, content is readable. Click "Download .ics" → open in a calendar app → events appear on correct dates. Click a WhatsApp link → browser opens wa.me with a pre-filled message. Click Print → print preview shows clean layout without buttons/sliders.

---

## SESSION 11 — Hardening: Security, Accessibility, Code Quality
**What gets built:** Full accessibility pass, security audit, code cleanup, lint, coverage.

### Security
- [ ] `helmet`, CORS allow-list, JSON body limit (~10kb)
- [ ] Rate limit on `/api/plan` (e.g. 10/min/IP) returns proper 429
- [ ] No secrets in logs or client bundle (search the build output for the key)
- [ ] No `dangerouslySetInnerHTML` anywhere
- [ ] `npm audit` has no critical issues in either folder

### Accessibility
- [ ] One `<h1>`, correct heading order, landmarks, `lang="en"`, meaningful `<title>`
- [ ] Skip-to-content link, visible focus styles
- [ ] Whole app usable with keyboard only
- [ ] Errors and results announced with `aria-live`
- [ ] Tables have `<caption>` and `<th scope>`
- [ ] Dashboard is one scrolling page with sticky section navigation; no ARIA tabs to maintain
- [ ] Buttons, refine chips, add-on toggles, and WhatsApp links have clear accessible names
- [ ] Contrast ≥ 4.5:1 and no colour-only information
- [ ] `prefers-reduced-motion` respected
- [ ] Run a Lighthouse accessibility check (target 95+) and fix issues

### Efficiency
- [ ] gzip/compression enabled
- [ ] Production build checked (bundle size reasonable)
- [ ] One LLM call per plan, cache working
- [ ] No unused dependencies (`npm ls`, remove extras)

### Code quality
- [ ] Lint passes with zero errors in both folders
- [ ] No dead code, commented-out blocks, or stray `console.log`
- [ ] JSDoc on public functions in services
- [ ] Constants live in config files, not inline

> ✅ **YOU TEST:** Run `npm run lint` → zero errors. Run `npm test -- --coverage` → all pass, note actual coverage numbers. Run Lighthouse → accessibility score. Tab through the entire form with keyboard only. `npm audit` → no critical vulnerabilities.

---

## SESSION 12 — Deployment
**What gets built:** Live URL on Render or Cloud Run.

- [ ] Choose host (Render free tier or Google Cloud Run) and note choice here: ____________
- [ ] Env vars set on host (`GEMINI_API_KEY`, `GEMINI_MODEL`, `NODE_ENV=production`, etc.)
- [ ] App deployed and reachable at one public URL
- [ ] Open live URL in an **incognito window** and on a **phone**: form → plan works
- [ ] Verify fallback works (temporarily test with a bad key locally, not on prod)
- [ ] Host cold-start time checked; open the URL shortly before submitting so it is awake
- [ ] Live URL pasted into README

> ✅ **YOU TEST:** Open the live URL in incognito → full flow works end-to-end. Open on phone → layout is usable. Note the URL for README.

---

## SESSION 13 — README, Architecture SVG & Demo Video
**What gets built:** Complete README, architecture diagram SVG, demo video script.

### README.md contains
- [ ] Chosen vertical and problem
- [ ] Live demo URL + demo video link
- [ ] Approach and logic (hybrid rules engine + Gemini, why)
- [ ] Privacy statement: no accounts, no server-side plan storage; browser persistence uses `localStorage`
- [ ] Coverage summary / coverage numbers from the test coverage report
- [ ] Real architecture diagram image committed at `docs/architecture.svg` (small SVG, not ASCII-only)
- [ ] How it works (architecture diagram + request flow)
- [ ] Features list (including standout features)
- [ ] Tech stack
- [ ] Setup and run locally (env vars, commands)
- [ ] Testing (how to run, what's covered)
- [ ] Security and accessibility measures
- [ ] Assumptions and limitations

### Demo video (under 4 minutes)
- [ ] Script: problem (15s) → single form + presets / add-ons (40s) → plan: budget, timeline, vendors (50s) → city-tier budget health + trade-off + what-if (35s) → panic mode / refine chips (25s) → exports + WhatsApp + AI fallback (25s) → wrap up (15s)
- [ ] Recorded, length checked (< 4:00)
- [ ] Uploaded to YouTube as **Unlisted** (or Drive with access given); link opened in incognito to verify

> ✅ **YOU TEST:** Read through the README — all 12 sections present. Open `docs/architecture.svg` in browser — renders correctly. Watch the demo video in incognito — under 4 mins, all features shown.

---

## SESSION 14 — Final Checks & Submission
**What gets built:** Final repo audit, then submit.

### Repo final checks
- [ ] Repo is **public** (open the URL in incognito)
- [ ] Repo size **< 10 MB** (check on GitHub; no `node_modules`, `dist`, videos, large images)
- [ ] **Only one branch** (`main`) exists on GitHub
- [ ] No `.env` or API key in repo or git history
- [ ] `git clone` into a fresh folder → `npm install` → `npm test` → `npm run dev` works
- [ ] All tests pass; lint clean
- [ ] Latest code pushed to `main`

### Submission
- [ ] Dashboard: Challenge 5 → paste **public GitHub repo URL**
- [ ] Add **live web app URL** and **demo video link** where the form asks
- [ ] Submit (**attempt 1 of 3**)
- [ ] Check the dashboard for the evaluation result / rank
- [ ] If score is low, read feedback, fix, and use attempt 2 (keep attempt 3 in reserve)

> ✅ **YOU TEST:** Open the repo in incognito → public. Clone fresh → npm install + npm test all pass. Submit.

---

## Explicitly Out of Scope (do NOT build)

- [ ] Do **not** build a Hindi/English toggle
- [ ] Do **not** build a PWA or offline shell
- [ ] Do **not** build a vendor comparison table
- [ ] Do **not** build keyboard shortcuts or an RSVP counter
- [ ] Do **not** add plan JSON download/upload; `localStorage` is sufficient for persistence
- [ ] Do **not** build free-form refine chat
- [ ] Do **not** create a separate landing/start screen; presets belong at the top of the form
- [ ] Do **not** create full per-function budgets; Haldi, Mehndi, and Sangeet are simple add-on toggles

---

## Suggested Time Plan

| Day | Sessions | Goal |
|---|---|---|
| **Thu 29 Oct (tonight)** | 1 → 2 → 3 → 4 → 5 | Scaffold + full backend rules engine + API |
| **Fri 30 Oct** | 6 → 7 → 8 | Gemini layer + full frontend form + dashboard |
| **Sat 31 Oct AM** | 9 → 10 | Standout features + exports |
| **Sat 31 Oct PM** | 11 → 12 | Hardening + deploy |
| **Sat 31 Oct Evening** | 13 → 14 | README + video + submit attempt 1 |
| **Sun 1 Nov** | Buffer | Fix issues, attempt 2 if needed |

## Cut Order If Time Runs Short

Drop in this order: dark mode bonus → optional seasonal-awareness extras → visual polish. If time is tight, simplify animations and styling before cutting required logic. **Never cut:** rules-engine correctness, city-tier thresholds, fallback, core tests, security, accessibility, README, CI, live URL, or demo video.

---

## Progress Log (agent updates after each work session)

| Date | Session | Done | Blockers / notes |
|---|---|---|---|
| 2026-10-30 | Session 1 | Project scaffold, backend & frontend configs, lint/test setup, CI workflow, initial git push | None. All root & workspace lint and tests pass cleanly. |
| 2026-10-30 | Session 2 | Backend config (eventConfig.js, env.js), strict planRequestSchema with Zod, validateBody middleware, central errorHandler, modular health route, and 25 unit/integration tests | None. All tests and lint pass cleanly. |
| 2026-10-30 | Session 3 | Rules engine budget allocation (priority shifts, category floors >= 2%, contingency floor >= 5%, exact integer sum matching input budget, function add-on lines, outdoor allowance), deterministic trade-off engine, city-tier budget health calculator, and 8 comprehensive unit tests | None. All 34 tests and lint pass cleanly. |
| 2026-10-30 | Session 4 | Rules engine timeline generator (drops past milestones, carries forward critical tasks, wedding add-on milestones), Panic Mode engine (< 14 days into bookToday/doThisWeek/canSkip), vendor checklist engine with dietary (Jain/vegan/halal/veg) & venue customizations, deterministic warning engine, and master orchestrator | None. All 45 tests and lint pass cleanly. |
| 2026-10-30 | Session 5 | Full POST /api/plan endpoint, planController, 10 req/min/IP rate limiter with standardized 429 error shape, production static frontend serving wired in Express, Helmet headers, and 4 supertest integration tests | None. All 49 tests and lint pass cleanly. |
