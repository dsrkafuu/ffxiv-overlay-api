'use strict';

import RawAPI from './api.js';
import rEvents from './events.js';

export default class OverlayAPI {
  /**
   * Init API
   * @constructor
   * @param {String} options - Message queue before OverlayPluginApi is ready
   * @param {API} api - Overlay API
   */
  constructor(events = {}) {
    this.options = Object.assign({}, rEvents, events);
    this.api = new RawAPI();
    // Register all events
    for (let event in this.options) {
      if (this.options[event]) {
        if (typeof this.options[event] === 'function') {
          this.api.addOverlayListener(event, this.options[event]);
        } else if (Array.isArray(this.options[event])) {
          this.options[event].forEach((cb) => {
            this.api.addOverlayListener(event, cb);
          });
        } else {
          console.error('[API] Wrong callback settings in events');
        }
      }
    }
    // Start event listening
    this.api.startOverlayEvents();
  }

  /**
   * This function allows you to call an overlay handler.
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot).
   * @param {Object} msg
   */
  callHandler(msg) {
    this.api.callOverlayHandler(msg);
  }
}
