'use strict';

import OverlayAPI from './api.js';

export default class OverlayParser {
  /**
   * Init parser data
   * @constructor
   */
  constructor() {
    this.api = new OverlayAPI();
  }
}
