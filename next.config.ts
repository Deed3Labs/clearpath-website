import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  /* Make the PostCSS config part of webpack's build-cache key. Without it a
     build that restores the cache (Vercel always does) keeps serving CSS
     compiled under the old config for every stylesheet that did not itself
     change: after postcss-nesting was added, /how and /style still shipped
     their nested CSS, which Safari half-drops. */
  webpack(webpackConfig) {
    const cache = webpackConfig.cache;
    if (cache && typeof cache === 'object' && cache.type === 'filesystem') {
      cache.buildDependencies = {
        ...cache.buildDependencies,
        postcss: [path.resolve(process.cwd(), 'postcss.config.mjs')],
      };
    }
    return webpackConfig;
  },
  async redirects() {
    /* Every route the old static site published keeps working. §8 — Redirects.
     * /capital.html carried the only external inbound links; a fragment on it
     * (/capital.html#who) lands on /capital rather than 404ing, because a
     * redirect drops the hash and the browser reapplies it to a page that no
     * longer has that anchor. Landing at the top of the right page is the
     * correct failure.
     *
     * statusCode 301 rather than permanent:true — that helper emits a 308, and
     * §8 asks for a 301. Modern crawlers treat them the same; older ones do
     * not, and these paths exist for old inbound links. */
    return [
      { source: '/capital.html',      destination: '/capital', statusCode: 301 },
      { source: '/clearcapital',      destination: '/capital', statusCode: 301 },
      { source: '/clearcapital.html', destination: '/capital', statusCode: 301 },
      { source: '/index.html',        destination: '/',        statusCode: 301 },
    ];
  },
};

export default config;
