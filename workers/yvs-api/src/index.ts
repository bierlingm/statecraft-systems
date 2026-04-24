/**
 * Yakima Valley Supply & Labor — intake form API
 *
 * Routes:
 *   POST /intake          Public. Accepts new-customer intake submissions as JSON,
 *                         stores them in KV, emails orders@yakimavalleysupply.com via Resend,
 *                         optionally pings a Slack webhook.
 *   GET  /submissions     Authenticated. Returns all stored submissions as JSON.
 *                         Requires header: `Authorization: Bearer <ADMIN_TOKEN>`.
 *   GET  /health          Unauthenticated liveness check.
 */

export interface Env {
  SUBMISSIONS: KVNamespace;
  ALLOWED_ORIGIN: string;
  NOTIFY_TO: string;
  NOTIFY_FROM: string;
  RESEND_API_KEY?: string;
  ADMIN_TOKEN?: string;
  SLACK_WEBHOOK?: string;
}

type Submission = {
  _kind: 'intake';
  _source?: string;
  _submittedAt?: string;
  company?: string;
  contact?: string;
  phone?: string;
  email?: string;
  industry?: string;
  products?: string[];
  volume?: string;
  contactMethod?: string;
  notes?: string;
};

const MAX_BODY_BYTES = 16 * 1024;

function corsHeaders(env: Env, req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allow = env.ALLOWED_ORIGIN || '*';
  const allowed =
    origin === allow || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

function sanitize(s: unknown, max = 4000): string {
  if (typeof s !== 'string') return '';
  return s.slice(0, max).trim();
}

function sanitizeList(v: unknown, maxItems = 50, maxItemLen = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, maxItems)
    .map((x) => sanitize(x, maxItemLen))
    .filter((x) => x.length > 0);
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmail(sub: Submission): { subject: string; text: string; html: string } {
  const rows: Array<[string, string]> = [
    ['Company', sub.company || ''],
    ['Primary Contact', sub.contact || ''],
    ['Phone', sub.phone || ''],
    ['Email', sub.email || ''],
    ['Industry', sub.industry || ''],
    ['Products of Interest', (sub.products || []).join(', ')],
    ['Estimated Volume', sub.volume || ''],
    ['Preferred Contact Method', sub.contactMethod || ''],
    ['Notes', sub.notes || ''],
    ['Submitted', sub._submittedAt || ''],
    ['Source', sub._source || ''],
  ];

  const text = rows
    .filter(([, v]) => v && v.length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const html =
    `<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px;">` +
    rows
      .filter(([, v]) => v && v.length > 0)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top;"><strong>${escapeHtml(
            k
          )}</strong></td><td style="padding:4px 0;">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`
      )
      .join('') +
    `</table>`;

  const subject = `New YVS intake — ${sub.company || sub.contact || sub.email || 'unknown'}`;

  return { subject, text, html };
}

async function sendEmail(env: Env, sub: Submission): Promise<{ ok: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not configured' };
  const { subject, text, html } = renderEmail(sub);

  const body: Record<string, unknown> = {
    from: env.NOTIFY_FROM,
    to: [env.NOTIFY_TO],
    subject,
    text,
    html,
  };
  if (sub.email && isEmail(sub.email)) {
    body.reply_to = sub.email;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const errText = await r.text();
      return { ok: false, error: `resend ${r.status}: ${errText.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 300) };
  }
}

async function notifySlack(env: Env, sub: Submission): Promise<void> {
  if (!env.SLACK_WEBHOOK) return;
  const lines = [
    `*YVS intake — new submission*`,
    sub.company ? `*Company:* ${sub.company}` : null,
    sub.contact ? `*Contact:* ${sub.contact}` : null,
    sub.email ? `*Email:* ${sub.email}` : null,
    sub.phone ? `*Phone:* ${sub.phone}` : null,
    sub.industry ? `*Industry:* ${sub.industry}` : null,
    sub.products && sub.products.length ? `*Products:* ${sub.products.join(', ')}` : null,
    sub.volume ? `*Volume:* ${sub.volume}` : null,
    sub.contactMethod ? `*Preferred:* ${sub.contactMethod}` : null,
    sub.notes ? `*Notes:* ${sub.notes}` : null,
  ].filter(Boolean);
  try {
    await fetch(env.SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: lines.join('\n') }),
    });
  } catch {
    // Non-fatal. Submission is already stored.
  }
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const cors = corsHeaders(env, req);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/health') {
      return json(200, { ok: true, service: 'yvs-api' }, cors);
    }

    if (url.pathname === '/intake' && req.method === 'POST') {
      const len = Number(req.headers.get('Content-Length') ?? '0');
      if (len > MAX_BODY_BYTES) {
        return json(413, { error: 'payload too large' }, cors);
      }

      let data: Submission;
      try {
        data = (await req.json()) as Submission;
      } catch {
        return json(400, { error: 'invalid json' }, cors);
      }

      const sub: Submission = {
        _kind: 'intake',
        _source: sanitize(data._source, 200),
        _submittedAt: new Date().toISOString(),
        company: sanitize(data.company, 200),
        contact: sanitize(data.contact, 200),
        phone: sanitize(data.phone, 40),
        email: sanitize(data.email, 200),
        industry: sanitize(data.industry, 100),
        products: sanitizeList(data.products, 20, 80),
        volume: sanitize(data.volume, 80),
        contactMethod: sanitize(data.contactMethod, 40),
        notes: sanitize(data.notes, 4000),
      };

      if (!sub.company) return json(400, { error: 'company required' }, cors);
      if (!sub.contact) return json(400, { error: 'contact name required' }, cors);
      if (!sub.email || !isEmail(sub.email)) {
        return json(400, { error: 'valid email required' }, cors);
      }
      if (!sub.phone) return json(400, { error: 'phone required' }, cors);
      if (!sub.industry) return json(400, { error: 'industry required' }, cors);

      const id = crypto.randomUUID();
      const key = `sub:intake:${sub._submittedAt}:${id}`;
      await env.SUBMISSIONS.put(key, JSON.stringify(sub), {
        metadata: { email: sub.email, submittedAt: sub._submittedAt },
      });

      // Fire-and-forget notifications. Submission is already durably stored in KV.
      ctx.waitUntil(
        (async () => {
          const emailResult = await sendEmail(env, sub);
          if (!emailResult.ok) {
            console.error('email send failed:', emailResult.error);
          }
          await notifySlack(env, sub);
        })()
      );

      return json(200, { ok: true, id }, cors);
    }

    if (url.pathname === '/submissions' && req.method === 'GET') {
      const auth = req.headers.get('Authorization') ?? '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return json(401, { error: 'unauthorized' }, cors);
      }
      const list = await env.SUBMISSIONS.list({ prefix: 'sub:intake:', limit: 1000 });
      const rows = await Promise.all(
        list.keys.map(async (k) => {
          const v = await env.SUBMISSIONS.get(k.name);
          return v ? { key: k.name, ...(JSON.parse(v) as Submission) } : null;
        })
      );
      return json(200, { count: rows.length, submissions: rows.filter(Boolean) }, cors);
    }

    return json(404, { error: 'not found' }, cors);
  },
};
