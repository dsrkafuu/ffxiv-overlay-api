import { logInfo, logError } from './logger';
import parseData from './parser';

/**
 * Origin api ported from common.js
 * @class
 * @prop {String} _queue Message queue before OverlayPlugin is ready
 * @prop {Boolean} _status OverlayPlugin init status
 * @prop {String} _wsURL Web Socket URL if exist
 * @prop {Object} _ws Web Socket instance if exist
 * @prop {Object} subscribers All subscribers for events emitted by OverlayPlugin
 */
export default class PluginAPI {
  /**
   * Init API
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    this._status = false;
    this._queue = []; // Data structure: [{ msg, cb }] (normal) | [msg] (ws)
    this.subscribers = {}; // Data structure: { event: [cb] }
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
      setTimeout(this.initAPI, 300);
      return;
    }
    // API loaded
    this._status = true;
    // Bind `this` for callback function called by OverlayAPI
    window.__OverlayCallback = this.triggerEvents.bind(this);
    // Send all messages in queue to OverlayPlugin
    while (this._queue.length > 0) {
      let { msg, cb } = this._queue.shift();
      try {
        window.OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
      } catch (e) {
        logError('Error stringify JSON', e, msg);
      }
    }
  }

  /**
   * Init WebSocket connection
   */
  initWS() {
    this._ws = new WebSocket(this._wsURL[1]);
    // Log error
    this._ws.addEventListener('error', (e) => {
      logError('WebSocket error', e);
    });
    // Successfully connected WebSocket
    this._ws.addEventListener('open', () => {
      logInfo('WebSocket connected');
      this._status = true;
      // Send all messages in queue to OverlayPlugin
      while (this._queue.length > 0) {
        let msg = this._queue.shift();
        this.sendMessage(msg);
      }
    });
    // On message loaded from WebSocket
    this._ws.addEventListener('message', (msg) => {
      try {
        msg = JSON.parse(msg.data);
      } catch (e) {
        logError('Error stringify JSON', e, msg);
        return;
      }
      this.triggerEvents(msg);
    });
    // Connection failed
    this._ws.addEventListener('close', () => {
      this._status = false;
      logInfo('WebSocket trying to reconnect...');
      // Don't spam the server with retries
      setTimeout(() => {
        this.initWS();
      }, 300);
    });
  }

  /**
   * Send message to OverlayPluginApi or push into queue before its init
   * @param {Object} msg Object to send
   * @param {Function} cb Callback function
   */
  sendMessage(msg, cb) {
    if (this._wsURL) {
      if (this._status) {
        try {
          this._ws.send(JSON.stringify(msg));
        } catch (e) {
          logError('Error stringify JSON', e, msg);
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
          logError('Error stringify JSON', e, msg);
          return;
        }
      } else {
        this._queue.push({ msg, cb });
      }
    }
  }

  /**
   * Start listening event
   * @param {String} event Event which to subscribe
   */
  listenEvent(event) {
    this.sendMessage({
      call: 'subscribe',
      events: [event],
    });
  }

  /**
   * Trigger event function, called by OverlayPluginApi, need `this` binding
   * @param {Object} msg Data from OverlayPluginApi
   */
  triggerEvents(msg) {
    // If this event type has subscribers
    if (this.subscribers[msg.type]) {
      // Trigger all event's callback
      for (let cb of this.subscribers[msg.type]) {
        if (options.liteMode) {
          cb(parseData(msg));
        } else {
          cb(msg);
        }
      }
    }
  }
}
