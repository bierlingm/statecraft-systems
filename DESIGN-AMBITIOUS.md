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

---

# Second pass: Field (same day)

Instruction after seeing the plate book: leave the colour scheme and visual language behind, take extreme liberty with the thesis and the copy, abstract upwards. Berkeley Mono may stay if it makes sense.

## What changed in kind

The plate book spoke about the work (booking, intake, enquiries) and let the thesis sit in a band. Field inverts that. The site now speaks at the level of the thesis and uses the work as proof.

- **Headline.** "The craft of good rule." The concrete line moves into the sentence beneath it.
- **Structure of the home page.** The name, taken literally (State, Craft, Systems). Five propositions. One figure: advance, or oscillate. One craft at three scales (the person, the institution, the instrument). Proof, small and real: each build named by the principle it demonstrates. Four verbs. Begin with the state of affairs.
- **Thesis.** Compressed to ten propositions at `/thesis`. The original text is untouched and published at `/thesis/full`.

## The system

- **Colour.** Ultramarine `#1029c4` as a field, bone `#f1f0ea` for reading, black `#09090d` as ground, vermilion `#ff4b1f` as the one signal (the square in the mark, the full stop in the headline, the path that matters in a drawing, the thing that advances).
- **Type.** Archivo, one variable file, across its width axis: condensed and heavy in capitals for statements, slightly narrow and bold for propositions, regular for reading. Berkeley Mono is the small voice: labels, numerals, facts, status.
- **Shape.** Circle, square, line. No engraving, no hairlines. Rules are two pixels and black.
- **Plates.** The drawings stay, as white line on the blue field with vermilion for the path that matters.
- **The figure.** Two tracks. On one a marker swings between problem and relief. On the other a marker moves from current reality to the desired outcome and leaves a line behind it. CSS only; under reduced motion both rest in a meaningful position.

## What it is not allowed to become

A poster with nothing behind it. Every abstract line on the home page is paired with a concrete one within the same screen, and every proposition can be traced to a sentence in `src/content/thesis.md`, the method page, the terms or `src/data/work.ts`.

---

# Third pass: Field, honed (same day)

Instruction: keep the bolder approach, remove the visual cruft (eyebrows, meta commentary, "Rev"), develop a perspective, turn it into a visual journey, make it clean and coherent.

## The perspective

Structure is what remains. A page that argues this should itself be made of very few things, each of which carries weight. Anything that only describes the page (a section number, a label above a heading, a revision stamp, a note about what follows) is not structure and was removed.

## The rules

- **Three grounds.** Blue is where a claim is made. Bone is where it is reasoned and shown. Black is where the tension is.
- **Two voices.** Statement (condensed, heavy capitals) and text. Berkeley Mono appears only in the navigation and on a recorded fact (status, a facts ledger, a diagram label).
- **Actions.** Anything that acts speaks in the statement voice and carries the same drawn arrow. Three forms: a block, an outline, a bare underlined line. Two heights, 64 and 44. Pointed at, a block turns blue; on blue it turns black.
- **Three sizes of statement.** XL for the first and last screen, L for every section and page heading, M for the things inside a section.
- **One signal.** Vermilion appears only on blue or black, and only where something is at stake: the full stop of the claim, the thing that advances, the full stop and the address of the invitation, the path that matters in a drawing. On bone the accent is blue. The mark in the header is the one exception.
- **Three shapes.** Circle, square, triangle. Rules are two pixels. The plate figures use the same three with fixed meanings: a circle is a person, a square is an institution or the thing that holds, a triangle is an instrument. White line on blue, vermilion for what the build is for, no labels.
- **Interaction is one move.** What you point at turns blue.

## The journey (home)

1. **Claim** (blue). The craft of good rule. One sentence that brings it to ground. Two actions.
2. **Name** (bone). State, Craft, Systems, each defined.
3. **Reasons** (bone). Five propositions.
4. **Tension** (black). Advance, or oscillate: the one moving figure on the site.
5. **Practice** (bone). One craft at three scales, then the proof, small and real.
6. **Invitation** (blue). Begin with the state of affairs. One address.

Blue opens and closes. Black sits at the hinge. The first and last screens are set the same way, so the page ends where it started, with a full stop in vermilion.

## What was removed

Section numbers and labels, every eyebrow, the hero's base strip, "Rev." and the copyright line, footer column headings, plate numbering in headings, "Scale 1/2/3", the notes under section headings, the four-verbs section on the home page (the method page carries it), and the labelled, dated "Quick answer" boxes. The facts those boxes held now sit in the page ledes and in one plain statement in the footer.
