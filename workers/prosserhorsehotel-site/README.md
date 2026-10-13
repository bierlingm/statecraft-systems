# prosserhorsehotel-site

Serves **https://prosserhorsehotel.com** (and redirects www) from the existing `statecraft-systems`
Pages project. There is no second build: edit `public/prosserhorsehotel/` and push to master.

| prosserhorsehotel.com path | Served from (statecraft-systems.pages.dev) |
|---|---|
| `/`, `/boarding/`, … | `/prosserhorsehotel/preview/…` (website draft) |
| `/room`, `/room/*` | 301 to https://statecraft.systems/prosserhorsehotel/ (the client room lives on statecraft.systems only) |
| `/api/prosserhorsehotel/*` | forwarded to statecraft.systems → `prosserhorsehotel-intake` Worker |
| `www.` | 301 to apex |

- Zone `prosserhorsehotel.com` (id a5ea14e25168695b2bf1d8761b59e263), registered via Cloudflare Registrar 2026-10-13.
- Worker custom domains: `prosserhorsehotel.com`, `www.prosserhorsehotel.com` (DNS + certificates managed by Cloudflare).
- Every response carries `X-Robots-Tag: noindex, nofollow` while the site is a draft. Remove it (and the
  pages' meta robots) at launch. `/_archive` and `/prosserhorsehotel*` return 404 on this domain.
- Deployed via the Cloudflare API (no wrangler.toml). Redeploy only when this file changes.
