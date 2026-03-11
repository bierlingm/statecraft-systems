# Statecraft Systems

Website for [statecraft.systems](https://statecraft.systems). A static site built with Astro.

## Tech Stack

- [Astro](https://astro.build/) v5 — static output, zero client-side JavaScript
- [Berkeley Mono](https://berkeleygraphics.com/typefaces/berkeley-mono/) — primary typeface

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
| `/` | `src/pages/index.astro` | Home |
| `/work` | `src/pages/work.astro` | Work and productions |
| `/approach` | `src/pages/approach.astro` | Methodology and disciplines |
| `/services` | `src/pages/services.astro` | Service offerings |
| `/about` | `src/pages/about.astro` | Founder and lineage |
| `/contact` | `src/pages/contact.astro` | Contact |

## Content Sources

- `src/content/thesis.md` — thesis document
- `src/content/brand.md` — brand voice and visual principles

## Reference Vault

`vault/` contains reference and working notes in Obsidian format. Not used at build time.

## Fonts

Berkeley Mono font files are in `public/fonts/`. Four weights: Regular, Bold, Oblique, Bold Oblique.

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
