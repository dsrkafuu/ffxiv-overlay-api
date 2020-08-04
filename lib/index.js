/*!
 * ffxiv-overlay-api v1.0.4 - MIT License
 * Copyright (c) 2020 DSRKafuU <amzrk2.cc>
 * Copyright (c) 2014 RainbowMage, hibiyasleep, ngld
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OverlayAPI = factory());
}(this, (function () { 'use strict';

  /**
   * Console logger
   */
  var log = {
    info() {
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      console.info('[OverlayAPI]', ...params);
    },

    error() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }

      console.error('[OverlayAPI]', ...params);
    }

  };

  /**
   * All event types available
   */
  var eventList = ['CombatData', 'LogLine', 'ImportedLogLines', 'ChangeZone', 'ChangePrimaryPlayer', 'OnlineStatusChanged'];

  /**
   * Origin api ported from common.js
   * @class
   * @prop {String} _queue - Message queue before OverlayPluginApi is ready
   * @prop {Boolean} _status - OverlayPluginApi init status
   * @prop {String} _wsURL - Web Socket URL if exist
   * @prop {Object} _ws - Web Socket instance if exist
   * @prop {Object} subscribers - All subscribers for events emitted by OverlayPluginApi
   */

  class PluginAPI {
    /**
     * Init API
     * @constructor
     */
    constructor() {
      this._queue = []; // { msg, cb } | msg

      this._status = false;
      this.subscribers = {}; // { eventName: [callbackFunc] }
      // Check if in WebSocket mode

      this._wsURL = /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href);

      if (this._wsURL) {
        this._ws = null;
        this.initWS();
      } else {
        this.initAPI();
      }
    }
    /**
     * Init OverlayPluginApi connection
     */


    initAPI() {
      if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
        setTimeout(this.initAPI, 200);
        return;
      } // API loaded


      this._status = true; // Bind `this` for callback function called by OverlayAPI, otherwist it will turn to `undefined`

      window.__OverlayCallback = this.triggerEvents.bind(this); // Send all messages in queue to OverlayPluginApi

      while (this._queue.length > 0) {
        var {
          msg,
          cb
        } = this._queue.shift();

        try {
          window.OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
        } catch (e) {
          log.error('Error stringify JSON', e, msg);
        }
      }
    }
    /**
     * Init WebSocket connection
     */


    initWS() {
      this._ws = new WebSocket(this._wsURL[1]); // Log error

      this._ws.addEventListener('error', e => {
        log.error('WebSocket error', e);
      }); // Successfully connected WebSocket


      this._ws.addEventListener('open', () => {
        log.info('WebSocket connected');
        this._status = true;

        while (this._queue.length > 0) {
          var msg = this._queue.shift();

          this.sendMessage(msg);
        }
      }); // On message loaded from WebSocket


      this._ws.addEventListener('message', msg => {
        try {
          msg = JSON.parse(msg.data);
        } catch (e) {
          log.error('Error stringify JSON', e, msg);
          return;
        }

        this.triggerEvents(msg);
      }); // Connection failed


      this._ws.addEventListener('close', () => {
        this._status = false;
        log.info('WebSocket trying to reconnect...'); // Don't spam the server with retries

        setTimeout(() => {
          this.initWS();
        }, 200);
      });
    }
    /**
     * Send message to OverlayPluginApi or push into queue before its init
     * @param {Object} msg - Object to send
     * @param {Function} cb - Callback function
     */


    sendMessage(msg, cb) {
      if (this._wsURL) {
        if (this._status) {
          try {
            this._ws.send(JSON.stringify(msg));
          } catch (e) {
            log.error('Error stringify JSON', e, msg);
            return;
          }
        } else {
          this._queue.push(msg);
        }
      } else {
        if (this._status) {
          try {
            window.OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
          } catch (e) {
            log.error('Error stringify JSON', e, msg);
            return;
          }
        } else {
          this._queue.push({
            msg,
            cb
          });
        }
      }
    }
    /**
     * Start listening event
     * @param {String} event - Event which to subscribe
     */


    listenEvent(event) {
      this.sendMessage({
        call: 'subscribe',
        events: [event]
      });
    }
    /**
     * Trigger event function, called by OverlayPluginApi, need `this` binding
     * @param {Object} msg - Data from OverlayPluginApi
     */


    triggerEvents(msg) {
      // If this event type has subscribers
      if (this.subscribers[msg.type]) {
        // Trigger all event's callback
        for (var cb of this.subscribers[msg.type]) {
          cb(msg);
        }
      }
    }

  }

  /**
   * Public API class
   * @class
   * @extends PluginAPI
   * @prop {String} _events - Events needs to be init at construct
   * @extends @prop {Object} subscribers - All subscribers for events emitted by OverlayPluginApi
   */

  class OverlayAPI extends PluginAPI {
    /**
     * Init API
     * @constructor
     * @param {Object} events - Events needs to be init at construct
     */
    constructor() {
      var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super();
      this._events = events; // Register all events

      for (var event in this._events) {
        if (eventList.includes(event)) {
          var cbs = this._events[event];

          if (cbs) {
            this.add(event, cbs);
          }
        }
      }
    }
    /**
     * Add an event listener
     * @param {String} event - Event to listen
     * @param {Function|Array} cbs - Callback function(s)
     */


    add(event, cbs) {
      if (eventList.includes(event)) {
        var eventListened = this.subscribers.hasOwnProperty(event); // Init event array

        if (!eventListened) {
          this.subscribers[event] = [];
        } // Push events


        if (typeof cbs === 'function') {
          this.subscribers[event].push(cbs);
        } else if (Array.isArray(cbs)) {
          cbs.forEach(f => {
            this.subscribers[event].push(f);
          });
        } else {
          log.error('Function add(event, cbs) wrong event callbacks', cbs);
          return;
        } // Listen event type


        if (!eventListened) {
          this.listenEvent(event);
        }
      }
    }
    /**
     * Remove a listener
     * @param {String} event - Event type which listener belongs to
     * @param {Function|Number} cb - Function or number which listener to remove
     */


    remove(event, cb) {
      var eventListened = this.subscribers.hasOwnProperty(event);

      if (eventListened) {
        if (typeof cb === 'function') {
          var cbPos = this.subscribers[event].indexOf(cb);

          if (cbPos >= 0) {
            this.subscribers[event].splice(cbPos, 1);
          }
        } else if (typeof cb === 'number') {
          cb = this.subscribers[event][cb];

          if (cb) {
            this.subscribers[event].splice(cb, 1);
          }
        } else {
          log.error('Function remove(event, cb) wrong params', cb);
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
        this.sendMessage(msg, data => {
          var rd;

          try {
            rd = data == null ? null : JSON.parse(data);
          } catch (e) {
            log.error('Error parse JSON', e, data);
            return reject(e);
          }

          return resolve(rd);
        });
      });
    }

  }

  return OverlayAPI;

})));
//# sourceMappingURL=index.js.map
