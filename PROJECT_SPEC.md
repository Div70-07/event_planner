# PROJECT_SPEC.md — Celebration & Event Planner (PromptWars Challenge 05)

> Single source of truth for the build. Antigravity must read this file fully before writing code and follow it. Progress is tracked separately in `CHECKLIST.md`. This spec deliberately prioritises a small, testable, resilient product for a three-day build.

## 1. Goal

Build a **GenAI-powered Celebration & Event Planner** for people in India planning weddings, birthdays, and community events. Given event details, the app creates a practical budget, timeline, vendor checklist, tasks, and context-aware recommendations.

**Core principle:** deterministic rules make the decisions and guarantee a usable plan; Gemini may enrich the plan but must never be required for core functionality.

## 2. Hard Constraints

| Rule | Requirement |
|---|---|
| Repository | Public GitHub repository, exactly one branch: `main` |
| Size | Under 10 MB; do not commit dependencies, build output, videos, or large assets |
| Submission | Maximum 3 attempts; treat attempt 1 as final-quality |
| Deadline | 1 Nov 2026, 11:59 PM IST; aim to submit by 30 Oct |
| Live app | One live, accessible URL |
| Demo | Under 4 minutes; YouTube unlisted or Drive link with access enabled |
| README | Vertical, approach, logic, features, architecture image, setup, tests, coverage, security, accessibility, assumptions, and limitations |

## 3. Evaluation Strategy

| Criterion | Implementation |
|---|---|
| Code quality | Small modules, consistent names, ESLint + Prettier, JSDoc on public functions, no dead code |
| Security | Server-only API key, environment variables, zod validation, Helmet, CORS allow-list, rate limits, body limit, safe rendering, no secrets in logs |
| Efficiency | Local deterministic calculations, at most one Gemini call per plan/refinement, no AI calls for sliders or sample demo, cache identical requests |
| Testing | Unit tests for rules, API tests with mocked Gemini, component tests, offline test suite, coverage reported |
| Accessibility | Semantic HTML, grouped fieldsets, labels, keyboard access, visible focus, live announcements, contrast, reduced motion, responsive layout |
| Problem fit | Budget, timeline, vendors and tasks personalised to event type, city tier, guests, budget, date and preferences |

## 4. Tech Stack

- **Frontend:** React + Vite, JavaScript, plain CSS/CSS Modules with CSS variables.
- **Backend:** Node.js + Express using ES modules.
- **AI:** Google Gemini via `@google/genai`; model configured by `GEMINI_MODEL` in environment variables.
- **Validation:** zod for incoming request and AI output schemas.
- **Security:** `helmet`, `cors`, `express-rate-limit`.
- **Tests:** Vitest, supertest, React Testing Library, coverage via Vitest coverage provider.
- **Quality:** ESLint + Prettier.
- **Deployment:** one Express service serves the built frontend and API. Use Render or Google Cloud Run.
- **CI:** `.github/workflows/ci.yml` runs install, lint, tests and coverage on pushes and pull requests to `main`.

Check the current Gemini model and free-tier limits before implementation. Keep model ID in `.env.example`, never hardcode it. The app must work without a Gemini key.

## 5. Architecture

```text
Browser (React + Vite)
  ├─ Event form / presets / refine chips
  ├─ Single scrolling dashboard + sticky section navigation
  ├─ Checklists / what-if sliders / exports
  └─ localStorage (saved form state and checklist progress)
              │ POST /api/plan
              ▼
Express API
  ├─ zod request validation
  ├─ deterministic rules engine
  │    ├─ budget allocation + city-tier thresholds
  │    ├─ timeline + panic mode
  │    ├─ vendors + task checklist
  │    └─ trade-off recommendations
  ├─ optional single Gemini enrichment call
  ├─ zod output validation + safe merge
  └─ rules-only fallback on AI failure
```

**Hybrid design:** rules own all numeric decisions, totals, date calculations, vendor budgets, warnings, trade-offs and panic-mode state. Gemini can add concise themes, tips and contextual wording only. Invalid, slow or unavailable AI output must never break the plan.

