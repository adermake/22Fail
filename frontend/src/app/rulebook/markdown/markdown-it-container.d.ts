/**
 * markdown-it-container ships no types of its own, and @types/markdown-it-container targets
 * markdown-it v14 (whose `export =` style conflicts with v15's bundled ESM types).
 * We only ever pass the plugin straight to `md.use(...)`, so an opaque declaration is enough.
 */
declare module 'markdown-it-container' {
  const plugin: unknown;
  export default plugin;
}
