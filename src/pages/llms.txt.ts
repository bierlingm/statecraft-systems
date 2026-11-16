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

> Statecraft Systems builds the working parts of small institutions: intake for a clinic, booking for a house, enquiries for a supplier. It is the practice of Moritz Bierling, run as Statecraft Systems LLC, a US company.

Last updated: ${REVISED}

- What it does: designs and builds intake, booking, enquiries and the systems behind them, with the people who run the place. Each version is reviewed on the real page, and the result is built to keep working after we step back.
- How a build runs: one conversation with the person who does the work; a working version at a real address, built in rounds; a launch written down so that someone else could carry it; then the client runs it, or Statecraft Systems keeps it running. A small site takes one to three weeks, end to end.
- Two scales of work: the person (working sessions for founders and their teams, building real tools on their own devices and workflows); the institution (its working parts, built in rounds, then run by the client or kept running by Statecraft Systems).
- Thesis, in one line: good rule is scarce, does not maintain itself, and endures only through structures built to carry it. It rests on four disciplines: structural dynamics (Robert Fritz), natural law (Curt Doolittle), currency design (Arthur Brock) and operative traditions (Miguel Angel Fernandez).
- What clients keep: their domains, content, data and accounts, set up under an address they control, whether or not Statecraft Systems stays involved.
- Recent work (clients are described, not named): direct booking for a family-owned vacation rental; clinical intake for a cash-pay telemedicine practice; trade enquiries for a regional jobsite-supply wholesaler; a one-page airline-miles donation ask for a child-recovery nonprofit.
- Operating records: helps companies decide whether to license their operating records to buyers that license data for AI training, with consent, an inventory and clear boundaries.
- Contact: m@statecraft.systems. The reply comes from the person who would build it. Client support: contact@statecraft.systems.

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
