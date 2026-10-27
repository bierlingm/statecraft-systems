// prosserhorsehotel-site: serves prosserhorsehotel.com from the statecraft-systems Pages project.
// Content lives in the repo at public/prosserhorsehotel/ (draft in preview/, client room at the folder root);
// pushing to master updates both statecraft.systems and this domain. No separate build.
//   https://www.prosserhorsehotel.com/*      -> 301 https://prosserhorsehotel.com/*
//   /api/prosserhorsehotel/*                 -> statecraft.systems (prosserhorsehotel-intake Worker)
//   /room, /room/*                           -> 301 https://statecraft.systems/prosserhorsehotel/ (room lives on statecraft.systems)
//   /favicon.svg                             -> /favicon.svg
//   everything else                          -> /prosserhorsehotel/preview/*   (website draft)
// Draft stays noindex while INDEXABLE = false: X-Robots-Tag on every response, plus the pages' own meta robots.
// /robots.txt, /sitemap.xml, /llms.txt and /feed.json are generated here (they exist only on this domain, never on statecraft.systems). Asset caching: photos/social 30 days, other assets 1 day, HTML revalidates.
// GO-LIVE SWITCH: set to true (and redeploy) to allow indexing. It drops X-Robots-Tag, strips the pages'
// <meta name="robots" noindex> on the fly, and switches robots.txt from Disallow-all to the AI-search policy below
// (allow search/answer crawlers + Bingbot + Googlebot, block AI-training crawlers) with a Sitemap line.
const INDEXABLE = false;
const ORIGIN = 'https://statecraft-systems.pages.dev';
const SITE = 'https://prosserhorsehotel.com';
const PAGES = ['', 'boarding/', 'camping/', 'fifth-wheel/', 'gallery/', 'reservations/', 'contact/'];
const LASTMOD = '2026-10-27';
const API = 'https://statecraft.systems';

// AI-search policy (applies only when INDEXABLE = true). Search/answer crawlers in, training crawlers out.
const AI_SEARCH_ALLOW = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Claude-User', 'Bingbot'];
const AI_TRAINING_BLOCK = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'Applebot-Extended'];

// Facts below are copied from the pages in public/prosserhorsehotel/preview/ (supplied by the owners). Keep them in sync
// with the pages; never add anything that is not on the site. Update UPDATED/LASTMOD when page content changes.
const UPDATED = '2026-10-27';
const FEED_ITEMS = [
  { path: '', title: 'Prosser Horse Hotel · Overnight horse boarding, Prosser WA',
    summary: 'Overnight stop in Prosser, Washington for horses and the people hauling them: individual sheltered paddocks with water access, a riding arena, RV / living-quarters dry camping (no hookups) and one stationary fifth-wheel rental. Stays are requested; the owners confirm space and the final price.' },
  { path: 'boarding/', title: 'Horse boarding', rates: [['night', 35], ['week', 200], ['month', 350]], unit: 'per horse',
    summary: 'Overnight, weekly and monthly horse boarding in six individual paddocks with run-in shelters and water access. One horse trailer and tow vehicle included per boarding reservation. Monthly boarding is self-care.' },
  { path: 'camping/', title: 'RV / LQ dry camping', rates: [['night', 25], ['week', 150], ['month', 450]], unit: 'per space',
    summary: 'RV and living-quarters horse trailer dry camping. No electrical, sewer or RV water hookups. Horse boarding is reserved separately.' },
  { path: 'fifth-wheel/', title: 'Stationary fifth wheel', rates: [['night', 110], ['week', 650], ['month', 1350]], unit: 'for the fifth wheel',
    summary: 'One stationary fifth wheel for up to two adults, two children and two household pets ($20 per pet, per night). Horses are boarded separately in the paddocks.' },
  { path: 'reservations/', title: 'Rates & availability requests',
    summary: 'All base rates and an availability request. No instant booking: the owners confirm space and the final price. Taxes and other charges are still to be confirmed.' },
  { path: 'gallery/', title: 'Gallery',
    summary: 'Property photos: paddocks, run-in shelter, pipe fencing, the riding arena, red barn and a sunset over the pasture.' },
  { path: 'contact/', title: 'Contact & arrival',
    summary: 'Guest email hello@prosserhorsehotel.com. Prosser, Washington. Street address, phone, arrival times and directions from I-82 are not yet published.' },
];

function robotsTxt() {
  if (!INDEXABLE) return 'User-agent: *\nDisallow: /\n# Draft: not launched. Every response also carries X-Robots-Tag: noindex, nofollow.\n';
  return [
    '# AI search / answer crawlers and Bing: allowed',
    ...AI_SEARCH_ALLOW.map(a => `User-agent: ${a}`), 'Allow: /', 'Disallow: /api/', '',
    '# AI training crawlers: blocked',
    ...AI_TRAINING_BLOCK.map(a => `User-agent: ${a}`), 'Disallow: /', '',
    'User-agent: Googlebot', 'Allow: /', 'Disallow: /api/', '',
    'User-agent: *', 'Allow: /', 'Disallow: /api/', '',
    `Sitemap: ${SITE}/sitemap.xml`, '',
  ].join('\n');
}

