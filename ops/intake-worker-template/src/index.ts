/**
 * Yakima Valley Supply & Labor — intake form API
 *
 * Routes:
 *   POST /intake          Public. Accepts new-customer intake submissions as JSON,
 *                         stores them in KV, emails orders@yakimavalleysupply.com via Resend,
 *                         optionally pings a Slack webhook.
 *   POST /path-choice     Public. Accepts go-live path picker submissions (A or B),
 *                         stores in KV, emails the owner with path-specific next steps
 *                         and CCs the admin.
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
  ADMIN_EMAIL?: string;
  PAGES_TARGET?: string;
  BUNDLE_URL?: string;
}

type PathChoice = {
  _kind: 'path-choice';
  _source?: string;
  _submittedAt?: string;
  path: 'A' | 'B';
  contact_name: string;
  contact_email: string;
  notes?: string;
};

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
  const allowList = new Set(
    (allow + ',https://yakimavalleysupply.com,https://www.yakimavalleysupply.com,https://yakimavalleysupply-website.pages.dev')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const allowed =
    allowList.has(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
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

function renderPathChoiceForOwner(
  choice: PathChoice,
  env: Env
): { subject: string; text: string; html: string } {
  const pagesTarget = env.PAGES_TARGET || 'yakimavalleysupply-website.pages.dev';
  const bundleUrl =
    env.BUNDLE_URL ||
    'https://github.com/bierlingm/yakimavalleysupply.com/releases/latest';
  const repoUrl = 'https://github.com/bierlingm/yakimavalleysupply.com';

  if (choice.path === 'A') {
    const text =
`Hi ${choice.contact_name},

Thanks — Path A confirmed. Yakimavalleysupply.com will go live on our Cloudflare as soon as DNS resolves.

What you do at your registrar (GoDaddy / Namecheap / wherever the domain is parked):

  Type   Name   Value
  CNAME  @      ${pagesTarget}
  CNAME  www    ${pagesTarget}

If your registrar refuses a CNAME at the apex (@), use these proxied records instead:

  Type   Name   Value
  A      @      192.0.2.1
  AAAA   @      100::
  CNAME  www    ${pagesTarget}

Cloudflare will catch and route those automatically.

Fallback if neither works: switch the domain to Cloudflare's nameservers — Cloudflare assigns two when you add the domain to a free account, and from there everything (cert, DNS, routing) is automatic. Reply if you'd like that route and we'll walk you through it.

The custom domain is already attached on our end. Cert provisions within minutes of DNS resolving. Site is usually live within 1–24 hours depending on TTLs.

Questions? Just reply.

— Moritz
`;
    const html = `<p>Hi ${escapeHtml(choice.contact_name)},</p>
<p>Thanks — <strong>Path A confirmed</strong>. Yakimavalleysupply.com will go live on our Cloudflare as soon as DNS resolves.</p>
<p><strong>What you do at your registrar</strong> (GoDaddy / Namecheap / wherever the domain is parked):</p>
<table style="border-collapse:collapse;font-family:ui-monospace,Menlo,monospace;font-size:14px;background:#f6f6f6;padding:8px;">
  <tr><th align="left" style="padding:4px 12px;">Type</th><th align="left" style="padding:4px 12px;">Name</th><th align="left" style="padding:4px 12px;">Value</th></tr>
  <tr><td style="padding:4px 12px;">CNAME</td><td style="padding:4px 12px;">@</td><td style="padding:4px 12px;">${escapeHtml(pagesTarget)}</td></tr>
  <tr><td style="padding:4px 12px;">CNAME</td><td style="padding:4px 12px;">www</td><td style="padding:4px 12px;">${escapeHtml(pagesTarget)}</td></tr>
</table>
<p>If your registrar refuses a CNAME at the apex, use these proxied records instead:</p>
<table style="border-collapse:collapse;font-family:ui-monospace,Menlo,monospace;font-size:14px;background:#f6f6f6;padding:8px;">
  <tr><th align="left" style="padding:4px 12px;">Type</th><th align="left" style="padding:4px 12px;">Name</th><th align="left" style="padding:4px 12px;">Value</th></tr>
  <tr><td style="padding:4px 12px;">A</td><td style="padding:4px 12px;">@</td><td style="padding:4px 12px;">192.0.2.1</td></tr>
  <tr><td style="padding:4px 12px;">AAAA</td><td style="padding:4px 12px;">@</td><td style="padding:4px 12px;">100::</td></tr>
  <tr><td style="padding:4px 12px;">CNAME</td><td style="padding:4px 12px;">www</td><td style="padding:4px 12px;">${escapeHtml(pagesTarget)}</td></tr>
</table>
<p><strong>Fallback</strong> if neither works: switch the domain to Cloudflare's nameservers. Reply if you'd like that route and we'll walk you through it.</p>
<p>The custom domain is already attached on our end. Cert provisions within minutes of DNS resolving. Site is usually live within 1–24 hours depending on TTLs.</p>
<p>Questions? Just reply.</p>
<p>— Moritz</p>`;
    return { subject: 'Path A confirmed — DNS records to add', text, html };
  }

  // Path B
  const text =
`Hi ${choice.contact_name},

Thanks — Path B confirmed. The site is yours.

Three things in this email:

1. Source bundle (everything: site, worker, runbook):
   ${bundleUrl}

2. GitHub repository:
   ${repoUrl}
   Reply to this email with your GitHub username and we'll add you as a collaborator within a few hours. (Or, if you'd prefer, we can transfer the repo to your account or org outright.)

3. Runbook (deploy + DNS + secrets):
   ${repoUrl}#readme

You'll need:
  - A host (Vercel, Netlify, your own Cloudflare, etc.). The static site is just HTML/CSS — works anywhere.
  - A Resend account for the intake email (free tier is plenty). Drop your key into the worker as RESEND_API_KEY.
  - DNS pointed at your host.

Happy to do a 30-minute handover call to walk through it. Just reply.

— Moritz
`;
  const html = `<p>Hi ${escapeHtml(choice.contact_name)},</p>
<p>Thanks — <strong>Path B confirmed</strong>. The site is yours.</p>
<p>Three things in this email:</p>
<ol>
  <li><strong>Source bundle</strong> (everything: site, worker, runbook):<br>
    <a href="${escapeHtml(bundleUrl)}">${escapeHtml(bundleUrl)}</a></li>
  <li><strong>GitHub repository</strong>:<br>
    <a href="${escapeHtml(repoUrl)}">${escapeHtml(repoUrl)}</a><br>
    <em>Reply to this email with your GitHub username</em> and we'll add you as a collaborator within a few hours. (Or, if you'd prefer, we can transfer the repo to your account or org outright.)</li>
  <li><strong>Runbook</strong> (deploy + DNS + secrets):<br>
    <a href="${escapeHtml(repoUrl)}#readme">${escapeHtml(repoUrl)}#readme</a></li>
</ol>
<p>You'll need:</p>
<ul>
  <li>A host (Vercel, Netlify, your own Cloudflare, etc.). The static site is just HTML/CSS — works anywhere.</li>
  <li>A Resend account for the intake email (free tier is plenty). Drop your key into the worker as <code>RESEND_API_KEY</code>.</li>
  <li>DNS pointed at your host.</li>
</ul>
<p>Happy to do a 30-minute handover call to walk through it. Just reply.</p>
<p>— Moritz</p>`;
  return { subject: 'Path B confirmed — your site, your infrastructure', text, html };
}

async function sendPathChoiceEmail(
  env: Env,
  choice: PathChoice
): Promise<{ ok: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not configured' };
  const adminEmail = env.ADMIN_EMAIL || 'moritzbierling@hey.com';
  const { subject, text, html } = renderPathChoiceForOwner(choice, env);

  const ownerBody: Record<string, unknown> = {
    from: env.NOTIFY_FROM,
    to: [choice.contact_email],
    bcc: [adminEmail],
    subject,
    text,
    html,
    reply_to: adminEmail,
  };

  const adminSummary =
`Path ${choice.path} chosen.

Name:  ${choice.contact_name}
Email: ${choice.contact_email}
Notes: ${choice.notes || '(none)'}

Submitted: ${choice._submittedAt}
Source:    ${choice._source || ''}
`;
  const adminBody: Record<string, unknown> = {
    from: env.NOTIFY_FROM,
    to: [adminEmail],
    subject: `YVS path-choice: Path ${choice.path} — ${choice.contact_name}`,
    text: adminSummary,
    reply_to: choice.contact_email,
  };

  try {
    const [r1, r2] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ownerBody),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminBody),
      }),
    ]);
    if (!r1.ok) {
      return { ok: false, error: `resend owner ${r1.status}: ${(await r1.text()).slice(0, 200)}` };
    }
    if (!r2.ok) {
      return { ok: false, error: `resend admin ${r2.status}: ${(await r2.text()).slice(0, 200)}` };
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

    if (url.pathname === '/path-choice' && req.method === 'POST') {
      const len = Number(req.headers.get('Content-Length') ?? '0');
      if (len > MAX_BODY_BYTES) {
        return json(413, { error: 'payload too large' }, cors);
      }

      let data: Partial<PathChoice>;
      try {
        data = (await req.json()) as Partial<PathChoice>;
      } catch {
        return json(400, { error: 'invalid json' }, cors);
      }

      const path = data.path;
      if (path !== 'A' && path !== 'B') {
        return json(400, { error: 'path must be "A" or "B"' }, cors);
      }
      const contact_name = sanitize(data.contact_name, 200);
      const contact_email = sanitize(data.contact_email, 200);
      if (!contact_name) return json(400, { error: 'contact_name required' }, cors);
      if (!contact_email || !isEmail(contact_email)) {
        return json(400, { error: 'valid contact_email required' }, cors);
      }

      const choice: PathChoice = {
        _kind: 'path-choice',
        _source: sanitize(data._source, 200),
        _submittedAt: new Date().toISOString(),
        path,
        contact_name,
        contact_email,
        notes: sanitize(data.notes, 4000),
      };

      const id = crypto.randomUUID();
      const key = `sub:choice:${choice._submittedAt}:${id}`;
      await env.SUBMISSIONS.put(key, JSON.stringify(choice), {
        metadata: { email: contact_email, path, submittedAt: choice._submittedAt },
      });

      ctx.waitUntil(
        (async () => {
          const r = await sendPathChoiceEmail(env, choice);
          if (!r.ok) console.error('path-choice email failed:', r.error);
        })()
      );

      return json(
        200,
        { ok: true, path, next_url: `/going-live/?path=${path}` },
        cors
      );
    }

    if (url.pathname === '/submissions' && req.method === 'GET') {
      const auth = req.headers.get('Authorization') ?? '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return json(401, { error: 'unauthorized' }, cors);
      }
      const [intakeList, choiceList] = await Promise.all([
        env.SUBMISSIONS.list({ prefix: 'sub:intake:', limit: 1000 }),
        env.SUBMISSIONS.list({ prefix: 'sub:choice:', limit: 1000 }),
      ]);
      const all = [...intakeList.keys, ...choiceList.keys];
      const rows = await Promise.all(
        all.map(async (k) => {
          const v = await env.SUBMISSIONS.get(k.name);
          return v ? { key: k.name, ...(JSON.parse(v) as Submission | PathChoice) } : null;
        })
      );
      return json(200, { count: rows.length, submissions: rows.filter(Boolean) }, cors);
    }

    return json(404, { error: 'not found' }, cors);
  },
};
