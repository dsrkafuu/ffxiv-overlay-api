import logger from './logger';
import ev from './events.js';
import PluginAPI from './plugin.js';

/**
 * Public API class
 * @class
 * @extends PluginAPI
 * @prop {String} _events - Events needs to be init at construct
 * @extends @prop {Object} subscribers - All subscribers for events emitted by OverlayPluginApi
 */
export default class OverlayAPI extends PluginAPI {
  /**
   * Init API
   * @constructor
   * @param {Object} events - Events needs to be init at construct
   */
  constructor(events = {}) {
    super();
    this._events = Object.assign({}, ev, events);
    // Register all events
    for (let event in this._events) {
      let cbs = this._events[event];
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
    const eventListened = this.subscribers.hasOwnProperty(event);
    // Init event array
    if (!eventListened) {
      this.subscribers[event] = [];
    }
    // Push events
    if (typeof cbs === 'function') {
      this.subscribers[event].push(cbs);
    } else if (Array.isArray(cbs)) {
      cbs.forEach((f) => {
        this.subscribers[event].push(f);
      });
    } else {
      logger.e('Wrong event callbacks', cbs);
      return;
    }
    // Listen event type
    if (!eventListened) {
      this.listenEvent(event);
    }
  }

  /**
   * Remove a listener
   * @param {String} event - Event type which listener belongs to
   * @param {Function|Number} cb - Function or number which listener to remove
   */
  remove(event, cb) {
    const eventListened = this.subscribers.hasOwnProperty(event);
    if (eventListened) {
      // Get cb
      let cb;
      if (typeof cb === 'function') {
        let cbPos = this.subscribers[event].indexOf(cb);
        if (cbPos >= 0) {
          this.subscribers[event].splice(cbPos, 1);
        }
      } else if (typeof cb === 'number') {
        cb = this.subscribers[event][cb];
        if (cb) {
          this.subscribers[event].splice(cb, 1);
        }
      } else {
        logger.e('Wrong params', cb);
        return;
      }
    }
  }

  /**
   * Remove all listener of one event type
   * @param {String} event - Event type which listener belongs to
   */
  removeAll(event) {
    if (this.subscribers[event] && this.subscribers[event].length > 0) {
      this.subscribers[event] = [];
    }
  }

  /**
   * Get all listeners of a event
   * @param {String} event - Event type which listener belongs to
   */
  list(event) {
    return this.subscribers[event] ? this.subscribers[event] : [];
  }

  /**
   * This function allows you to call an overlay handler.
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot).
   * Returns a Promise
   * @param {Object} msg - Message send to OverlayPlugin
   */
  call(msg) {
    return new Promise((resolve, reject) => {
      this.sendMessage(msg, (data) => {
        let rd;
        try {
          rd = data == null ? null : JSON.parse(data);
        } catch (e) {
          logger.e(e, data);
          return reject(e);
        }
        return resolve(rd);
      });
    });
  }
}
