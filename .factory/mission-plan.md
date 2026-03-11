# Mission: Statecraft Systems — Make It Real

## Overview

Transform statecraft.systems from a placeholder into a genuine business presence. The thesis (`src/content/thesis.md`) and brand (`src/content/brand.md`) are finalized and govern all decisions. The Obsidian vault (`vault/`) contains atomic notes on every concept, discipline, person, project, tool, offering, and metaphor.

This mission covers two phases: design system + architecture, then implementation.

---

## Inputs (completed, do not modify)

- **Thesis**: `src/content/thesis.md` — the Statecraft Thesis. Core sentence: "Good rule is the foundation of all human flourishing, and it endures only through structures worthy of it."
- **Brand**: `src/content/brand.md` — voice, visual principles (operative aesthetics), metaphor system, calibration framework, brand architecture, naming conventions, differentiation.
- **Vault**: `vault/` — 55+ atomic notes cross-linked with wiki-links. Reference for any concept, person, or project mentioned in the thesis or brand.
- **Current site**: Astro site. Pages in `src/pages/*.astro`, layout in `src/layouts/BaseLayout.astro`, styles in `src/styles/global.css`, fonts in `public/fonts/` (Berkeley Mono).

---

## Phase 1: Design System + Architecture

### Design System

Read `src/content/brand.md` section "Visual Principles" in full. The design philosophy is "operative aesthetics": every element has a function; beauty is a byproduct of structural soundness; the visitor earns depth.

Key reference points (study these):
- New Swiss Passport by RETINAA (retinaa.ch/work/new-swiss-passport): clean complexity, layered revelation, dual-purpose elements
- U.S. Graphics Company (usgraphics.com): emergent over prescribed aesthetics, dense not sparse, performance is design, as complex as it needs to be
- Triple Aught Design (tripleaughtdesign.com): technical utility and craft coexisting

Tasks:
1. Revise `src/styles/global.css` to implement the operative aesthetics. Specific requirements:
   - Berkeley Mono remains primary typeface. Consider a complementary serif or humanist face for longer contemplative content if monospace fatigues at length. Test against real content before committing.
   - Color palette flows from other decisions. Starting constraints: warmth over coolness, sufficient contrast for dense reading, accent color marks thresholds and actions (not decorative).
   - Implement earned depth through interaction: hover states that reveal structure, rule lines with geometric terminals, typographic details that distinguish content levels.
   - Transitions between sections should feel architectural (thresholds, not animations).
   - Dense, not sparse. As complex as it needs to be. Do not infantilize users.
   - Max-width may vary by page type: narrow for thesis/approach content, wider for portfolio/offerings.
   - Must never look like: corporate, startup-slick, guru/personal-brand, or minimalist-for-minimalism's-sake. Must carry weight, not delicacy.

2. Define component patterns:
   - Offering cards (for services page)
   - Project/production blocks (for work page)
   - Discipline descriptions (for approach page)
   - Result/intervention descriptions
   - Navigation and footer reflecting the web of relationships

### Information Architecture

Read `src/content/brand.md` section "Calibration Framework". Each page has a calibration level:
- Level 1 (professional surface): Home above the fold, Contact, offering descriptions
- Level 2 (structural depth): Approach, detailed service descriptions, tool descriptions
- Level 3 (full thesis): Thesis page, About (selectively)

Proposed site structure:
- **Home** — Level 1 surface, Level 2 below the fold
- **Work** — Level 1-2. Productions, interventions, programs, tools.
- **Approach** — Level 2-3. Disciplines, methodology, who this is for.
- **Services** — Level 1-2. Individual track, team track, pricing.
- **About** — Level 2-3. Moritz's background, formation lineage, the operative tradition.
- **Contact** — Level 1. Simple.
- **Thesis** — Level 3. Published version of `src/content/thesis.md` (optional, decide during implementation).

Navigation labels should express the brand. Evaluate whether these labels are right or whether alternatives serve better. The brand vocabulary section has guidance.

Update `src/layouts/BaseLayout.astro` to reflect the new navigation and footer.

---

## Phase 2: Implementation

### Pages to create/modify

