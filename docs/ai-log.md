# AI Collaboration Log

## Assignment Checkpoint Prompt

> "Review this React component for semantic HTML, WCAG-oriented keyboard access, responsive behavior, and TypeScript safety. Return: issue, why it matters, smallest change, and a manual test. Do not claim compliance from code alone."

---

## Tool 1: ChatGPT

### Output Summary

- **Issue:** Missing explicit `type="button"` on interactive action buttons in property cards.
- **Why it matters:** Without an explicit type, buttons inside forms can accidentally trigger form submissions on Enter key press.
- **Smallest change:** Add `type="button"` to card buttons.

### Evaluation

- **Accepted suggestions:** Added explicit `type="button"` attributes across interactive components.
- **Rejected suggestions:** Recommending inline `onClick` handlers for static links; preferred native `<a>` anchors for semantic accessibility.
- **Manual test result:** Tabbed through cards with keyboard; verified buttons do not trigger unexpected form submits.

---

## Tool 2: Gemini

### Output Summary

- **Issue:** Lack of visible focus indicators (`focus-visible:ring-2`) on key interactive links and custom filter selects.
- **Why it matters:** Keyboard users relying on Tab navigation cannot identify which element currently has focus.
- **Smallest change:** Applied Tailwind focus ring utility classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`).

### Evaluation

- **Accepted suggestions:** Updated `SearchFilters` select controls and `PropertyCard` interactive links with `focus-visible:ring-2`.
- **Rejected suggestions:** Suggestions to replace standard HTML form labels with `aria-label` attributes; retained `<label>` elements for screen reader compatibility.
- **Manual test result:** Tested with `Tab` and `Shift+Tab`; verified distinct outline rings on active elements.

---

## Checkpoint: JSON Schema and Data Contract Architecture

### Prompt Pattern Used

> "Given these fictional listing requirements, propose a strict JSON Schema. Identify ambiguous business rules before writing the schema. Then provide valid and intentionally invalid examples and explain what a validator should reject."

### Models Consulted

- **Gemini (3.5 Flash / AI Studio):** Primary generator for schema structure, Zod definitions, and structured JSON output.
- **ChatGPT:** Secondary critique for identifying edge-case normalization issues and business rule ambiguities.

### Useful Output Accepted

- Strict JSON Schema requiring core property fields and enforcing `additionalProperties: false`.
- Single source of truth Zod schema in TypeScript (`src/schemas/property.ts`).
- AJV validation script with programmatic error logging (`scripts/validate.js`).

### Rejected Output and Corrections

- **Rejected:** Initial output returned `price` as a formatted string (for example, `"$450,000"`).
  - **Correction:** Enforced a strict numeric constraint (`"type": "number"`, `"minimum": 0`) in the prompt system instructions and schema definition.
- **Rejected:** Permitted loose free-text strings for `amenities` (for example, `"Central AC"` versus `"air-conditioning"`).
  - **Correction:** Adopted controlled enum values in the Zod contract and documented the decision in `docs/adr/001-data-contract.md`.

### Verification Summary

- **Seed records:** 100% of generated records passed local AJV validation (`node scripts/validate.js`).
- **Invalid fixtures:** Unit tests verified failure cases for missing ID, negative price, invalid ZIP format, and unexpected additional fields.
- **Privacy verification:** Confirmed zero personal, secret, or real client data present in prompts or committed files.

---

## Boundary Validation Implementation

- Implemented Zod schema parsing in `src/lib/api.ts`.
- Structured directory hierarchy (`src/lib/` and `src/test/`) and verified native TypeScript execution via `tsx`.
- Verified JSON schema validation using `node scripts/validate.js`.

---

## Midterm Practical Exam — Initial Requirements Draft

- **Tool:** ChatGPT
- **Prompt:** "Please explain these two assignments, and let's do them for this class for Rahim Islam step by step." The exam instructions were provided as context.
- **Output used:** The three user stories, acceptance criteria, estimates, traceability paths, and open questions in `docs/requirements.md`.
- **Output rejected / rationale:** No implementation or security claims were accepted without checking the migration, routes, and test results. The district/coverage-zone and booking-policy details remained open questions because the instructions did not fully define them.
- **Verification:** Compared the stories with the three stakeholder roles and requirements in the exam instructions; recorded unresolved schema questions in `docs/requirements.md`.
- **Associated commit:** Pending.
- **Other AI tools:** Gemini and Google AI Studio have not been used for this draft.

# AI Provenance Journal

| Step / Tool | Prompt Summary | Model Output Used | Model Output Rejected & Rationale | Verification Method | Associated Git Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Part 3: DDL Architecture** | Generated PostgreSQL DDL with strict checks, foreign keys, and RLS policies. | DDL structure for `profiles`, `services`, `bookings`, `service_categories`, and junction tables. | Rejected initial attempt that omitted `status IN ('draft', 'pending', 'approved', 'suspended')` check constraint. | Executed migration via Supabase CLI; verified table creation in remote dashboard. | `feat(db): add versioned persistence schema for local services` |
| **Part 4: RLS Policies** | Generated least-privilege RLS policies for anonymous, provider, client, and admin roles. | Provider-scoped `UPDATE`/`DELETE` policy restricting modifications to `draft` or `suspended` listings. | Rejected policy allowing providers to delete live `approved` listings without admin oversight. | Executed SQL audit matrix tests in Supabase SQL Editor as different roles. | `security(rls): enforce role-based access control policies` |
| **Part 5: Data Contract** | Generated Zod validation schema for service POST requests with strict property checks. | Zod object schema with `.strict()` modifier and min/max length constraints. | Rejected default `.passthrough()` validation as it allows unexpected body attributes. | Ran unit tests against API handler using invalid payloads (missing titles, extra keys). | `feat(api): implement runtime validation contract and service handlers` |
| **Part 6: UI Component** | Generated responsive Tailwind React component for `ServiceCard.tsx`. | Semantic `<article>`, `<header>`, `<ul>` structure and Tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. | Rejected generic `<div>` layout and buttons missing explicit `aria-label` attributes. | Tested WCAG keyboard navigation (`Tab`/`Enter`) and inspected DOM structure. | `feat(ui): add accessible semantic ServiceCard component` |
