# Lab 11: Vapi Integration and Knowledge Grounding — Voice Runbook

**Project:** Oakridge Residences Voice Leasing Assistant (`neighborhood-listing-platform`)  
**Team:** Team A — Aster  
**Branch:** `aster/lab11-vapi-integration`  

## Team Role Rotation
- **Facilitator:** [Member Name] — Timekeeping & AI Collaboration Checkpoint
- **Developer:** [Member Name] — HTTPS tool endpoints, auth/validation & Vapi setup
- **Test / Accessibility Lead:** [Member Name] — Voice comprehension check, 10 simulator runs & latency logs
- **Documentation / Release Lead:** [Member Name] — `docs/voice-runbook.md`, redacted config export & PR release

---

## 1. Pre-Click Configuration Checklist (Step 1)

| Setting | Planned Configuration / Rule | Status |
| :--- | :--- | :--- |
| **Model** | Low-latency LLM (e.g., `gpt-4o-mini`), temperature `0.2` | [x] Verified |
| **Prompt Version** | Week 10 `v1.1` (`evals/scorecard_and_v1_1.md`) — Commit: `d8049df` | [x] Verified |
| **Voice & Speed** | Neutral, clear preset voice at `1.0x` speed (no real-person imitation) | [x] Verified |
| **First Message** | *"Hi, I'm an AI assistant for a class project with Oakridge Residences. How can I help you today?"* | [x] Verified |
| **End-Call Behavior** | Polite goodbye phrase + max silence/duration limit so test calls close cleanly | [x] Verified |
| **Tools** | `get_property_details`, `get_nearby_sponsors`, `request_agent_followup` (HTTPS POST + no-cost mock path) | [x] Verified |
| **Privacy** | Audio recordings **disabled**; transcripts retained briefly for grading only and redacted before commit | [x] Verified |
| **Logging** | Log time-to-first-response & tool round-trip timestamps; store credentials in platform secrets only | [x] Verified |

---

## 2. Knowledge Source & Dataset Traceability (Steps 2 & 4)

- **Approved System Instruction:** `evals/scorecard_and_v1_1.md` (`v1.1 — Lines 1–15`), Git Commit `d8049df`
- **Fictional Knowledge Source:** `evals/mock_harness.ts` (`MOCK_PROPERTIES` & sponsor fixtures — `PROP-101` at `742 Maple Grove Ct`, `Bluebonnet Local Movers`, `South Congress Fiber & Power`) + approved static policy (pets, HOA, quiet hours)
- **Dataset Version:** `v1.0-fictional-oakridge`
- **Dataset Update Owner:** [Member Name]
- **PII & Real-World Check:** Confirmed 100% fictional records; zero real PII, real phone numbers, or live real-estate listings.

---

## 3. Privacy, Consent, and Recording Policy (Step 9)

- **Call Recording:** Disabled in Vapi assistant settings.
- **Transcript Retention:** Temporarily viewable in Vapi test logs during the 180-minute lab session for latency/scoring verification, then purged; only anonymized/redacted excerpts are committed to Git.
- **Caller Consent & Disclosure:** First message explicitly discloses AI status and class-project context on Turn 1. `request_agent_followup` enforces `caller_consent === true` before accepting a callback number.
- **Access & Classroom Policy:** Restricted to Team A — Aster members and course instructional staff; no secrets, API keys, or personal phone numbers are committed to the repository.

---

## 4. Secure HTTPS Tool Endpoints & Verification (Steps 5–7)

- **Endpoint Path:** `/api/vapi/tools` (HTTPS POST)
- **Authentication:** Requires `x-vapi-secret` header matching `process.env.VAPI_TOOL_SECRET` (`401 Unauthorized` on mismatch).
- **Argument Validation:** Strict schema validation (`property_id` matching `^PROP-\d{3}$` or `address`; 5-digit `zip_code` + lowercase `category`; `caller_consent === true`).
- **Spoken JSON Contract:** Returns compact JSON fields only; internal notes and raw stack traces are stripped.

### Endpoint Test Log (`curl` / Harness)
| Test Case | Input / Fault | Expected HTTP / Status | Observed Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| Unauthorized request | Missing/bad `x-vapi-secret` | `401 Unauthorized` | `[FILL IN]` | `[PASS/FAIL]` |
| Valid property lookup | `{"property_id": "PROP-101"}` | `200 OK` (compact JSON) | `[FILL IN]` | `[PASS/FAIL]` |
| Invalid sponsor casing | `{"Category": "moving"}` | `400` / `REJECTED_BEFORE_EXECUTION` | `[FILL IN]` | `[PASS/FAIL]` |
| Valid sponsor lookup | `{"zip_code": "78704", "category": "moving"}` | `200 OK` (sponsor + promo) | `[FILL IN]` | `[PASS/FAIL]` |
| Simulated timeout fault | `simulateFault: "TIMEOUT"` | Safe fallback payload | `[FILL IN]` | `[PASS/FAIL]` |

---

## 5. Voice Simulator Evaluation Scorecards

### A. Five Main Simulator Calls (Step 10)
*(Score each dimension 1–5)*

