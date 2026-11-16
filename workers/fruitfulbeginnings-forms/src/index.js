// fruitfulbeginnings-forms
// POST /api/fruitfulbeginnings/submit   application | enrollment
// GET  /api/fruitfulbeginnings/status   { ready } without revealing LAURA_EMAIL
//
// Mail uses the Cloudflare Email Sending binding, same shape as the
// Prosser Horse Hotel workers: env.EMAIL.send, from rooms@statecraft.systems,
// replyTo as a plain string. The recipient is the LAURA_EMAIL secret.
// Until that secret is set, nothing is stored and nothing is sent.

const ALLOWED = [
  /^https:\/\/statecraft\.systems$/,
  /^https:\/\/www\.statecraft\.systems$/,
  /^https:\/\/statecraft-systems\.pages\.dev$/,
  /^https:\/\/[a-z0-9-]+\.statecraft-systems\.pages\.dev$/,
  /^http:\/\/localhost(?::\d+)?$/,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
];

const SETUP_MESSAGE = 'Forms are being set up. Nothing was sent.';
const FROM_NAME = 'Fruitful Beginnings';
const DEFAULT_FROM = 'rooms@statecraft.systems';
const MAX_BODY = 100_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const LABELS = {
  parent_name: 'Parent or guardian name',
  email: 'Email',
  phone: 'Phone',
  child_name: 'Child name',
  child_dob: 'Child date of birth',
  potty_trained: 'Potty trained',
  start_date: 'Desired start date',
  days: 'Days needed',
  hear_about: 'How did you hear about us',
  dcyf_interest: 'Interest in DCYF child care assistance',
  message: 'Message',
  emergency_contact: 'Emergency contact',
  allergies: 'Allergies or dietary needs',
  medical_notes: 'Medical notes',
  authorized_pickup: 'Authorized pickup persons',
  consent: 'Consent',
};

const BASE_FIELDS = ['parent_name', 'email', 'phone', 'child_name', 'child_dob', 'potty_trained', 'start_date', 'days', 'dcyf_interest'];
const OPTIONAL = ['hear_about', 'message', 'allergies', 'medical_notes', 'authorized_pickup'];
const ENROLL_FIELDS = ['emergency_contact', 'consent'];
const LIMITS = {
  parent_name: 120,
  email: 200,
  phone: 40,
  child_name: 120,
  child_dob: 10,
  potty_trained: 3,
  start_date: 10,
  days: 200,
  hear_about: 200,
  dcyf_interest: 3,
  message: 2000,
  emergency_contact: 500,
  allergies: 1000,
  medical_notes: 2000,
  authorized_pickup: 1000,
  consent: 3,
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const log = (event, extra = {}) => {
  console.log(JSON.stringify({ worker: 'fruitfulbeginnings-forms', event, ...extra }));
};

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin && ALLOWED.some((r) => r.test(origin)) ? origin : 'https://statecraft.systems',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, accept',
  Vary: 'Origin',
});

const wantsHtml = (req) => {
  const accept = req.headers.get('accept') || '';
  return accept.includes('text/html') && !accept.includes('application/json');
};

