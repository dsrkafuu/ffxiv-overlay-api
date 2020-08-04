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

  var e = {
    CombatData: null,
    LogLine: null,
    ImportedLogLines: null,
    ChangeZone: null,
    ChangePrimaryPlayer: null,
    OnlineStatusChanged: null
  };

  /**
   * Origin api ported from common.js
   * @class
   * @param {Function} initWS
   * @param {Function} initAPI
   * @param {Function} sendMessage
   * @param {Function} triggerEvents
   */
  class API {
    /**
     * Init API
     * @constructor
     * @param {String} queue - Message queue before OverlayPluginApi is ready
     * @param {Boolean} apiStatus - OverlayPluginApi init status
     * @param {Object} subscribers - All subscribers for events emitted by OverlayPluginApi
     */
    constructor() {
      this.queue = [];
      this.apiStatus = false;
      this.subscribers = {}; // { eventName: [callbackFunc] }
      // Check if in WebSocket mode

      this.wsURL = /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href);

      if (this.wsURL) {
        this.ws = null;
        this.responsePromises = {};
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


      this.apiStatus = true; // Bind `this` for callback function called by OverlayAPI, otherwist it will turn to `undefined`

      window.__OverlayCallback = this.triggerEvents.bind(this); // Send all messages in queue to OverlayPluginApi

      while (this.queue.length > 0) {
        var {
          obj,
          cb
        } = this.queue.shift();
        window.OverlayPluginApi.callHandler(JSON.stringify(obj), cb);
      }
    }
    /**
     * Init WebSocket connection
     */


    initWS() {
      this.ws = new WebSocket(this.wsURL[1]); // Log error

      this.ws.addEventListener('error', e => {
        console.error(e);
      }); // Successfully connected WebSocket

      this.ws.addEventListener('open', () => {
        console.info('[API] WebSocket connected');
        this.apiStatus = true;

        while (this.queue.length > 0) {
          var msg = this.queue.shift();
          this.sendMessage(msg);
        }
      }); // On message loaded from WebSocket

      this.ws.addEventListener('message', msg => {
        try {
          msg = JSON.parse(msg.data);
        } catch (e) {
          console.error('[API] WebSocket invalid message received: ', msg, e);
          return;
        }

        if (msg.rseq !== undefined && this.responsePromises[msg.rseq]) {
          this.responsePromises[msg.rseq](msg);
          delete this.responsePromises[msg.rseq];
        } else {
          this.triggerEvents(msg);
        }
      }); // Connection failed

      this.ws.addEventListener('close', () => {
        this.apiStatus = false;
        console.info('[API] WebSocket trying to reconnect...'); // Don't spam the server with retries

        setTimeout(() => {
          this.initWS();
        }, 200);
      });
    }
    /**
     * Send message to OverlayPluginApi or push into queue before its init
     * @param {Object} obj - Object to send
     * @param {Function} cb - Callback function
     */


    sendMessage(obj, cb) {
      if (this.wsURL) {
        if (this.apiStatus) {
          try {
            this.ws.send(JSON.stringify(obj));
          } catch (e) {
            console.error('[API] Error stringfy message: ', obj, e);
            return;
          }
        } else {
          this.queue.push(obj);
        }
      } else {
        if (this.apiStatus) {
          try {
            window.OverlayPluginApi.callHandler(JSON.stringify(obj), cb);
          } catch (e) {
            console.error('[API] Error stringfy message: ', obj, e);
            return;
          }
        } else {
          this.queue.push({
            obj,
            cb
          });
        }
      }
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
   * @param {Function} listenEvents
   * @param {Function} add
   * @param {Function} remove
   * @param {Function} removeAll
   * @param {Function} list
   * @param {Function} call
   */

  class OverlayAPI extends API {
    /**
     * Init API
     * @constructor
     * @extends API
     * @param {Object} events - Events needs to be init at constructor
     */
    constructor() {
      var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      super();
      this.events = Object.assign({}, e, events); // Register all events

      for (var event in this.events) {
        var cbs = this.events[event];

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
        events
      });
    }
    /**
     * Add an event listener
     * @param {String} event - Event to listen
     * @param {Function|Array} cbs - Callback function(s)
     */


    add(event, cbs) {
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
        console.error('[API] Wrong params:', cbs);
        return;
      } // Listen event type


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
      var eventListened = this.subscribers.hasOwnProperty(event);

      if (eventListened) {
        // Get cb
        var cb;

        if (typeof id === 'function') {
          var cbPos = this.subscribers[event].indexOf(id);

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
        this.sendMessage(msg, data => {
          var rd;

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

  return OverlayAPI;

})));
//# sourceMappingURL=index.js.map