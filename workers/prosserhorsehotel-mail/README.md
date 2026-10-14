# prosserhorsehotel-mail

Email Routing Worker for **hello@prosserhorsehotel.com** (guest email on the site) and
**listings@prosserhorsehotel.com** (directory sign-ups).

- **Moritz:** the original message is forwarded (`message.forward`) to moritzbierling@hey.com,
  a verified Email Routing destination.
- **Ben:** a copy is re-sent to prosserhorsehotel@gmail.com through the Cloudflare Email Service
  send binding `EMAIL` (allowed sender `forward@statecraft.systems`, a verified sending domain),
  so Ben never has to verify anything. From is "Prosser Horse Hotel mail <forward@statecraft.systems>",
  Reply-To is the original sender, and subject, text, HTML and attachments (up to 20 MB) are kept.
  The message is parsed with postal-mime.
- A failure on one path never blocks the other; the message is rejected only if both fail.
- Zone `prosserhorsehotel.com` → Email Routing rules for hello@ and listings@ use *Send to Worker*
  → `prosserhorsehotel-mail`. The catch-all drops everything else.
- Build: `npm i && npm run build`, then deploy `dist/index.js` as module `index.js` via the
  Cloudflare API with binding `{type: "send_email", name: "EMAIL", allowed_sender_addresses: ["forward@statecraft.systems"]}`
  (no wrangler.toml).
