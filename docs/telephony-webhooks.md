# Lab 9: Telephony Webhooks & SMS Confirmation

## Event Sequence Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Caller
    participant Provider as Simulator / Twilio
    participant App as Next.js Route (/api/webhooks/voice)
    participant Store as Idempotency Store (data/idempotency.json)
    participant SMS as Outbound SMS Gate

    Caller->>Provider: Places inbound call
    Provider->>App: POST /api/webhooks/voice (X-Twilio-Signature)
    App->>App: Validate Method (POST), Content-Type, Size (<=16KB) & HMAC-SHA1 Signature
    App->>Store: Lookup CallSid
    alt Duplicate Event (Provider Retry)
        Store-->>App: Already processed
        App-->>Provider: 200 OK (<Response></Response>)
    else New Event
        Store-->>App: Persist CallSid + redacted suffix (***5309)
        App->>App: Log JSON event (eventId, status, phoneSuffix only)
        opt Consent == true && ENABLE_OUTBOUND_SMS == true
            App->>SMS: Send SMS with project name & STOP opt-out
        end
        App-->>Provider: 200 OK (Minimal TwiML <Response><Say>...</Say></Response>)
    endnode