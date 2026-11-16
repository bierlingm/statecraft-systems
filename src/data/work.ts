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
  /** What the figure shows, for people who cannot see it. */
  figure: string;
}

export const plates: Plate[] = [
  {
    slug: 'direct-booking',
    figure: 'Two listing sites and one guest booking directly, all feeding a single calendar.',
    numeral: 'I',
    title: 'Direct booking',
    status: 'Live',
    client: 'A family-owned vacation rental',
    summary:
      'A family-owned vacation rental now takes bookings on its own site. One calendar covers the site and the listing platforms, and the owners get a text when a request needs their answer.',
    facts: [
      ['Replaced', 'Booking only through listing sites'],
      ['Built', 'September 2026'],
      ['Rounds', 'Nine reviewed versions'],
      ['Parts', 'Site, calendar sync, holds and payment, owner texts'],
      ['Status', 'Live'],
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
    figure: 'A patient, then a fixed protocol that gathers, then the physician who decides.',
    numeral: 'II',
    title: 'Clinical intake',
    status: 'Pilot',
    client: 'A cash-pay telemedicine practice',
    summary:
      'Intake for a cash-pay telemedicine practice. Patients answer questions by form or by phone, a fixed protocol chooses the questions, and AI drafts a report for the physician to review. The system keeps no patient records.',
    facts: [
      ['For', 'A physician-led, cash-pay practice'],
      ['Built', 'July 2026, continuing'],
      ['Parts', 'Protocol engine, bounded AI layer, review queue, voice intake'],
      ['Status', 'Engineering pilot, shown on synthetic data only'],
    ],
    situation: [
      'In a routine visit, much of the physician’s time goes to taking a history that follows a predictable shape. That leaves less time for the judgement the patient came for.',
    ],
    built: [
      'A fixed protocol decides what to ask, in what order, and when to stop and escalate. The same answers always produce the same path.',
      'An AI layer drafts a provisional report from the answers. It organises what the patient said and flags what looks urgent, and it has no part in the decision.',
      'Identifying details are removed before anything leaves the patient’s device. The practice’s own records system holds the record, and this system stores none.',
      'The physician works through a review queue, reading each report and deciding on treatment. Patients can also give the same history by phone.',
    ],
    process: [
      'Built alongside the physician, in rounds. Everything shown outside the build runs on synthetic patients.',
    ],
  },
  {
    slug: 'trade-enquiries',
    figure: 'Three people sending requests that arrive in one inbox.',
    numeral: 'III',
    title: 'Trade enquiries',
    status: 'Live',
    client: 'A regional jobsite-supply wholesaler',
    summary:
      'A site for a regional jobsite-supply wholesaler that lists what they carry, with a request form that goes to an inbox run by the counter staff. Built in one week, over five drafts.',
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
      'A site that lists what they carry and explains how to order.',
      'A request form that arrives by email and in a small inbox the staff can work through, so every request is kept in one place.',
    ],
    process: [
      'Five drafts in a week. Each carried a short log of what changed and why, and comments were left directly on the page being discussed.',
    ],
  },
  {
    slug: 'one-page-one-ask',
    figure: 'One page with one thing on it.',
    numeral: 'IV',
    title: 'One page, one ask',
    status: 'Live',
    client: 'A child-recovery nonprofit',
    summary:
      'One page for a child-recovery nonprofit. It shows supporters how to donate unused airline miles, with separate steps for each airline, and takes about two minutes.',
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
      'A single page. Each major airline gets its own short set of steps and a direct link to its donation portal. The page asks for nothing else.',
    ],
    process: ['A single short build, reviewed on the page itself.'],
  },
];
