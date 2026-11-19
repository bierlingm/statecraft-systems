import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './index.js';

const application = {
  form: 'application',
  parent_name: 'Alex Parent',
  email: 'alex@example.com',
  phone: '555-010-0199',
  child_name: 'Sam Child',
  child_dob: '2022-04-02',
  potty_trained: 'yes',
  start_date: '2026-12-01',
  days: 'Three weekdays, still to confirm with Laura',
  hear_about: 'A neighbor',
  dcyf_interest: 'no',
  message: 'Hello & welcome <there>',
};

function request(path, { method = 'GET', body, headers = {}, origin = 'https://statecraft.systems' } = {}) {
  return new Request(`https://statecraft.systems${path}`, {
    method,
    headers: {
      accept: 'application/json',
      origin,
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('status stays unready until LAURA_EMAIL and the email binding exist', async () => {
  const res = await worker.fetch(request('/api/fruitfulbeginnings/status'), {});
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ready, false);
  assert.match(body.message, /could not be sent just yet/i);
  assert.equal(JSON.stringify(body).includes('example.com'), false);
});

test('a real submission is not sent when LAURA_EMAIL is unset', async () => {
  const sent = [];
  const env = { EMAIL: { async send(message) { sent.push(message); } } };
  const res = await worker.fetch(request('/api/fruitfulbeginnings/submit', { method: 'POST', body: application }), env);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, false);
  assert.equal(body.setup, true);
  assert.match(body.message, /could not be sent just yet/i);
  assert.equal(sent.length, 0);
});

test('honeypot submissions look successful and are not mailed', async () => {
  const sent = [];
  const env = {
    LAURA_EMAIL: 'laura@example.com',
    EMAIL: { async send(message) { sent.push(message); } },
  };
  const res = await worker.fetch(request('/api/fruitfulbeginnings/submit', {
    method: 'POST',
    body: { ...application, website: 'https://spam.example' },
  }), env);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.ok, true);
  assert.equal(sent.length, 0);
});

test('a complete application is mailed to LAURA_EMAIL with a string replyTo', async () => {
  const sent = [];
  const env = {
    LAURA_EMAIL: '  laura@example.com  ',
    NOTIFY_FROM: 'rooms@statecraft.systems',
    EMAIL: { async send(message) { sent.push(message); return { messageId: 'msg-1' }; } },
  };
  const res = await worker.fetch(request('/api/fruitfulbeginnings/submit', {
    method: 'POST',
    body: { ...application, parent_name: 'Alex <Parent>' },
  }), env);
  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.ok, true);
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].to, ['laura@example.com']);
  assert.equal(sent[0].replyTo, 'alex@example.com');
  assert.equal(typeof sent[0].replyTo, 'string');
  assert.deepEqual(sent[0].from, { email: 'rooms@statecraft.systems', name: 'Fruitful Beginnings' });
  assert.match(sent[0].subject, /application: Alex <Parent>/);
  assert.match(sent[0].html, /Alex &lt;Parent&gt;/);
  assert.equal(sent[0].html.includes('<Parent>'), false);
  assert.match(sent[0].text, /Hello & welcome <there>/);
});

test('enrollment requires the extra care fields and the consent checkbox', async () => {
  const env = {
    LAURA_EMAIL: 'laura@example.com',
    EMAIL: { async send() { return { messageId: 'msg-2' }; } },
  };
  const missing = await worker.fetch(request('/api/fruitfulbeginnings/submit', {
    method: 'POST',
    body: { ...application, form: 'enrollment' },
  }), env);
  const missingBody = await missing.json();
  assert.equal(missing.status, 400);
  assert.match(missingBody.message, /Emergency contact/);
  assert.match(missingBody.message, /Consent/);

  const sent = [];
  env.EMAIL = { async send(message) { sent.push(message); return { messageId: 'msg-3' }; } };
  const ok = await worker.fetch(request('/api/fruitfulbeginnings/submit', {
    method: 'POST',
    body: {
      ...application,
      form: 'enrollment',
      emergency_contact: 'Jordan Parent',
      allergies: 'Strawberries',
      medical_notes: 'Inhaler kept at home',
      authorized_pickup: 'Jordan Parent',
      consent: 'yes',
    },
  }), env);
  assert.equal(ok.status, 201);
  assert.match(sent[0].text, /Strawberries/);
  assert.match(sent[0].subject, /^Fruitful Beginnings enrollment:/);
});

test('other origins are refused and a failed send is not reported as delivered', async () => {
  const forbidden = await worker.fetch(request('/api/fruitfulbeginnings/submit', {
    method: 'POST',
    body: application,
    origin: 'https://example.com',
  }), { LAURA_EMAIL: 'laura@example.com', EMAIL: { async send() {} } });
  assert.equal(forbidden.status, 403);

  const failed = await worker.fetch(request('/api/fruitfulbeginnings/submit', { method: 'POST', body: application }), {
    LAURA_EMAIL: 'laura@example.com',
    EMAIL: { async send() { throw Object.assign(new Error('mailbox unavailable'), { code: 'send_failed' }); } },
  });
  const body = await failed.json();
  assert.equal(failed.status, 502);
  assert.equal(body.ok, false);
  assert.match(body.message, /did not send/i);
});

test('a browser form post without JavaScript gets an HTML page', async () => {
  const res = await worker.fetch(request('/api/fruitfulbeginnings/submit', {
    method: 'POST',
    body: application,
    headers: { accept: 'text/html' },
  }), {});
  const html = await res.text();
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.match(html, /noindex/);
  assert.match(html, /could not be sent just yet/);
  assert.match(html, />Back</);
});
