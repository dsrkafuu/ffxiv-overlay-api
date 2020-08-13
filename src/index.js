import { logInfo, logError } from './components/logger';
import defaultOptions from './components/options';
import PluginAPI from './components/plugin';

/**
 * Public API class
 * @class
 * @extends PluginAPI
 * @extends @prop {Object} subscribers All subscribers for events emitted by OverlayPlugin
 */
export default class OverlayAPI extends PluginAPI {
  /**
   * Init API
   * @constructor
   * @param {Object} options Options
   */
  constructor(options = defaultOptions) {
    super(options);
    if (options.liteMode) {
      logInfo('Working in lite mode');
    } else {
      logInfo('Working in raw mode');
    }
  }

  /**
   * Add an event listener
   * @param {String} event Event to listen
   * @param {Function} cb Callback function
   */
  addListener(event, cb) {
    const eventListened = this.subscribers.hasOwnProperty(event);
    // Init event array
    if (!eventListened) {
      this.subscribers[event] = [];
    }
    // Push events
    if (typeof cb === 'function') {
      this.subscribers[event].push(cb);
    } else {
      logError('Function add(event, cb) wrong event callbacks', cb);
      return;
    }
    // Listen event type
    if (!eventListened) {
      this.listenEvent(event);
    }
  }

  /**
   * Remove a listener
   * @param {String} event Event type which listener belongs to
   * @param {Function} cb Function which listener to remove
   */
  removeListener(event, cb) {
    const eventListened = this.subscribers.hasOwnProperty(event);
    if (eventListened) {
      if (typeof cb === 'function') {
        let cbPos = this.subscribers[event].indexOf(cb);
        if (cbPos >= 0) {
          this.subscribers[event].splice(cbPos, 1);
        }
      } else {
        logError('Function remove(event, cb) wrong params', cb);
        return;
      }
    }
  }

  /**
   * Remove all listener of one event type
   * @param {String} event Event type which listener belongs to
   */
  removeAllListener(event) {
    if (this.subscribers[event] && this.subscribers[event].length > 0) {
      this.subscribers[event] = [];
    }
  }

  /**
   * Get all listeners of a event
   * @param {String} event Event type which listener belongs to
   */
  listListener(event) {
    return this.subscribers[event] ? this.subscribers[event] : [];
  }

  /**
   * Ends current encounter and save it
   * Returns a Promise
   */
  endEncounter() {
    if (this._status) {
      return window.OverlayPluginApi.endEncounter();
    } else {
      return Promise.reject('[OverlayAPI] Plugin not ready yet');
    }
  }

  /**
   * This function allows you to call an overlay handler
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot)
   * Returns a Promise
   * @param {Object} msg Message send to OverlayPlugin
   */
  call(msg) {
    return new Promise((resolve, reject) => {
      this.sendMessage(msg, (data) => {
        let rd;
        try {
          rd = data == null ? null : JSON.parse(data);
        } catch (e) {
          logError('Error parse JSON', e, data);
          return reject(e);
        }
        return resolve(rd);
      });
    });
  }
}
