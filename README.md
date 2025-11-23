# Statecraft Systems

A minimal, static website for Statecraft Systems built with Astro.

## Overview

This site presents Statecraft Systems as a studio for designing systems of cooperation and sovereignty. It is intentionally minimal and links to partner projects including Modern Minuteman, The Field Company, and Moritz Bierling's personal work.

## Local Development

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The dev server will start at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

This generates static files in the `dist/` directory, ready for deployment.

### Preview Production Build Locally

```bash
npm run preview
```

## Editing Content

### Home Page
Edit `src/pages/index.astro` to:
- Change the headline and subheadline
- Modify the introductory paragraph
- Update project descriptions and links

### Approach Page
Edit `src/pages/approach.astro` to:
- Revise the approach description
- Add or remove sections
- Update focus areas

### Projects Page
Edit `src/pages/projects.astro` to:
- Add or remove projects
- Update project descriptions and links
- The structure includes a placeholder comment for future projects

### About Page
Edit `src/pages/about.astro` to:
- Modify the founder biography
- Update roles and contributions
- Change the link to personal website

### Contact Page
Edit `src/pages/contact.astro` to:
- Update email address
- Modify contact instructions
- Add or remove contact methods

### Styling
Edit `src/styles/global.css` to:
- Adjust colors (see CSS variables in `:root`)
- Modify typography sizes or spacing
- Change responsive breakpoints

The site uses Berkeley Mono font across all text. Font files are located in `public/fonts/`.

### Layout & Navigation
The shared header and footer are defined in `src/layouts/BaseLayout.astro`. Navigation links and footer text can be modified there.

## Design System

- **Colors:**
  - Background: `#f7f5f0` (off-white)
  - Text Primary: `#1a1816` (near-black)
  - Text Secondary: `#6b6560` (gray)
  - Accent: `#8b6f47` (muted bronze)

- **Typography:**
  - Font: Berkeley Mono (all text)
  - Line height: 1.6 (body), 1.3 (headings)
  - Max content width: 800px

- **Spacing:** Defined via CSS variables (`--spacing-xs` through `--spacing-2xl`)

## Deployment to Cloudflare Pages

### Prerequisites

1. A GitHub repository with this code
2. A Cloudflare account

### Steps

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/statecraft-systems.git
   git push -u origin master
   ```

2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)

3. Go to **Pages** → **Create a project** → **Connect to Git**

4. Select the `statecraft-systems` repository

5. Configure build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (or leave default)

6. No environment variables are required

7. Click **Save and Deploy**

Cloudflare Pages will automatically rebuild and redeploy whenever you push to the master branch.

## Project Structure

```
statecraft-systems/
├── public/
│   ├── fonts/              # Berkeley Mono font files
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro   # Shared header, footer, layout
│   ├── pages/
│   │   ├── index.astro        # Home page
│   │   ├── approach.astro     # Approach page
│   │   ├── projects.astro     # Projects page
│   │   ├── about.astro        # About founder
│   │   └── contact.astro      # Contact page
│   └── styles/
│       └── global.css         # Design system and styles
├── astro.config.mjs
├── package.json
└── README.md
```

## Notes

- This site produces zero JavaScript in the final output. It is pure static HTML and CSS.
- The archive folder contains the previous Squarespace export and is ignored by git.
- All content is intended to be in third-person voice.
- The site is designed for clarity and readability, with no animations or gratuitous styling.
