import fs from 'fs';
import path from 'path';
import { computeSignature } from '../src/lib/telephony-webhook.js';

const fixture = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'fixtures/inbound-call.json'), 'utf8')
);

async function runSimulator() {
  const url = process.env.PUBLIC_CALLBACK_URL || 'http://localhost:3000/api/webhooks/voice';
  const token = process.env.TWILIO_AUTH_TOKEN || 'local_dev_test_token';

  const payload = {
    ...fixture,
    CallSid: `CA_SIM_${Date.now()}`,
  };

  const signature = computeSignature(token, url, payload);
  const body = new URLSearchParams(payload).toString();

  console.log(`Simulating webhook POST for ${payload.CallSid} -> ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Twilio-Signature': signature,
    },
    body,
  });

  console.log('HTTP Status:', res.status);
  console.log('TwiML Response:\n', await res.text());
}

runSimulator();