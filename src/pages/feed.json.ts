import type { APIRoute } from 'astro';
import { publicPages, absolute, SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '../data/site';

// A small JSON Feed (https://jsonfeed.org/version/1.1) of the public pages.
// Each item carries title, url, summary and updated (also as date_modified).
// Project rooms are never listed here.
export const GET: APIRoute = () => {
  const updated = publicPages.map((p) => p.updated).sort().at(-1);
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_NAME,
    home_page_url: `${SITE_URL}/`,
    feed_url: `${SITE_URL}/feed.json`,
    description: SITE_DESCRIPTION,
    language: 'en',
    authors: [{ name: 'Moritz Bierling', url: 'https://moritzbierling.com' }],
    updated,
    items: publicPages.map((p) => ({
      id: absolute(p.path),
      url: absolute(p.path),
      title: p.title,
      summary: p.summary,
      updated: p.updated,
      date_modified: `${p.updated}T00:00:00Z`,
    })),
  };
  return new Response(JSON.stringify(feed, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
