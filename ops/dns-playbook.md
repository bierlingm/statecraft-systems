# DNS playbook

The same DNS dance happens for every static site Statecraft Systems hosts on Cloudflare Pages. This document is the canonical version.

## Auto-deploy is the default

For all sites under `~/werk/repos/`, Cloudflare Pages is wired to the GitHub repo and auto-deploys on push to the production branch. You only manually `wrangler pages deploy` if the GitHub integration is down or you want to ship a non-production branch as a preview. Workers (the `worker/` subdirs) are **not** auto-deployed — those always need `wrangler deploy`.

## Default setup (Cloudflare-managed registrar)

Easiest path: domain is on Cloudflare nameservers. DNS, certs, and Pages custom domain are all wired automatically.

1. In Cloudflare Pages, open the project → Custom domains → Set up a custom domain → enter the apex (`example.com`).
2. Cloudflare adds the records itself. Repeat for `www.example.com`.
3. Cert provisions within a few minutes. Done.

## Registrar-managed (registrar holds DNS)

When the client wants to keep DNS at their registrar:

1. In Cloudflare Pages → Custom domains → add `example.com`. Cloudflare will show the records you need to add at the registrar.
2. At the registrar, add:

   ```
   @    CNAME   <project>.pages.dev    (or A records to Cloudflare anycast IPs if registrar refuses apex CNAME and doesn't flatten)
   www  CNAME   <project>.pages.dev
   ```

3. If the registrar refuses apex CNAME and doesn't flatten — common at GoDaddy, Namecheap, etc. — the cleanest fix is to switch nameservers to Cloudflare and let Cloudflare hold DNS. Otherwise use the Cloudflare anycast A records as fallback.

4. Cert provisions within minutes of DNS resolving.

## Verifying

```sh
dig +short example.com CNAME
dig +short www.example.com CNAME
curl -sI https://example.com | head -3
```

## Common failure modes

- **Cert stuck "pending"** for >30 min: DNS likely doesn't resolve to Cloudflare. Run `dig` and check the answer is a `*.pages.dev` or Cloudflare anycast IP.
- **522 / 523 errors**: Pages project not actually deployed yet, or the custom domain is mapped to the wrong project.
- **`www` works but apex doesn't**: registrar didn't accept the apex CNAME and you didn't fall back to A records or Cloudflare nameservers.
- **Email stops working after switching nameservers to Cloudflare**: MX records didn't migrate. Pull them from the old DNS provider before flipping nameservers.

## Path B (client hosts) variant

When handing off, the client can deploy to whatever they like (Vercel, Netlify, their own Cloudflare). They point DNS at *their* host, not yours. Drop them this playbook plus the bundle from the GitHub release; the steps generalize.
