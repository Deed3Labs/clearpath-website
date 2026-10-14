/* postcss-nesting flattens nested CSS before anything ships. Every page's
   stylesheet is nested under .pg-<route>, and Safari, meeting a nested rule
   it cannot parse (a Firefox-only ::-moz-range-* slider rule), dropped every
   rule after it in the block, so /how lost 219 of 238 rules on an iPhone.
   Flat, a browser skips only the one rule it does not understand. */
export default {
  plugins: { 'postcss-nesting': {}, '@tailwindcss/postcss': {} },
};
