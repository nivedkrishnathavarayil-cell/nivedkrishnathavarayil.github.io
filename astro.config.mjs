import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // the live address; switch SITE_URL in the deploy workflow when the custom domain is connected
  site: process.env.SITE_URL || 'https://nivedkrishnathavarayil.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  integrations: [sitemap({ filter: (p) => !p.includes('/404') })],
});
