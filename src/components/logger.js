/**
 * console info logger
 * @param {...any} params
 */
export function logInfo(...params) {
  console.info('[ffxiv-overlay-api]', ...params);
}

/**
 * console error logger
 * @param {...any} params
 */
export function logError(...params) {
  console.error('[ffxiv-overlay-api]', ...params);
}
