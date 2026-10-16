---
name: verify
description: How to check a change to statecraft.systems before calling it done.
---
# Verify a change

```sh
npm ci
npm run check      # typecheck Pages Functions (gates, sessions) + astro build
```

Then preview: `npx wrangler pages dev dist` (functions + `_redirects` active) and open every page
you touched at ~375px and desktop width. For a project room under `public/<room>/`, also check:
the invite gate still redirects when signed out, and any `_redirects` entry you added resolves.

Never deploy, never change DNS (`ops/dns-playbook.md`), never edit gate/token logic without an
explicit ask.
