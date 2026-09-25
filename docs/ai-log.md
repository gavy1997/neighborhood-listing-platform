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