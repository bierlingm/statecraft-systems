# Fruitful Beginnings

A preview for Laura Sabin’s licensed in-home day care. Pages are `noindex`. Nothing here states hours, rates, a street address, a phone number, or a license number, because those have not been provided. Drawings of the orchard, the house, and a blueberry branch hold the places where photographs will go. The only visible note that this is a preview is the ribbon at the top of each page.

## The core

The reader is a parent, usually working at one of the farms, orchards, or vineyards within 5 to 8 miles, with a child ages 3 to 5. Their real options are driving into town to a sterile center, or an unlicensed neighbor with no financial help. Their worries: is my child safe, known, and loved; fed well; outside and learning; can I afford it; is it close to where I work. Fruitful Beginnings answers all of these in one place.

## The perspective

A country childhood is not a compromise. It is one of the best starts a child can get. Laura is offering the childhood she had: she grew up in a large Christian family in rural Idaho, where there was always a full table, room to run, and older and younger children growing up together. Now she opens her own home on an organic blueberry orchard below Rattlesnake Mountain to a small group of children. It is also the real thing, not a backyard arrangement: licensed and DCYF approved, so qualified working families can get help paying. The name carries the idea: good beginnings, like anything growing, need good ground, sun, patience, and care. Use this lightly. It is a thread through the site, not a pun on every line.

## The voice

Warm, plain, and confident. Speak directly to parents (“your child”, “you”). The Home welcome is in Laura’s first person and signed Laura. That note is draft, pending her approval, and the draft mark lives in an HTML comment only. No hedging, no disclaimers about what a form does not do, no “photo coming soon”, and no talk about the website itself. Never invent hours, rates, an address, license numbers, testimonials, staff, or religious claims beyond the facts.

## The arc

1. Home, “A good start, close to home.” Hero: in-home day care on a blueberry orchard below Rattlesnake Mountain, for a small group of children ages 3 to 5, licensed and DCYF approved. Then Laura’s welcome. Then “What your child’s day is made of”: a home, not a center; meals cooked from scratch at the family table; a big yard and open country; a small group where every child is known. Then the trust band: licensed and DCYF approved, so families who qualify can get help paying while their child gets the same care as everyone else. Close by inviting them to come see the place and meet Laura.
2. Home Comforts, “The place.” A guided walk through the house, the kitchen table, the yard, the orchard rows, and the mountain. Each stop says what it means for a child, as a calm description, not a promise of activities we do not know about.
3. Our Daily Rhythm, “A steady, unhurried day.” Why rhythm matters, then morning, midday, and afternoon, with no invented clock times. A calendar card for closures and holidays. Missing times stay in HTML comments.
4. Enroll, “Start with a conversation.” One warm paragraph, then the assistance block, then two tabs: “Tell us about your family” and “Enrollment.” Success: “Thank you. Laura will be in touch soon.” If mail is not connected yet, the worker’s reply stays honest and quiet. The “Before you send” aside does not exist.
5. Contact, “Come see it for yourself.” An invitation to visit. Contact values that Laura has not given yet are HTML comments. The cards use neutral labels, such as “Email Laura”, and open Enroll until the real values exist.

## Still needed from Laura

- Photos of Laura
- Photos of the house, meals, the yard, and the scenery
- Hours
- Rates
- Address, and how she wants the service area worded
- DCYF license details (the pages say only that the day care is licensed and DCYF approved)
- Laura’s email, the form recipient (`LAURA_EMAIL` on `workers/fruitfulbeginnings-forms` — not set)
- The daily schedule, including clock times
- Calendar closures and holidays
- Contact links: email, phone, Facebook, and a map
- Approval of the draft welcome, written in her first person
- Domain choice

## Forms

Both forms post to `/api/fruitfulbeginnings/submit`. Until `LAURA_EMAIL` is set, the endpoint answers that the note could not be sent just yet, and sends nothing. See `workers/fruitfulbeginnings-forms/README.md`.

## Before this is public

These shared files were left unchanged on purpose. When the preview should follow the other rooms:

- `public/robots.txt` — add `Disallow: /fruitfulbeginnings` in both the AI-search group and the `User-agent: *` group. `public/fruitfulbeginnings/robots.txt` is not the file crawlers read.
- `public/_redirects` — optional, matching the other rooms: `/fruitfulbeginnings /fruitfulbeginnings/index.html 200` (and the same for `/comforts`, `/rhythm`, `/enroll`, and `/contact` if a directory index is not enough).
- `public/sitemap.xml` — do not list these pages while they are `noindex`.
