export default {
  /**
   * Info logger
   * @param {String} i
   * @param {...any} params
   */
  i(i, ...params) {
    console.info('[OverlayAPI]', i, ...params);
  },
  /**
   * Error logger
   * @param {Object} e
   * @param {...any} params
   */
  e(e, ...params) {
    console.log('[OverlayAPI] Error occurred:', e, ...params);
  },
};
