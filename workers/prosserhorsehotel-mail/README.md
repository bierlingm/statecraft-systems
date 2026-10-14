# prosserhorsehotel-mail

Email Routing Worker for **hello@prosserhorsehotel.com** (guest email on the site) and
**listings@prosserhorsehotel.com** (directory sign-ups).

## Delivery

1. **Moritz:** `message.forward` to moritzbierling@hey.com (verified Email Routing destination).
2. **Ben:** re-send via Cloudflare Email Service binding `EMAIL` from
   `Prosser Horse Hotel mail <rooms@statecraft.systems>` (same proven sender as the intake Worker),
   with the original sender as Reply-To, plus subject / text / HTML / attachments when parseable.
3. **Fallback:** if Email Sending fails, `message.forward` to prosserhorsehotel@gmail.com
   (verified destination). Ben never needs to re-verify.

A failure on one path never blocks the others; the message is rejected only if nothing was delivered.

## Why rooms@ (not forward@)

The first Email Sending attempt used `forward@statecraft.systems`. Worker invocations for the
TEST emails completed with 0 errors (HEY forward succeeded) but Ben never got a copy — the resend
path failed silently in a catch. The working intake Worker sends as `rooms@statecraft.systems`.
This Worker now uses that same allowed sender.

## Deploy

```bash
npm i && npm run build
```

Deploy `dist/index.js` as module `index.js` via the Cloudflare API with:

```json
{ "type": "send_email", "name": "EMAIL", "allowed_sender_addresses": ["rooms@statecraft.systems"] }
```

Keep `[observability] enabled = true` (100% sampling) so `[phh-mail] resent …` / `fallback forward gmail` lines show in Workers Logs.

Zone `prosserhorsehotel.com` → Email Routing rules for hello@ and listings@ use *Send to Worker*
→ `prosserhorsehotel-mail`. Catch-all drops everything else.
