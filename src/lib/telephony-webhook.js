import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'idempotency.json');

// Step 7: Load and save persistent idempotency records keyed by CallSid/MessageSid
export function loadStore() {
  if (!fs.existsSync(STORE_PATH)) return {};
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

export function saveStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

// Step 3: PII Redaction helper (logs only the last 4 digits)
export function redactPhone(phone) {
  if (!phone || typeof phone !== 'string') return 'UNKNOWN';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 4 ? `***${digits.slice(-4)}` : '***';
}

// Step 3: Structured logger with zero full phone numbers, tokens, or recordings
export function logEvent({ eventId, status, phone, note }) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      eventId,
      status,
      phoneSuffix: redactPhone(phone),
      note,
    })
  );
}

// Step 5: Compute Twilio HMAC-SHA1 signature using the exact server-configured URL
export function computeSignature(authToken, url, params) {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  return crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
}

// Step 5: Constant-time signature verification
export function verifySignature(providedSig, params) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const callbackUrl = process.env.PUBLIC_CALLBACK_URL;
  if (!providedSig || !authToken || !callbackUrl) return false;

  const expectedSig = computeSignature(authToken, callbackUrl, params || {});
  const providedBuf = Buffer.from(providedSig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');

  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

// Step 8: SMS confirmation template with project identity and opt-out instructions
export function buildSmsConfirmation(projectName) {
  return `${projectName}: We received your call and logged your request. Reply STOP to opt out.`;
}

// Step 9: Gate outbound SMS behind explicit consent AND ENABLE_OUTBOUND_SMS=true
export async function maybeSendConfirmationSms({ eventId, toPhone, hasExplicitConsent, smsClient }) {
  const outboundEnabled = process.env.ENABLE_OUTBOUND_SMS === 'true';

  if (!hasExplicitConsent) {
    logEvent({ eventId, status: 'sms_skipped_no_consent', phone: toPhone, note: 'Explicit consent missing' });
    return { sent: false, reason: 'no_consent' };
  }

  if (!outboundEnabled) {
    logEvent({ eventId, status: 'sms_dry_run_disabled', phone: toPhone, note: 'ENABLE_OUTBOUND_SMS is false' });
    return { sent: false, reason: 'flag_disabled' };
  }

  const body = buildSmsConfirmation(process.env.PROJECT_NAME || 'NeighborhoodListingPlatform');
  if (smsClient) {
    await smsClient.send({ to: toPhone, body });
  }
  logEvent({ eventId, status: 'sms_dispatched', phone: toPhone, note: 'Confirmation sent' });
  return { sent: true, body };
}