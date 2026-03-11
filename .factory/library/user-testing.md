# User Testing

Testing surface: tools, URLs, setup steps, isolation notes, known quirks.

**What belongs here:** How to test the site manually, what tools to use, what to look for.

---

## Setup

1. Run `npm run dev` (or equivalent if framework changed) to start dev server
2. Site available at http://localhost:4321

## Testing Surface

- **Browser:** All pages accessible via agent-browser at localhost:4321
- **curl:** Pages return HTTP 200 with HTML content
- **Build:** `npm run build` must exit 0

## Pages to Test

| Page | URL | Calibration Level |
|------|-----|-------------------|
| Home | / | Level 1-2 |
| Work | /work | Level 1-2 |
| Approach | /approach | Level 2-3 |
| Services | /services | Level 1-2 |
| About | /about | Level 2-3 |
| Contact | /contact | Level 1 |

## What to Check

- All navigation links resolve (no 404s)
- External links work: modernminuteman.net, hayescanon.org, capablefew.com, moritzbierling.com
- Privacy: search all pages for "Alex Beltechi", "Alexis Papageorgiou", "Nicholas Catton" — must not appear
- Brand voice: no emojis, no exclamation marks, no rhetorical questions
- Responsive: verify at 375px width
- Interaction states: hover effects work as designed

## Known Quirks

- Stale `src/pages/index.astro.save` file may cause build warnings. Should be deleted by init.sh.
- Astro/agent-browser overlay UI can duplicate labels like `Menu` and `Work`; prefer scoped selectors such as `.mobile-nav-toggle` and `header .site-nav a`.
- During long browser runs, the page can occasionally jump back to Home between actions; explicitly re-open the target route before final evidence capture.
- `fieldcompany.org` is intentionally not linked in the current site build; validate only that the domain is absent from footer links where applicable.

## Flow Validator Guidance: web-ui

- Surface: browser validation against `http://localhost:4321`.
- Tooling: use `agent-browser` for interactive checks and screenshots, plus `curl` for HTTP status checks.
- Isolation for parallel runs:
  - Use unique screenshot/report labels per assertion group (`ds-foundation`, `ds-components`, `nav-layout`).
  - Do not modify application code, content files, or test data.
  - Restrict writes to your assigned flow report file under `.factory/validation/<milestone>/user-testing/flows/`.
- Shared state boundaries:
  - No login/account creation is required for this static site; credentials are placeholders only.
  - Avoid killing or restarting the dev server started by the validator coordinator.
  - Do not claim assertions outside your assigned list.
