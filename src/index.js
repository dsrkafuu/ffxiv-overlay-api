import { logInfo, logError } from './components/logger';
import { defaultOptions } from './components/defaultOptions';
import { extendData } from './components/extendData';

export default class OverlayAPI {
  // singleton
  static _instance = null;

  // settings
  _options = {};
  // event subscribers
  // { event:string : cb:function[] }
  _subscribers = {};
  // plugin init status
  _status = false;
  // waiting queue before api init
  // { msg:object, cb?:function }[]
  _queue = [];
  _wsURL =
    Array.from(
      /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href) ||
        /[?&]HOST_PORT=([^&]+)/.exec(window.location.href) ||
        []
    )[1] || '';
  _ws = null;
  _resCounter = 0;
  _resPromises = {};

  /**
   * init API
   */
  constructor(options = {}) {
    // singleton
    if (OverlayAPI._instance) {
      return OverlayAPI._instance;
    }

    // init options
    this._options = Object.assign(this._options, defaultOptions, options);
    // check mode
    if (this._wsURL) {
      // if in websocket mode
      !this._options.silentMode && logInfo('initializing api in websocket mode...');
      this._initWebSocketMode();
    } else {
      // normal mode
      !this._options.silentMode && logInfo('initializing api in callback mode...');
      this._initCallbackMode();
    }
    // `common.js` _L92 binding
    window.dispatchOverlayEvent = this._triggerEvents.bind(this);

    // singleton
    if (!OverlayAPI._instance) {
      OverlayAPI._instance = this;
    }
  }

  /**
   * send message to OverlayPluginApi or push into queue before its init
   */
  _sendMessage(msg, cb) {
    if (this._ws) {
      // websocket mode
      if (this._status) {
        try {
          this._ws.send(JSON.stringify(msg));
        } catch (e) {
          logError(e, msg);
          return;
        }
      } else {
        this._queue.push({ msg });
      }
    } else {
      // callback mode
      if (this._status) {
        try {
          window.OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
        } catch (e) {
          logError(e, msg);
          return;
        }
      } else {
        this._queue.push({ msg, cb });
      }
    }
  }

  /**
   * trigger event function, called by OverlayPluginApi, need `this` binding
   */
  _triggerEvents(msg) {
    // if this event type has subscribers
    if (this._subscribers[msg.type]) {
      // trigger all this event's callback
      for (let cb of this._subscribers[msg.type]) {
        if (this._options.extendData) {
          cb(extendData(msg, this._options.seperateLB));
        } else {
          cb(msg);
        }
      }
    }
  }

  /**
   * init websocket connection
   */
  _initWebSocketMode() {
    // legacy ws url support
    let url = this._wsURL;
    if (!url.includes('/ws')) {
      url += (url.endsWith('/') ? '' : '/') + 'ws';
    }
    this._ws = new WebSocket(url);
    // log error
    this._ws.addEventListener('error', (e) => {
      logError(e);
    });
    // successfully connected WebSocket
    this._ws.addEventListener('open', () => {
      !this._options.silentMode && logInfo('websocket connected');
      this._status = true;
      // send all messages in queue to OverlayPlugin
      while (this._queue.length > 0) {
        const { msg } = this._queue.shift();
        this._sendMessage(msg);
      }
      !this._options.silentMode && logInfo('api ready');
    });
    // on message loaded from WebSocket
    this._ws.addEventListener('message', (msg) => {
      try {
        msg = JSON.parse(msg.data);
      } catch (e) {
        logError(e, msg);
        return;
      }
      if (msg.rseq !== undefined && this._resPromises[msg.rseq]) {
        this._resPromises[msg.rseq](msg);
        delete this._resPromises[msg.rseq];
      } else {
        this._triggerEvents(msg);
      }
    });
    // connection failed
    this._ws.addEventListener('close', () => {
      this._status = false;
      !this._options.silentMode && logInfo('websocket trying to reconnect...');
      // don't spam the server with retries
      setTimeout(() => {
        this._initWebSocketMode();
      }, 5000);
    });
  }

  /**
   * init OverlayPluginApi connection
   */
  _initCallbackMode() {
    if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
      !this._options.silentMode && logInfo('api not ready, trying to reconnect...');
      setTimeout(() => {
        this._initCallbackMode();
      }, 5000);
      return;
    }
    // api loadedpoint
    this._status = true;
    // bind `this` for callback function called by OverlayAPI
    // `common.js` _L78 binding
    window.__OverlayCallback = this._triggerEvents.bind(this);
    // send all messages in queue to OverlayPlugin
    while (this._queue.length > 0) {
      const { msg, cb } = this._queue.shift();
      this._sendMessage(msg, cb);
    }
    !this._options.silentMode && logInfo('api ready');
  }

  /**
   * add an event listener
   */
  addListener(event, cb) {
    // init event array
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }
    // push events
    if (typeof cb === 'function') {
      this._subscribers[event].push(cb);
      !this._options.silentMode && logInfo('listener', cb, 'of event', event, 'added');
    } else {
      logError('wrong params', cb);
    }
  }

  /**
   * remove a listener
   */
  removeListener(event, cb) {
    if (this._subscribers[event]) {
      if (typeof cb === 'function') {
        let cbPos = this._subscribers[event].indexOf(cb);
        if (cbPos > -1) {
          this._subscribers[event].splice(cbPos, 1);
          !this._options.silentMode && logInfo('listener', cb, 'of event', event, 'removed');
        }
      } else {
        logError('wrong params', cb);
      }
    }
  }

  /**
   * remove all listener of one event type
   */
  removeAllListener(event) {
    if (this._subscribers[event] && this._subscribers[event].length > 0) {
      this._subscribers[event] = [];
      !this._options.silentMode && logInfo('all listener of event', event, 'removed');
    }
  }

  /**
   * get all listeners of a event
   */
  getAllListener(event) {
    return this._subscribers[event] ? this._subscribers[event] : [];
  }

  /**
   * start listening event
   */
  startEvent() {
    this._sendMessage({
      call: 'subscribe',
      events: Object.keys(this._subscribers),
    });
    !this._options.silentMode && logInfo('events', Object.keys(this._subscribers), 'started');
  }

  /**
   * ends current encounter and save it
   */
  endEncounter() {
    if (this._status) {
      return window.OverlayPluginApi.endEncounter();
    } else {
      logError('plugin not ready yet');
    }
    !this._options.silentMode && logInfo('encounter ended');
  }

  /**
   * this function allows you to call an overlay handler,
   * these handlers are declared by Event Sources,
   * either built into OverlayPlugin or loaded through addons like Cactbot
   */
  callHandler(msg) {
    let p;
    if (this._ws) {
      msg.rseq = this._resCounter++;
      p = new Promise((resolve) => {
        this._resPromises[msg.rseq] = resolve;
      });
      this._sendMessage(msg);
    } else {
      p = new Promise((resolve, reject) => {
        this._sendMessage(msg, (data) => {
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
   */
  simulateData(msg) {
    this._triggerEvents(msg);
  }
}
