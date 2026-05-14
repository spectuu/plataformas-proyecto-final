// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Hybrid rendering on Cloudflare:
  //  - `output: 'server'` makes every page SSR by default (Cloudflare Workers).
  //    Used by the public storefront: catalog + product detail are generated
  //    per request so prices / stock are always fresh.
  //  - Admin pages opt OUT of SSR with `export const prerender = true`,
  //    so they are pre-rendered at build time (SSG) and served as static HTML.
  output: 'server',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});