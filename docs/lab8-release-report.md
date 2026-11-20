# Lab 8: Midterm Integration, Deployment & Release Report (v0.5.0)
**Capstone Team:** Team A — Aster (Gabriela Avila Rodriguez, Michael Falujo, Rahim Islam, Tavia Owens)
**Author / Release Lead:** Gabriela Avila Rodriguez (@gavy1997)

## 1. Release Checklist
- [x] Production build passes (`npx next build --webpack`)
- [x] Missing dependencies resolved (`zod`, `@supabase/supabase-js`)
- [x] Build-phase Supabase fallback configured for CI/WebContainer safety
- [x] Database migrations verified from clean state (`supabase/migrations/`)
- [x] Row-Level Security (RLS) policies verified on client table grants
- [x] Smoke tested deployed production URL in a private browser window

## 2. Functional & Failure-Mode Smoke Tests
- **Happy Path:** Property listings load with active neighborhood sponsors, detail view renders validated schema fields, and navigation links resolve without 404s.
- **Failure 1 — No Results:** Empty filter/ZIP query renders safe empty-state UI without crashing.
- **Failure 2 — Bad Filter:** Invalid filter input is rejected by Zod schema validation with user-safe feedback.
- **Failure 3 — Database Error:** Missing/unreachable Supabase credentials trigger graceful server fallback without exposing stack traces.
- **Failure 4 — Expired Sponsor:** Expired sponsor records are excluded from active banner rendering (`getActiveSponsorForProperty`).
- **Failure 5 — Broken Image:** Missing property/sponsor media falls back cleanly without breaking card layout.

## 3. Usability Study Summary & Severity Triage
- **Participants & Tasks:** 3 core tasks evaluated (browse neighborhood listings, filter by ZIP/criteria, inspect property details & local sponsor).
- **Severity 1 (Release Blockers — Fixed):** Missing `zod`/`@supabase/supabase-js` build imports and Turbopack WebContainer build failures resolved.
- **Severity 2 (Minor UI/UX — Logged):** Non-blocking layout polish deferred to post-v0.5.0 milestone.

## 4. AI Collaboration Checkpoint (Release-Readiness Review)
- **Prompt Pattern Used:** "Act as a release-readiness reviewer. Given this checklist and test report, identify missing evidence, high-risk assumptions, and the smallest set of release blockers. Do not equate a successful build with a tested product."
- **Models Consulted:** ChatGPT & Gemini.
- **Useful Output Adopted:** Flagged the risk of equating a passing `next build` with runtime data safety; added explicit smoke-test verification across all 5 failure modes and build-phase fallback guards.
- **Rejected AI Suggestion (Technical Reason):** Rejected an AI suggestion to disable strict TypeScript/Zod runtime validation during production builds to bypass missing module errors; instead, restored the exact package dependencies (`zod`, `@supabase/supabase-js`) and configured `--webpack` so strict type and schema contracts remain enforced.
