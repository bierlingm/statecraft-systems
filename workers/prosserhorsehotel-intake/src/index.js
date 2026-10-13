// prosserhorsehotel-intake: receives the Prosser Horse Hotel room forms (intake + feedback),
// stores every submission in KV (SUBMISSIONS) before answering, then emails a copy to NOTIFY_TO.
// Routes (zone route statecraft.systems/api/prosserhorsehotel/*):
//   POST /api/prosserhorsehotel/submit        multipart/form-data or JSON; honeypot field "website"
//   GET  /api/prosserhorsehotel/submissions   Authorization: Bearer ADMIN_TOKEN -> JSON list
//   GET  /api/prosserhorsehotel/file/<key>    Authorization: Bearer ADMIN_TOKEN -> stored upload
const ALLOWED = [/^https:\/\/prosserhorsehotel\.com$/, /^https:\/\/www\.prosserhorsehotel\.com$/, /^https:\/\/statecraft\.systems$/, /^https:\/\/www\.statecraft\.systems$/, /^https:\/\/[a-z0-9-]+\.statecraft-systems\.pages\.dev$/, /^http:\/\/localhost(:\d+)?$/];
const MAX_FIELDS = 120, MAX_FIELD = 5000, MAX_FILES = 10, MAX_FILE = 8 * 1024 * 1024, MAX_TOTAL = 20 * 1024 * 1024;
const cors = (o) => ({ 'Access-Control-Allow-Origin': o && ALLOWED.some(r => r.test(o)) ? o : 'https://statecraft.systems', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'content-type, authorization', Vary: 'Origin' });
const json = (d, s, o) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(o) } });
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const authed = (req, env) => env.ADMIN_TOKEN && req.headers.get('authorization') === `Bearer ${env.ADMIN_TOKEN}`;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url), o = req.headers.get('origin');
    const p = url.pathname.replace(/\/+$/, '');
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(o) });
    if (p === '/api/prosserhorsehotel/submit' && req.method === 'POST') return submit(req, env, ctx, o);
    if (p === '/api/prosserhorsehotel/submissions' && req.method === 'GET') {
      if (!authed(req, env)) return json({ error: 'Unauthorized' }, 401, o);
      const list = await env.SUBMISSIONS.list({ prefix: 'sub:' });
      const out = [];
      for (const k of list.keys) out.push(JSON.parse(await env.SUBMISSIONS.get(k.name)));
      return json({ count: out.length, submissions: out }, 200, o);
    }
    if (p.startsWith('/api/prosserhorsehotel/file/') && req.method === 'GET') {
      if (!authed(req, env)) return json({ error: 'Unauthorized' }, 401, o);
      const key = decodeURIComponent(p.slice('/api/prosserhorsehotel/file/'.length));
      const { value, metadata } = await env.SUBMISSIONS.getWithMetadata(key, 'arrayBuffer');
      if (!value) return json({ error: 'Not found' }, 404, o);
      return new Response(value, { headers: { 'Content-Type': metadata?.type || 'application/octet-stream', 'Content-Disposition': `attachment; filename="${(metadata?.name || 'file').replace(/"/g, '')}"` } });
    }
    return json({ error: 'Not found' }, 404, o);
  },
};

