# Agent notes — statecraft.systems

Astro site (`src/`) plus hand-built project rooms as static files in `public/<room>/`
(`index.html`, `project.css`, `project.js`). Pages Functions in `functions/` implement the
invite-link gates for `/pnw` and `/runcible` (`functions/lib/gate.ts`, `tokens.ts`).

- Rooms are client-facing documents: do not change copy, pricing or design unless asked.
- Redirects live in `public/_redirects`; when you move a page, add a redirect from the old URL.
- Never commit secrets (`.dev.vars`), never deploy, never touch DNS.
- Verify with `.agents/skills/verify/SKILL.md` (`npm run check`).
