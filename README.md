# Statecraft Systems

Website for [statecraft.systems](https://statecraft.systems). A static site built with Astro.

## Tech Stack

- [Astro](https://astro.build/) v5 — static output; one small script (the Detail A reasoning toggle). All motion is CSS and is off under `prefers-reduced-motion`.
- Archivo (variable width and weight, OFL) + [Berkeley Mono](https://usgraphics.com/products/berkeley-mono)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Dev server runs at `http://localhost:4321`.

## Build

```bash
npm run build
```

Static files output to `dist/`.

## Preview

```bash
npm run preview
```

Serves the production build locally for review.

## Pages

| Path | File | Description |
|------|------|-------------|
| `/` | `src/pages/index.astro` | Home (the offering only): hero, two ways to work, proof, how a build runs, one doorway to the ideas, contact |
| `/work`, `/work/:slug` | `src/pages/work/` | Plates (anonymized client work) from `src/data/work.ts` |
| `/method` | `src/pages/method.astro` | How a build runs |
| `/instruments` | redirect in `astro.config.mjs` | Removed; leads to `/` |
| `/werk` | `src/pages/werk.astro` | werk. Not linked from the site or listed in llms.txt, feed or sitemap; kept only because the werk repo links to it |
| `/thesis` | `src/pages/thesis/index.astro` | The name, then ten propositions. Names no project or programme |
| `/disciplines` | `src/pages/disciplines.astro` | Four disciplines, each credited and linked to its source, with the advance-or-oscillate figure |
| `/thesis/full` | redirect in `astro.config.mjs` | Removed; leads to `/thesis` |
| `/contact` | `src/pages/contact.astro` | Contact |

Old routes `/approach`, `/services`, `/about` redirect via `public/_redirects`.
Client rooms and demos under `public/` (`prosser/`, `cashclinic/`, `pnw/`, …) are standalone and untouched by the site design.

## Content Sources

- `src/data/work.ts` — the plates. Clients are described, not named; every claim must be defensible (see `brand.md`).
- `src/components/Drawing.astro` — the line drawing for each plate.
- `src/content/brand.md` — brand voice and visual principles
- `DESIGN-AMBITIOUS.md` — the three directions explored for the 2026-11 pass and the system that was built

## Reference Vault

`vault/` contains reference and working notes in Obsidian format. Not used at build time.

## Fonts

Self-hosted in `public/fonts/`: Archivo (variable, OFL) for statements and reading text, Berkeley Mono (licensed) for labels and record. The Newsreader files are no longer used by the main site. The `.otf` Berkeley Mono files are still used by `public/prosser/project.css`.

## Project Structure

```
statecraft-systems/
├── public/
│   └── fonts/                 # Berkeley Mono .otf files
├── src/
│   ├── content/               # Thesis and brand documents
│   ├── layouts/               # BaseLayout (header, footer, shared structure)
│   ├── pages/                 # Astro page components
│   └── styles/                # Global CSS and design tokens
├── vault/                     # Obsidian reference vault
├── astro.config.mjs
└── package.json
```
