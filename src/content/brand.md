# Statecraft Systems: brand

How the site speaks and looks. Not published. If the site and this file disagree, fix one of them the same day.

## Two kinds of page

The site keeps what is sold apart from what is believed.

A visitor arrives with one of two questions: "what can you do for me?" or "who are you, and why does this exist?". Each is answered in its own place, and the first never depends on the second.

**The offering.** Home, Work, each build, Method, Contact, Operating records, Support, Terms, Privacy. These say what can be asked for, in plain nouns (a build, care, working sessions, a records review), with recent work and how a build runs. A reader should know within one screen whether to write. No philosophy is needed to follow them. The home headline is "The working parts."

**The practice.** Practice, Thesis, Disciplines. These are the company: what the name means, why it exists, the three scales it works at (person, institution, network), where its reasoning comes from, and who does the work. They sell nothing. "The craft of good rule" is the headline of the Practice page and appears nowhere on the offering pages.

The rule: a page belongs to one kind. The navigation shows the two halves with a rule between them. The home page carries one doorway to the practice. The Practice page carries one doorway back to the offering. Every page ends on the same invitation.

## Voice

**Register.** Direct, unhurried, precise. Sentences state facts or name structural relationships. Clarity does the persuading.

**Person.** "We" for Statecraft Systems. Moritz Bierling is named as the practitioner and linked to moritzbierling.com. No LinkedIn links.

**Use freely:** structure, craft, rule, capacity, reciprocity, obligation, sovereignty, formation, advance, operative, discipline, persist, build.

**Use with care:** framework, ecosystem, mission, vision, journey. Only when the specific meaning is clear.

**Do not use:** solutions, innovative, cutting-edge, leverage (as a verb), passionate, excited, empower, holistic, synergy, disrupt, unlock (as a metaphor), deep dive, game-changer. No emojis, no exclamation marks, no rhetorical questions.

**Cadence.** Full sentences of ordinary length. Vary them because the content varies.

**Write like a person explaining their work.** These patterns read as machine-written and are not used:

- Slogans and aphorisms, especially as headings ("Small, and real.", "The machine gathers. The physician decides.").
- "X, not Y" and "not X but Y" used for effect. Say what the thing is.
- Lists of three for rhythm. List what there is, however many that is.
- Sentence fragments standing in for sentences ("What remains. What compounds.").
- A short punchy line at the end of a paragraph that restates it.
- A colon that sets up a reveal.
- The same favourite phrase on every page. Say a thing once, where it belongs.
- Headings that tease. A heading names what is under it ("Recent work.", "How we are paid.").

**Honesty standard.** Every claim must be something Moritz can defend in a direct conversation. Nothing that inflates scope or implies capability not yet shown. If something is early, say so. Clients are described, not named. No invented clients, numbers, logos, testimonials, awards or team.

## What the site does not depend on

Projects, programmes and tools come and go. The site names none of them: no programme, no production, no in-house tool, no network. The thesis and the disciplines are written so that they stay true when any of those change. Finished work is different: something that was done stays done. Past work is shown as a record on the Work page, saying what was done, for whom, when and in what role, in words the people involved would recognise.

## Naming

**Builds** have plain names (Direct booking, Clinical intake) and one line saying what each demonstrates.

**Disciplines** are called by their established names and credited to the person who worked each out: structural dynamics (Robert Fritz), natural law (Curt Doolittle), currency design (Arthur Brock), operative traditions (Miguel A. Fernandez). Each has a page of its own under `/disciplines/`, built from `src/data/disciplines.ts`. Every page has the same five parts, in this order:

1. Who worked it out, with the facts a reader needs to place it.
2. One drawn figure on the black ground, in the shape grammar, with a legend.
3. What it says: the source's ideas in plain words, each with one exact quotation and a link to the page it comes from. A quotation is checked against that page before it is published.
4. How we use it: only things the site shows elsewhere (the method, the terms, a build), with one document from the work set as a sheet, and the propositions of the thesis that rest on it.
5. Where our use stops, and the sources.

The fifth part matters as much as the third. Each of these bodies of work is wider than our use of it, and some of what lies outside our use is contested. The page says what we take and says that we take nothing else.

**Concepts** from the thesis (structural tension, advance and oscillate, reciprocity) are working vocabulary in lower case, explained where first used.

## Visual system ("Field")

The full reasoning is in `DESIGN-AMBITIOUS.md`. The rules:

- **Three grounds.** Ultramarine `#1029c4` where a claim or an invitation is made. Bone `#f1f0ea` where things are shown and reasoned. Black `#09090d` for the one band per page that shows a process or a tension.
- **One signal.** Vermilion `#ff4b1f`, only on blue or black, only where something is at stake. On bone the accent is blue. The header mark is the one exception.
- **Two voices.** Archivo in heavy condensed capitals for statements, Archivo regular for reading. Berkeley Mono only in the navigation and on recorded facts (status, a facts ledger, a source, a diagram label).
- **Three sizes of statement.** One for the first and last screen, one for section and page headings, one for things inside a section.
- **Three shapes.** A circle is a person, a square is an institution or the thing that holds, a triangle is a network. Rules are two pixels. Each thing on offer carries the shape of the scale it works at.
- **Actions** speak in the statement voice and carry the same drawn arrow: a block, an outline, or an underlined line. What you point at turns blue; on blue it turns black.
- **Nothing that only describes the page.** No eyebrows, section numbers, revision stamps or notes about what follows.
- **Motion** is CSS only, slight, and off under reduced motion. The site works without JavaScript.

## What it must never look like

- A software-company page: gradients, glass cards, feature grids, a floating "Book a call".
- A personal-brand page: a large portrait, testimonial sliders.
- A poster with nothing behind it: every large statement has a plain sentence within the same screen.
- Decorated: nothing exists for its own sake.
