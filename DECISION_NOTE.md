# Lab 6: Contextual Sponsor Matching Engine — Decision & Telemetry Note

## 1. Architectural & Eligibility Rules
- **Eligibility Criteria:** Approved, Active, Placement slot match, Effective Date Range inclusive, and Exact ZIP Code or approved geographic radius match.
- **Deterministic Tie-Breaker:** Primary sort by `priority` (descending), secondary tie-breaker by stable `id` (ascending/alphabetical).
- **Privacy Controls:** No PII, cookies, IP addresses, or user profiling are collected, processed, or persisted.

## 2. AI Collaboration & Adversarial Testing Log
| Prompt / Context | Useful AI Suggestions | Rejected AI Suggestions | Verification & Commit Hash |
| :--- | :--- | :--- | :--- |
| **Adversarial Boundary Testing:** "Act as an adversarial tester for this contextual sponsor-selection function. Generate boundary cases involving dates, ZIP codes, empty data, ties, unapproved records, and unsafe URLs." | Handled edge cases: midnight boundary dates, unapproved destination URLs, null candidate arrays. | Rejected any recommendation that suggested user tracking or cookie profiling. | *Committed on branch feature/sponsor-matching* |

## 3. Predictable Outcomes Verification Checklist
- [x] Selection is deterministic under fixed fixture.
- [x] Every placement displays visual disclosure (`Sponsored` or `Local Partner`).
- [x] Unsafe or unapproved destinations are strictly rejected.
- [x] Zero sensitive or individualized targeting used.