## 6. Product Scope — 12 Features

### 6.1 One-page form with presets and function add-ons

No separate landing screen and no multi-step wizard. The top of the page contains three preset buttons: **Wedding**, **Kids' birthday**, and **Diwali meet**. Presets populate sensible example values but remain editable.

Use one form with clearly labelled `<fieldset>` groups:
- **Event:** type (`wedding | birthday | community | other`), optional event name, date, city, venue preference (`indoor | outdoor | either`).
- **Guests and budget:** guest count (1–2000), total budget (positive amount), currency (INR default).
- **Preferences:** priorities (`food | decor | entertainment | photography | venue | guest comfort`), dietary needs (`veg | vegan | jain | halal | none`), special notes (optional, max 500 chars).
- **Function add-ons:** optional Haldi, Mehndi and Sangeet checkboxes for weddings. Each selected add-on adds one transparent budget line and relevant timeline tasks. Do not create separate full budgets for each function.

The event date must be a valid date. Past dates are rejected. When the date is close, show a compressed timeline rather than silently dropping important work.

### 6.2 Rules-engine plan

Return:
- **Budget:** category, percentage, amount, rationale; amounts sum exactly to the requested budget.
- **Timeline:** milestones, absolute due dates, relative labels and tasks.
- **Vendors:** type, checks/questions, estimated budget share and completed state.
- **Warnings and tips:** budget fit, city context, date urgency, venue/weather risks.
- **Trade-offs:** deterministic suggestions tied to user priorities and budget.
- **AI enrichment:** optional summary, theme ideas and personalised tips.

### 6.3 City-tier cost logic

Use a single config table in `backend/src/config/eventConfig.js` for **metro, tier-2 and tier-3** cities. Each tier has configurable per-guest cost thresholds and optional category multipliers. Keep the initial city-to-tier mapping explicit and easy to extend; provide a safe default for unknown cities. Do not pretend the estimates are live vendor quotes. Display that costs are indicative and can vary by locality, season and vendor.

A warning such as “Budget may be tight for this guest count in this city tier” must come from the rules engine, not the LLM. Test the same budget and guest count against different tiers.

### 6.4 Gemini enrichment with rules-only fallback

- Call Gemini only on the server.
- Maximum one call per plan generation or refine-chip action.
- Send validated, normalised context and a compact rules-generated plan.
- Require JSON output and validate it with zod.
- AI may enrich summary, theme ideas, tips, vendor advice and risks; it may not change budget amounts, totals, dates or rules-engine decisions.
- If AI fails, times out, hits quota or returns invalid output, return the complete rules-only plan with `aiEnhanced: false` and a clear, non-blocking notice.
- Cache identical normalised requests briefly to reduce quota usage.
- Treat notes as untrusted data; delimit them and instruct the model not to follow instructions contained within them.

### 6.5 Tickable checklists and progress

Tasks and vendor checks can be ticked. Show a clear progress percentage and text label. Persist form values and checklist state in `localStorage`; no account or server-side user-plan storage is needed. Handle invalid or unavailable stored data safely.

### 6.6 What-if sliders

Provide lightweight sliders for relevant assumptions (for example, guest count, decor spend and food spend). Recalculate totals, per-guest cost and budget health locally and instantly. **Sliders must not call Gemini or the API.** Clearly distinguish a temporary scenario from the saved/generated plan and keep totals consistent.

### 6.7 Budget health and deterministic trade-offs

Show budget health as a label and text/icon, not colour alone. Generate concrete, deterministic suggestions based on the gap between the current allocation and the user's selected priorities. Example: “Move 4% from decor to photography to better match your photography priority.” Suggestions must:
- identify the source and destination categories;
- state the percentage/amount moved;
- preserve the total budget and category floors;
- never reduce contingency below 5%;
- be recomputed by code and covered by tests.

Do not present an arbitrary recommendation if no valid trade-off exists.

