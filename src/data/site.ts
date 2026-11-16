// Public pages of the main site, for /llms.txt, /feed.json and /sitemap.xml.
// Client project rooms (/pnw, /runcible, /prosser, /prosserhorsehotel and the other
// folders under public/) are deliberately absent and must stay absent.
// `updated` is the date the page's content last changed (YYYY-MM-DD).
import { plates } from './work';

export const SITE_URL = 'https://statecraft.systems';
export const SITE_NAME = 'Statecraft Systems';
export const SITE_DESCRIPTION =
  'Statecraft Systems builds the working parts of small institutions: intake, booking, enquiries and the systems behind them.';

/** Date of the last change to the factual summaries (ledes, footer statement) on pages that use it. */
export const QUICK_ANSWER_DATE = '2026-10-27';
/** Date of the last pass that changed what the main pages say (not only how they look). */
export const REVISED = '2026-11-16';

export interface PublicPage {
  path: string;
  title: string;
  summary: string;
  updated: string;
  section: 'Main' | 'Work' | 'Details';
}

export const publicPages: PublicPage[] = [
  { path: '/', title: 'Statecraft Systems', section: 'Main', updated: REVISED,
    summary: 'Statecraft Systems, the practice of Moritz Bierling, builds the working parts of small institutions, such as patient intake for a clinic or direct booking for a rental house. Clients review every version and own the result.' },
  { path: '/work/', title: 'Work', section: 'Main', updated: REVISED,
    summary: 'Four recent builds by Statecraft Systems: direct booking, clinical intake, trade enquiries and a donation page for a nonprofit.' },
  ...plates.map((p): PublicPage => ({
    path: `/work/${p.slug}/`, title: p.title, section: 'Work', updated: '2026-09-24', summary: p.summary,
  })),
  { path: '/method/', title: 'Method', section: 'Main', updated: REVISED,
    summary: 'How a Statecraft Systems build runs: one conversation, working versions reviewed in rounds, a written handover at launch, then the client or Statecraft Systems runs it.' },
  { path: '/operating-records/', title: 'Operating records', section: 'Main', updated: QUICK_ANSWER_DATE,
    summary: 'Help for companies deciding whether to license their operating records for AI training: which records qualify, which must stay private, and what the terms mean.' },
  { path: '/practice/', title: 'Practice', section: 'Main', updated: REVISED,
    summary: 'About Statecraft Systems: what the name means, the three scales it works at (person, institution, network), the thesis behind the work, and who does it.' },
  { path: '/thesis/', title: 'Thesis', section: 'Main', updated: REVISED,
    summary: 'Ten propositions on good rule. It is scarce, it does not maintain itself, and it lasts only where a structure carries it.' },
  { path: '/disciplines/', title: 'Disciplines', section: 'Main', updated: REVISED,
    summary: 'The four bodies of work the practice draws on: structural dynamics (Robert Fritz), natural law (Curt Doolittle), currency design (Arthur Brock) and operative traditions (Miguel Angel Fernandez).' },
  { path: '/contact/', title: 'Contact', section: 'Main', updated: REVISED,
    summary: 'Write to Statecraft Systems. Moritz Bierling replies. Includes answers to common questions.' },
  { path: '/support/', title: 'Support', section: 'Details', updated: '2026-10-14',
    summary: 'How Statecraft Systems clients get help: contact, response times and billing.' },
  { path: '/terms/', title: 'Terms', section: 'Details', updated: '2026-10-14',
    summary: "Terms of service for Statecraft Systems website work and care plans: what's included, third-party costs, billing, cancellation and ownership." },
  { path: '/privacy/', title: 'Privacy', section: 'Details', updated: '2026-10-14',
    summary: 'What data Statecraft Systems keeps for outreach, client websites, form submissions and billing, why, and how to reach us.' },
];

export const absolute = (path: string) => new URL(path, SITE_URL).href;
