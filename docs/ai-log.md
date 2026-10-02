# AI Collaboration Log

## Assignment Checkpoint Prompt
> "Review this React component for semantic HTML, WCAG-oriented keyboard access, responsive behavior, and TypeScript safety. Return: issue, why it matters, smallest change, and a manual test. Do not claim compliance from code alone."

---

## Tool 1: ChatGPT
### Output Summary
- **Issue**: Missing explicit `type="button"` on interactive action buttons in property cards.
- **Why it matters**: Without an explicit type, buttons inside forms can accidentally trigger form submissions on Enter key press.
- **Smallest Change**: Add `type="button"` to card buttons.

### Evaluation
- **Accepted Suggestions**: Added explicit `type="button"` attributes across interactive components.
- **Rejected Suggestions**: Recommending inline `onClick` handlers for static links (preferred native `<a>` anchors for semantic accessibility).
- **Manual Test Result**: Tabbed through cards with keyboard; verified buttons do not trigger unexpected form submits.

---

## Tool 2: Gemini
### Output Summary
- **Issue**: Lack of visible focus indicator (`focus-visible:ring-2`) on key interactive links and custom filter selects.
- **Why it matters**: Keyboard users relying on Tab navigation cannot identify which element currently has focus.
- **Smallest Change**: Applied Tailwind focus ring utility classes (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`).

### Evaluation
- **Accepted Suggestions**: Updated `SearchFilters` select controls and `PropertyCard` interactive links with `focus-visible:ring-2`.
- **Rejected Suggestions**: Suggestions to replace standard HTML form labels with `aria-label` attributes (retained `<label>` elements for screen reader compatibility).
- **Manual Test Result**: Tested with `Tab` / `Shift+Tab`; verified distinct outline rings on active elements.

- # AI Collaboration Log

## Checkpoint: JSON Schema & Data Contract Architecture

### Prompt Pattern Used
> "Given these fictional listing requirements, propose a strict JSON Schema. Identify ambiguous business rules before writing the schema. Then provide valid and intentionally invalid examples and explain what a validator should reject."

### Models Consulted
- **Gemini (3.5 Flash / AI Studio)**: Primary generator for schema structure, Zod definitions, and structured JSON output.
- **ChatGPT**: Secondary critique for identifying edge-case normalization issues and business rule ambiguities.

### Useful Output Accepted
- Strict JSON Schema requiring `property_id`, `street`, `city`, `state`, `zip_code`, `price`, `bedrooms`, `bathrooms`, `square_feet`, `amenities`, and `local_sponsors`.
- Enforcement of `additionalProperties: false` to prevent unknown field injection.
- Zod schema source of truth pattern in TypeScript (`src/schemas/property.ts`).
- AJV validation script with programmatic error logging (`scripts/validate.js`).

### Rejected Output & Corrections
- **Rejected**: Initial output returned `price` as a formatted string (e.g., `"$450,000"`).
  - *Correction*: Enforced strict numeric constraint (`"type": "number"`, `"minimum": 0`) in prompt system instructions and schema definition.
- **Rejected**: Permitted loose free-text strings for `amenities` (e.g., `"Central AC"` vs `"air-conditioning"`).
  - *Correction*: Adopted controlled enum values in the Zod contract and documented the decision in `docs/adr/001-data-contract.md`.

### Verification Summary
- **Seed Records**: 100% of generated records passed local AJV validation (`node scripts/validate.js`).
- **Invalid Fixtures**: Unit tests verified failure cases for missing ID, negative price, invalid ZIP format, and unexpected additional fields.
- **Privacy Verification**: Confirmed zero personal, secret, or real client data present in prompts or committed files.
