// ─── Global Logging Toggle ──────────────────────────────────────────────────
// Set ENABLE_LOGGING to true to see all console output across the project.
// Set to false to silence every console.log / console.error / console.warn
// / console.info / console.debug — including any future ones added anywhere.

export const ENABLE_LOGGING = true;

if (!ENABLE_LOGGING) {
  const noop = () => {};
  console.log   = noop;
  console.error = noop;
  console.warn  = noop;
  console.info  = noop;
  console.debug = noop;
}