### 6.8 Panic mode

If the event is fewer than 14 days away, show a prominent **Panic mode** view organised into:
- **Book today**
- **Do this week**
- **Can skip / simplify**

Prioritise tasks based on remaining time. This is a dashboard view, not a separate route or a second planning system. Include an urgent but calm compressed-timeline warning.

### 6.9 Refine chips instead of chat

Do not build free-form follow-up chat. Show preset refinement chips such as:
- **Make it cheaper**
- **More vegetarian**
- **Add live music**

Clicking a chip updates the relevant validated input or preference, reruns the deterministic engine, and makes at most one optional Gemini enrichment call. Clearly show what changed. Avoid arbitrary user-written instructions in the refinement flow.

### 6.10 Exports and vendor inquiry messages

Provide:
- **Copy plan as text**
- **Print / Save as PDF** using a print stylesheet
- **Download calendar (.ics)** for dated timeline milestones
- **WhatsApp vendor inquiry** buttons on vendor rows

WhatsApp buttons open `https://wa.me/` with URL-encoded prewritten text containing the event date, guest count, city and indicative budget share. Do not include private notes or unnecessary personal data. Make clear the message is a draft and is not sent until the user confirms in WhatsApp. Validate and encode all URL content. No heavy PDF library.

### 6.11 Sample-plan demo mode

A **Try a sample** button loads a complete, deterministic prebuilt example plan locally, with no API call and no API key required. The sample must include budget, timeline, vendors, warnings and checklist items. Clearly label it as sample data; do not overwrite the user's saved plan without a clear user action. Include a reset/return-to-form action.

### 6.12 Accessibility and security hardening

Use semantic landmarks, one `<h1>`, visible labels, fieldsets/legends, keyboard-operable controls, visible focus, skip link, `aria-live` announcements for results/errors, table captions and scoped headers where tables are used. Maintain contrast of at least 4.5:1, support 320px screens and `prefers-reduced-motion`. Set `lang="en"`. Dark mode is a **bonus only** if the core features, tests, README and deployment are complete.

## 7. Explicitly Out of Scope

Do not implement:
- Hindi/English toggle or partial localisation.
- PWA, service worker or offline application mode.
- Vendor comparison table, RSVP counter or keyboard-shortcut system.
- Download/save plan as JSON.
- Free-form refine chat.
- Multi-step wizard, separate landing/start screen or tabbed dashboard.
- Full per-function budgets.
- Authentication, accounts, database or server-side plan storage.
- Extra features not listed in this spec before the required features, tests and docs are complete.

`localStorage` is enough for local persistence. Dark mode may be added only as a low-risk bonus using CSS variables.

## 8. Rules Engine

Keep numeric constants and mappings in `backend/src/config/eventConfig.js`. Keep logic in small, independently testable modules.

### 8.1 Starting budget percentages

| Category | Wedding | Birthday | Community |
|---|---:|---:|---:|
| Venue | 25 | 20 | 20 |
| Food & catering | 35 | 35 | 35 |
| Decor & theme | 12 | 12 | 10 |
| Entertainment / music | 8 | 10 | 12 |
| Photography / video | 8 | 5 | 5 |
| Attire / invitations / misc | 7 | 8 | 8 |
| Contingency | 5 | 10 | 10 |

Rules:
- Starting values total 100%.
- Priorities may shift 3–5 percentage points toward selected categories, taken proportionally from eligible non-priority categories.
- No category may fall below a 2% floor; contingency must never fall below 5%.
- Function add-ons (Haldi, Mehndi, Sangeet) create explicit additional budget lines by reallocating from suitable existing categories, not by increasing the total budget.
- Outdoor events add a weather/tenting allowance within decor or contingency.
- Round amounts consistently; the final eligible category absorbs any rounding remainder so the sum equals the budget exactly.
- Trade-off suggestions must use the same constraints and shared allocation functions.

### 8.2 City-tier thresholds

Configure thresholds by event type and city tier in one table. At minimum include:
- `metro`
- `tier2`
- `tier3`

