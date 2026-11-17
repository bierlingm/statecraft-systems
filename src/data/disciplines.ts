// The four bodies of work the practice draws on. Each is credited to the person
// who worked it out and linked to its source. Rules for this file:
// - `ideas` restate the source in plain words. A quotation is exact, was checked
//   against the page it comes from, and says where that is.
// - `use` is what Statecraft Systems does with it, and only things the site
//   shows elsewhere (the method, the terms, a build). `use.text` may hold links.
// - `leave` says where our use stops, so that nobody mistakes us for the source.
// See src/content/brand.md.

export type DisciplineSlug = 'structural-dynamics' | 'natural-law' | 'currency-design' | 'operative-traditions';

export interface Idea {
  term: string;
  text: string[];
  quote?: { text: string; cite: string; href?: string };
}

export interface Sheet {
  title: string;
  note: string;
  rows: { k: string; b?: string; v?: string; mark?: boolean }[];
  foot: string;
  link?: { href: string; label: string };
}

/** A legend entry: `g` is the mark it explains (a number, or the name of a drawn shape). */
export interface Key {
  g: string;
  t: string;
}

export interface Discipline {
  slug: DisciplineSlug;
  name: string;
  by: string;
  /** The question it puts to a piece of work. */
  asks: string;
  /** For the index, feeds and descriptions. */
  summary: string;
  lede: string;
  facts: { k: string; v: string; href?: string }[];
  figure: { title: string; em: string; caption: string; label: string; legend: Key[] };
  ideas: Idea[];
  use: { lead: string; text: string[] };
  sheet: Sheet;
  thesis: { n: string; title: string }[];
  leave: string[];
  sources: { title: string; meta: string; note: string; href?: string }[];
}

const NLI = 'https://naturallawinstitute.com';
const NLI_METHOD = { cite: 'Natural Law Institute, The Method of Universal Decidability', href: `${NLI}/method/` };
const AB = 'https://www.artbrock.com';
const AB_RECORDS = { cite: 'Arthur Brock, Currencies are Records of Currents, 2020', href: `${AB}/2020/07/29/currencies-are-records-of-currents` };
const AB_CH6 = `${AB}/2014/11/21/designing-social-flows-chapter-6-on-designing-incentives`;
const MAF_INTRO = {
  cite: 'Miguel A. Fernandez, introduction to the 2020 edition',
  href: 'https://thesolarwarrior.com/wp-content/uploads/2025/07/Operative-Traditions-Introduction.pdf',
};
const RF = 'https://www.robertfritz.com/wp';
const RF_STRUCTURES = { cite: 'Robert Fritz, Thinking in Structures, 2015', href: `${RF}/thinking-in-structures/` };
const MANTICORE = 'https://manticore.press/product/operative-traditions/';

