import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  outDir: './dist',
  site: 'https://statecraft.systems',
  // Pages that were removed; their addresses still lead somewhere.
  redirects: {
    '/thesis/full': '/thesis',
    '/instruments': '/',
  },
});
