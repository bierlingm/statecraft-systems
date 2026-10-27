// Public pages of the main site, for /llms.txt, /feed.json and /sitemap.xml.
// Client project rooms (/pnw, /runcible, /prosser, /prosserhorsehotel and the other
// folders under public/) are deliberately absent and must stay absent.
// `updated` is the date the page's content last changed (YYYY-MM-DD).
import { plates } from './work';

export const SITE_URL = 'https://statecraft.systems';
export const SITE_NAME = 'Statecraft Systems';
export const SITE_DESCRIPTION =
  'Statecraft Systems builds the working parts of small institutions: intake, booking, enquiries and the systems behind them.';

/** Date shown on the quick-answer blocks. Change it when a quick answer changes. */
export const QUICK_ANSWER_DATE = '2026-10-27';

export interface PublicPage {
  path: string;
  title: string;
  summary: string;
  updated: string;
  section: 'Main' | 'Work' | 'Instruments' | 'Details';
}

export const publicPages: PublicPage[] = [
  { path: '/', title: 'Statecraft Systems', section: 'Main', updated: QUICK_ANSWER_DATE,
    summary: 'The practice of Moritz Bierling. We build the working parts of small institutions: intake for a clinic, booking for a house, enquiries for a supplier.' },
  { path: '/work/', title: 'Work', section: 'Main', updated: QUICK_ANSWER_DATE,
    summary: "Recent builds by Statecraft Systems: booking, clinical intake, trade enquiries and a nonprofit's single ask." },
  ...plates.map((p): PublicPage => ({
    path: `/work/${p.slug}/`, title: `Plate ${p.numeral} · ${p.title}`, section: 'Work', updated: '2026-09-24', summary: p.summary,
  })),
  { path: '/method/', title: 'Method', section: 'Main', updated: QUICK_ANSWER_DATE,
    summary: 'How a Statecraft Systems build runs: a working version first, review on the real page, and a launch someone else could carry.' },
  { path: '/operating-records/', title: 'Operating records', section: 'Main', updated: QUICK_ANSWER_DATE,
    summary: 'Decide whether to license your operating records for AI training, with an inventory, clear boundaries and redaction before delivery.' },
  { path: '/instruments/', title: 'Instruments', section: 'Instruments', updated: QUICK_ANSWER_DATE,
    summary: 'Tools Statecraft Systems built for its own work and publishes: spikes and werk.' },
  { path: '/werk/', title: 'werk', section: 'Instruments', updated: '2026-09-24',
    summary: 'The Operative Instrument — a structural dynamics engine for the gap between desire and reality.' },
  { path: '/thesis/', title: 'Thesis', section: 'Main', updated: '2026-09-24',
    summary: 'The Statecraft thesis: good rule is the foundation of all human flourishing, and it endures only through structures worthy of it.' },
  { path: '/contact/', title: 'Contact', section: 'Main', updated: QUICK_ANSWER_DATE,
    summary: 'Write to Statecraft Systems. The reply comes from the person who would build it.' },
  { path: '/support/', title: 'Support', section: 'Details', updated: '2026-10-14',
    summary: 'How Statecraft Systems clients get help: contact, response times and billing.' },
  { path: '/terms/', title: 'Terms', section: 'Details', updated: '2026-10-14',
    summary: "Terms of service for Statecraft Systems website work and care plans: what's included, third-party costs, billing, cancellation and ownership." },
  { path: '/privacy/', title: 'Privacy', section: 'Details', updated: '2026-10-14',
    summary: 'What data Statecraft Systems keeps for outreach, client websites, form submissions and billing, why, and how to reach us.' },
];

export const absolute = (path: string) => new URL(path, SITE_URL).href;
