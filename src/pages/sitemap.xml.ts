import type { APIRoute } from 'astro';
import { publicPages, absolute } from '../data/site';

// Public main-site pages only. Project rooms are never listed here.
export const GET: APIRoute = () => {
  const urls = publicPages
    .map((p) => `  <url><loc>${absolute(p.path)}</loc><lastmod>${p.updated}</lastmod></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
