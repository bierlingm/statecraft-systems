# Statecraft Systems

Website for [statecraft.systems](https://statecraft.systems). A static site built with Astro.

## Tech Stack

- [Astro](https://astro.build/) v5 — static output; one small script (the Detail A reasoning toggle)
- Newsreader + [Berkeley Mono](https://usgraphics.com/products/berkeley-mono)

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
| `/` | `src/pages/index.astro` | Home: headline, plates, Detail A, instruments |
| `/work`, `/work/:slug` | `src/pages/work/` | Plates (anonymized client work) from `src/data/work.ts` |
| `/method` | `src/pages/method.astro` | How a build runs |
| `/instruments` | `src/pages/instruments.astro` | spikes, werk |
| `/werk` | `src/pages/werk.astro` | werk (linked from the werk repo; keep the URL) |
| `/thesis` | `src/pages/thesis.astro` | Renders `src/content/thesis.md` |
| `/contact` | `src/pages/contact.astro` | Contact |

Old routes `/approach`, `/services`, `/about` redirect via `public/_redirects`.
Client rooms and demos under `public/` (`prosser/`, `cashclinic/`, `pnw/`, …) are standalone and untouched by the site design.

## Content Sources

- `src/data/work.ts` — the plates. Clients are described, not named; every claim must be defensible (see `brand.md`).
- `src/components/Drawing.astro` — the line drawing for each plate.
- `src/content/thesis.md` — thesis document
- `src/content/brand.md` — brand voice and visual principles

## Reference Vault

`vault/` contains reference and working notes in Obsidian format. Not used at build time.

## Fonts

Self-hosted in `public/fonts/`: Newsreader (variable, OFL) for reading text, Berkeley Mono (licensed) for labels. The `.otf` Berkeley Mono files are still used by `public/prosser/project.css`.

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