export const disciplines: Discipline[] = [
  {
    slug: 'structural-dynamics',
    name: 'Structural dynamics',
    by: 'Robert Fritz',
    asks: 'What is wanted, and what is there now?',
    summary:
      'Robert Fritz’s account of why some efforts last and others are undone. The underlying structure of a situation decides how it behaves, and results that last come from the tension between what is wanted and what is there now.',
    lede:
      'Robert Fritz began as a composer and a teacher of composition, and has taught the creative process for more than forty years. He found that many of his students made progress and later lost it. His explanation is that the underlying structure of a situation decides how it behaves.',
    facts: [
      { k: 'Worked out by', v: 'Robert Fritz' },
      { k: 'First set out in', v: 'The Path of Least Resistance, 1984, revised 1989' },
      { k: 'For organisations', v: 'Corporate Tides, 1996, and The Path of Least Resistance for Managers, 1999' },
      { k: 'Source', v: 'robertfritz.com', href: `${RF}/` },
    ],
    figure: {
      title: 'Oscillate',
      em: 'or advance.',
      caption:
        'On the first line a problem prompts action, the action eases the problem, and the action stops. On the second the same effort is aimed at a wanted result and continues until it gets there.',
      label: 'Two lines. On the first a marker swings back and forth between two points. On the second a marker travels from one end to the other.',
      legend: [],
    },
    ideas: [
      {
        term: 'Structure',
        text: [
          'Fritz’s first courses taught people to set goals and reach them. Most did. When he followed them over time, many had lost what they had gained. He looked for what separated the people who kept their progress from the people who lost it, and he concluded that it was the structure they were in. Attitude and effort did not explain the difference.',
          'By structure he means how the parts of a situation relate to one another, such as what a person wants, what they believe and what is true at present. Water goes where it is easiest to go, and the riverbed decides where that is. He says behaviour follows structure in the same way.',
        ],
        quote: { text: 'the underlying structure of anything will determine its behavior', ...RF_STRUCTURES },
      },
      {
        term: 'Oscillation and advancement',
        text: [
          'He found two patterns. In an oscillating structure, progress is followed by a reversal that brings things back to where they started. His examples from companies are building capacity and then cutting it, and centralising decisions and then decentralising them again. In an advancing structure each success becomes the base for the next.',
          'Which pattern appears depends on the structure. An oscillating structure still produces successes, and then it loses them.',
        ],
        quote: { text: 'When you are in a rocking chair, you will go back and forth. That is the nature of the structure.', ...RF_STRUCTURES },
      },
      {
        term: 'Structural tension',
        text: [
          'The structure that advances has two parts. One is a result you want, and the other is a clear view of what exists now in relation to it. The difference between them is a tension, and a tension tends toward resolution, as it does in a piece of music.',
          'Fritz is careful to say that this tension is a fact about the structure. It is not stress or pressure. While both ends are kept accurate, action goes toward closing the gap.',
        ],
        quote: {
          text: 'The right structure is structural tension, the tension formed between the desired state in relationship to its current state. What you want, and what you have.',
          cite: 'Robert Fritz, It’s Not About Having The “Right” Attitude!, 2020',
          href: `${RF}/the-right-attitude/`,
        },
      },
      {
        term: 'Structural conflict',
        text: [
          'Oscillation comes from two tensions that cannot both be resolved. Fritz’s plain example is hunger and weight. Being hungry is resolved by eating, and being overweight is resolved by not eating, so each resolution brings the other tension back. A person or a company caught between two such tensions moves toward one and then toward the other.',
          'He holds that a structure of this kind cannot be repaired. It can only be left for a different structure, one built on a wanted result.',
        ],
      },
      {
        term: 'Creating and problem solving',
        text: [
          'Fritz separates two kinds of action. Solving a problem is acting to make something go away. Creating is acting to bring something into being. A problem that has been eased no longer drives anyone to act, which is one way an oscillation begins.',
        ],
        quote: {
          text: 'We can solve all of our problems and still not have created what we want.',
          cite: 'Robert Fritz, A Case For Democracy, 2019',
          href: `${RF}/a-case-for-democracy/`,
        },
      },
      {
        term: 'Current reality',
        text: [
          'The second end of structural tension is harder to hold than it sounds. It asks for a description of what is there, without softening it or making it worse and without a story about why. Fritz trains consultants to picture exactly what a client has said, and to ask about whatever is missing from the picture or contradicts it.',
        ],
        quote: {
          text: 'You can’t play the violin in tune if you can’t hear the pitch.',
          cite: 'Robert Fritz, Thinking in Pictures, 2024',
          href: `${RF}/thinking-in-pictures/`,
        },
      },
      {
        term: 'The chart',
        text: [
          'His working tool is the structural tension chart, which he describes in Your Life as Art and in The Path of Least Resistance for Managers. The wanted result is written at the top of a page and current reality at the bottom. The steps that lead from one to the other go between them, and each step gets a due date and a person accountable for it.',
          'Any step can become the result at the top of a chart of its own. He calls this telescoping.',
        ],
      },
    ],
    use: {
      lead: 'Each build starts by writing down what should happen and what happens now, and every version is checked against both.',
      text: [
        'The first conversation of a build asks what happens now and what should happen instead. Those are the two ends of structural tension, and the difference between the answers is what we build.',
        'We describe the present as it is. In the <a class="inline" href="/work/direct-booking">direct booking build</a> that meant writing down that the house could be booked only through the listing sites, which set the terms and took a share of every stay.',
        'Each working version is a dated step, and the project room keeps the list. The build ends when the client signs off on a version as the one they asked for.',
      ],
    },
    sheet: {
      title: 'One build, set out as a structural tension chart',
      note: 'Direct booking, 2026',
      rows: [
        { k: 'Result', v: 'The owners take bookings on a site of their own, with no second calendar to keep in their heads.', mark: true },
        { k: '28 Sep', v: 'Launched.' },
        { k: '22 Sep', v: 'Ready to launch, with live calendars from the listing sites.' },
        { k: '15 Sep', v: 'Guests can pick dates on the home page.' },
        { k: '14 Sep', v: 'Booking added, with request, quote and payment.' },
        { k: '11 Sep', v: 'The real house, from the photographs on its listing.' },
        { k: '7 Sep', v: 'A first concept, with stand-in photographs.' },
        { k: 'Reality', v: 'The house can be booked only through the listing sites. They set the terms and take a share of every stay.' },
      ],
      foot: 'Fritz’s chart, filled in from the record of one build. It reads from the bottom up.',
      link: { href: '/work/direct-booking', label: 'See the build' },
    },
    thesis: [
      { n: 'IV', title: 'Structure is what lasts.' },
      { n: 'V', title: 'Look before building.' },
      { n: 'VI', title: 'A structure advances or oscillates.' },
    ],
    leave: [
      'Fritz’s first subject is a person’s own life and the orientation of the person living it. We use the structural part on jobs for clients, which means the wanted result, the present as it is and the steps between them. We do not coach people or advise them on their lives.',
      'A chart for a booking site is a small use of a large idea. Fritz applies the same analysis to whole companies, where it explains why a firm builds capacity and then cuts it. The builds on this site do not reach that far.',
      'Fritz and his instructors teach this work and certify structural consultants. This page is a reader’s summary of it, and anyone who wants to learn the work should go to them.',
    ],
    sources: [
      { title: 'The Path of Least Resistance', meta: '1984, revised 1989', note: 'The first and best-known book. It sets out structure, structural tension and structural conflict for a person’s own life.', href: `${RF}/shop/` },
      { title: 'Creating', meta: '1991', note: 'The creative process in more detail.' },
      { title: 'Corporate Tides', meta: '1996', note: 'The same analysis applied to organisations, with the rocking chair and the car as its two images.' },
      { title: 'The Path of Least Resistance for Managers', meta: '1999', note: 'How to design an organisation that advances, with the structural tension chart as its working tool.' },
      { title: 'Your Life as Art', meta: '2003', note: 'The chart used for a person’s own projects, and what drives people to create.' },
      { title: 'The Underlying Structure', meta: 'Essay, 2018', note: 'A short essay by Fritz, and the quickest introduction online.', href: `${RF}/the-underlying-structure/` },
      { title: 'Thinking in Structures', meta: 'Essay, 2015', note: 'Oscillation and advancement in people and in organisations.', href: `${RF}/thinking-in-structures/` },
      { title: 'Principles', meta: 'Robert Fritz Inc.', note: 'The company’s own short statement of the principles.', href: `${RF}/principles/` },
    ],
  },
  {
    slug: 'natural-law',
    name: 'Natural law',
    by: 'Curt Doolittle',
    asks: 'Can this claim be decided, and who bears its costs?',
    summary:
      'The Natural Law Institute’s method for stating a claim so that it can be tested and decided, with a test of reciprocity for dealings between people. The work is led by Curt Doolittle.',
    lede:
      'Curt Doolittle leads the research of the Natural Law Institute, which dates its founding to 2012. The institute calls its subject decidability. That means finding the strongest answer the available record supports and saying what would change it. We use its tests on the claims and agreements in our own work.',
    facts: [
      { k: 'Worked out by', v: 'Curt Doolittle and the fellows of the institute' },
      { k: 'Institute', v: 'Natural Law Institute', href: `${NLI}/institute/` },
      { k: 'State of the work', v: 'Volumes in progress. The method page was last revised in July 2026.' },
      { k: 'Earlier name', v: 'Propertarianism, which now names one part of it' },
      { k: 'Our connection', v: 'Moritz Bierling leads outreach for the institute.' },
    ],
    figure: {
      title: 'A claim and',
      em: 'its tests.',
      caption:
        'A claim is fixed as one proposition and put through six tests in order. The institute’s rule is that passing one test cannot make up for failing another.',
      label: 'A person makes a claim. The claim passes through six gates and arrives as something that can be relied on.',
      legend: [
        { g: '1', t: 'Identity and existence' },
        { g: '2', t: 'Testifiability and causality' },
        { g: '3', t: 'Authority and lawfulness' },
        { g: '4', t: 'Reciprocity and accounting' },
        { g: '5', t: 'Possibility and consequence' },
        { g: '6', t: 'Warranty and limits' },
      ],
    },
    ideas: [
      {
        term: 'Decidability',
        text: [
          'A question is decidable when the record in front of you is enough to settle it. The method looks for the strongest answer that record supports, the reason a stronger answer fails, and the change that would require the answer to be worked out again.',
          'It does not promise that every question has an answer. A claim comes out in one of four classes. It is warranted under stated conditions, certainly false, undecidable for now because something obtainable is missing, or undecidable in principle.',
        ],
        quote: { text: 'The answer must say what would change it', ...NLI_METHOD },
      },
      {
        term: 'One claim at a time',
        text: [
          'The procedure has five steps. Fix one proposition. List every fact, meaning and authority it depends on. Show the sequence by which those conditions produce the result. Say what observation would show it to be wrong. Then classify it.',
          'The third step carries the institute’s older idea of operational language. A claim is stated as actions and their consequences, the way a recipe is, so that someone else can follow it and see whether they get the same result.',
        ],
        quote: {
          text: 'State one proposition precisely enough that proving or defeating it changes the available conclusion or action.',
          ...NLI_METHOD,
        },
      },
      {
        term: 'Six tests',
        text: [
          'The claim then has to survive six tests, which are listed beside the figure above. Each asks for its own kind of record. The first asks whether the terms are unambiguous, and the second whether a sequence of actions connects the act to the result. The third asks who has the authority to decide.',
        ],
        quote: {
          text: 'A citation cannot supply a missing fact. Institutional authority cannot repair causality. A desired remedy cannot demonstrate injury.',
          ...NLI_METHOD,
        },
      },
      {
        term: 'Reciprocity',
        text: [
          'The fourth test asks who gains and who pays. The benefits, costs, risks and side effects of an arrangement are each assigned to a named person. A demonstrated interest is whatever a person has borne a cost to obtain or keep.',
          'The institute’s earlier writing gives the rule behind the test. Dealings should be productive, fully informed, warrantied and voluntary, and should not put costs on people who are outside them.',
        ],
        quote: { text: 'Which demonstrated interests change, who bears the costs, and which externalities remain?', ...NLI_METHOD },
      },
      {
        term: 'Warranty',
        text: [
          'The last test concerns the person making the claim. A conclusion states its conditions, its scope and what would defeat it, and the person who gives it stands behind it within those limits. The institute describes its own results in the same way.',
        ],
        quote: {
          text: 'The method does not promise a favorable answer. It identifies the strongest answer the declared record warrants—and no stronger.',
          ...NLI_METHOD,
        },
      },
    ],
    use: {
      lead: 'We write terms and proposals as actions with dates and amounts, so that a client can check each one against what happened.',
      text: [
        'A sentence such as “we provide ongoing support” cannot be tested. Our terms say that we reply within two business days, and the same or the next business day if a site is down.',
        'The reciprocity test is why the terms run in both directions. Either side can cancel the care plan with 30 days’ notice, each side’s liability has the same limit, and a new cost over $25 needs the client’s OK before we buy anything.',
        'The same idea shapes what we build. In the <a class="inline" href="/work/clinical-intake">clinical intake build</a> a fixed protocol chooses the questions, so the same answers always produce the same path. The decision about treatment stays with the physician, who is the person answerable for it.',
      ],
    },
    sheet: {
      title: 'Terms, written as actions',
      note: 'From our terms',
      rows: [
        { k: 'Reply', b: 'Within two business days.', v: 'The same or the next business day if a site is down.' },
        { k: 'New costs', b: 'Any new cost over $25 needs your OK first.', v: 'Domains and tools are passed through at cost, with the receipt.' },
        { k: 'Prices', b: 'No change without 30 days’ written notice.' },
        { k: 'Larger work', b: 'A short written quote comes first.', v: 'Nothing is charged until you approve it.' },
        { k: 'Leaving', b: 'Either side can cancel with 30 days’ written notice.', v: 'You keep the domains, content, data and every account.' },
        { k: 'Liability', b: 'The same limit for each side.', v: 'It is the fees paid in the previous three months.' },
      ],
      foot: 'Each line names an action, an amount or a time, and who has to agree.',
      link: { href: '/terms', label: 'Read the terms' },
    },
    thesis: [
      { n: 'VII', title: 'Reciprocity holds it together.' },
      { n: 'IX', title: 'Sovereignty has to be built.' },
    ],
    leave: [
      'The institute’s research programme is far wider than this page. Its volumes in progress cover language, human behaviour, law, history and religion. We use the method for testing a claim and the test of reciprocity, on the claims and agreements in our own work. This page describes nothing else and takes no position on the rest.',
      'The name can mislead. This is a different body of work from natural law in the classical or Thomist sense. The institute describes its volumes as editorial work in progress until they are formally published, so every quotation here comes from its current method page, which is dated.',
      'We are not lawyers, and the institute says of itself that it is not a law firm. The tests help us write terms that can be read and checked. They do not replace legal advice.',
      'Statecraft Systems is a separate company from the institute, where Moritz Bierling leads outreach. Nothing on this site speaks for the institute.',
    ],
    sources: [
      { title: 'The Method of Universal Decidability', meta: 'Revised July 2026', note: 'The institute’s current statement of the method, with its five steps, six tests and four classes of answer. Every quotation on this page comes from it.', href: `${NLI}/method/` },
      { title: 'The Natural Law Institute', meta: 'Institute', note: 'What the institute is, what it offers and what it does not do.', href: `${NLI}/institute/` },
      { title: 'Research programme', meta: 'In progress', note: 'The planned volumes, from the introduction to the volumes on law, history and religion.', href: `${NLI}/research-program/` },
      { title: 'curtdoolittle.com', meta: 'Author', note: 'Doolittle’s own site, with his account of his career and of the state of each volume.', href: 'https://curtdoolittle.com/' },
    ],
  },
  {
    slug: 'currency-design',
    name: 'Currency design',
    by: 'Arthur Brock',
    asks: 'What moves here, and what record is kept of it?',
    summary:
      'Arthur Brock’s account of currencies as records of flows. Money is one kind, and grades, tickets, medals and ratings are others. Each one is designed, and the design decides what a group of people can see.',
    lede:
      'Arthur Brock has designed currency systems since the early 2000s. He works in the MetaCurrency Project and started Holochain with Eric Harris-Braun. He treats a currency as a record of something that moved, and its design as a decision about what a group of people can see.',
    facts: [
      { k: 'Worked out by', v: 'Arthur Brock' },
      { k: 'Starting point', v: '2001, on reading Bernard Lietaer’s The Future of Money' },
      { k: 'Later work', v: 'Ceptr and Holochain, with Eric Harris-Braun' },
      { k: 'Source', v: 'artbrock.com', href: AB },
    ],
    figure: {
      title: 'A flow and',
      em: 'its record.',
      caption:
        'Something passes between two people and is over. The currency is the entry made for it. Whoever designs the currency decides which passings get an entry and who may write it.',
      label: 'Two people with something passing between them. Below them is a row of cells, and the passing is entered in one of them.',
      legend: [
        { g: 'circle', t: 'A person' },
        { g: 'dot', t: 'What passes between them' },
        { g: 'cell', t: 'The entry made for it' },
        { g: 'row', t: 'The record so far' },
      ],
    },
    ideas: [
      {
        term: 'Records of currents',
        text: [
          'A flow happens in a moment and is gone. If you were not there when the service was done or the goods changed hands, the only dependable way to know that it happened is the record kept of it.',
          'Brock’s definition follows from that. Currencies are “formal symbol systems which shape, enable and measure currents”.',
        ],
        quote: { text: 'We use currencies to keep records of currents.', ...AB_RECORDS },
      },
      {
        term: 'More than money',
        text: [
          'Money is one member of a large family. Brock’s own list includes “buy 9 get 10th free” cards, school grades, postage stamps, hotel stars, movie tickets, frequent flier miles, Olympic gold medals and golf handicaps. He says they are all the same kind of thing, each targeted to a purpose.',
        ],
        quote: {
          text: 'Currency should NOT be equated with money. Monetary currencies are a small part of a much larger framework.',
          cite: 'Targeted Currencies, Vision',
          href: `${AB}/targeted-currencies/vision`,
        },
      },
      {
        term: 'Current-see',
        text: [
          'Brock reads the word as “current-see”. An organisation can act only on what it can see, and it sees through its currencies. A university sees its students through grades, credits and degrees. A state sees its citizens through certificates and numbers.',
        ],
        quote: { text: 'The design of the currency makes certain things visible and leaves others invisible.', ...AB_RECORDS },
      },
      {
        term: 'A currency shapes behaviour',
        text: [
          'People act toward what is recorded. Brock’s example is the Olympic medal, whose value does not come from the metal. A currency also brings side markets with it. Grades create the market for tutors, and event tickets create scalpers.',
        ],
        quote: {
          text: 'The possibility of winning a Gold Medal shapes the flow of participation of millions of athletes all over the world.',
          ...AB_RECORDS,
        },
      },
      {
        term: 'The design decisions',
        text: [
          'Brock mapped the decisions a designer has to make. For the token they cover how it is issued and by whom, how it may change hands, how it relates to other currencies and how it ends. A second set covers the whole system, from the problem it targets to how it is governed and closed.',
          'He observes that most arguments about currency concern only who issues it and whether balances bear interest. Some currencies should never change hands at all. A degree or a rating is earned and kept.',
        ],
        quote: {
          text: 'You do not spend or trade reputation. Once you earn it, it is yours.',
          cite: 'Arthur Brock, Reputation is Orthogonal to Exchange, 2014',
          href: `${AB}/2014/11/16/reputation-is-orthogonal-to-exchange`,
        },
      },
      {
        term: 'Start from the flow',
        text: [
          'His first advice to designers is to forget about money and look for the flow that is not working. A working group at Occupy Wall Street wanted to print its own bills. The trouble people were having was noise at night, and nobody could tell how widespread it was.',
          'Brock and his colleagues suggested coffee beans. At breakfast each person drops a bean into a jar with a red, yellow or green lid to show how they slept.',
        ],
        quote: {
          text: 'Each day there would be a clearly visible indicator of this particular aspect of well-being in the community for all to see.',
          cite: 'Arthur Brock, Designing Social Flows, chapter 6, 2014',
          href: AB_CH6,
        },
      },
    ],
    use: {
      lead: 'For each build we decide what gets recorded, who may enter it and who can see it.',
      text: [
        'The booking calendar in the <a class="inline" href="/work/direct-booking">direct booking build</a> is a currency in Brock’s sense. Nights at the house are the flow. Before the build, the record of them was split across the listing sites. One calendar now covers the owners’ site and the listing sites, so a night cannot be sold twice.',
        'The request inbox in the <a class="inline" href="/work/trade-enquiries">trade enquiries build</a> does the same for requests from contractors. The project room does it for the build itself. Each version is dated, and each answer a client gives is listed with what we did about it.',
      ],
    },
    sheet: {
      title: 'A booking calendar, read as a currency',
      note: 'Direct booking, 2026',
      rows: [
        { k: 'What moves', v: 'Nights at the house, and guests’ requests for them.' },
        { k: 'The record', v: 'One calendar for the owners’ site and the listing sites.' },
        { k: 'Who enters', v: 'A guest asks. An owner accepts, and later confirms the payment.' },
        { k: 'Who sees', v: 'Guests see which nights are open. The listing sites read the calendar through a link. The owners see every request.' },
        { k: 'How it ends', v: 'A hold that is not paid for lapses by itself, and the dates go back on sale.' },
      ],
      foot: 'The rows follow Brock’s map of design decisions.',
      link: { href: '/work/direct-booking', label: 'See the build' },
    },
    thesis: [{ n: 'VII', title: 'Reciprocity holds it together.' }],
    leave: [
      'Currency design was made for communities and for networks of organisations. What this site shows is much smaller, such as a calendar, an inbox and a record of decisions. We have no finished work at the larger scale to show yet.',
      'This is not cryptocurrency. Brock’s work on currencies began years before Holochain, and Holochain is not a blockchain. The builds on this site use neither, and we issue no tokens.',
      'Not everything is a currency. In Brock’s terms attention and trust are flows, and a currency is the formal record that makes one of them visible. We use the word only where such a record exists.',
    ],
    sources: [
      { title: 'Currencies are Records of Currents', meta: '2020', note: 'The shortest statement of the idea, and the place to start.', href: AB_RECORDS.href },
      { title: 'Designing Social Flows, chapter 6', meta: '2014', note: 'The longest introduction, with Brock’s advice to designers and several worked examples.', href: AB_CH6 },
      { title: 'Intro to Currency Design', meta: '2017', note: 'A script written with Ferananda Ibarra. It sets out the life cycle of a token and of a currency system.', href: `${AB}/2017/02/27/intro-to-currency-design` },
      { title: 'Currency design decisions', meta: '2008, reissued 2020', note: 'Brock’s map of everything a currency designer has to decide.', href: `${AB}/docs/open_currency_map_2020_10.md` },
      { title: 'Reputation is Orthogonal to Exchange', meta: '2014', note: 'Why a reputation currency should not be built like money.', href: `${AB}/2014/11/16/reputation-is-orthogonal-to-exchange` },
      { title: 'The MetaCurrency Project', meta: 'Project', note: 'The group Brock works in, with its own questions and answers on currency and wealth.', href: 'https://metacurrency.org/' },
    ],
  },
  {
    slug: 'operative-traditions',
    name: 'Operative traditions',
    by: 'Miguel A. Fernandez',
    asks: 'Who knows how this is done, and how does the next person learn it?',
    summary:
      'Miguel A. Fernandez’s book on the knowledge that exists in the doing of a craft, and on technique as something that forms the person who practises it.',
    lede:
      'Miguel A. Fernandez is an industrial engineer and an independent writer. His book Operative Traditions, published in 2017, is about the kind of knowledge that exists only in doing a thing, and about what the practice of a technique does to the person who practises it.',
    facts: [
      { k: 'Worked out by', v: 'Miguel A. Fernandez' },
      { k: 'Book', v: 'Operative Traditions, Manticore Press, 2017', href: MANTICORE },
      { k: 'Later edition', v: 'Four volumes, published by the author in 2020' },
      { k: 'The word', v: 'From the operative masons, who built in stone' },
    ],
    figure: {
      title: 'The work and',
      em: 'the worker.',
      caption:
        'A person works on a thing, which is the white arrow. Fernandez writes about the second arrow, which is what practising the technique does to the person.',
      label: 'A person and the thing they work on. One arrow runs from the person to the thing, and a second arrow returns from the thing to the person.',
      legend: [
        { g: 'circle', t: 'The person' },
        { g: 'square', t: 'The thing worked on' },
        { g: 'line', t: 'What the person does to the thing' },
        { g: 'aline', t: 'What the practice does to the person' },
      ],
    },
    ideas: [
      {
        term: 'Operative',
        text: [
          'Fernandez sets operative knowledge against the conceptual kind. It is gained at first hand, through the senses and through work, and it has effects on the world even where it cannot be fully put into words.',
          'The word has a history. The operative masons were the ones who built in stone. The lodges that formed a grand lodge in London in 1717 are called speculative, because their members kept the masons’ tools as symbols and did not build.',
        ],
        quote: { text: 'this type of knowledge is neither conceptual nor dialectical, but operative', ...MAF_INTRO },
      },
      {
        term: 'Technique forms the person',
        text: [
          'The publisher gives the book’s subject as technique and “its importance as a key factor for spiritual development”. Fernandez reads three earlier works for it. They are Julius Evola’s theory of the absolute individual, Eugen Herrigel’s Zen in the Art of Archery and Ernst Jünger’s The Worker.',
          'Herrigel’s book is the most approachable of the three. It describes years of practice under a Japanese archery master, in which hitting the target matters less than what happens to the archer.',
        ],
        quote: {
          text: 'technique and its importance as a key factor for spiritual development',
          cite: 'Manticore Press, description of the book',
          href: MANTICORE,
        },
      },
      {
        term: 'Means and meaning',
        text: [
          'His criticism of the present is that tools and methods have multiplied while the question of what they are for has dropped away. He takes this from Jacques Ellul. An operative discipline, in his words, tries “to progressively relate to the meaning of the means”. Modern technology, as he describes it, attends to the means alone and aims at efficiency.',
        ],
        quote: { text: 'a modern society where means have defeated meanings', ...MAF_INTRO },
      },
      {
        term: 'Works before words',
        text: [
          'Fernandez asks to be judged by what is made. He calls his path one “where works speak louder than words”, and he describes the culture of the medieval guilds as one that existed only so far as it was built.',
        ],
        quote: { text: 'culture can only exist to the extent it can be artistically built', ...MAF_INTRO },
      },
    ],
    use: {
      lead: 'We learn a job from the person who does it, and we hand over a system that its owner can run.',
      text: [
        'A description of a job leaves out much of what the person doing it knows. That is why the first conversation of a build is with the person who does the work now. It is also why each round of review is a working version that the client can use on a phone.',
        'In working sessions a person builds tools for their own work on their own computer, and we teach them to keep going without us.',
        'At launch we write down how everything runs and which steps belong to the owner. A system lasts while somebody knows how to run it and what it is for.',
      ],
    },
    sheet: {
      title: 'What the client does at each stage',
      note: 'From the method',
      rows: [
        { k: 'Talk', b: 'You talk to us once.', v: 'If someone else does the work day to day, you bring them.' },
        { k: 'Build', b: 'You comment on each working version.', v: 'You answer the questions you can. All of it works on a phone.' },
        { k: 'Launch', b: 'You sign off on the version you want live.', v: 'You get a written account of how it runs.' },
        { k: 'Run', b: 'You run it yourself, or you tell us what should change.', v: 'An email or a text is enough.' },
      ],
      foot: 'These are the “Your part” lines of the method page.',
      link: { href: '/method', label: 'How a build runs' },
    },
    thesis: [{ n: 'X', title: 'A tradition is a structure that teaches.' }],
    leave: [
      'We have taken one distinction and one claim from this book. The distinction is between knowing about a thing and knowing how to do it, and the claim is that technique forms the person. The book goes much further, into alchemy, metaphysics and a critique of modern science, and we do not follow it there.',
      'Two of the authors it reads, Julius Evola and Ernst Jünger, are known for their politics as well as their writing. The publisher’s description says both “have been labeled politically as proponents of the so-called ‘conservative revolution’”. We take from the book what it says about craft and practice, and nothing on politics.',
      'The quotations on this page come from the publisher’s description of the 2017 book and from the author’s introduction to his 2020 edition. Each one says which.',
      'On the history we follow the usual account, in which lodges admitted members who were not masons from the 1600s onward. Fernandez treats 1717 as a sharper break than that.',
    ],
    sources: [
      { title: 'Operative Traditions', meta: 'Manticore Press, 2017', note: 'The book, 368 pages. The publisher’s page carries a full description of it.', href: MANTICORE },
      { title: 'Introduction to Operative Traditions', meta: 'Author’s edition, 2020', note: 'Twelve pages in which Fernandez introduces his later four-volume edition. Most quotations on this page come from it.', href: MAF_INTRO.href },
      { title: 'thesolarwarrior.com', meta: 'Author', note: 'Fernandez’s own site, with the four volumes and his other writing.', href: 'https://thesolarwarrior.com/operative-traditions-series/' },
      { title: 'Zen in the Art of Archery', meta: 'Eugen Herrigel, 1948', note: 'The most approachable of the three works the book reads. The English translation appeared in 1953.' },
      { title: 'History of Freemasonry', meta: 'United Grand Lodge of England', note: 'The grand lodge’s own account of 1717 and of the speculative masons before it.', href: 'https://www.ugle.org.uk/discover-freemasonry/history-freemasonry' },
    ],
  },
];

export const bySlug = (slug: string) => disciplines.find((d) => d.slug === slug);
