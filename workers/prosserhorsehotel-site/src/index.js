// prosserhorsehotel-site: serves prosserhorsehotel.com from the statecraft-systems Pages project.
// Content lives in the repo at public/prosserhorsehotel/ (draft in preview/, client room at the folder root);
// pushing to master updates both statecraft.systems and this domain. No separate build.
//   https://www.prosserhorsehotel.com/*      -> 301 https://prosserhorsehotel.com/*
//   /api/prosserhorsehotel/*                 -> statecraft.systems (prosserhorsehotel-intake Worker)
//   /room/*                                  -> /prosserhorsehotel/*   (client intake room)
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
    if (p === '/room') return Response.redirect(`https://prosserhorsehotel.com/room/${url.search}`, 301);
    if (p.startsWith('/_archive') || p.startsWith('/prosserhorsehotel')) return new Response('Not found', { status: 404 });
    let target, room = false;
    if (p.startsWith('/room/')) { room = true; target = '/prosserhorsehotel/' + p.slice(6); }
    else if (p === '/favicon.svg') target = p;
    else target = '/prosserhorsehotel/preview' + p;
    const up = await fetch(ORIGIN + target + url.search, { method: req.method, headers: { accept: req.headers.get('accept') || '*/*' }, redirect: 'manual' });
    if (up.status >= 300 && up.status < 400) {
      const loc = new URL(up.headers.get('location'), ORIGIN);
      return Response.redirect('https://prosserhorsehotel.com' + mapBack(loc.pathname) + loc.search, up.status === 308 ? 301 : up.status);
    }
    const headers = new Headers(up.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    let res = new Response(up.body, { status: up.status, headers });
    if (room && (headers.get('content-type') || '').includes('text/html')) {
      const fix = (attr) => ({ element(el) { const v = el.getAttribute(attr); if (v && v.startsWith('/prosserhorsehotel')) el.setAttribute(attr, mapBack(v)); } });
      res = new HTMLRewriter().on('a[href]', fix('href')).on('link[href]', fix('href')).on('script[src]', fix('src')).on('img[src]', fix('src')).transform(res);
    }
    return res;
  },
};

function mapBack(path) {
  if (path.startsWith('/prosserhorsehotel/preview')) return path.slice('/prosserhorsehotel/preview'.length) || '/';
  if (path === '/prosserhorsehotel') return '/room/';
  if (path.startsWith('/prosserhorsehotel/')) return '/room/' + path.slice('/prosserhorsehotel/'.length);
  return path;
}
