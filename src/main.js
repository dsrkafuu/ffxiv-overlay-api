'use strict';

import RawAPI from './api.js';
import rEvents from './events.js';

export default class OverlayAPI {
  /**
   * Init API
   * @constructor
   * @param {String} options - Message queue before OverlayPluginApi is ready
   * @param {Object} listening - Event types which are being listened and all listeners
   * @param {API} api - Overlay API
   */
  constructor(events = {}) {
    this.events = Object.assign({}, rEvents, events);
    this.listening = {};
    this.api = new RawAPI();
    // Register all events
    for (let event in this.events) {
      let cbs = this.events[event];
      if (cbs) {
        this.add(event, cbs);
      }
    }
  }

  /**
   * Add an event listener
   * @param {String} event - Event to listen
   * @param {Function|Array} cbs - Callback function(s)
   */
  add(event, cbs) {
    if (typeof cbs === 'function') {
      this.api.addOverlayListener(event, cbs);
      if (!this.listening.hasOwnProperty(event)) {
        this.listening[event] = [];
        this.api.startOverlayEvents([event]);
      }
      this.listening[event].push(cbs);
    } else if (Array.isArray(cbs)) {
      cbs.forEach((f) => {
        this.api.addOverlayListener(event, f);
      });
      if (!this.listening.hasOwnProperty(event)) {
        this.listening[event] = [];
        this.api.startOverlayEvents([event]);
      }
      this.listening[event].push(...cbs);
    } else {
      console.error('[API] Wrong params:', cbs);
      return;
    }
  }

  /**
   * Remove a listener
   * @param {String} event - Event type which listener belongs to
   * @param {Function|Number} id - Function or number which listener to remove
   */
  remove(event, id) {
    // Get cb
    let cb;
    if (typeof id === 'function') {
      cb = id;
    } else if (typeof id === 'number') {
      cb = this.listening[event][id];
      if (cb) {
        this.listening[event].splice(id, 1);
      }
    } else {
      console.error('[API] Wrong params:', id);
      return;
    }
    // Remove listener
    if (cb) {
      this.api.removeOverlayListener(event, cb);
    }
  }

  /**
   * Remove all listener of one event type
   * @param {String} event - Event type which listener belongs to
   */
  removeAll(event) {
    if (this.listening[event] && this.listening[event].length > 0) {
      this.listening[event].forEach((cb) => {
        this.api.removeOverlayListener(event, cb);
      });
      this.listening[event] = [];
    }
  }

  /**
   * List all event listeners
   */
  list() {
    console.log(this.listening);
  }

  /**
   * This function allows you to call an overlay handler.
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot).
   * Returns a Promise
   * @param {Object} msg - Message send to OverlayPlugin
   */
  call(msg) {
    return this.api.callOverlayHandler(msg);
  }
}
