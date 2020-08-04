import e from './events.js';
import API from './plugin.js';

/**
 * Public API class
 * @class
 * @param {Function} listenEvents
 * @param {Function} add
 * @param {Function} remove
 * @param {Function} removeAll
 * @param {Function} list
 * @param {Function} call
 */

export default class OverlayAPI extends API {
  /**
   * Init API
   * @constructor
   * @extends API
   * @param {Object} events - Events needs to be init at constructor
   */
  constructor(events = {}) {
    super();
    this.events = Object.assign({}, e, events);
    // Register all events
    for (let event in this.events) {
      let cbs = this.events[event];
      if (cbs) {
        this.add(event, cbs);
      }
    }
  }

  /**
   * Start listening events
   * @param {Array} events - Events which to subscribe
   */
  listenEvents(events) {
    this.sendMessage({
      call: 'subscribe',
      events,
    });
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
      console.error('[API] Wrong params:', cbs);
      return;
    }
    // Listen event type
    if (!eventListened) {
      this.listenEvents([event]);
    }
  }

  /**
   * Remove a listener
   * @param {String} event - Event type which listener belongs to
   * @param {Function|Number} id - Function or number which listener to remove
   */
  remove(event, id) {
    const eventListened = this.subscribers.hasOwnProperty(event);
    if (eventListened) {
      // Get cb
      let cb;
      if (typeof id === 'function') {
        let cbPos = this.subscribers[event].indexOf(id);
        if (cbPos >= 0) {
          this.subscribers[event].splice(pos, 1);
        }
      } else if (typeof id === 'number') {
        cb = this.subscribers[event][id];
        if (cb) {
          this.subscribers[event].splice(id, 1);
        }
      } else {
        console.error('[API] Wrong params:', id);
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
   * List all event listeners
   */
  list() {
    console.log(this.subscribers);
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
          console.error('[API] Error stringfy message: ', data, e);
          return reject(e);
        }
        return resolve(rd);
      });
    });
  }
}
