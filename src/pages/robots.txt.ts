import type { APIRoute } from 'astro';
import { LAUNCHED } from '../config';

export const GET: APIRoute = ({ site }) => {
  const body = LAUNCHED
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site).href}\n`
    : `# Web ještě není spuštěný. Po spuštění přepni LAUNCHED v src/config.ts.\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
