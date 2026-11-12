import { NextResponse } from 'next/server';
import {
  verifySignature,
  loadStore,
  saveStore,
  redactPhone,
  logEvent,
  maybeSendConfirmationSms,
} from '@/lib/telephony-webhook';

const MAX_BODY_BYTES = 16 * 1024; // 16KB limit

export async function POST(request) {
  // Step 4: Enforce documented content-type
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return new NextResponse('Unsupported Media Type', { status: 415 });
  }

  // Step 4: Reject oversized bodies
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return new NextResponse('Payload Too Large', { status: 413 });
  }

  const params = Object.fromEntries(new URLSearchParams(rawBody));
  const providedSig = request.headers.get('x-twilio-signature');

  // Step 5: Verify provider signature
  if (!verifySignature(providedSig, params)) {
    return new NextResponse('Invalid signature', { status: 403 });
  }

  // Step 4: Validate required fields
  const { CallSid, From, CallStatus, Consent } = params;
  if (!CallSid || !From || !CallStatus) {
    return new NextResponse('Missing required webhook fields', { status: 400 });
  }

  // Step 7: Idempotency check so retries do not duplicate SMS
  const store = loadStore();
  if (store[CallSid]) {
    logEvent({ eventId: CallSid, status: CallStatus, phone: From, note: 'Duplicate event ignored' });
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  store[CallSid] = {
    processedAt: new Date().toISOString(),
    status: CallStatus,
    phoneSuffix: redactPhone(From),
  };
  saveStore(store);

  // Step 3: Log only event ID, status, and redacted phone suffix
  logEvent({ eventId: CallSid, status: CallStatus, phone: From, note: 'Event accepted' });

  // Steps 8 & 9: Gated outbound SMS confirmation
  const hasExplicitConsent = String(Consent).toLowerCase() === 'true';
  await maybeSendConfirmationSms({
    eventId: CallSid,
    toPhone: From,
    hasExplicitConsent,
  });

  // Step 6: Return minimal valid TwiML XML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling ${process.env.PROJECT_NAME || 'Neighborhood Listing Platform'}. Your request has been recorded.</Say>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

// Step 4: Reject unexpected HTTP methods
export async function GET() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}