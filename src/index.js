/*! ffxiv-overlay-plugin | DSRKafuU (https://dsrkafuu.co) | Copyright MIT License */

import { logInfo, logError } from './components/logger';
import { defaultOptions } from './components/defaultOptions';
import { extendData } from './components/extendData';

/**
 * @class
 */
export class OverlayAPI {
  // settings
  #options = {};
  // event subscribers
  // { event:string : cb:function[] }
  #subscribers = {};
  // plugin init status
  #status = false;
  // waiting queue before api init
  // { msg:object, cb:function }[] (normal) | msg[] (ws)
  #queue = [];
  // websocket
  #wsURL = /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href);
  #ws = null;
  #resCounter = 0;
  #resPromises = {};

  /**
   * init API
   * @constructor
   * @param {Object} options
   */
  constructor(options = {}) {
    // init options
    this.#options = Object.assign({}, defaultOptions, options);

    // check mode
    if (this.#wsURL && this.#wsURL.length > 0) {
      // if in websocket mode
      !this.#options.silentMode && logInfo('initializing api in websocket mode...');
      this.#initWebSocketMode();
    } else {
      // normal mode
      !this.#options.silentMode && logInfo('initializing api in callback mode...');
      this.#initCallbackMode();
    }
    // `common.js` #L92 binding
    window.dispatchOverlayEvent = this.#triggerEvents.bind(this);
  }

