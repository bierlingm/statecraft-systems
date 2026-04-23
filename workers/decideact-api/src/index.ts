/**
 * Decide / Act 2026 — form submission API
 *
 * Routes:
 *   POST /submit          Public. Accepts Apply or Pulse submissions as JSON,
 *                         stores them in KV, optionally pings a Slack webhook.
 *   GET  /submissions     Authenticated. Returns all stored submissions as JSON.
 *                         Requires header: `Authorization: Bearer <ADMIN_TOKEN>`.
 *   GET  /health          Unauthenticated liveness check.
 */

export interface Env {
  SUBMISSIONS: KVNamespace;
  ALLOWED_ORIGIN: string;
  ADMIN_TOKEN?: string;
  SLACK_WEBHOOK?: string;
  NOTIFY_EMAIL?: string;
}

type Submission = {
  _kind: 'apply' | 'pulse';
  _source?: string;
  _submittedAt?: string;
  name?: string;
  email?: string;
  locality?: string;
  fight?: string;
  vouches?: string;
  note?: string;
};

const MAX_BODY_BYTES = 16 * 1024; // 16 KB — plenty for a form

function corsHeaders(env: Env, req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allow = env.ALLOWED_ORIGIN || '*';
  // Allow the configured origin exactly, plus localhost for dev.
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

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function notifySlack(env: Env, sub: Submission): Promise<void> {
  if (!env.SLACK_WEBHOOK) return;
  const lines = [
    `*Decide / Act — ${sub._kind === 'apply' ? 'Invitation request' : 'Pulse subscription'}*`,
    sub.name ? `*Name:* ${sub.name}` : null,
    sub.email ? `*Email:* ${sub.email}` : null,
    sub.locality ? `*Locality:* ${sub.locality}` : null,
    sub.fight ? `*Fight:* ${sub.fight}` : null,
    sub.vouches ? `*Vouches:* ${sub.vouches}` : null,
    sub.note ? `*Note:* ${sub.note}` : null,
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
      return json(200, { ok: true, service: 'decideact-api' }, cors);
    }

    if (url.pathname === '/submit' && req.method === 'POST') {
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

      const kind = data._kind === 'apply' || data._kind === 'pulse' ? data._kind : null;
      if (!kind) return json(400, { error: 'missing _kind' }, cors);

      const sub: Submission = {
        _kind: kind,
        _source: sanitize(data._source, 200),
        _submittedAt: new Date().toISOString(),
        name: sanitize(data.name, 200),
        email: sanitize(data.email, 200),
        locality: sanitize(data.locality, 400),
        fight: sanitize(data.fight, 2000),
        vouches: sanitize(data.vouches, 2000),
        note: sanitize(data.note, 2000),
      };

      if (!sub.email || !isEmail(sub.email)) {
        return json(400, { error: 'valid email required' }, cors);
      }
      if (kind === 'apply' && !sub.name) {
        return json(400, { error: 'name required' }, cors);
      }

      const id = crypto.randomUUID();
      const key = `sub:${kind}:${sub._submittedAt}:${id}`;
      await env.SUBMISSIONS.put(key, JSON.stringify(sub), {
        metadata: { kind, email: sub.email, submittedAt: sub._submittedAt },
      });

      ctx.waitUntil(notifySlack(env, sub));

      return json(200, { ok: true, id }, cors);
    }

    if (url.pathname === '/submissions' && req.method === 'GET') {
      const auth = req.headers.get('Authorization') ?? '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return json(401, { error: 'unauthorized' }, cors);
      }
      const kindFilter = url.searchParams.get('kind');
      const list = await env.SUBMISSIONS.list({
        prefix: kindFilter ? `sub:${kindFilter}:` : 'sub:',
        limit: 1000,
      });
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
