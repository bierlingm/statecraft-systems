# Agent-friendliness audit — statecraft.systems

Framework: @poteto's inverse pyramid (design > static analysis > minimal prose > human review).

## Evidence (170 commits, PRs #1–#7)

1. **Rooms are copy-pasted, then reworked in long fix streaks.** Each room carries its own
   `project.js`/`project.css` (pnw 803 lines, prosser 355, runcible 219, prosserhorsehotel 72).
   19 commits are "PNW room: …" iterations, many pure rework: `00611ea` (fix alignment),
   `e654c09` (centre the reading column), `ce06441` (alignment, spacing, 2.5KB dead CSS),
   `85a3e3e`→`77ad3c8` (identity redone twice), `283a9df` (fixes from adversarial review).
   Mobile passes recur per room: `c4ec6a6` (Runcible, #5), `ad7ad91` (Horse Hotel).
   `public/pnw/index.html` (30 commits) and `public/prosser/index.html` (26) are the most-churned files.
2. **URL moves need hand-written redirects.** `public/_redirects` changed in 14 commits
   (`6f30973`, `d302822`, `2ddc016`, `a83dfb7`); nothing checks that old room URLs still resolve.
3. **Zero static checks or CI; tracked junk.** No tsconfig, no lint, no tests; the access-gate
   Functions (`functions/lib/gate.ts`, `tokens.ts`) were never type-checked. `preview.log` and
   `package-lock.json` are tracked even though `.gitignore` lists them — agents can't trust
   the ignore file, and ignoring the lockfile undermines reproducible `npm ci`.
4. **No agent instructions** (no AGENTS.md), while the repo mixes Astro pages, static rooms,
   gated Functions, ops/DNS docs and a `vault/`.

## Plan (by pyramid)

**1. Codebase design**
- Extract a shared room kit (`public/_room/room.css`, `room.js`: reading column, figures,
  mobile CTA, draft banner) that rooms import and theme with CSS variables; new rooms start
  from a template (`ops/room-link.mjs` is a seed). Would remove most alignment/mobile rework above.
- Move rooms into Astro (a `RoomLayout`) over time so layout is shared and typed.
- Keep a typed route manifest (rooms + gates + legacy URLs) that generates `_redirects`.

**2. Static analysis**
- (done) strict `tsc` over `functions/**` — passes; `npm run typecheck`, `npm run check`.
- (staged) CI at `docs/agent-audit/ci.yml` — move to `.github/workflows/` (token here lacks `workflow` scope).
- Next: a link checker over `dist/` + `_redirects` (e.g. lychee) and `astro check`.
- Next: stop ignoring `package-lock.json`; `git rm --cached preview.log`.

**3. Minimal prose** — (done) short AGENTS.md + verify skill.

**4. Human review** — keep for copy/pricing/design in client rooms.

## Open questions resolved by prototyping
- *Do the gate Functions survive strict type-checking?* Yes: `tsc --strict` with
  `@cloudflare/workers-types` reports 0 errors.
- *Does the build pass?* Yes, 15 pages built.

## What this PR changes
Adds `tsconfig.functions.json`, devDeps `typescript` + `@cloudflare/workers-types`, scripts
`typecheck`/`check`, AGENTS.md, `.agents/skills/verify/SKILL.md`, staged CI. No content, design,
behavior, gates, DNS, deploy config or secrets changed.
