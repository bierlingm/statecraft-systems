import type { APIRoute } from 'astro';
import { publicPages, absolute, REVISED } from '../data/site';

// Plain summary for AI assistants (https://llmstxt.org). Facts only from the site itself.
// Project rooms are never listed here.
export const GET: APIRoute = () => {
  const section = (name: string) =>
    publicPages
      .filter((p) => p.section === name)
      .map((p) => `- [${p.title}](${absolute(p.path)}): ${p.summary}`)
      .join('\n');

  const body = `# Statecraft Systems

> Statecraft Systems builds the working parts of small institutions, such as patient intake for a clinic or direct booking for a rental house. It is the practice of Moritz Bierling, run as Statecraft Systems LLC, a US company.

Last updated: ${REVISED}

- What it does: designs and builds intake, booking and enquiry systems with the people who use them. The client reviews every version and owns the result.
- How a build runs: (1) one conversation with the person who does the work now; (2) working versions reviewed in a project room, a private page holding the current draft, the proposal with a one-time fee, the questions, and a dated record of every version and decision; (3) launch when the client signs off, with a written account of how everything runs; (4) the client runs it, or Statecraft Systems runs it on a monthly care plan that either side can cancel with 30 days' written notice. A small site takes one to three weeks. The direct booking build took 22 days: nine reviewed versions and the launch.
- Services: a build (a booking site, an intake form, an enquiry inbox or a single page); care (a monthly plan that keeps a site online and secure and covers small changes); working sessions (for one person or a small team, building tools for their own work on their own computers); a records review (deciding whether to license operating records for AI training).
- About the company: statecraft is an old word for the craft of ruling well, applied here at three scales (person, institution, network). The thesis in one line: good rule is scarce, does not maintain itself, and lasts only where a structure carries it. Disciplines: structural dynamics (Robert Fritz), natural law (Curt Doolittle), currency design (Arthur Brock) and operative traditions (Miguel Angel Fernandez).
- What clients keep: their domains, content, data and accounts, set up under an address they control, whether or not Statecraft Systems stays involved.
- Recent work (clients are described without being named): direct booking for a family-owned vacation rental; clinical intake for a cash-pay telemedicine practice; trade enquiries for a regional jobsite-supply wholesaler; a one-page airline-miles donation ask for a child-recovery nonprofit.
- Operating records: helps companies decide whether to license their operating records to buyers that license data for AI training, with consent, an inventory and clear boundaries.
- Contact: m@statecraft.systems. Moritz Bierling replies. Client support: contact@statecraft.systems.

## Main

${section('Main')}

## Work

${section('Work')}

## Optional

${section('Details')}
- [JSON feed of these pages](${absolute('/feed.json')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