function respond(req, origin, body, status) {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    ...cors(origin),
  };
  if (wantsHtml(req)) {
    const title = body.setup ? 'Forms are being set up' : (body.ok ? 'Form received' : 'Form not sent');
    headers['Content-Type'] = 'text/html; charset=utf-8';
    const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title></head><body style="font-family:Georgia,serif;background:#f4efe4;color:#241c16;margin:0;padding:3rem 1.25rem"><main style="max-width:36rem;margin:auto"><h1>${esc(title)}</h1><p>${esc(body.message || '')}</p><p><a href="/fruitfulbeginnings/enroll/">Back to the forms</a></p></main></body></html>`;
    return new Response(page, { status, headers });
  }
  headers['Content-Type'] = 'application/json; charset=utf-8';
  return new Response(JSON.stringify(body), { status, headers });
}

function lauraEmail(env) {
  const raw = String(env?.LAURA_EMAIL || '').trim();
  return EMAIL_RE.test(raw) && !/[\r\n]/.test(raw) ? raw : '';
}

function fromEmail(env) {
  const raw = String(env?.NOTIFY_FROM || DEFAULT_FROM).trim();
  const addr = raw.match(/<([^>]+)>/)?.[1]?.trim() || raw;
  return EMAIL_RE.test(addr) ? addr : DEFAULT_FROM;
}

function clean(value, max) {
  return String(value ?? '').replace(/\u0000/g, '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

async function readFields(req) {
  const claimed = Number(req.headers.get('content-length') || 0);
  if (Number.isFinite(claimed) && claimed > MAX_BODY) return { error: 'too-large' };
  const ct = req.headers.get('content-type') || '';
  try {
    if (ct.includes('multipart/form-data')) {
      const fd = await req.formData();
      const fields = {};
      for (const [key, value] of fd.entries()) {
        if (typeof value !== 'string') continue;
        fields[key] = fields[key] ? `${fields[key]}, ${value}` : value;
      }
      return { fields };
    }
    const text = await req.text();
    if (text.length > MAX_BODY) return { error: 'too-large' };
    if (ct.includes('application/json')) {
      const data = JSON.parse(text || '{}');
      if (!data || typeof data !== 'object' || Array.isArray(data)) return { error: 'bad' };
      const fields = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') fields[key] = value;
        else if (Array.isArray(value)) fields[key] = value.filter((item) => typeof item === 'string').join(', ');
      }
      return { fields };
    }
    const fields = {};
    for (const [key, value] of new URLSearchParams(text).entries()) {
      fields[key] = fields[key] ? `${fields[key]}, ${value}` : value;
    }
    return { fields };
  } catch {
    return { error: 'bad' };
  }
}

function validate(fields) {
  const form = fields.form === 'enrollment' ? 'enrollment' : (fields.form === 'application' ? 'application' : '');
  const problems = [];
  if (!form) problems.push('which form this is');
  const required = form === 'enrollment' ? [...BASE_FIELDS, ...ENROLL_FIELDS] : BASE_FIELDS;
  const values = {};
  for (const key of [...required, ...OPTIONAL]) {
    values[key] = clean(fields[key], LIMITS[key] || 500);
  }
  for (const key of required) {
    if (!values[key]) problems.push(LABELS[key]);
  }
  if (values.email && !EMAIL_RE.test(values.email)) problems.push('a valid email');
  if (values.phone) {
    const digits = values.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) problems.push('a phone number');
  }
  if (values.child_dob && !DATE_RE.test(values.child_dob)) problems.push('the child’s date of birth');
  if (values.start_date && !DATE_RE.test(values.start_date)) problems.push('a desired start date');
  if (values.potty_trained && !['yes', 'no'].includes(values.potty_trained)) problems.push('whether the child is potty trained');
  if (values.dcyf_interest && !['yes', 'no'].includes(values.dcyf_interest)) problems.push('whether you are interested in DCYF child care assistance');
  if (form === 'enrollment' && values.consent && values.consent !== 'yes') problems.push('the consent checkbox');
  return { form, values, problems };
}

function display(key, value) {
  if (key === 'potty_trained' || key === 'dcyf_interest') return value === 'yes' ? 'Yes' : 'No';
  if (key === 'consent') return 'Yes. The sender confirmed the details are accurate to the best of their knowledge, and that sending the form does not hold or confirm a place.';
  return value;
}

function mailFor(form, values, id, at) {
  const keys = [
    ...BASE_FIELDS,
    'hear_about',
    'message',
    ...(form === 'enrollment' ? [...ENROLL_FIELDS, 'allergies', 'medical_notes', 'authorized_pickup'] : []),
  ];
  const rows = keys.filter((key) => values[key]).map((key) => [LABELS[key], display(key, values[key])]);
  const who = values.parent_name;
  const subject = `Fruitful Beginnings ${form}: ${who}`.replace(/[\r\n]/g, ' ').slice(0, 150);
  const text = [
    `New ${form} from the Fruitful Beginnings website.`,
    `From: ${who}`,
    `Reference: ${id}`,
    `Received: ${at}`,
    '',
    ...rows.map(([label, value]) => `${label}:\n${value}`),
    '',
    'Sending this form does not hold or confirm a place.',
    'Fruitful Beginnings is licensed and DCYF approved. Qualified families may receive child care assistance. This form does not apply for that assistance and does not say whether a family qualifies.',
  ].join('\n');
  const html = `<p>New <b>${esc(form)}</b> from the Fruitful Beginnings website.</p><p>From: ${esc(who)}<br>Reference: ${esc(id)}<br>Received: ${esc(at)}</p><table style="border-collapse:collapse">${rows.map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#555"><b>${esc(label)}</b></td><td style="padding:6px 0;white-space:pre-wrap">${esc(value)}</td></tr>`).join('')}</table><p>Sending this form does not hold or confirm a place.</p><p>Fruitful Beginnings is licensed and DCYF approved. Qualified families may receive child care assistance. This form does not apply for that assistance and does not say whether a family qualifies.</p>`;
  return { subject, text, html, replyTo: EMAIL_RE.test(values.email) ? values.email : '' };
}

async function submit(req, env, origin) {
  const parsed = await readFields(req);
  if (parsed.error === 'too-large') return respond(req, origin, { ok: false, message: 'That form is too large to send.' }, 413);
  if (parsed.error) return respond(req, origin, { ok: false, message: 'Could not read the form.' }, 400);

  if (clean(parsed.fields.website, 500)) {
    log('honeypot');
    return respond(req, origin, { ok: true, message: 'Thank you.' }, 200);
  }

  const { form, values, problems } = validate(parsed.fields);
  if (problems.length) {
    return respond(req, origin, { ok: false, message: `Please check: ${[...new Set(problems)].join(', ')}.` }, 400);
  }

  const to = lauraEmail(env);
  const canSend = to && env?.EMAIL && typeof env.EMAIL.send === 'function';
  if (!canSend) {
    log('setup', { form, hasRecipient: Boolean(to), hasBinding: Boolean(env?.EMAIL) });
    return respond(req, origin, { ok: false, setup: true, message: SETUP_MESSAGE }, 200);
  }

  const at = new Date().toISOString();
  const id = crypto.randomUUID();
  const mail = mailFor(form, values, id, at);
  const message = {
    from: { email: fromEmail(env), name: FROM_NAME },
    to: [to],
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  };
  if (mail.replyTo) message.replyTo = mail.replyTo;

  try {
    const result = await env.EMAIL.send(message);
    log('sent', { form, id, messageId: result?.messageId || '' });
    return respond(req, origin, {
      ok: true,
      id,
      message: 'Thank you. Your form was sent to Laura. It does not hold or confirm a place.',
    }, 201);
  } catch (error) {
    console.error(JSON.stringify({
      worker: 'fruitfulbeginnings-forms',
      event: 'send-failed',
      form,
      id,
      code: error?.code || '',
      message: error?.message || String(error),
    }));
    return respond(req, origin, {
      ok: false,
      message: 'We could not send this just now. Nothing was delivered. Please try again later.',
    }, 502);
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin');
    const path = url.pathname.replace(/\/+$/, '');

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (origin && !ALLOWED.some((rule) => rule.test(origin))) {
      return respond(req, origin, { ok: false, message: 'This form only accepts notes from the Fruitful Beginnings preview.' }, 403);
    }

    if (path === '/api/fruitfulbeginnings/status' && req.method === 'GET') {
      const ready = Boolean(lauraEmail(env) && env?.EMAIL && typeof env.EMAIL.send === 'function');
      return respond(req, origin, {
        ok: true,
        ready,
        message: ready ? 'Forms are ready.' : 'Forms are being set up.',
      }, 200);
    }

    if (path === '/api/fruitfulbeginnings/submit' && req.method === 'POST') return submit(req, env, origin);

    if (path === '/api/fruitfulbeginnings/status' || path === '/api/fruitfulbeginnings/submit') {
      return respond(req, origin, { ok: false, message: 'That action is not available.' }, 405);
    }

    return respond(req, origin, { ok: false, message: 'Not found.' }, 404);
  },
};