Map a small initial set of Indian cities to tiers, including Lucknow as tier-2. Unknown cities use a documented default. Do not claim the mapping is comprehensive or that thresholds are market quotes. Test tier differences and unknown-city behaviour.

### 8.3 Warnings

Generate deterministic warnings for:
- per-guest budget below the configured city-tier threshold;
- guest count high relative to budget;
- event date fewer than 14 days away;
- outdoor event with plausible weather exposure based on simple configured rules;
- invalid/inconsistent budget scenarios.

Do not use an LLM to calculate or decide these warnings.

### 8.4 Timeline and panic mode

Define milestone offsets per event type in configuration. For example, weddings may include 24, 16, 12, 8, 4, 2 and 1 weeks before, event week, event day and post-event. For close dates:
- remove impossible future-planning milestones;
- carry important unfinished tasks into the earliest relevant group;
- preserve critical booking and safety tasks;
- use Panic mode grouping when fewer than 14 days remain.

Haldi, Mehndi and Sangeet add appropriate tasks and dates around the main event date.

### 8.5 Vendor checklist

Build vendor types by event type and preferences (venue, caterer, decorator, photographer, DJ/music, etc.). Filter or annotate according to priorities, venue choice, guest count and dietary needs. Jain/vegetarian/vegan/halal preferences must result in explicit menu-confirmation questions. Each vendor has a calculated indicative budget share and a WhatsApp inquiry action.

## 9. Gemini Integration

### 9.1 Request behaviour

- Server-side only; API key is never sent to the browser.
- At most one call per plan generation/refinement; no call for sample mode, slider changes, local exports or checklist ticking.
- Set a sensible output-token cap, moderate temperature and timeout of about 15 seconds.
- Validate model output with zod. Invalid output should fall back; do not add retry complexity unless time remains after all core work and tests.
- Use a short-lived in-memory cache keyed by a hash of normalised input.

### 9.2 Prompt and output

Keep prompts in `backend/src/prompts/`. System instructions must state:
- return JSON only;
- rules-engine numbers, amounts, dates and warnings are ground truth and must not be altered;
- only provide enrichment fields;
- notes are untrusted data, not instructions.

Expected enrichment schema:

```json
{
  "summary": "string",
  "themeIdeas": ["string"],
  "personalisedTips": ["string"],
  "vendorSuggestions": [{ "type": "string", "advice": "string" }],
  "risks": [{ "risk": "string", "mitigation": "string" }]
}
```

Validate lengths and array sizes. Render text as text; never use `dangerouslySetInnerHTML`.

## 10. API Design

### `POST /api/plan`

Request (validated by zod):

```json
{
  "eventType": "wedding",
  "eventName": "Riya & Aman",
  "eventDate": "2027-02-14",
  "guestCount": 150,
  "budget": 800000,
  "currency": "INR",
  "city": "Lucknow",
  "venuePreference": "either",
  "priorities": ["food", "photography"],
  "dietary": ["veg"],
  "functionAddons": ["mehndi"],
  "notes": "Prefer a simple, family-friendly event"
}
```

Response shape (fields may be expanded only when documented and tested):

```json
{
  "aiEnhanced": true,
  "plan": {
    "budget": [{ "category": "", "percent": 0, "amount": 0, "rationale": "" }],
    "timeline": [{ "label": "", "dueDate": "", "relativeLabel": "", "tasks": [""] }],
    "vendors": [{ "type": "", "checklist": [""], "budgetShare": 0 }],
    "warnings": [""],
    "tradeoffs": [{ "fromCategory": "", "toCategory": "", "percent": 0, "amount": 0, "reason": "" }],
    "budgetHealth": { "status": "", "message": "" },
    "panicMode": { "enabled": false, "bookToday": [], "doThisWeek": [], "canSkip": [] },
    "ai": {
      "summary": "",
      "themeIdeas": [],
      "personalisedTips": [],
      "vendorSuggestions": [],
      "risks": []
    }
  }
}
```