**Home (`index.astro`) — Complete rewrite.**
Calibration: Level 1 above fold, Level 2 below.
Content:
- What Statecraft Systems does: one sentence, grounded in thesis. "We help founders, executives, and their teams become capable of creating the outcomes they are after and governing what they build."
- Two dimensions: technical capacity (AI-native) and structural capacity. Brief, factual.
- Two paths: Individual (Unlock, Stack Build, Sparring) and Team (Discovery, Build, Train, Retainer). Link to Services.
- Credibility: Skinner Layne (Claude Code introduction led to team training demand, product building, fundraising acceleration), Noah/The Meta Father (rebuilt platform, moved off Kajabi). State results factually.
- The web: brief mention of Modern Minuteman, The Field Company, productions, tools. Link to Work.

**Work (`work.astro`) — New page, replaces `projects.astro`.**
Calibration: Level 1-2.
Content:
- Productions: hayescanon.org (for Brandon Hayes), modernminuteman.net (own program), capablefew.com (own project), fieldcompany.org (own program).
- Interventions/Results: Skinner Layne, Noah/The Meta Father. State what happened factually.
- Programs: Exosphere intensives, Volta retreats, Modern Minuteman cohorts. Brief descriptions.
- Tools: sd-core (structural dynamics framework, mentioned not featured), spikes.sh, beats, werk-cli. Brief descriptions.
- Privacy constraints: Alex Beltechi, Alexis Papageorgiou, Nicholas Catton NOT named publicly.

**Approach (`approach.astro`) — Rewrite.**
Calibration: Level 2-3.
Content:
- The disciplines, each with originator credited: Structural Dynamics (Robert Fritz), Natural Law (Curt Doolittle / Natural Law Institute), Currency Design (Arthur Brock), Collective Intelligence, Operative Traditions (Miguel Angel Fernandez), Formation.
- The synthesis: what looking through all lenses simultaneously produces.
- Via negativa as via positiva: constraints require active structural enactment.
- Who this is for. Who it is not for. State plainly per brand voice guidelines.

**Services (`services.astro`) — New page.**
Calibration: Level 1-2.
Content:
- For Individuals: Unlock Session (~3hrs, $1,500), Personal Stack Build ($5,000 / 2 weeks), Sparring Partner ($1,500-2,500/mo biweekly + async).
- For Teams: Discovery ($3-5K), Build ($8-15K), Train ($2,500-5K), Retainer ($2-4K/mo).
- The natural flow: CEO gets personal value first, then brings in the team.
- Structural dynamics framing: every engagement begins with current reality and desired outcome.

**About (`about.astro`) — Rewrite.**
Calibration: Level 2-3.
Content:
- Moritz Bierling: 4+ years in agent orchestration, multi-model systems, frontier tooling. Formation experience (Exosphere, Volta, Modern Minuteman). Pursuing Structural Consultant certification. Direct practitioner, not theorist.
- The operative tradition: what Statecraft Systems is becoming.
- Family heritage (bell-makers, small industrialists) if it serves the page. Test against brand voice; include only if it adds substance.
- Link to moritzbierling.com.

**Contact (`contact.astro`) — Minor revision.**
Calibration: Level 1.
Content:
- Email: contact@statecraft.systems
- Brief framing around fit, not generic inquiry.
- Remove PGP mention unless Moritz confirms it should stay.

**Layout (`BaseLayout.astro`) — Update.**
- Navigation reflecting new page structure.
- Footer reflecting the web: Modern Minuteman, The Field Company, plus other productions/links as appropriate.
- Meta descriptions updated per page.

### Technical notes
- Astro site, static build.
- Delete `projects.astro` after `work.astro` is created.
- Rebuild dist/ after all changes.
- Run `npm run build` (or equivalent) to verify no build errors.
- Test responsive behavior on mobile breakpoints.

---

## Constraints

- Read `src/content/brand.md` before writing any copy or CSS. Every decision must be traceable to it.
- Read `src/content/thesis.md` before writing any page that operates at Level 2 or 3.
- Consult `vault/` notes for accurate descriptions of any concept, person, discipline, project, tool, or offering.
- Brand voice: direct, unhurried, precise. No emojis, no exclamation marks, no rhetorical questions. Persuasion through clarity.
- Privacy: Alex Beltechi, Alexis Papageorgiou, Nicholas Catton not named publicly.
- Honesty standard: every claim must be defensible in direct conversation.

---

## Out of scope (not this mission)

- Retreat/program photography
- Commons/Resources section
- Closed club / membership concept
- Content strategy for gifting to people of influence
- sd-core dedicated page
- Testimonial collection
- Blog or temporal content
