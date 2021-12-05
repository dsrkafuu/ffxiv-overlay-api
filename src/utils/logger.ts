/**
 * console info logger
 */
export function logInfo(...args: unknown[]) {
  console.log('[ffxiv-overlay-api]', ...args);
}

/**
 * console error logger
 */
export function logError(...args: unknown[]) {
  console.error('[ffxiv-overlay-api]', ...args);
}
