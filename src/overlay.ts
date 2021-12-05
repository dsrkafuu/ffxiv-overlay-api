import { logInfo, logError } from './utils/logger';
import defaultOptions from './utils/options';
import extendData from './modules/extendData';
import mergeCombatant from './modules/mergeCombatant';

type MessageCallback = (msg: any) => void;

// messages send with `_sendMessage`
interface MessageObject {
  msg: any;
  cb?: MessageCallback;
}

// subscribers to some event of `EventType`
interface EventSubscribers {
  [event: string]: EventCallback[];
}

class OverlayAPI {
  // singleton
  static _instance: OverlayAPI | null = null;
  // function for merging combatant like pets into first player arg
  static mergeCombatant = mergeCombatant;

  // settings
  _options: OverlayOptions = {};
  // event subscribers
  _subscribers: EventSubscribers = {};
  // plugin init status
  _status = false;
  // waiting queue before api init
  _queue: MessageObject[] = [];
  _wsURL =
    Array.from(
      /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href) ||
        /[?&]HOST_PORT=([^&]+)/.exec(window.location.href) ||
        []
    )[1] || '';
  _ws: WebSocket | null = null;
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
      !this._options.silentMode &&
        logInfo('initializing api in websocket mode...');
      this._initWebSocketMode();
    } else {
      // normal mode
      !this._options.silentMode &&
        logInfo('initializing api in callback mode...');
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
  _sendMessage(msg: any, cb?: MessageCallback) {
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
  _triggerEvents(msg: EventMessage) {
    // if this event type has subscribers
    if (this._subscribers[msg.type]) {
      // trigger all this event's callback
      for (const cb of this._subscribers[msg.type]) {
        if (this._options.extendData) {
          cb(extendData(msg, !!this._options.seperateLB));
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
        const { msg } = this._queue.shift() as MessageObject;
        this._sendMessage(msg);
      }
      !this._options.silentMode && logInfo('api ready');
    });
    // on message loaded from WebSocket
    this._ws.addEventListener('message', (msg) => {
      let data: EventMessage;
      try {
        data = JSON.parse(msg.data) as EventMessage;
      } catch (e) {
        logError(e, msg);
        return;
      }
      this._triggerEvents(data);
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
      !this._options.silentMode &&
        logInfo('api not ready, trying to reconnect...');
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
      const { msg, cb } = this._queue.shift() as MessageObject;
      this._sendMessage(msg, cb);
    }
    !this._options.silentMode && logInfo('api ready');
  }

  /**
   * add an event listener
   */
  addListener(event: EventType, cb: EventCallback) {
    // init event array
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }
    // push events
    if (typeof cb === 'function') {
      this._subscribers[event].push(cb);
      !this._options.silentMode &&
        logInfo('listener', cb, 'of event', event, 'added');
    } else {
      logError('wrong params', cb);
    }
  }

  /**
   * remove a listener
   */
  removeListener(event: EventType, cb: EventCallback) {
    if (this._subscribers[event]) {
      if (typeof cb === 'function') {
        const cbPos = this._subscribers[event].indexOf(cb);
        if (cbPos > -1) {
          this._subscribers[event].splice(cbPos, 1);
          !this._options.silentMode &&
            logInfo('listener', cb, 'of event', event, 'removed');
        }
      } else {
        logError('wrong params', cb);
      }
    }
  }

  /**
   * remove all listener of one event type
   */
  removeAllListener(event: EventType) {
    if (this._subscribers[event] && this._subscribers[event].length > 0) {
      this._subscribers[event] = [];
      !this._options.silentMode &&
        logInfo('all listener of event', event, 'removed');
    }
  }

  /**
   * get all listeners of a event
   */
  getAllListener(event: EventType) {
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
    !this._options.silentMode &&
      logInfo('events', Object.keys(this._subscribers), 'started');
  }

  /**
   * ends current encounter and save it
   */
  endEncounter() {
    if (this._status) {
      return window.OverlayPluginApi.endEncounter();
    }
    !this._options.silentMode && logInfo('encounter ended');
  }

  /**
   * this function allows you to call an overlay handler,
   * these handlers are declared by Event Sources,
   * either built into OverlayPlugin or loaded through addons like Cactbot
   */
  callHandler(msg: any) {
    let p;
    if (this._ws) {
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
  simulateData(msg: EventMessage) {
    this._triggerEvents(msg);
  }
}

export default OverlayAPI;
