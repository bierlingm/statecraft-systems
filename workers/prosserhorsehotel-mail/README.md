# prosserhorsehotel-mail

Email Routing Worker for **hello@prosserhorsehotel.com** and **listings@prosserhorsehotel.com**.

## Delivery

1. **HEY first:** `message.forward` to moritzbierling@hey.com (before reading `message.raw`).
2. **Ben via Email Sending:** `env.EMAIL.send` from `Prosser Horse Hotel mail <rooms@statecraft.systems>`
   (same sender + binding allowlist as the working intake Worker). Payload matches intake:
   `{ from: { email, name }, to: [string], subject, text, html? }` with `replyTo` as a **plain
   string** (not `{ email, name }` — object form caused `EmailAddress.name` TypeErrors).
3. **Fallback:** if Email Sending fails, `message.forward` to prosserhorsehotel@gmail.com (verified).

## Root causes fixed

- `EmailAddress.name` must be a string or omitted (postal-mime can return non-strings).
- `replyTo` as an object was a likely ongoing send failure; intake never uses replyTo objects.
- Attachments (if any) are base64 strings; Email Sending total size cap is 5 MiB.
- HEY forward runs before reading raw so parse/send failures cannot skip Moritz.

## Deploy

```bash
npm i && npm run build
```

Deploy `dist/index.js` via the Cloudflare API with:

```json
{ "type": "send_email", "name": "EMAIL", "allowed_sender_addresses": ["rooms@statecraft.systems"] }
```

Keep observability enabled (100% sampling). Look for `[phh-mail] sending` then `resent` / `resend failed` / `fallback forward gmail`.
