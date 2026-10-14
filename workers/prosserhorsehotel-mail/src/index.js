// prosserhorsehotel-mail: Email Routing Worker for hello@ and listings@prosserhorsehotel.com.
// 1) Forward original to Moritz (HEY) first, before reading message.raw.
// 2) Re-send a copy to Ben via Cloudflare Email Service (rooms@statecraft.systems),
//    matching the working intake Worker payload shape; replyTo is a plain string.
// 3) If Email Sending fails, message.forward to Ben (verified destination).
import PostalMime from 'postal-mime';

const FORWARD_HEY = 'moritzbierling@hey.com';
const BEN = 'prosserhorsehotel@gmail.com';
const FROM_EMAIL = 'rooms@statecraft.systems';
const FROM_NAME = 'Prosser Horse Hotel mail';
const MAX_ATTACH = 4 * 1024 * 1024; // Email Sending limit is 5 MiB total
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function log(...parts) {
  console.log(parts.map(p => {
    if (p == null) return String(p);
    if (typeof p === 'string') return p;
    if (p instanceof Error) return `${p.name}: ${p.message}`;
    try { return JSON.stringify(p); } catch { return String(p); }
  }).join(' '));
}

function emailOnly(email) {
  const s = String(email || '').trim();
  // Strip display-name wrappers: Name <addr@host>
  const m = s.match(/<([^>]+)>/);
  const addr = (m ? m[1] : s).trim();
  return EMAIL_RE.test(addr) ? addr : '';
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toBase64(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

async function buildCopy(message, raw) {
  let subject = message.headers.get('subject') || '(no subject)';
  let replyEmail = emailOnly(message.from);
  let text = `Forwarded copy of a message to ${message.to}.\nOriginal From: ${message.from}\n\n(Could not parse the original body; open the HEY copy for the full message.)`;
  let html;
  let attachments = [];
  try {
    const m = await PostalMime.parse(raw);
    if (typeof m.subject === 'string' && m.subject) subject = m.subject;
    if (m.from?.address) {
      const a = emailOnly(m.from.address);
      if (a) replyEmail = a;
    }
    const who = (typeof m.from?.name === 'string' && m.from.name.trim())
      ? `${m.from.name.trim()} <${replyEmail || message.from}>`
      : (replyEmail || message.from);
    const note = `Sent to ${message.to} by ${who}. Reply to answer them directly.`;
    text = `${note}\n\n${m.text || '(no plain-text body)'}`;
    if (typeof m.html === 'string' && m.html) {
      html = `<p style="color:#666;font-size:13px">${esc(note)}</p><hr>${m.html}`;
    }
    let size = 0;
    for (const a of m.attachments || []) {
      const buf = a.content instanceof ArrayBuffer ? a.content
        : a.content?.buffer ? a.content : null;
      const len = buf?.byteLength ?? 0;
      if (!buf || !len) continue;
      size += len;
      if (size > MAX_ATTACH) break;
      attachments.push({
        content: toBase64(buf),
        filename: (typeof a.filename === 'string' && a.filename) ? a.filename : 'attachment',
        type: (typeof a.mimeType === 'string' && a.mimeType) ? a.mimeType : 'application/octet-stream',
        disposition: 'attachment',
      });
    }
  } catch (e) {
    log('[phh-mail] parse failed, using header fallback', e);
  }
  return {
    subject: String(subject).slice(0, 900),
    replyEmail,
    text: String(text),
    html: typeof html === 'string' ? html : undefined,
    attachments,
  };
}

async function sendCopy(env, copy) {
  // Match intake Worker: from object with string name, to as string array, text (+ optional html).
  // replyTo as plain string only (object form previously caused EmailAddress TypeErrors).
  const base = {
    from: { email: FROM_EMAIL, name: FROM_NAME },
    to: [BEN],
    subject: copy.subject,
    text: copy.text,
  };
  if (copy.replyEmail) base.replyTo = copy.replyEmail;
  if (copy.html) base.html = copy.html;

  // 1) Minimal send first (no attachments) — same shape as intake.
  log('[phh-mail] sending', { to: BEN, from: FROM_EMAIL, replyTo: base.replyTo || null, subject: copy.subject.slice(0, 80), hasHtml: !!copy.html, attach: 0 });
  try {
    const r = await env.EMAIL.send(base);
    log('[phh-mail] resent', r?.messageId || r);
    return true;
  } catch (e1) {
    log('[phh-mail] resend failed', e1?.code, e1?.message, e1);
  }

  // 2) Retry without replyTo / html (closest to bare intake).
  try {
    const r = await env.EMAIL.send({
      from: { email: FROM_EMAIL, name: FROM_NAME },
      to: [BEN],
      subject: copy.subject,
      text: copy.text,
    });
    log('[phh-mail] resent no-attach', r?.messageId || r);
    return true;
  } catch (e2) {
    log('[phh-mail] resend bare failed', e2?.code, e2?.message, e2);
  }

  // 3) Optional: with base64 attachments only if present and still failing above is N/A —
  //    try once with attachments if we have them and bare already failed (unlikely to help).
  if (copy.attachments?.length) {
    try {
      const r = await env.EMAIL.send({ ...base, attachments: copy.attachments });
      log('[phh-mail] resent', r?.messageId || r);
      return true;
    } catch (e3) {
      log('[phh-mail] resend with attachments failed', e3?.code, e3?.message, e3);
    }
  }
  return false;
}

export default {
  async email(message, env) {
    let delivered = 0;
    log('[phh-mail] start', message.to);

    log('[phh-mail] forwarding hey');
    try {
      await message.forward(FORWARD_HEY);
      delivered++;
      log('[phh-mail] forwarded hey');
    } catch (e) {
      log('[phh-mail] forward hey failed', e);
    }

    let resent = false;
    try {
      if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
        log('[phh-mail] EMAIL binding missing', { hasEmail: !!env.EMAIL });
      } else {
        const raw = await new Response(message.raw).arrayBuffer();
        const copy = await buildCopy(message, raw);
        resent = await sendCopy(env, copy);
        if (resent) delivered++;
      }
    } catch (e) {
      log('[phh-mail] resend path threw', e);
    }

    if (!resent) {
      try {
        await message.forward(BEN);
        delivered++;
        log('[phh-mail] fallback forward gmail');
      } catch (e) {
        log('[phh-mail] fallback forward gmail failed', e);
      }
    }

    if (!delivered) message.setReject('Temporarily unable to deliver');
  },
};
