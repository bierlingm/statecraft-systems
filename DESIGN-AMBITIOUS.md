# Statecraft Systems: the ambitious pass (2026-11-16)

The brief: make statecraft.systems read as a top-tier, high-status studio. Restraint, scale, typography, rhythm, editorial craft, one or two memorable moments. Not a SaaS page, not a guru funnel. Only true material.

## Where the site stands

The clean pass is honest and calm, and it is modest in every dimension at once: one type size for headlines, one ground colour from top to bottom, four equal cards, a footer that is a single line of links. Nothing is wrong. Nothing is remembered either. The material is stronger than the page lets on: a sharp core line, four real builds with drawings, a method with a point of view, published tools, a thesis.

What is missing is not content. It is scale, contrast between sections, and one thing a visitor would describe to someone else.

## Three directions

### A. The Charter

The site as the printed charter of a small firm. Monumental serif, long measured columns, folio numbers and running heads, margin notes, a colophon. Paper and ink, oxblood for thresholds.

- For: fully inside the brand (warm, heavy, slow). Newsreader at display size carries it. Cheap to run, nothing to break.
- Against: it is the current site with bigger type. All the status has to come from typography, and there is no moment. A reader would call it tasteful.

### B. The Plate

The site as an engraved plate book, after the reference the brand document calls definitive: the Swiss passport. Security-print linework (guilloché), drawings treated as numbered plates with registration marks, dimension lines, dense mono annotation. The firm carries a seal whose rings turn against each other like a movement: working parts, literally. The work index has a stage where the drawing for the row under your hand is shown at size.

- For: a real memorable moment that belongs to this firm and no other. It makes the existing drawings the centre of the site instead of thumbnails. "The visitor earns depth" becomes true: hairline detail that rewards a close look.
- Against: linework can tip into ornament. It has to stay in two places and carry content, or it breaks the brand rule that nothing decorative exists for its own sake.

### C. The Monolith

Architectural and cinematic. Dark warm stone ground, very large grotesque type, full-bleed sections that pin and release on scroll, the work shown one build per screen.

- For: instant impact, the look of the studios that win awards.
- Against: the brand document rules it out by name (startup-slick, dark mode, animation as spectacle), it needs a scroll library to do well, and it would look like forty other studios. Trust on sight from a physician or a trustee does not come from this.

## Chosen: B, The Plate, on A's typographic skeleton

B is the only direction with something a visitor would repeat. A supplies the discipline that keeps B from becoming decoration: the page is still a document set in two typefaces on paper. C contributes one thing only, contrast: two bands of warm ink (the thesis, and the closing contact and footer) so the page has a rhythm of light and dark instead of one flat ground.

### The system

- **Type.** Newsreader for everything read, now used across its whole optical range: display light at up to ~150px in the hero, 76px section heads, 46px statement text. Berkeley Mono for labels, numerals, record. No third face; nothing new to download.
- **Colour.** Paper `#f6f1e7`, plate ground `#ede6d8`, ink `#231f1a`, oxblood `#7a2418` for thresholds and the path that matters, drafting blue `#2b3fa0` for the reasoning layer only. On ink, a lighter oxblood for contrast.
- **Grid.** Twelve columns, generous gutter, 1520 max. Section heads sit in a 4/8 split: index and label left, statement right.
- **Rhythm.** Paper, paper, plate ground, ink, paper, paper, ink.

### The two moments

1. **The seal.** Three concentric layers of hairline engraving: a lettered rim, a woven wave band, a rosette. The wave band and rosette turn slowly in opposite directions. It sits at the right of the hero, cropped by the edge, under the headline. It returns small in the footer as a colophon. Built from a handful of rotated SVG primitives (about 3 KB), rotated on the compositor, static under reduced motion.
2. **The plate stage.** On the home page the work is a typographic index. Beside it, a framed plate with registration marks shows the drawing for the row under the pointer or keyboard focus. Pure CSS (`:has`). On touch and narrow screens each row carries its own drawing.

### Motion

One orchestrated entrance in the hero (lines rise from behind a mask). Sections ease in as they enter the viewport using CSS scroll-driven animation where the browser supports it. No JavaScript is needed for any of it; without support, everything is simply there. `prefers-reduced-motion` turns all of it off.

### Copy

The core line stays. Additions are drawn from what the site, the terms and the one-pager already state:

- A premise paragraph and three commitments (owned, reviewed on the real thing, made to be handed on), from the method page and the terms.
- Three ways to work (a build, care, working sessions for founders and teams), from the method page, the terms and the one-pager. No prices, no client names, no numbers that are not already on the site.
- Questions before the first message on the contact page, from existing facts, with matching FAQPage data.

### What does not change

URLs, client rooms, functions, workers, robots rules, redirects. Quick-answer blocks, llms.txt, feed.json, sitemap and JSON-LD stay and are updated where wording moved.
