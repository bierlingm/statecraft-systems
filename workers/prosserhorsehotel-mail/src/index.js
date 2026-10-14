// prosserhorsehotel-mail: Email Routing Worker for hello@ and listings@prosserhorsehotel.com.
// 1) Forwards the original message to Moritz (moritzbierling@hey.com, a verified Email Routing destination).
// 2) Re-sends a copy to Ben (prosserhorsehotel@gmail.com) through the Cloudflare Email Service
//    send binding, so Ben never has to verify a destination. The copy comes from
//    "Prosser Horse Hotel mail <forward@statecraft.systems>", with the original sender as Reply-To,
//    the original subject, text, HTML and attachments.
// A failure on one path never blocks the other; mail is rejected only if both fail.
import PostalMime from 'postal-mime';

const FORWARD_TO = 'moritzbierling@hey.com';
const RESEND_TO = 'prosserhorsehotel@gmail.com';
const FROM = { email: 'forward@statecraft.systems', name: 'Prosser Horse Hotel mail' };
const MAX_ATTACH = 20 * 1024 * 1024;

export default {
  async email(message, env) {
    const raw = await new Response(message.raw).arrayBuffer();
    let ok = 0;
    try { await message.forward(FORWARD_TO); ok++; } catch (e) { console.error('[phh-mail] forward failed', e?.message); }
    try {
      const m = await PostalMime.parse(raw);
      const sender = m.from?.address ? { email: m.from.address, name: m.from.name || undefined } : { email: message.from };
      const who = sender.name ? `${sender.name} <${sender.email}>` : sender.email;
      const note = `Sent to ${message.to} by ${who}. Reply to answer them directly.`;
      let size = 0;
      const attachments = (m.attachments || []).filter(a => (size += a.content.byteLength) <= MAX_ATTACH).map(a => ({
        content: a.content, filename: a.filename || 'attachment', type: a.mimeType || 'application/octet-stream',
        disposition: a.disposition === 'inline' && a.contentId ? 'inline' : 'attachment',
        ...(a.contentId ? { contentId: a.contentId.replace(/^<|>$/g, '') } : {}),
      }));
      const text = `${note}\n\n${m.text || ''}`;
      const html = m.html ? `<p style="color:#666;font-size:13px">${note.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</p><hr>${m.html}` : undefined;
      const r = await env.EMAIL.send({
        from: FROM, to: [RESEND_TO], replyTo: sender,
        subject: (m.subject || '(no subject)').slice(0, 900), text, ...(html ? { html } : {}),
        ...(attachments.length ? { attachments } : {}),
      });
      console.log('[phh-mail] resent', r?.messageId);
      ok++;
    } catch (e) { console.error('[phh-mail] resend failed', e?.code, e?.message); }
    if (!ok) message.setReject('Temporarily unable to deliver');
  },
};
