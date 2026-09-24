// The plates. Clients are described, not named: every line here must be
// something Moritz can defend in a direct conversation (see src/content/brand.md).

export interface Plate {
  slug: string;
  numeral: string;
  title: string;
  status: string;
  client: string;
  summary: string;
  facts: [string, string][];
  situation: string[];
  built: string[];
  process: string[];
  quote?: string;
}

export const plates: Plate[] = [
  {
    slug: 'direct-booking',
    numeral: 'I',
    title: 'Direct booking',
    status: 'Launching',
    client: 'A family-owned vacation rental',
    summary:
      'A family-owned vacation rental takes bookings on its own site. One calendar holds every channel. The owners hear only when something needs them.',
    facts: [
      ['Replaced', 'Booking only through listing sites'],
      ['Built', 'September 2026'],
      ['Rounds', 'Nine reviewed versions'],
      ['Parts', 'Site, calendar sync, holds and payment, owner texts'],
      ['Status', 'Launching'],
    ],
    situation: [
      'The house could only be booked through the large listing sites. They set the terms, hold the guest relationship and take a share of every stay.',
      'The owners wanted a place of their own to take bookings, without a second calendar to keep in their heads.',
    ],
    built: [
      'A booking site of their own. Guests choose dates against one calendar that also carries the listing-site bookings, so a night cannot be sold twice.',
      'A request places a hold. The owners accept it from their phone, the guest pays, and the dates confirm. Holds that nobody acts on lapse by themselves.',
      'The owners receive a text only when something needs them. Every text is built from a fixed template, so nothing a guest types ever reaches a phone.',
      'An owner page, signed into by an emailed link, where they see requests and copy the calendar link for the listing sites.',
    ],
    process: [
      'Nine versions, each at a private address the owners could open on their phones. Questions that needed a decision were written as plain questions with answers to tap, and each answer was applied in the next version.',
    ],
  },
  {
    slug: 'clinical-intake',
    numeral: 'II',
    title: 'Clinical intake',
    status: 'Pilot',
    client: 'A cash-pay telemedicine practice',
    summary:
      'A cash-pay telemedicine practice. The patient answers by form or by phone. A fixed protocol decides what to ask, AI drafts the report, the physician decides. No patient records kept.',
    facts: [
      ['For', 'A physician-led, cash-pay practice'],
      ['Built', 'July 2026, continuing'],
      ['Parts', 'Protocol engine, bounded AI layer, review queue, voice intake'],
      ['Status', 'Engineering pilot, shown on synthetic data only'],
    ],
    situation: [
      'In routine visits, much of a physician’s time goes to taking a history that follows a predictable shape. The judgement is the valuable part; the gathering is not.',
    ],
    built: [
      'A fixed protocol decides what to ask, in what order, and when to stop and escalate. It is deterministic: the same answers produce the same path.',
      'An AI layer drafts the provisional report from the answers. It is bounded: it structures and flags, and it cannot decide.',
      'Identifying details are removed before anything leaves the patient’s device. The practice’s own records system keeps the record; this system keeps none.',
      'The physician works from a review queue: read, adjudicate, treat. A voice option lets the patient give the same history by phone.',
    ],
    process: [
      'Built alongside the physician, in rounds. Everything shown outside the build runs on synthetic patients.',
    ],
    quote: 'AI gathers, structures, detects and escalates. The physician reviews, adjudicates and treats.',
  },
  {
    slug: 'trade-enquiries',
    numeral: 'III',
    title: 'Trade enquiries',
    status: 'Live',
    client: 'A regional jobsite-supply wholesaler',
    summary:
      'A regional jobsite-supply wholesaler. A site that says plainly what they carry, and a request form that lands in an inbox the counter staff run. Five drafts, one week.',
    facts: [
      ['For', 'A regional wholesaler of safety and jobsite supplies'],
      ['Built', 'April 2026, in one week'],
      ['Rounds', 'Five drafts, each with a revisions log'],
      ['Parts', 'Site, request form, staff inbox'],
      ['Status', 'Live since April 2026'],
    ],
    situation: [
      'The business needed a plain place for contractors to see what it carries and to ask for it.',
    ],
    built: [
      'A site that says plainly what they carry and how ordering works.',
      'A request form that arrives by email and in a small inbox the staff can work through, so every request is kept in one place.',
    ],
    process: [
      'Five drafts in a week. Each carried a short log of what changed and why, and comments were left directly on the page being discussed.',
    ],
  },
  {
    slug: 'one-page-one-ask',
    numeral: 'IV',
    title: 'One page, one ask',
    status: 'Live',
    client: 'A child-recovery nonprofit',
    summary:
      'A child-recovery nonprofit. One page that walks supporters through giving their unused airline miles, airline by airline, in about two minutes.',
    facts: [
      ['For', 'A nonprofit that recovers missing and abducted children'],
      ['Built', 'April 2026'],
      ['Parts', 'A single page, with a preview image for sharing'],
      ['Status', 'Live'],
    ],
    situation: [
      'The organisation’s operators travel worldwide, and donated airline miles pay for those flights. Supporters have miles to give, but every airline handles donations differently.',
    ],
    built: [
      'One page with one ask. Each major airline gets its own short set of steps and a direct link to its donation portal. Nothing else competes for attention.',
    ],
    process: ['A single short build, reviewed on the page itself.'],
  },
];
