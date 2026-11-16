# fruitfulbeginnings-forms

Receives the two forms on the Fruitful Beginnings preview (`/fruitfulbeginnings/enroll/`) and emails them with Cloudflare Email Sending.

This worker is **not deployed**. No secret is set.

## Routes

| Method | Path | Behavior |
|---|---|---|
| `POST` | `/api/fruitfulbeginnings/submit` | Application (`form=application`) or enrollment (`form=enrollment`) |
| `GET` | `/api/fruitfulbeginnings/status` | `{ ready: true/false }` so the page can tell whether mail is connected. The address itself is never returned. |

Spam: a honeypot field named `website`. If it is filled, the response is `{ ok: true }` and nothing is sent.

## Recipient

`LAURA_EMAIL` is a Worker secret, not a value in `wrangler.toml` and not in the pages. Until it is a real address, and until the `EMAIL` binding is present, both routes answer that **forms are being set up** and no message is sent.

The sender is `Fruitful Beginnings <rooms@statecraft.systems>`, the same Email Sending sender already used by `prosserhorsehotel-mail` and `prosserhorsehotel-intake`. `replyTo` is the parent’s email as a plain string, so Laura can reply directly. The binding allowlist is `allowed_sender_addresses = ["rooms@statecraft.systems"]`.

## When Laura’s email is known

Do this only when asked to deploy. Nothing here deploys the worker or sets the secret.

1. Confirm `rooms@statecraft.systems` is still an allowed Email Sending sender on `statecraft.systems`.
2. Verify Laura’s address as a destination if this account’s Email Sending binding only delivers to verified destinations.
3. From this directory:

   ```bash
   npx wrangler secret put LAURA_EMAIL
   npx wrangler deploy
   ```

4. Attach a zone route on `statecraft.systems`:

   `statecraft.systems/api/fruitfulbeginnings/*` → worker `fruitfulbeginnings-forms`

   That route is commented in `wrangler.toml` so a casual deploy does not claim it early. Add it when you deploy.

5. Open `/fruitfulbeginnings/enroll/`. The notice should change from “forms are being set up” to say a submission is emailed to Laura. Send a test application and confirm it arrives, with reply going to the address typed in the form.

The page already posts to `/api/fruitfulbeginnings/submit`. No page change is required once the route and secret exist.

## Checks

```bash
npm test
```
