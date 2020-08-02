'use strict';

/**
 * Ported and modified from ngld/OverlayPlugin
 * MIT License
 */

export default class RawAPI {
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
    this.subscribers = {}; // { eventName: callbackFunc }
    // Check if in WebSocket mode
    this.wsURL = /[\?&]OVERLAY_WS=([^&]+)/.exec(window.location.href);
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
    }
    // API loaded
    this.apiStatus = true;
    // Bind `this` for callback function called by OverlayAPI, otherwist it will turn to `undefined`
    window.__OverlayCallback = this.triggerEvent.bind(this);
    // Send all messages in queue to OverlayPluginApi
    while (this.queue.length > 0) {
      let { obj, cb } = this.queue.shift();
      window.OverlayPluginApi.callHandler(JSON.stringify(obj), cb);
    }
  }

  /**
   * Init WebSocket connection
   */
  initWS() {
    this.ws = new WebSocket(this.wsURL[1]);
    // Log error
    this.ws.addEventListener('error', (e) => {
      console.error(e);
    });
    // Successfully connected WebSocket
    this.ws.addEventListener('open', () => {
      console.info('[API] WebSocket connected');
      this.apiStatus = true;
      while (this.queue.length > 0) {
        let msg = this.queue.shift();
        this.sendMessage(msg);
      }
    });
    // On message loaded from WebSocket
    this.ws.addEventListener('message', (msg) => {
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
        this.triggerEvent(msg);
      }
    });
    // Connection failed
    this.ws.addEventListener('close', () => {
      this.apiStatus = false;
      console.info('[API] WebSocket trying to reconnect...');
      // Don't spam the server with retries
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
        this.queue.push({ obj, cb });
      }
    }
  }

  /**
   * Trigger event function, called by OverlayPluginApi, need `this` binding
   * @param {Object} msg - Data from OverlayPluginApi
   */
  triggerEvent(msg) {
    // If this event type has subscribers
    if (this.subscribers[msg.type]) {
      // Trigger all event's callback
      for (let cb of this.subscribers[msg.type]) {
        cb(msg);
      }
    }
  }

  /**
   * Add an subscriber
   * @param {String} event - Event which is to subscribe
   * @param {Function} cb - Callback function
   */
  addOverlayListener(event, cb) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(cb);
  }

  /**
   * Remove an subscriber
   * @param {String} event - Event which is to unsubscribe
   * @param {Function} cb - Callback function
   */
  removeOverlayListener(event, cb) {
    if (this.subscribers[event]) {
      let list = this.subscribers[event];
      let pos = list.indexOf(cb);
      if (pos > -1) {
        list.splice(pos, 1);
      }
    }
  }

  /**
   * Start listening events
   * @param {Array} events - Events which to subscribe
   */
  startOverlayEvents(events) {
    this.sendMessage({
      call: 'subscribe',
      events,
    });
  }

  /**
   * This function allows you to call an overlay handler.
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot).
   * @param {Object} msg
   */
  callOverlayHandler(msg) {
    return new Promise((resolve, reject) => {
      this.sendMessage(msg, (data) => {
        try {
          const rd = data == null ? null : JSON.parse(data);
        } catch (e) {
          console.error('[API] Error stringfy message: ', data, e);
          return reject(e);
        }
        return resolve(rd);
      });
    });
  }
}