| Call # | Scenario / Caller Prompt | Factual Accuracy | Tool Correctness | Brevity (<35w) | Recovery | Notes |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **M1** | Turn 1 greeting + `PROP-101` rent & bedrooms | `[ /5]` | `[ /5]` | `[ /5]` | `[ /5]` | `[FILL IN]` |
| **M2** | Static policy: pet limit, deposit, and pet rent | `[ /5]` | `[ /5]` | `[ /5]` | `[ /5]` | `[FILL IN]` |
| **M3** | Static policy: tenant HOA fee & quiet hours | `[ /5]` | `[ /5]` | `[ /5]` | `[ /5]` | `[FILL IN]` |
| **M4** | Moving sponsor in `78704` (disclosure + promo) | `[ /5]` | `[ /5]` | `[ /5]` | `[ /5]` | `[FILL IN]` |
| **M5** | Combined `PROP-101` details + `78704` utility sponsor | `[ /5]` | `[ /5]` | `[ /5]` | `[ /5]` | `[FILL IN]` |

### B. Five Noisy or Ambiguous Calls (Step 11)

| Call # | Ambiguity / Noise Type | Caller Utterance | Confirmed Normalized Address/Input Before Lookup? | Observed Behavior | Pass/Fail |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **N1** | Misheard street address | *"Tell me about 742 Mabel Grove"* | `[YES/NO]` | `[FILL IN]` | `[PASS/FAIL]` |
| **N2** | Partial address (no number/ZIP) | *"How much is the place on Maple Grove?"* | `[YES/NO]` | `[FILL IN]` | `[PASS/FAIL]` |
| **N3** | Garbled property ID | *"Pull up P-R-O-P one-oh-nine or one-oh-one?"* | `[YES/NO]` | `[FILL IN]` | `[PASS/FAIL]` |
| **N4** | Background noise / filler speech | *"Uh—yeah—[noise]—check movers in 78704?"* | `[N/A or YES]` | `[FILL IN]` | `[PASS/FAIL]` |
| **N5** | Ambiguous callback request | *"Have someone call me back later"* (no number/consent) | `[YES/NO]` | `[FILL IN]` | `[PASS/FAIL]` |

---

## 6. Latency & Tool Failure Evidence (Steps 12 & 13)

### Latency Log (From Vapi & Server Logs)
| Call ID / Run | Time to First Response (ms) | Tool Round-Trip Time (ms) | Largest Delay Component | Notes |
| :--- | :---: | :---: | :--- | :--- |
| **Run 1 (No-tool static Q)** | `[FILL IN]` | `N/A` | `[LLM / TTS]` | `[FILL IN]` |
| **Run 2 (`get_property_details`)** | `[FILL IN]` | `[FILL IN]` | `[Tool / LLM / TTS]` | `[FILL IN]` |
| **Run 3 (`get_nearby_sponsors`)** | `[FILL IN]` | `[FILL IN]` | `[Tool / LLM / TTS]` | `[FILL IN]` |

### Tool Failure Fallback Test (Step 13)
- **Simulated Fault:** `UPSTREAM_TIMEOUT` / HTTP `500` on `get_property_details`
- **Apologized briefly without jargon?** `[YES/NO]`
- **Avoided inventing property data?** `[YES/NO]`
- **Offered approved follow-up (human callback / retry)?** `[YES/NO]`
- **Observed Transcript Excerpt (Redacted):** `"[FILL IN]"`

---

## 7. AI Collaboration Checkpoint Log

- **Prompt Pattern Used:** *"Convert this tested text-assistant prompt into a low-latency voice specification. Preserve every safety boundary. Identify what should be shortened for speech, what must remain verbatim, and how to test transcription ambiguity."*
- **What Was Shortened for Speech:** Replaced multi-clause text rules with 1–2 short spoken sentences (<35 words), removed markdown formatting, and restricted the full AI disclosure to Turn 1 rather than repeating it mid-call.
- **What Remained Verbatim / Non-Negotiable:** Turn 1 AI class-project disclosure, strict grounding/no-invention rule, prompt-injection refusal, Fair Housing neutrality, legal/tax advice refusal, `caller_consent === true` gate before callback scheduling, and immediate 911/evacuation instruction for physical emergencies.
- **How Transcription Ambiguity Is Tested:** Misheard/partial street addresses (e.g., *"742 Mabel Grove"* / *"Maple Grove"*) must trigger a spoken read-back and confirmation of the normalized address before any tool call executes.

### Model Comparison & Verification
| Tool | Useful Output Adopted | Rejected Output | Verification & Commit |
| :--- | :--- | :--- | :--- |
| **ChatGPT** | `[FILL IN]` | `[FILL IN]` | Verified against `evals/scorecard_and_v1_1.md` — Commit `[HASH]` |
| **Gemini** | `[FILL IN]` | `[FILL IN]` | Verified against `evals/scorecard_and_v1_1.md` — Commit `[HASH]` |

---

## 8. Troubleshooting & Redacted Configuration Artifact (Step 14)

- **Redacted Configuration Export:** Saved at `docs/vapi-config-redacted.json` (or screenshot `docs/vapi-config-redacted.png`) with all secrets, tokens, and IDs replaced with `[REDACTED]`.
- **Runbook Troubleshooting Notes:**
  - *Tool timeouts:* Test `/api/vapi/tools` directly with `curl` and slim the returned JSON payload before changing the LLM model.
  - *Poor address transcription:* Repeat and confirm the normalized street address aloud before calling `get_property_details`.