---
name: design-worker
description: Implements design system, visual identity, layout, and component patterns for the Statecraft Systems site.
---

# Design Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Features involving: CSS/styles, color palette, typography, layout structure, navigation, footer, component patterns, responsive design, interaction states, and any technology/framework decisions.

## Work Procedure

1. **Read the brand document.** Open and read `src/content/brand.md` in full, particularly the "Visual Principles" section. This is your primary design brief. Pay special attention to:
   - "Operative Aesthetics" — every element has a function
   - "Earned Depth" — austere surface, detail rewards attention
   - Reference points (Swiss Passport, U.S. Graphics, Triple Aught Design, etc.)
   - "What It Must Never Look Like"

2. **Read the thesis.** Open and read `src/content/thesis.md`. Understand the worldview the design must express. The design is itself a structure of persistence.

3. **Study the reference points.** Use `FetchUrl` to study:
   - https://usgraphics.com — design philosophy, visual approach
   - https://tripleaughtdesign.com — utility-craft balance
   - https://retinaa.ch/work/new-swiss-passport — clean complexity, layered revelation

4. **Make technology decisions.** You have FULL AUTONOMY. Evaluate whether to keep Astro or switch. If switching, justify briefly in your handoff. If keeping Astro, proceed with the existing setup.

5. **Implement the design system.** Write tests first where applicable (build succeeds, pages render). Then implement:
   - Global styles: color palette, typography, spacing, base elements
   - Layout: navigation, footer, page structure, max-width per page type
   - Component patterns: offering cards, project blocks, discipline descriptions
   - Interaction states: hover reveals, earned-depth details
   - Responsive: test at 375px mobile width

6. **Verify manually.** Start the dev server. Load every page. Check:
   - Does it feel like the brand document describes? (Warm, weighted, dense not sparse, operative)
   - Does it NOT look like the forbidden categories? (Corporate, startup, guru, empty-minimal)
   - Do hover/interaction states work?
   - Is mobile responsive at 375px?
   - Does the build succeed?

7. **Run build.** `npm run build` (or equivalent if framework changed) must exit 0.

## Example Handoff

```json
{
  "salientSummary": "Implemented complete design system: kept Astro, replaced global.css with new operative aesthetic. Warm stone palette (#f5f0e8 bg, #2d2a26 text, #8b6f47 accent), Berkeley Mono primary with Crimson Pro for long-form. Component patterns for offerings (bordered cards), productions (minimal blocks), disciplines (structured descriptions). Hover states reveal accent borders and geometric markers. Verified at 375px mobile, build passes.",
  "whatWasImplemented": "New global.css with operative aesthetic color palette and typography. Updated BaseLayout.astro with six-page navigation and footer with ecosystem links. Component CSS for offering-card, project-block, discipline-block. Hover states with accent border reveals. Variable max-width (680px thesis/approach, 900px work/services). Mobile-first responsive breakpoints at 375px and 768px.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "npm run build", "exitCode": 0, "observation": "Built 6 pages in 1.2s, zero errors" },
      { "command": "curl -s -o /dev/null -w '%{http_code}' http://localhost:4321", "exitCode": 0, "observation": "200 OK" },
      { "command": "curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/services", "exitCode": 0, "observation": "200 OK" }
    ],
    "interactiveChecks": [
      { "action": "Loaded homepage in browser at 1440px width", "observed": "Warm stone background, Berkeley Mono headings, clear navigation with six links, footer with MM and FC links" },
      { "action": "Hovered over navigation links", "observed": "Accent underline reveals from left on hover, subtle and structural" },
      { "action": "Resized to 375px mobile", "observed": "Navigation collapses to hamburger, content readable, no horizontal scroll" },
      { "action": "Compared visual feel against brand forbidden list", "observed": "Does not resemble corporate, startup, guru, or empty-minimal sites. Has distinct warmth and weight." }
    ]
  },
  "tests": {
    "added": []
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Brand document is ambiguous in a way that materially affects the design
- A technology migration creates issues that affect the content milestone
- Font files are missing or corrupted
- The reference sites are inaccessible and you need alternative guidance
