# prosserhorsehotel-intake

Receives both forms in the Prosser Horse Hotel room (statecraft.systems/prosserhorsehotel):
the intake checklist (`form=intake`) and draft feedback (`form=feedback`).

- Route: zone route `statecraft.systems/api/prosserhorsehotel/*` -> Worker `prosserhorsehotel-intake`.
- Storage: KV namespace `prosserhorsehotel-submissions` (id 58690725440b4c70a10cd16b9693d6d2).
  `sub:<id>` = submission JSON, `file:<id>:<n>` = uploaded photo. Saved before the page is told it worked.
- Email: Cloudflare Email Service (`send_email` binding `EMAIL`) to `NOTIFY_TO` = bierlingm@mail.grokbot.com.
  Sender is `rooms@statecraft.systems` (statecraft.systems enabled as an Email Sending domain on 2026-10-13;
  return path cf-bounce.statecraft.systems).
- Spam: honeypot field `website`; a filled honeypot gets a fake 200 and nothing is stored.
- Reading: `curl -H "Authorization: Bearer $(cat /home/workspace/Projects/prosserhorsehotel/.intake-admin-token)" https://statecraft.systems/api/prosserhorsehotel/submissions`
  Files: `.../api/prosserhorsehotel/file/<key>` with the same header. Or Cloudflare dashboard -> KV.
- Deployed via the Cloudflare API (no wrangler.toml); secret `ADMIN_TOKEN` is set on the Worker.