function llmsTxt() {
  const rate = i => i.rates ? ` Base rates ${i.unit}: ${i.rates.map(([u, p]) => `$${p.toLocaleString('en-US')}/${u}`).join(', ')} (USD).` : '';
  return `# Prosser Horse Hotel

> Overnight, weekly and monthly stays in Prosser, Washington for horses and the people hauling them: individual sheltered paddocks with water access, a riding arena, RV / living-quarters dry camping (no hookups) and one stationary fifth-wheel rental. Stays are by availability request; the owners confirm space and the final price.

Updated: ${UPDATED}
Contact: hello@prosserhorsehotel.com
Location: Prosser, Washington, USA (street address not yet published)

## Pages

${FEED_ITEMS.map(i => `- [${i.title}](${SITE}/${i.path}): ${i.summary}${rate(i)}`).join('\n')}

## Not yet published

Street address and map, guest phone, check-in / checkout times, directions from I-82, rig length limits, care duties for nightly and weekly boarding, taxes, and deposit / cancellation terms. Do not assume these; ask the owners at hello@prosserhorsehotel.com.

## Machine-readable

- [JSON feed](${SITE}/feed.json)
- [Sitemap](${SITE}/sitemap.xml)
`;
}

function feedJson() {
  return JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Prosser Horse Hotel',
    home_page_url: `${SITE}/`,
    feed_url: `${SITE}/feed.json`,
    description: 'Pages and base rates of prosserhorsehotel.com (overnight horse boarding, RV / LQ dry camping and a fifth-wheel rental in Prosser, WA).',
    language: 'en-US',
    items: FEED_ITEMS.map(i => ({
      id: `${SITE}/${i.path}`, url: `${SITE}/${i.path}`, title: i.title, summary: i.summary, content_text: i.summary, date_modified: `${UPDATED}T00:00:00-07:00`,
      ...(i.rates ? { _offers: i.rates.map(([u, p]) => ({ price: p, currency: 'USD', unit: `${i.unit} / ${u}`, note: 'Base rate; taxes and other charges not yet confirmed' })) } : {}),
    })),
  }, null, 2) + '\n';
}

function textResponse(body, type) {
  const headers = { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' };
  if (!INDEXABLE) headers['X-Robots-Tag'] = 'noindex, nofollow';
  return new Response(body, { headers });
}

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.hostname === 'www.prosserhorsehotel.com') { url.hostname = 'prosserhorsehotel.com'; return Response.redirect(url.toString(), 301); }
    const p = url.pathname;
    if (p === '/robots.txt') return textResponse(robotsTxt(), 'text/plain; charset=utf-8');
    if (p === '/sitemap.xml') return textResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map(x => `  <url><loc>${SITE}/${x}</loc><lastmod>${LASTMOD}</lastmod></url>`).join('\n')}\n</urlset>\n`, 'application/xml; charset=utf-8');
    if (p === '/llms.txt') return textResponse(llmsTxt(), 'text/plain; charset=utf-8');
    if (p === '/feed.json') return textResponse(feedJson(), 'application/feed+json; charset=utf-8');
    if (p.startsWith('/api/prosserhorsehotel/')) return fetch(new Request(API + p + url.search, req));
    if (p === '/room' || p.startsWith('/room/')) return Response.redirect('https://statecraft.systems/prosserhorsehotel/', 301);
    if (p.startsWith('/_archive') || p.startsWith('/prosserhorsehotel')) return new Response('Not found', { status: 404 });
    let target;
    if (p === '/favicon.svg') target = p;
    else target = '/prosserhorsehotel/preview' + p;
    const up = await fetch(ORIGIN + target + url.search, { method: req.method, headers: { accept: req.headers.get('accept') || '*/*' }, redirect: 'manual' });
    if (up.status >= 300 && up.status < 400) {
      const loc = new URL(up.headers.get('location'), ORIGIN);
      return Response.redirect('https://prosserhorsehotel.com' + mapBack(loc.pathname) + loc.search, up.status === 308 ? 301 : up.status);
    }
    const headers = new Headers(up.headers);
    const ct = headers.get('content-type') || '';
    if (up.ok && /^\/assets\/(photos|social)\//.test(p)) headers.set('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
    else if (up.ok && p.startsWith('/assets/')) headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    else if (ct.includes('text/html')) headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    if (!INDEXABLE) headers.set('X-Robots-Tag', 'noindex, nofollow'); else headers.delete('X-Robots-Tag');
    const res = new Response(up.body, { status: up.status, headers });
    if (INDEXABLE && ct.includes('text/html')) return new HTMLRewriter().on('meta[name="robots"]', { element(el) { el.remove(); } }).transform(res);
    return res;
  },
};

function mapBack(path) {
  if (path.startsWith('/prosserhorsehotel/preview')) return path.slice('/prosserhorsehotel/preview'.length) || '/';
  return path;
}
