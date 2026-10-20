import path from 'node:path';
import type { NextConfig } from 'next';

/* Where the apex's app paths are served from (Clear's monorepo, Deed3Labs/Protocol-Contracts). */
const REWARDS = (process.env.REWARDS_ORIGIN || 'https://rewards.useclear.org').replace(/\/+$/, '');
const APP = (process.env.CLEAR_APP_ORIGIN || 'https://app.useclear.org').replace(/\/+$/, '');

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
  /* Paths printed on things, served by Clear's apps behind this domain (rewards DECISIONS, Hosts).
   *   /s/<shop>   a shop's rewards app (apps/rewards), with its files under /_rw
   *   /p/<code>   a Point's bill, /r/<code> a receipt: the Clear app's phone pages (apps/member),
   *               with their files under /assets
   * External rewrites run after this site's own pages and files, so nothing here is shadowed:
   * public/assets/logo.png is still this site's. */
  async rewrites() {
    return [
      { source: '/s/:path*', destination: `${REWARDS}/s/:path*` },
      { source: '/_rw/:path*', destination: `${REWARDS}/_rw/:path*` },
      { source: '/p/:path*', destination: `${APP}/p/:path*` },
      { source: '/r/:path*', destination: `${APP}/r/:path*` },
      { source: '/assets/:path*', destination: `${APP}/assets/:path*` },
    ];
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
      // Shop slugs that changed (content/shop.ts MOVED).
      { source: '/shop/member-tee',           destination: '/shop/logo-tee',             statusCode: 301 },
      { source: '/shop/long-sleeve-mock-tee', destination: '/shop/logo-long-sleeve-tee', statusCode: 301 },
      { source: '/shop/turtleneck',           destination: '/shop/logo-turtleneck',      statusCode: 301 },
      { source: '/shop/hoodie',               destination: '/shop/logo-hoodie',          statusCode: 301 },
    ];
  },
};

export default config;
