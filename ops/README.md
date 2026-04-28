# ops/

Operational scaffolding for Statecraft Systems hosting work — the patterns reused across client/incubator sites that live under or graduate from `statecraft.systems`.

## Contents

- **`dns-playbook.md`** — DNS setup the same way every time (apex CNAME, www, Cloudflare Pages custom domain dance).
- **`intake-worker-template/`** — copy-paste Cloudflare Worker for sites that need a contact/intake form. Stores submissions in KV, emails via Resend, optional Slack webhook, optional Path A/B picker. Cribbed from `repos/yakimavalleysupply.com/worker/`.

## How to use the worker template

```sh
# Copy, don't symlink — each project owns its worker
cp -r ~/werk/repos/statecraft.systems/ops/intake-worker-template ~/werk/repos/<your-domain>/worker
cd ~/werk/repos/<your-domain>/worker

# Replace placeholders
# - PROJECT in wrangler.toml `name`
# - PROJECT-DOMAIN throughout wrangler.toml
# - PROJECT-website.pages.dev (the actual Pages target)
# - REPLACE_WITH_KV_ID / REPLACE_WITH_KV_PREVIEW_ID after running:
npx wrangler kv namespace create "SUBMISSIONS"
npx wrangler kv namespace create "SUBMISSIONS" --preview

# Set secrets
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_TOKEN          # optional
npx wrangler secret put SLACK_WEBHOOK        # optional

# Deploy
npx wrangler deploy
```

Then strip out the bits you don't need. `path-choice` is YVS-specific (Path A/B picker) — drop it if the project doesn't have a go-live ceremony.

## Philosophy

This is a starting point, not a framework. Copy and modify. If three projects diverge, that's fine — don't try to factor a shared dependency.