  /**
   * send message to OverlayPluginApi or push into queue before its init
   * @private
   * @param {Object} msg object to send
   * @param {Function} cb callback function
   */
  #sendMessage(msg, cb) {
    if (this.#ws) {
      // websocket mode
      if (this.#status) {
        try {
          this.#ws.send(JSON.stringify(msg));
        } catch (e) {
          logError(e, msg);
          return;
        }
      } else {
        this.#queue.push(msg);
      }
    } else {
      // callback mode
      if (this.#status) {
        try {
          window.OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
        } catch (e) {
          logError(e, msg);
          return;
        }
      } else {
        this.#queue.push({ msg, cb });
      }
    }
  }

  /**
   * trigger event function, called by OverlayPluginApi, need `this` binding
   * @private
   * @param {Object} msg data from OverlayPluginApi
   */
  #triggerEvents(msg) {
    // if this event type has subscribers
    if (this.#subscribers[msg.type]) {
      // trigger all this event's callback
      for (let cb of this.#subscribers[msg.type]) {
        if (this.#options.extendData) {
          cb(extendData(msg));
        } else {
          cb(msg);
        }
      }
    }
  }

  /**
   * init websocket connection
   * @private
   */
  #initWebSocketMode() {
    this.#ws = new WebSocket(this.#wsURL[1]);
    // log error
    this.#ws.addEventListener('error', (e) => {
      logError(e);
    });
    // successfully connected WebSocket
    this.#ws.addEventListener('open', () => {
      !this.#options.silentMode && logInfo('websocket connected');
      this.#status = true;
      // send all messages in queue to OverlayPlugin
      while (this.#queue.length > 0) {
        let msg = this.#queue.shift();
        this.#sendMessage(msg);
      }
      !this.#options.silentMode && logInfo('api ready');
    });
    // on message loaded from WebSocket
    this.#ws.addEventListener('message', (msg) => {
      try {
        msg = JSON.parse(msg.data);
      } catch (e) {
        logError(e, msg);
        return;
      }
      if (msg.rseq !== undefined && this.#resPromises[msg.rseq]) {
        this.#resPromises[msg.rseq](msg);
        delete this.#resPromises[msg.rseq];
      } else {
        this.#triggerEvents(msg);
      }
    });
    // connection failed
    this.#ws.addEventListener('close', () => {
      this.#status = false;
      !this.#options.silentMode && logInfo('websocket trying to reconnect...');
      // don't spam the server with retries
      setTimeout(() => {
        this.#initWebSocketMode();
      }, 5000);
    });
  }

  /**
   * init OverlayPluginApi connection
   * @private
   */
  #initCallbackMode() {
    if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
      !this.#options.silentMode && logInfo('api not ready, trying to reconnect...');
      setTimeout(() => {
        this.#initCallbackMode();
      }, 5000);
      return;
    }
    // api loadedpoint
    this.#status = true;
    // bind `this` for callback function called by OverlayAPI
    // `common.js` #L78 binding
    window.__OverlayCallback = this.#triggerEvents.bind(this);
    // send all messages in queue to OverlayPlugin
    while (this.#queue.length > 0) {
      let { msg, cb } = this.#queue.shift();
      this.#sendMessage(msg, cb);
    }
    !this.#options.silentMode && logInfo('api ready');
  }

  /**
   * add an event listener
   * @public
   * @param {string} event event to listen
   * @param {Function} cb callback function
   */
  addListener(event, cb) {
    const eventListened = this.#subscribers.hasOwnProperty(event);
    // init event array
    if (!eventListened) {
      this.#subscribers[event] = [];
    }
    // push events
    if (typeof cb === 'function') {
      this.#subscribers[event].push(cb);
      !this.#options.silentMode && logInfo('listener', cb, 'of event', event, 'added');
    } else {
      logError('wrong params', cb);
    }
  }

  /**
   * remove a listener
   * @public
   * @param {string} event event type which listener belongs to
   * @param {Function} cb function which listener to remove
   */
  removeListener(event, cb) {
    const eventListened = this.#subscribers.hasOwnProperty(event);
    if (eventListened) {
      if (typeof cb === 'function') {
        let cbPos = this.#subscribers[event].indexOf(cb);
        if (cbPos > -1) {
          this.#subscribers[event].splice(cbPos, 1);
          !this.#options.silentMode && logInfo('listener', cb, 'of event', event, 'removed');
        }
      } else {
        logError('wrong params', cb);
      }
    }
  }

  /**
   * remove all listener of one event type
   * @public
   * @param {string} event event type which listener belongs to
   */
  removeAllListener(event) {
    if (this.#subscribers[event] && this.#subscribers[event].length > 0) {
      this.#subscribers[event] = [];
      !this.#options.silentMode && logInfo('all listener of event', event, 'removed');
    }
  }

  /**
   * get all listeners of a event
   * @public
   * @param {string} event event type which listener belongs to
   * @return {Array<Function>}
   */
  getAllListener(event) {
    return this.#subscribers[event] ? this.#subscribers[event] : [];
  }

  /**
   * start listening event
   * @public
   */
  startEvent() {
    this.#sendMessage({
      call: 'subscribe',
      events: Object.keys(this.#subscribers),
    });
    !this.#options.silentMode && logInfo('events', Object.keys(this.#subscribers), 'started');
  }

  /**
   * ends current encounter and save it
   * @public
   * @return {Promise<any>}
   */
  endEncounter() {
    if (this.#status) {
      return window.OverlayPluginApi.endEncounter();
    } else {
      logError('plugin not ready yet');
    }
    !this.#options.silentMode && logInfo('encounter ended');
  }

  /**
   * this function allows you to call an overlay handler,
   * these handlers are declared by Event Sources,
   * either built into OverlayPlugin or loaded through addons like Cactbot
   * @public
   * @param {Object} msg message send to OverlayPlugin
   * @return {Promise<any>}
   */
  callHandler(msg) {
    let p;
    if (this.#ws) {
      msg.rseq = this.#resCounter++;
      p = new Promise((resolve) => {
        this.#resPromises[msg.rseq] = resolve;
      });
      this.#sendMessage(msg);
    } else {
      p = new Promise((resolve) => {
        this.#sendMessage(msg, (data) => {
          let rd;
          try {
            rd = data == null ? null : JSON.parse(data);
          } catch (e) {
            logError(e, data);
            return reject(e);
          }
          return resolve(rd);
        });
      });
    }
    return p;
  }

  /**
   * simulate triggering event once
   * @public
   * @param {Object} msg data same as those from OverlayPluginApi
   */
  simulateData(msg) {
    this.#triggerEvents(msg);
  }
}
