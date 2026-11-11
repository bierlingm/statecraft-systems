# statecraft.systems: "the working parts" makeover

**Line it has to live up to:** *I build the working parts of small institutions,* with the people who run them, made to keep working after I step back.

## Concept: a set of drawing sheets, and Sheet 01 runs

The site is drawn as a set of sheets, the way a workshop issues drawings: numbered sheets, datum rules with small terminals, registration marks, a title block. Sheet 01 is the homepage drawing, and it is the whole claim made concrete.

1. **It arrives as parts.** Six working parts of a small institution, drawn in line, start exploded: *the way in, one calendar, the rule, the inbox, the record, a word to the owner.* Blue leader lines run from each part to its socket, where a crosshair marks home.
2. **The parts click into place.** One after another they travel along their leaders and seat. Each seat gives a small "click": the part's lines flash oxblood and a ring opens on the socket. The builder's pencil, tagged M.B., moves from part to part as they go in.
3. **It runs.** Once every part is seated, requests enter at the way in, pass the rule, and go to the calendar (a night fills) or the inbox. Every one drops a line into the record. Now and then one runs the dashed line to the owner's phone and lights it. The owner hears only when something needs them.
4. **The builder steps back.** About two seconds later the pencil leaves the sheet. The status in the title block changes to *Running without the builder · 0:07*, and the clock keeps counting. Nothing else changes, which is the point.
5. **Pull any part out.** You can grab any part and drag it out of its socket. Its pipes go slack, requests wait at the gap, and the status reads *Waiting for a part.* Let go and it springs back, clicks in, and the flow resumes. On a phone, or from the keyboard, the legend buttons pull a part out a little and let it go.

Hovering a part, or a legend entry, names it in the title block with one plain line about what that part does. Each line is grounded in a plate already on the site. For example, "One calendar every channel writes to, so a night cannot be sold twice" comes from Plate I, and "The same answers take the same path" comes from Plate II. The figure says *"A drawing, not a dashboard"*, and the counts are simulated.

The plate drawings echo Sheet 01: each one is drawn in, line by line, when it comes into view.

## Concepts considered

1. **Blueprint to building.** The page starts as a pencil plan and inks itself in as you scroll. It is beautiful, but passive. It shows *making* and never *keeps working*.
2. **A crank and a flywheel.** The visitor turns a mechanism, lets go, and the flywheel keeps it running. It makes the "after I step back" point, but it is a toy. It is awkward on a phone, and the brand calls for weight, not delicacy.
3. **Exploded assembly that runs (chosen).** The parts click into place, the builder steps back, and it keeps running. You can pull a part and watch it hold. It is the only one of the three that puts *working parts*, *with the people who run them* and *keeps working after I step back* in a single drawing. It is also plain SVG and DOM.

## How it follows `src/content/brand.md`

- **Warm paper, ink, one oxblood accent, drafting blue for reasoning.** Blue is used only for the leaders, the pencil, and the Detail A reasoning layer. There is no dark mode, no gradient and no neon. The one ink band is the existing thesis band.
- **Earned depth.** The surface is austere. Hovering reveals structure (part names and notes), the pencil and sockets reward attention, and the reasoning toggle is kept.
- **No guru signals.** There's no hero photo, floating "Book a call" button or testimonial. Moritz is credited as the practitioner, and his name links to moritzbierling.com.
- **Newsreader and Berkeley Mono.** Both are self-hosted, as before.

## Desktop and mobile, no effort

- **Nobody waits on it.** An untouched visitor sees the drawing seated about 3.0 s after load. The builder steps back about 5.2 s after load (measured in headless Chrome at both sizes). Pointer movement over the sheet, scrolling or touching speeds assembly up about 2.4×.
- **Links and text are live from the first frame.** Only the drawing animates.
- **On phones,** the sheet scales to the column. Labels shrink and the legend carries the names. The SVG keeps `touch-action: pan-y`, so scrolling over it works and dragging a part is a deliberate grab.
- **A "Take it apart again" link** appears once it is running, and replays the assembly.

## Accessibility

- The drawing is an `<svg role="img">` with a full `<desc>` of the six parts and the flow. The legend is a real `<ol>` of buttons. The tokens, sockets and leaders are `aria-hidden`.
- **`prefers-reduced-motion`.** The drawing renders seated and still (`data-state="still"`). There is no assembly, no flow and no drag. The plate drawings appear whole.
- **No JS.** The server-rendered SVG is the seated drawing. A head fail-safe adds `.failsafe` after 2.5 s if the script never mounts.
- **Keyboard.** The legend buttons get focus rings, name the part, and pull it out and back.

## Performance

- **Script.** The homepage script is one small module, bundled by Astro. It has no dependencies, uses one `requestAnimationFrame` loop, and sleeps when the figure is off screen or the tab is hidden. It animates SVG `transform` and attributes only.
- **Plate draw-in.** This uses the Web Animations API on `pathLength="1"` strokes, from a tiny inline script in the layout.
- **No new fonts or images.**

## Copy

| Kept word for word | Changed or new |
|---|---|
| Plates I–IV (titles, summaries, facts, pages) | Hero: "I build the *working parts* of small institutions." (was "We build…"). Lede: "With the people who run them, on the real thing, and made to keep working after I step back." This replaces "Intake for a clinic. Booking for a house. Enquiries for a supplier…" |
| Detail A, Method, Instruments, Thesis, Contact pages, Operating records page, Support/Terms/Privacy | New Sheet 02, "What a working part is" (three short paragraphs) |
| "Describe what you need. The reply comes from the person who would build it." | The Operating records band is off the homepage. In its place is one "Also" line linking to `/operating-records`, which is unchanged, and there's a footer link |
| m@statecraft.systems (the address the live site uses); contact@ stays on Support/Terms/Privacy as before | The homepage quick answer is reworded so it doesn't reduce the work to "intake, booking and enquiries", and it's dated 2026-11-11. The site meta description is reworded the same way |
| | The footer is a title block: entity, practitioner, sheets, records |
| | The Spikes feedback widget was removed from the public layout. Its endpoints return 404 and logged console errors on every page, and the floating button sat over content. It's easy to re-add for a review round |

No clients are named. Plates still describe them, as the live site does. There are no testimonials, metrics or invented claims.

## Untouched

These were not touched: `functions/` (the invite-gated `/pnw/*` and `/runcible/*` rooms and their session APIs), `public/` (all rooms, demos, client previews, `_redirects`, robots.txt), and the `/llms.txt`, `/feed.json` and `/sitemap.xml` generators.

## Files

- `src/components/Assembly.astro`, `src/scripts/assembly.ts`: Sheet 01
- `src/pages/index.astro`: homepage sheets
- `src/styles/global.css`: the whole system, restyled
- `src/layouts/BaseLayout.astro`: head flag, title-block footer, plate draw-in
- `src/components/{ContactBlock,DetailA,Drawing,PlateCard}.astro`: small changes
- `src/components/OperatingRecords.astro`: removed (it was only used by the homepage band)
