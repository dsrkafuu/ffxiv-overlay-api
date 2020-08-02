/**
 * Ported and modified from ngld/OverlayPlugin
 * MIT License
 */

class RawAPI {
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
    } // API loaded


    this.apiStatus = true; // Bind `this` for callback function called by OverlayAPI, otherwist it will turn to `undefined`

    window.__OverlayCallback = this.triggerEvent.bind(this); // Send all messages in queue to OverlayPluginApi

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
        this.triggerEvent(msg);
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


  triggerEvent(msg) {
    // If this event type has subscribers
    if (this.subscribers[msg.type]) {
      // Trigger all event's callback
      for (var cb of this.subscribers[msg.type]) {
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
      var list = this.subscribers[event];
      var pos = list.indexOf(cb);

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
      events
    });
  }
  /**
   * This function allows you to call an overlay handler.
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot).
   * @param {Object} msg
   */


  callOverlayHandler(msg) {
    return new Promise((resolve, reject) => {
      this.sendMessage(msg, data => {
        try {
          var _rd = data == null ? null : JSON.parse(data);
        } catch (e) {
          console.error('[API] Error stringfy message: ', data, e);
          return reject(e);
        }

        return resolve(rd);
      });
    });
  }

}

var rEvents = {
  CombatData: [data => {
    console.log(data.type);
  }, data => {
    console.log(data.isActive);
  }],
  LogLine: null,
  ImportedLogLines: null,
  ChangeZone: data => {
    console.log(data.type);
  },
  ChangePrimaryPlayer: null,
  OnlineStatusChanged: null
};

class OverlayAPI {
  /**
   * Init API
   * @constructor
   * @param {String} options - Message queue before OverlayPluginApi is ready
   * @param {Object} listening - Event types which are being listened and all listeners
   * @param {API} api - Overlay API
   */
  constructor() {
    var _this = this;

    var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.events = Object.assign({}, rEvents, events);
    this.listening = {};
    this.api = new RawAPI(); // Register all events

    var _loop = function _loop(event) {
      var cbs = _this.events[event];

      if (cbs) {
        if (typeof cbs === 'function') {
          _this.add(event, cbs);
        } else if (Array.isArray(cbs)) {
          cbs.forEach(cb => {
            _this.add(event, cb);
          });
        } else {
          console.error('[API] Wrong callback settings in events:', cbs);
        }
      }
    };

    for (var event in this.events) {
      _loop(event);
    }
  }
  /**
   * Add an event listener
   * @param {String} event - Event to listen
   * @param {Function} cb - Callback function
   */


  add(event, cb) {
    if (typeof cb !== 'function') {
      console.error('[API] Wrong params:', cb);
      return;
    }

    this.api.addOverlayListener(event, cb);

    if (!this.listening.hasOwnProperty(event)) {
      this.listening[event] = [];
      this.api.startOverlayEvents([event]);
    }

    this.listening[event].push(cb);
  }
  /**
   * Remove a listener
   * @param {String} event - Event type which listener belongs to
   * @param {Function|Number} id - Function or number which listener to remove
   */


  remove(event, id) {
    // Get cb
    var cb;

    if (typeof id === 'function') {
      cb = id;
    } else if (typeof id === 'number') {
      cb = this.listening[event][id];
      this.listening[event].splice(id, 1);
    } else {
      console.error('[API] Wrong params:', id);
      return;
    } // Remove listener


    this.api.removeOverlayListener(event, cb);
  }
  /**
   * List all event listeners
   */


  list() {
    console.log(this.listening);
  }
  /**
   * This function allows you to call an overlay handler.
   * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot).
   * Returns a Promise
   * @param {Object} msg
   */


  call(msg) {
    return this.api.callOverlayHandler(msg);
  }

}

export default OverlayAPI;
//# sourceMappingURL=overlay.esm.js.map
