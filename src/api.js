'use strict';

/**
 * Origin api ported from common.js
 * @function initWS
 * @function initAPI
 * @function sendMessage
 * @function triggerEvents
 */

export default class API {
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
    window.__OverlayCallback = this.triggerEvents.bind(this);
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
        this.triggerEvents(msg);
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
  triggerEvents(msg) {
    // If this event type has subscribers
    if (this.subscribers[msg.type]) {
      // Trigger all event's callback
      for (let cb of this.subscribers[msg.type]) {
        cb(msg);
      }
    }
  }
}
