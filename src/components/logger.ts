/**
 * console info logger
 */
export function logInfo(...params: any[]) {
  console.info('[ffxiv-overlay-api]', ...params);
}

/**
 * console error logger
 */
export function logError(...params: any[]) {
  console.error('[ffxiv-overlay-api]', ...params);
}
