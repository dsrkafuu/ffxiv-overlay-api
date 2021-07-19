import { logInfo, logError } from './components/logger';
import defaultOptions from './components/defaultOptions';
import { extendData } from './components/extendData';

import {
  ReqMessage,
  EventCallback,
  EventCenter,
  EventType,
  HandlerCallback,
  OverlayOptions,
  QueueMessage,
  ResMessage,
  ResponsePromises,
  SubscribeReqMessage,
  CombatDataResMessage,
} from './types';

export default class OverlayAPI {
  _options: OverlayOptions = {};
  // event subscribers
  _subscribers: EventCenter = {};
  // plugin init status
  _status: boolean = false;
  // waiting queue before api init
  _queue: QueueMessage[] = [];
  // websocket mode staff
  _wsURL: string = (() => {
    const exec =
      /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href) ||
      /[?&]HOST_PORT=([^&]+)/.exec(window.location.href);
    if (exec && exec[1]) {
      return exec[1];
    } else {
      return '';
    }
  })();
  _ws: WebSocket | null = null;
  // for callHandler function
  _resCounter: number = 0;
  _resPromises: ResponsePromises = {};

  /**
   * init API
   */
  constructor(options: OverlayOptions = {}) {
    // init options
    this._options = Object.assign({}, defaultOptions, options);

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
    (window as any).dispatchOverlayEvent = this._triggerEvents.bind(this);
  }

  /**
   * send message to OverlayPluginApi or push into queue before its init
   */
  _sendMessage(msg: ReqMessage, cb?: HandlerCallback) {
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
          (window as any).OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
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
  _triggerEvents(msg: ResMessage) {
    // if this event type has subscribers
    if (this._subscribers[msg.type]) {
      const callbacks = this._subscribers[msg.type] as EventCallback[];
      // trigger all this event's callback
      for (const cb of callbacks) {
        if (this._options.extendData && msg.type === 'CombatData') {
          cb(extendData(msg as CombatDataResMessage));
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
        const { msg } = this._queue.shift() as QueueMessage;
        this._sendMessage(msg);
      }
      !this._options.silentMode && logInfo('api ready');
    });

    // on message loaded from WebSocket
    this._ws.addEventListener('message', (res) => {
      try {
        const msg = JSON.parse(res.data) as ResMessage;
        // `common.js` _L43 porting
        if (msg.rseq !== undefined && this._resPromises[msg.rseq]) {
          this._resPromises[msg.rseq](msg); // resolve(msg)
          delete this._resPromises[msg.rseq];
        } else {
          this._triggerEvents(msg);
        }
      } catch (e) {
        logError(e, res);
        return;
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
    if (!(window as any).OverlayPluginApi || !(window as any).OverlayPluginApi.ready) {
      !this._options.silentMode && logInfo('api not ready, trying to reconnect...');
      setTimeout(() => {
        this._initCallbackMode();
      }, 5000);
      return;
    }

    // api loaded
    this._status = true;
    // bind `this` for callback function called by OverlayAPI
    // `common.js` _L78 binding
    (window as any).__OverlayCallback = this._triggerEvents.bind(this);
    // send all messages in queue to OverlayPlugin
    while (this._queue.length > 0) {
      let { msg, cb } = this._queue.shift() as QueueMessage;
      this._sendMessage(msg, cb);
    }
    !this._options.silentMode && logInfo('api ready');
  }

  /**
   * add an event listener
   */
  addListener(event: EventType, cb: EventCallback) {
    // init callback array
    if (!this._subscribers[event]) {
      this._subscribers[event] = [];
    }
    const callbacks = this._subscribers[event] || [];
    callbacks.push(cb);
    !this._options.silentMode && logInfo('listener', cb, 'of event', event, 'added');
  }

  /**
   * remove a listener
   */
  removeListener(event: EventType, cb: EventCallback) {
    const callbacks = this._subscribers[event] || [];
    if (callbacks.length > 0) {
      const idx = callbacks.indexOf(cb);
      if (idx > -1) {
        callbacks.splice(idx, 1);
        !this._options.silentMode && logInfo('listener', cb, 'of event', event, 'removed');
      }
    }
  }

  /**
   * remove all listener of one event type
   */
  removeAllListener(event: EventType) {
    const callbacks = this._subscribers[event] || [];
    if (callbacks.length > 0) {
      this._subscribers[event] = [];
      !this._options.silentMode && logInfo('all listener of event', event, 'removed');
    }
  }

  /**
   * get all listeners of a event
   */
  getAllListener(event: EventType) {
    return this._subscribers[event] || [];
  }

  /**
   * start listening event
   */
  startEvent() {
    this._sendMessage({
      call: 'subscribe',
      events: Object.keys(this._subscribers),
    } as SubscribeReqMessage);
    !this._options.silentMode && logInfo('events', Object.keys(this._subscribers), 'started');
  }

  /**
   * ends current encounter and save it
   */
  endEncounter() {
    if (this._status) {
      return (window as any).OverlayPluginApi.endEncounter();
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
  callHandler(msg: ReqMessage) {
    let p;
    if (this._ws) {
      msg.rseq = this._resCounter++;
      const resq = msg.rseq;
      p = new Promise((resolve) => {
        this._resPromises[resq] = resolve;
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
  simulateData(msg: ResMessage) {
    this._triggerEvents(msg);
  }
}
