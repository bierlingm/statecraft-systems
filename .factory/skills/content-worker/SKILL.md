---
name: content-worker
description: Writes and implements page content for the Statecraft Systems site, governed by thesis and brand documents.
---

# Content Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Features involving: writing page copy, implementing page templates, populating content from thesis/brand/vault sources.

## Work Procedure

1. **Read the brand document.** Open and read `src/content/brand.md` in full. Pay particular attention to:
   - "Voice" section — register, vocabulary, cadence, honesty standard
   - "Calibration Framework" — what level this page operates at
   - "Naming Conventions" — how offerings, disciplines, and concepts are named

2. **Read the thesis.** Open and read `src/content/thesis.md` in full. This is the source of truth for the worldview, disciplines, and framing.

3. **Read the relevant vault notes.** For each concept, person, discipline, project, tool, or offering mentioned on your page, open the corresponding note in `vault/`. These contain accurate details, cross-references, and privacy flags. Notes marked `#private` indicate people who must NOT be named.

4. **Check the feature description.** Your feature specifies the calibration level, content requirements, and which validation assertions you must fulfill. Use these as your checklist.

5. **Write tests first.** At minimum, verify the page builds and returns HTTP 200. If the framework supports it, write content assertions (page contains expected text).

6. **Write the page copy.** Follow brand voice exactly:
   - Direct, unhurried, precise
   - No emojis, no exclamation marks, no rhetorical questions
   - No forbidden vocabulary (see brand doc)
   - Every claim defensible in conversation
   - Calibration level appropriate to the page

7. **Implement the page.** Use the component patterns established by the design system milestone. Use semantic HTML. Maintain the design system's visual language.

8. **Verify manually.** Start the dev server. Load the page. Check:
   - Is all required content present? (Cross-check against feature description)
   - Does the copy match the brand voice?
   - Are all links functional (internal and external)?
   - Does the page render correctly at desktop and 375px mobile?
   - Are privacy constraints respected? (Search for: Alex Beltechi, Alexis Papageorgiou, Nicholas Catton)

9. **Run build.** Build command must exit 0.

## Example Handoff

```json
{
  "salientSummary": "Implemented Services page at calibration Level 1-2. Individual track (Unlock $1,500, Stack Build $5K, Sparring $1,500-2,500/mo) and team track (Discovery $3-5K, Build $8-15K, Train $2,500-5K, Retainer $2-4K/mo) with pricing. Natural flow described: CEO personal value first, then team. Build passes, all links to Home and Contact functional, verified at 375px.",
  "whatWasImplemented": "New services.astro page with two sections (Individual, Team), each using offering-card component pattern. Seven offerings with descriptions, pricing, and duration. Introductory paragraph on the natural engagement flow. Internal links to Contact page for inquiries.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "npm run build", "exitCode": 0, "observation": "Built 7 pages, zero errors" },
      { "command": "curl -s http://localhost:4321/services | grep -c '\\$'", "exitCode": 0, "observation": "7 price references found, matching all offerings" }
    ],
    "interactiveChecks": [
      { "action": "Loaded /services in browser", "observed": "Two clear sections: For Individuals and For Teams. All seven offerings visible with pricing." },
      { "action": "Checked brand voice compliance", "observed": "No emojis, no exclamation marks, no rhetorical questions. Direct, factual descriptions." },
      { "action": "Verified at 375px mobile", "observed": "Offering cards stack vertically, pricing readable, no overflow" },
      { "action": "Searched page source for forbidden names", "observed": "No instances of Alex Beltechi, Alexis Papageorgiou, or Nicholas Catton" }
    ]
  },
  "tests": {
    "added": [
      { "file": "src/pages/services.astro", "cases": [{ "name": "page builds and serves", "verifies": "Services page returns 200 with pricing content" }] }
    ]
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Thesis or brand document contains contradictory guidance for this page
- A vault note is missing for a person, concept, or project that must be described
- Design system component patterns are missing or broken for the content needed
- Privacy flag unclear — uncertain whether someone should be named
- Content requirements in the feature description are ambiguous
