"use strict";
// ─── Global Logging Toggle ──────────────────────────────────────────────────
// Set ENABLE_LOGGING to true to see all console output across the project.
// Set to false to silence every console.log / console.error / console.warn
// / console.info / console.debug — including any future ones added anywhere.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_LOGGING = void 0;
exports.ENABLE_LOGGING = true;
if (!exports.ENABLE_LOGGING) {
    const noop = () => { };
    console.log = noop;
    console.error = noop;
    console.warn = noop;
    console.info = noop;
    console.debug = noop;
}
