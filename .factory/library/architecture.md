# Architecture

Architectural decisions, patterns discovered, and structural notes.

**What belongs here:** Framework choices, layout patterns, component architecture, design system decisions.

---

- Current: Astro 5.16.0, static output to `./dist/`, site URL https://statecraft.systems
- Workers have full autonomy to change the framework. If changed, document the new stack here.
- Content source documents: `src/content/thesis.md`, `src/content/brand.md`
- Reference vault: `vault/` (Obsidian format, wiki-linked atomic notes)
- Pages: Home, Work, Approach, Services, About, Contact
- Design system: see `src/content/brand.md` "Visual Principles" for operative aesthetics principles
