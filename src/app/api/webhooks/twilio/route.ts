import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Helper to mask phone numbers: +14155550199 -> +1******0199
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return '***REDACTED***';
  return `${phone.slice(0, 2)}******${phone.slice(-4)}`;
}

export async function POST(req: NextRequest) {
  // 1. Parse raw form-urlencoded body required for Twilio HMAC validation
  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  // 2. Cryptographic Signature Validation
  const twilioSignature = req.headers.get('x-twilio-signature') || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`;

  const isValid = twilio.validateRequest(authToken, twilioSignature, webhookUrl, params);

  if (!isValid) {
    return new NextResponse('Unauthorized: Invalid Twilio Signature', { status: 403 });
  }

  const callSid = params.CallSid;
  const callerPhone = params.From || '';

  // 3. Idempotency Check (24-hour TTL lock in Redis)
  const idempotencyKey = `twilio:call:${callSid}`;
  const isFirstAttempt = await redis.set(idempotencyKey, 'processed', { nx: true, ex: 86400 });

  if (!isFirstAttempt) {
    // Acknowledge duplicate retry safely without re-triggering Vapi/DB side effects
    return new NextResponse('<Response/>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // 4. PII-Safe Structured Logging
  console.log(
    JSON.stringify({
      event: 'inbound_call_ingested',
      callSid,
      callerMasked: maskPhone(callerPhone),
      timestamp: new Date().toISOString(),
    })
  );

  // 5. Vapi AI Agent Handoff & Safe Fallback TwiML
  try {
    const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: process.env.VAPI_ASSISTANT_ID,
        customer: { number: callerPhone },
      }),
    });

    if (!vapiResponse.ok) throw new Error(`Vapi upstream error: ${vapiResponse.status}`);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.vapi.ai/ws/twilio" />
  </Connect>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error(JSON.stringify({ event: 'ingestion_pipeline_error', callSid }));

    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We are currently experiencing high call volume. Please stay on the line while we connect you to an agent, or try your call again shortly.</Say>
  <Pause length="1"/>
  <Hangup/>
</Response>`;

    return new NextResponse(fallbackTwiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}