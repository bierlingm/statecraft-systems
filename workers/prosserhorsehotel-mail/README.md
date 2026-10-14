# prosserhorsehotel-mail

Email Routing Worker for **hello@prosserhorsehotel.com** (guest email on the site) and
**listings@prosserhorsehotel.com** (directory sign-ups). Every message is forwarded to both
Ben (prosserhorsehotel@gmail.com) and Moritz (moritzbierling@hey.com). A failed forward to one
never blocks the other.

- Zone `prosserhorsehotel.com` → Email Routing rules "hello to Ben + Moritz" and
  "listings to Ben + Moritz" use action *Send to Worker* → `prosserhorsehotel-mail`.
  The catch-all drops everything else.
- Both recipients must be verified Email Routing destinations. prosserhorsehotel@gmail.com was
  added 2026-10-14; until Ben clicks Cloudflare's verification email, only the HEY copy is delivered.
- Deployed via the Cloudflare API (no wrangler.toml). Redeploy after changing `src/index.js`.
