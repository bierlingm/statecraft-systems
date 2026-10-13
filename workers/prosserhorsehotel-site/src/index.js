// prosserhorsehotel-site: serves prosserhorsehotel.com from the statecraft-systems Pages project.
// Content lives in the repo at public/prosserhorsehotel/ (draft in preview/, client room at the folder root);
// pushing to master updates both statecraft.systems and this domain. No separate build.
//   https://www.prosserhorsehotel.com/*      -> 301 https://prosserhorsehotel.com/*
//   /api/prosserhorsehotel/*                 -> statecraft.systems (prosserhorsehotel-intake Worker)
//   /room, /room/*                           -> 301 https://statecraft.systems/prosserhorsehotel/ (room lives on statecraft.systems)
//   /favicon.svg                             -> /favicon.svg
//   everything else                          -> /prosserhorsehotel/preview/*   (website draft)
// Draft stays noindex while INDEXABLE = false: X-Robots-Tag on every response, plus the pages' own meta robots.
// /robots.txt and /sitemap.xml are generated here. Asset caching: photos/social 30 days, other assets 1 day, HTML revalidates.
// GO-LIVE SWITCH: set to true (and redeploy) to allow indexing. It drops X-Robots-Tag, strips the pages'
// <meta name="robots" noindex> on the fly, and robots.txt keeps pointing at the sitemap.
const INDEXABLE = false;
const ORIGIN = 'https://statecraft-systems.pages.dev';
const SITE = 'https://prosserhorsehotel.com';
const PAGES = ['', 'boarding/', 'camping/', 'fifth-wheel/', 'gallery/', 'reservations/', 'contact/'];
const LASTMOD = '2026-10-13';
const API = 'https://statecraft.systems';

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.hostname === 'www.prosserhorsehotel.com') { url.hostname = 'prosserhorsehotel.com'; return Response.redirect(url.toString(), 301); }
    const p = url.pathname;
    if (p === '/robots.txt') return new Response(`User-agent: *\n${INDEXABLE ? 'Allow: /' : 'Allow: /\n# Draft: pages carry noindex until launch'}\n\nSitemap: ${SITE}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
    if (p === '/sitemap.xml') return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map(x => `  <url><loc>${SITE}/${x}</loc><lastmod>${LASTMOD}</lastmod></url>`).join('\n')}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
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