Use a consistent error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted fields.",
    "details": []
  }
}
```

Use appropriate HTTP status codes (400, 429, 500). `GET /api/health` returns `{ "status": "ok" }`. What-if slider updates and sample mode are client-side; do not add API endpoints for them without a clear requirement.

## 11. Folder Structure

```text
event-planner/
├── README.md
├── PROJECT_SPEC.md
├── CHECKLIST.md
├── .gitignore
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   └── architecture.svg
├── package.json
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── app.js
│       ├── config/
│       │   └── eventConfig.js
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       │   ├── rulesEngine/
│       │   ├── geminiService.js
│       │   └── cache.js
│       ├── prompts/
│       ├── schemas/
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
        │   ├── EventForm.jsx
        │   ├── Presets.jsx
        │   ├── Dashboard.jsx
        │   ├── BudgetBreakdown.jsx
        │   ├── Timeline.jsx
        │   ├── VendorChecklist.jsx
        │   ├── RefineChips.jsx
        │   ├── WhatIfSliders.jsx
        │   └── ProgressBar.jsx
        ├── hooks/
        ├── styles/
        └── __tests__/
```

Keep the implementation flexible within this structure, but do not add unnecessary packages or layers. The architecture diagram must be a real, small SVG committed at `docs/architecture.svg` and linked from the README.

## 12. Security Checklist

- [ ] `.env` is git-ignored; only `.env.example` is committed; no API key in source or git history.
- [ ] Gemini calls occur only on the server.
- [ ] zod validates all request input and AI output; reject unknown request fields.
- [ ] `helmet`, explicit CORS allow-list, JSON body limit around 10 KB.
- [ ] Rate-limit `/api/plan` (e.g. 10 requests/minute/IP); configure proxy trust safely for deployment.
- [ ] Treat notes as untrusted prompt content; do not support free-form chat.
- [ ] React's default escaping only; no `dangerouslySetInnerHTML`.
- [ ] URL-encode WhatsApp message content and use only intended, non-sensitive event details.
- [ ] Generic client errors; detailed server logs must not contain secrets or unnecessary user notes.
- [ ] `npm audit` has no unresolved critical vulnerabilities before submission.
- [ ] `localStorage` is used only for local preferences/form/checklist state; no account or server-side plan storage.
- [ ] README privacy statement: “No accounts and no server-side plan storage; saved form and checklist data stay in this browser's localStorage.”

## 13. Accessibility Checklist

- [ ] One `<h1>`, logical headings, `header`, `main`, and `footer` landmarks.
- [ ] Skip-to-content link and visible keyboard focus.
- [ ] Form controls have visible labels; related inputs are grouped with `<fieldset>` and `<legend>`.
- [ ] Validation errors connect to fields using `aria-describedby`.
- [ ] All controls work with keyboard and have accessible names.
- [ ] Plan changes and errors are announced with `aria-live="polite"` without repeatedly announcing the entire page.
- [ ] Tables have captions and scoped headers.
- [ ] Contrast is at least 4.5:1; budget status is not communicated by colour alone.
- [ ] Respect `prefers-reduced-motion`; responsive at 320px and above.
- [ ] Set `lang="en"` and a meaningful page title.
- [ ] Sticky section navigation uses ordinary links to page sections, with clear focus and current section indication where practical.
- [ ] Verify WhatsApp, print and download actions have understandable labels and feedback.

## 14. Testing Plan

All tests run offline without a real Gemini key. Root `npm test` runs the full suite.

| Area | Required tests |
|---|---|
| Budget rules | Allocation sums exactly to input; priority shifts; category floors; contingency >= 5%; function add-ons preserve total |
| City tier | Same inputs can produce different warnings across tiers; Lucknow maps to tier-2; unknown city uses default |
| Trade-offs | Suggestion respects priority, floors and contingency; total remains unchanged; no suggestion when no valid move exists |
| Timeline | Past milestones handled; close dates compressed; under-14-day panic mode; add-on tasks included |
| Validation | Reject past/invalid dates, negative budget, guest count outside limits, unknown fields, oversized notes and invalid add-ons |
| API | Happy path with Gemini mocked; validation 400; rate-limit 429; Gemini failure or invalid response returns rules-only plan |
| Gemini | Valid enrichment accepted; schema-invalid/oversized output rejected; core numbers cannot be overwritten |
| UI | Presets populate form; field errors; dashboard renders; checklist progress; refine chips update inputs; slider changes make no API call; sample mode makes no API call |
| Exports | Copy fallback/error handling; generated `.ics` is valid and escapes text; WhatsApp URL is encoded; print stylesheet hides controls appropriately |
| Accessibility | Labels, fieldset/legend, keyboard focus, live region and responsive layout checks |
| Coverage | Generate a coverage report with `vitest --coverage`; report actual line/branch/function coverage in README. Do not invent a percentage. |

## 15. Efficiency Requirements

- All maths, thresholds, dates, allocations, trade-offs and panic-mode decisions are deterministic code.
- At most one Gemini call per generated/refined plan; no AI for sliders, sample mode, checklists or exports.
- Cache identical normalised requests with a short TTL.
- Keep the frontend bundle and dependency count small; use compression in production.
- Avoid unnecessary rerenders and expensive recalculation; debounce only inputs that actually trigger API calls.
- Never commit `node_modules`, `dist`, `.env`, videos or large images.
- Confirm repository size and public access before submission.

## 16. README Requirements

`README.md` must include:
1. Chosen vertical and problem solved.
2. Live demo URL and demo video link.
3. Approach and why deterministic rules + optional Gemini are combined.
4. How it works, with a linked `docs/architecture.svg` image and request-flow explanation.
5. The 12 features and explicitly stated limitations.
6. Tech stack.
7. Setup/run instructions and environment variables.
8. Test commands, test areas and actual coverage results.
9. Security and accessibility measures.
10. Privacy line: no accounts/server-side plan storage; local saved state uses `localStorage`.
11. Assumptions: indicative costs, approximate city-tier mapping and no live vendor pricing.
12. Known limitations and deployment details.

## 17. Build Phases

1. **Setup:** repo on `main`, folders, root scripts, lint, `.gitignore`, `.env.example`, CI workflow.
2. **Rules engine:** schemas, event config, city-tier thresholds, budget, add-ons, timeline, vendors, warnings, trade-offs and tests.
3. **Gemini layer:** enrichment prompt/schema, output validation, fallback, cache and mocked tests.
4. **Frontend form:** presets, grouped fieldsets, validation and add-ons.
5. **Dashboard:** scrolling sections, sticky nav, budget health, timeline/panic mode, vendors, checklists, trade-offs, refine chips and sliders.
6. **Exports/demo:** copy, print/PDF, `.ics`, WhatsApp links and sample demo mode.
7. **Hardening:** security middleware, accessibility audit, full tests and coverage, dependency audit.
8. **Docs/deploy:** architecture SVG, README, live URL, mobile/incognito checks, demo video under 4 minutes, repo size check.
9. **Submit:** verify public repository and live app, then submit.

If time is tight, prioritise in this order: **correct deterministic rules and tests → usable accessible form/dashboard → security and fallback → sample mode and exports → documentation/CI polish**. Do not sacrifice the core test suite to add optional styling.

## 18. Rules for Antigravity

- Read this entire spec before coding. Do not ask questions unless a requirement is genuinely ambiguous; document reasonable assumptions in README.
- Implement only the listed scope. Do not reintroduce features explicitly marked out of scope.
- Keep commits small and commit to `main` only; never create another branch.
- Never commit secrets or large assets.
- After each phase, run lint and tests and update `CHECKLIST.md`.
- Keep code readable, modular and documented; avoid unused dependencies.
- If Gemini model IDs or free-tier limits change, update configuration and README, not hardcoded logic.
- Build `docs/architecture.svg` as a real, lightweight SVG and link it in README.
