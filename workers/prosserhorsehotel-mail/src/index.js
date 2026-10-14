// prosserhorsehotel-mail: Email Routing Worker for hello@ and listings@prosserhorsehotel.com.
// 1) Always forwards the original message to Moritz (moritzbierling@hey.com) via message.forward
//    BEFORE reading message.raw (so a parse/send failure cannot skip HEY).
// 2) Re-sends a copy to Ben (prosserhorsehotel@gmail.com) via Cloudflare Email Service
//    (From: "Prosser Horse Hotel mail <rooms@statecraft.systems>", Reply-To = original sender).
// 3) If Email Sending fails, falls back to message.forward to Ben (verified destination).
// EmailAddress.name is only set when typeof name === 'string' and non-empty (avoids TypeError).
import PostalMime from 'postal-mime';

const FORWARD_HEY = 'moritzbierling@hey.com';
const BEN = 'prosserhorsehotel@gmail.com';
const FROM_EMAIL = 'rooms@statecraft.systems';
const FROM_NAME = 'Prosser Horse Hotel mail';
const MAX_ATTACH = 15 * 1024 * 1024;

function emailAddress(email, name) {
  const a = { email: String(email || '').trim() };
  if (typeof name === 'string' && name.trim()) a.name = name.trim();
  return a;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function buildCopy(message, raw) {
  let subject = message.headers.get('subject') || '(no subject)';
  let replyTo = emailAddress(message.from);
  let text = `Forwarded copy of a message to ${message.to}.\nOriginal From: ${message.from}\n\n(Could not parse the original body; open the HEY copy for the full message.)`;
  let html;
  let attachments;
  try {
    const m = await PostalMime.parse(raw);
    if (typeof m.subject === 'string' && m.subject) subject = m.subject;
    if (m.from?.address) replyTo = emailAddress(m.from.address, m.from.name);
    const who = replyTo.name ? `${replyTo.name} <${replyTo.email}>` : replyTo.email;
    const note = `Sent to ${message.to} by ${who}. Reply to answer them directly.`;
    text = `${note}\n\n${m.text || '(no plain-text body)'}`;
    if (m.html) html = `<p style="color:#666;font-size:13px">${esc(note)}</p><hr>${m.html}`;
    let size = 0;
    attachments = [];
    for (const a of m.attachments || []) {
      const buf = a.content instanceof ArrayBuffer ? a.content : (a.content?.buffer || a.content);
      const len = buf?.byteLength ?? buf?.length ?? 0;
      if (!buf || !len) continue;
      size += len;
      if (size > MAX_ATTACH) break;
      const item = {
        content: buf,
        filename: (typeof a.filename === 'string' && a.filename) ? a.filename : 'attachment',
        type: (typeof a.mimeType === 'string' && a.mimeType) ? a.mimeType : 'application/octet-stream',
        disposition: a.disposition === 'inline' && a.contentId ? 'inline' : 'attachment',
      };
      if (typeof a.contentId === 'string' && a.contentId) item.contentId = a.contentId.replace(/^<|>$/g, '');
      attachments.push(item);
    }
  } catch (e) {
    console.error('[phh-mail] parse failed, using header fallback', e?.message);
  }
  return { subject: String(subject).slice(0, 900), replyTo, text, html, attachments };
}

export default {
  async email(message, env) {
    let delivered = 0;
    console.log('[phh-mail] start', message.to);

    // HEY first, before touching message.raw, so this path always runs.
    console.log('[phh-mail] forwarding hey');
    try {
      await message.forward(FORWARD_HEY);
      delivered++;
      console.log('[phh-mail] forwarded hey');
    } catch (e) {
      console.error('[phh-mail] forward hey failed', e?.message, String(e));
    }

    const raw = await new Response(message.raw).arrayBuffer();

    let resent = false;
    try {
      const copy = await buildCopy(message, raw);
      const payload = {
        from: emailAddress(FROM_EMAIL, FROM_NAME),
        to: [BEN],
        replyTo: copy.replyTo,
        subject: copy.subject,
        text: copy.text,
      };
      if (copy.html) payload.html = copy.html;
      if (copy.attachments?.length) payload.attachments = copy.attachments;
      try {
        const r = await env.EMAIL.send(payload);
        console.log('[phh-mail] resent', r?.messageId);
        resent = true;
        delivered++;
      } catch (e1) {
        console.error('[phh-mail] resend with attachments failed', e1?.code, e1?.message);
        delete payload.attachments;
        const r = await env.EMAIL.send(payload);
        console.log('[phh-mail] resent no-attach', r?.messageId);
        resent = true;
        delivered++;
      }
    } catch (e) {
      console.error('[phh-mail] resend failed', e?.code, e?.message, String(e));
    }

    if (!resent) {
      try {
        await message.forward(BEN);
        delivered++;
        console.log('[phh-mail] fallback forward gmail');
      } catch (e) {
        console.error('[phh-mail] fallback forward gmail failed', e?.message, String(e));
      }
    }

    if (!delivered) message.setReject('Temporarily unable to deliver');
  },
};
