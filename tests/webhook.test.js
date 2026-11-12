import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { POST, GET } from '../src/app/api/webhooks/voice/route.js';
import { computeSignature } from '../src/lib/telephony-webhook.js';

const fixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'fixtures/inbound-call.json'), 'utf8')
);

const TEST_TOKEN = 'test_secret_token_12345';
const TEST_URL = 'http://localhost:3000/api/webhooks/voice';
const STORE_PATH = path.join(process.cwd(), 'data/idempotency.json');

function makeWebhookRequest(payload, signature, contentType = 'application/x-www-form-urlencoded') {
  const body = new URLSearchParams(payload).toString();
  const headers = { 'Content-Type': contentType };
  if (signature) headers['X-Twilio-Signature'] = signature;

  return new Request(TEST_URL, {
    method: 'POST',
    headers,
    body,
  });
}

describe('Lab 9: Telephony Webhook Security, Idempotency & Consent', () => {
  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = TEST_TOKEN;
    process.env.PUBLIC_CALLBACK_URL = TEST_URL;
    process.env.ENABLE_OUTBOUND_SMS = 'false';
    process.env.PROJECT_NAME = 'NeighborhoodListingPlatform';
    if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
  });

  it('1. Accepts a valid signature and returns TwiML XML', async () => {
    const sig = computeSignature(TEST_TOKEN, TEST_URL, fixture);
    const res = await POST(makeWebhookRequest(fixture, sig));
    const xml = await res.text();

    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/xml/);
    assert.match(xml, /<Response>/);
  });

  it('2. Rejects an invalid signature with 403', async () => {
    const res = await POST(makeWebhookRequest(fixture, 'forged_signature=='));
    assert.equal(res.status, 403);
  });

  it('3. Rejects missing required fields with 400', async () => {
    const incomplete = { CallSid: 'CA111', From: '+15551234567' }; // Missing CallStatus
    const sig = computeSignature(TEST_TOKEN, TEST_URL, incomplete);
    const res = await POST(makeWebhookRequest(incomplete, sig));
    assert.equal(res.status, 400);
  });

  it('4. Handles duplicate events / provider retries idempotently', async () => {
    const sig = computeSignature(TEST_TOKEN, TEST_URL, fixture);

    const first = await POST(makeWebhookRequest(fixture, sig));
    assert.equal(first.status, 200);

    const retry = await POST(makeWebhookRequest(fixture, sig));
    const retryXml = await retry.text();
    assert.equal(retry.status, 200);
    assert.equal(retryXml, '<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  });

  it('5. Rejects unexpected HTTP methods and oversized bodies', async () => {
    const getRes = await GET();
    assert.equal(getRes.status, 405);

    const huge = { ...fixture, Extra: 'X'.repeat(20000) };
    const sig = computeSignature(TEST_TOKEN, TEST_URL, huge);
    const largeRes = await POST(makeWebhookRequest(huge, sig));
    assert.equal(largeRes.status, 413);
  });
});