async function submit(req, env, ctx, o) {
  if (o && !ALLOWED.some(r => r.test(o))) return json({ error: 'Origin not allowed' }, 403, o);
  let fields = {}, files = [];
  const ct = req.headers.get('content-type') || '';
  try {
    if (ct.includes('multipart/form-data')) {
      const fd = await req.formData();
      for (const [k, v] of fd.entries()) {
        if (typeof v === 'string') fields[k] = fields[k] ? fields[k] + ', ' + v : v;
        else if (v && v.size) files.push(v);
      }
    } else fields = await req.json();
  } catch { return json({ error: 'Could not read the form' }, 400, o); }
  // Honeypot: real people never fill "website". Pretend success, store nothing.
  if (String(fields.website || '').trim()) return json({ ok: true }, 200, o);
  delete fields.website;
  const form = ['intake', 'feedback'].includes(fields.form) ? fields.form : 'unknown';
  const entries = Object.entries(fields).filter(([k, v]) => k !== 'form' && typeof v === 'string' && v.trim()).slice(0, MAX_FIELDS).map(([k, v]) => [String(k).slice(0, 80), v.trim().slice(0, MAX_FIELD)]);
  if (!entries.length && !files.length) return json({ error: 'The form is empty' }, 400, o);
  if (files.length > MAX_FILES) return json({ error: `Up to ${MAX_FILES} files at a time` }, 413, o);
  let total = 0;
  for (const f of files) { if (f.size > MAX_FILE) return json({ error: `${f.name} is over 8 MB` }, 413, o); total += f.size; }
  if (total > MAX_TOTAL) return json({ error: 'Files are over 20 MB together' }, 413, o);

  const at = new Date().toISOString();
  const id = `${at.replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 8)}`;
  const stored = [];
  for (const [i, f] of files.entries()) {
    const key = `file:${id}:${i}`;
    await env.SUBMISSIONS.put(key, await f.arrayBuffer(), { metadata: { name: f.name, type: f.type, size: f.size } });
    stored.push({ key, name: f.name, type: f.type, size: f.size });
  }
  const labels = (() => { try { return JSON.parse(fields._labels || '{}'); } catch { return {}; } })();
  const rec = { id, at, form, page: req.headers.get('referer') || '', ip_country: req.cf?.country || '', fields: Object.fromEntries(entries.filter(([k]) => k !== '_labels')), labels, files: stored };
  await env.SUBMISSIONS.put(`sub:${id}`, JSON.stringify(rec));

  const name = rec.fields.name || 'No name given';
  const rows = Object.entries(rec.fields).map(([k, v]) => `<tr><td style="padding:6px 10px;vertical-align:top;color:#555"><b>${esc(labels[k] || k)}</b></td><td style="padding:6px 10px;white-space:pre-wrap">${esc(v)}</td></tr>`).join('');
  const fileRows = stored.map(f => `<li>${esc(f.name)} (${Math.round(f.size / 1024)} KB): https://statecraft.systems/api/prosserhorsehotel/file/${encodeURIComponent(f.key)}</li>`).join('');
  const html = `<p>New <b>${form}</b> submission from the Prosser Horse Hotel room.</p><p>From: ${esc(name)} · ${at} · id ${id}</p><table style="border-collapse:collapse">${rows}</table>${stored.length ? `<p>Uploaded files (download with the admin token):</p><ul>${fileRows}</ul>` : ''}<p>All submissions: GET https://statecraft.systems/api/prosserhorsehotel/submissions with Authorization: Bearer &lt;ADMIN_TOKEN&gt;.</p>`;
  const text = `New ${form} submission from the Prosser Horse Hotel room.\nFrom: ${name} · ${at} · id ${id}\n\n` + Object.entries(rec.fields).map(([k, v]) => `${labels[k] || k}:\n${v}`).join('\n\n') + (stored.length ? `\n\nFiles:\n` + stored.map(f => `${f.name}: https://statecraft.systems/api/prosserhorsehotel/file/${encodeURIComponent(f.key)}`).join('\n') : '');
  let emailed = false;
  try {
    await env.EMAIL.send({ from: { email: env.NOTIFY_FROM, name: 'Prosser Horse Hotel room' }, to: [env.NOTIFY_TO], subject: `Prosser Horse Hotel ${form}: ${name}`.slice(0, 150), html, text });
    emailed = true;
  } catch (e) { console.error('[phh-intake] email failed', e?.code, e?.message); }
  rec.emailed = emailed;
  await env.SUBMISSIONS.put(`sub:${id}`, JSON.stringify(rec));
  return json({ ok: true, id, emailed }, 201, o);
}
