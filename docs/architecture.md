sequenceDiagram
    autonumber
    actor Caller
    participant Provider as Telephony Provider (Simulator / Twilio)
    participant App as Webhook Server (/webhooks/voice)
    participant Store as Idempotency Store (SQLite / JSON / Redis)
    participant SMS as Outbound SMS Worker / API

    Caller->>Provider: Places inbound call
    Provider->>App: POST /webhooks/voice (X-Twilio-Signature, form-urlencoded)
    App->>App: Validate Method, Body Size, Content-Type & Signature
    App->>Store: Check CallSid / MessageSid
    alt Duplicate Event (Retry)
        Store-->>App: Already processed
        App-->>Provider: 200 OK (Empty TwiML <Response/>)
    else New Event
        Store-->>App: Record event ID as "processing"
        App->>App: Log event ID, status & redacted suffix (***1234)
        opt Consent == true && ENABLE_OUTBOUND_SMS == true
            App->>SMS: Send SMS confirmation template
            SMS-->>Provider: POST /webhooks/sms-status (StatusCallback)
        end
        App-->>Provider: 200 OK (Minimal TwiML <Response><Say>...</Say></Response>)
    end
