// prosserhorsehotel-site: serves prosserhorsehotel.com from the statecraft-systems Pages project.
// Content lives in the repo at public/prosserhorsehotel/ (draft in preview/, client room at the folder root);
// pushing to master updates both statecraft.systems and this domain. No separate build.
//   https://www.prosserhorsehotel.com/*      -> 301 https://prosserhorsehotel.com/*
//   /api/prosserhorsehotel/*                 -> statecraft.systems (prosserhorsehotel-intake Worker)
//   /room, /room/*                           -> 301 https://statecraft.systems/prosserhorsehotel/ (room lives on statecraft.systems)
//   /favicon.svg                             -> /favicon.svg
//   everything else                          -> /prosserhorsehotel/preview/*   (website draft)
// Draft stays noindex: X-Robots-Tag on every response, plus the pages' own meta robots.
const ORIGIN = 'https://statecraft-systems.pages.dev';
const API = 'https://statecraft.systems';

export default {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.hostname === 'www.prosserhorsehotel.com') { url.hostname = 'prosserhorsehotel.com'; return Response.redirect(url.toString(), 301); }
    const p = url.pathname;
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
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(up.body, { status: up.status, headers });
  },
};

function mapBack(path) {
  if (path.startsWith('/prosserhorsehotel/preview')) return path.slice('/prosserhorsehotel/preview'.length) || '/';
  return path;
}
