/**
 * Console logger
 */
export default {
  info(...params) {
    console.info('[OverlayAPI]', ...params);
  },
  error(...params) {
    console.error('[OverlayAPI]', ...params);
  },
};
