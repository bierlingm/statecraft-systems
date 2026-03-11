# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** Required env vars, external API keys/services, dependency quirks, platform-specific notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

- No environment variables required. Static site with no external API dependencies.
- Berkeley Mono font files in `public/fonts/` (BerkeleyMono-Regular.otf, BerkeleyMono-Bold.otf, BerkeleyMono-Oblique.otf, BerkeleyMono-Bold-Oblique.otf).
- Node.js required for build tooling.
- If framework is changed from Astro, update services.yaml commands accordingly.
