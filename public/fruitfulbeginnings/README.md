# Fruitful Beginnings — first preview

A static preview for Laura Sabin’s licensed in-home day care. The words are draft copy, pending her approval. Pages are `noindex`. Nothing here states hours, rates, a street address, a phone number, or a license number, because those have not been provided.

## Still needed from Laura

- Photos of Laura
- Photos of the house, meals, the yard, and the scenery
- Hours
- Rates
- Address, and how she wants the service area worded
- DCYF license details (the pages say only that the day care is licensed and DCYF approved)
- Laura’s email, the form recipient (`LAURA_EMAIL` on `workers/fruitfulbeginnings-forms` — not set)
- The daily schedule
- Calendar closures and holidays
- Contact links: email, phone, Facebook, and a map
- Approval of the draft copy
- Domain choice

## Forms

Both forms post to `/api/fruitfulbeginnings/submit`. Until `LAURA_EMAIL` is set, the endpoint answers that the forms are being set up and sends nothing. See `workers/fruitfulbeginnings-forms/README.md`.

## Before this is public

These shared files were left unchanged on purpose. When the preview should follow the other rooms:

- `public/robots.txt` — add `Disallow: /fruitfulbeginnings` in both the AI-search group and the `User-agent: *` group. `public/fruitfulbeginnings/robots.txt` is not the file crawlers read.
- `public/_redirects` — optional, matching the other rooms: `/fruitfulbeginnings /fruitfulbeginnings/index.html 200` (and the same for `/comforts`, `/rhythm`, `/enroll`, and `/contact` if a directory index is not enough).
- `public/sitemap.xml` — do not list these pages while they are `noindex`.
