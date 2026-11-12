import {
    verifySignature,
    loadStore,
    saveStore,
    redactPhone,
    logEvent,
    maybeSendConfirmationSms,
  } from '../../../../lib/telephony-webhook.js';
  
  const MAX_BODY_BYTES = 16 * 1024; // 16KB limit
  
  export async function POST(request) {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      return new Response('Unsupported Media Type', { status: 415 });
    }
  
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
      return new Response('Payload Too Large', { status: 413 });
    }
  
    const params = Object.fromEntries(new URLSearchParams(rawBody));
    const providedSig = request.headers.get('x-twilio-signature');
  
    if (!verifySignature(providedSig, params)) {
      return new Response('Invalid signature', { status: 403 });
    }
  
    const { CallSid, From, CallStatus, Consent } = params;
    if (!CallSid || !From || !CallStatus) {
      return new Response('Missing required webhook fields', { status: 400 });
    }
  
    const store = loadStore();
    if (store[CallSid]) {
      logEvent({ eventId: CallSid, status: CallStatus, phone: From, note: 'Duplicate event ignored' });
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
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
  
    logEvent({ eventId: CallSid, status: CallStatus, phone: From, note: 'Event accepted' });
  
    const hasExplicitConsent = String(Consent).toLowerCase() === 'true';
    await maybeSendConfirmationSms({
      eventId: CallSid,
      toPhone: From,
      hasExplicitConsent,
    });
  
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say>Thank you for calling ${process.env.PROJECT_NAME || 'Neighborhood Listing Platform'}. Your request has been recorded.</Say>
  </Response>`;
  
    return new Response(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
  
  export async function GET() {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }