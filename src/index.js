import { logInfo, logError } from './components/logger';
import defaultOptions from './components/options';
// import parseData from './components/parser';

/**
 * OverlayAPI class
 * @class
 */
export default class OverlayAPI {
  // Settings
  #options = {};
  // Event subscribers
  // { event:string : cb:function[] }
  #subscribers = {};
  // Plugin init status
  #status = false;
  // Waiting queue before api init
  // { msg:object, cb:function }[] (normal) | msg[] (ws)
  #queue = [];
  // WebSocket
  #wsURL = /[?&]OVERLAY_WS=([^&]+)/.exec(window.location.href);
  #ws = null;

  // Fake data interval
  #simulator = null;

  /**
   * Init API
   * @constructor
   * @param {Object} options Options
   */
  constructor(options = {}) {
    // Init options
    this.#options = Object.assign({}, defaultOptions, options);
    // Check mode
    if (this.#wsURL && this.#wsURL.length > 0) {
      // If in websocket mode
      this.#initWebSocketMode();
    } else {
      // Normal mode
      this.#initCallbackMode();
    }
    window.dispatchOverlayEvent = this.#triggerEvents.bind(this);
  }

  /**
   * Send message to OverlayPluginApi or push into queue before its init
   * @public
   * @param {Object} msg Object to send
   * @param {Function} cb Callback function
   */
  #sendMessage(msg, cb) {
    if (this.#ws) {
      // WS mode
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
      // CB mode
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
   * Trigger event function, called by OverlayPluginApi, need `this` binding
   * @private
   * @param {Object} msg Data from OverlayPluginApi
   */
  #triggerEvents(msg) {
    // If this event type has subscribers
    if (this.#subscribers[msg.type]) {
      // Trigger all this event's callback
      for (let cb of this.#subscribers[msg.type]) {
        // if (this.#options.liteMode) {
        //   cb(parseData(msg));
        // } else {
        cb(msg);
        // }
      }
    }
  }

  /**
   * Init WebSocket connection
   * @private
   */
  #initWebSocketMode() {
    this.#ws = new WebSocket(this.#wsURL[1]);
    // Log error
    this.#ws.addEventListener('error', (e) => {
      logError(e);
    });
    // Successfully connected WebSocket
    this.#ws.addEventListener('open', () => {
      logInfo('WebSocket connected');
      this.#status = true;
      // Send all messages in queue to OverlayPlugin
      while (this.#queue.length > 0) {
        let msg = this.#queue.shift();
        this.#sendMessage(msg);
      }
    });
    // On message loaded from WebSocket
    this.#ws.addEventListener('message', (msg) => {
      try {
        msg = JSON.parse(msg.data);
      } catch (e) {
        logError(e, msg);
        return;
      }
      this.#triggerEvents(msg);
    });
    // Connection failed
    this.#ws.addEventListener('close', () => {
      this.#status = false;
      logInfo('WebSocket trying to reconnect...');
      // Don't spam the server with retries
      setTimeout(() => {
        this.#initWebSocketMode();
      }, 500);
    });
  }

  /**
   * Init OverlayPluginApi connection
   * @private
   */
  #initCallbackMode() {
    if (!window.OverlayPluginApi || !window.OverlayPluginApi.ready) {
      setTimeout(() => {
        this.#initCallbackMode();
      }, 500);
      return;
    }
    // API loadedpoint
    this.#status = true;
    // Bind `this` for callback function called by OverlayAPI
    window.__OverlayCallback = this.#triggerEvents.bind(this);
    // Send all messages in queue to OverlayPlugin
    while (this.#queue.length > 0) {
      let { msg, cb } = this.#queue.shift();
      this.#sendMessage(msg, cb);
    }
  }

  /**
   * Add an event listener
   * @public
   * @param {String} event Event to listen
   * @param {Function} cb Callback function
   */
  addListener(event, cb) {
    const eventListened = this.#subscribers.hasOwnProperty(event);
    // Init event array
    if (!eventListened) {
      this.#subscribers[event] = [];
    }
    // Push events
    if (typeof cb === 'function') {
      this.#subscribers[event].push(cb);
    } else {
      logError('Wrong params', cb);
      return;
    }
  }

  /**
   * Remove a listener
   * @public
   * @param {String} event Event type which listener belongs to
   * @param {Function} cb Function which listener to remove
   */
  removeListener(event, cb) {
    const eventListened = this.#subscribers.hasOwnProperty(event);
    if (eventListened) {
      if (typeof cb === 'function') {
        let cbPos = this.#subscribers[event].indexOf(cb);
        if (cbPos > -1) {
          this.#subscribers[event].splice(cbPos, 1);
        }
      } else {
        logError('Wrong params', cb);
        return;
      }
    }
  }

  /**
   * Start listening event
   * @public
   */
  startEvent() {
    this.#sendMessage({
      call: 'subscribe',
      events: Object.keys(this.#subscribers),
    });
  }

  /**
   * Remove all listener of one event type
   * @public
   * @param {String} event Event type which listener belongs to
   */
  removeAllListener(event) {
    if (this.#subscribers[event] && this.#subscribers[event].length > 0) {
      this.#subscribers[event] = [];
    }
  }

  /**
   * Get all listeners of a event
   * @public
   * @param {String} event Event type which listener belongs to
   */
  listAllListener(event) {
    return this.#subscribers[event] ? this.#subscribers[event] : [];
  }

  /**
   * Ends current encounter and save it
   * Returns a Promise
   * @public
   */
  endEncounter() {
    if (this.#status) {
      return window.OverlayPluginApi.endEncounter();
    } else {
      logError('Plugin not ready yet');
    }
  }

  // /**
  //  * Switch data simulation
  //  * @param {Object|Boolean} fakeData Simulation data
  //  */
  // simulateData(fakeData) {
  //   if (typeof fakeData === 'object') {
  //     if (fakeData.hasOwnProperty('type') && fakeData.type === 'CombatData') {
  //       this.#simulator = setInterval(() => {
  //         this.#triggerEvents(fakeData);
  //       }, 1000);
  //       logInfo('Data simulating on with fake data', fakeData);
  //     } else {
  //       logError('You need to provide currect fake CombatData object to enable data simulation', e);
  //     }
  //   } else if (typeof fakeData === 'boolean' && !fakeData) {
  //     if (this.#simulator) {
  //       clearInterval(this.#simulator);
  //     }
  //     logInfo('Data simulating off');
  //   } else {
  //     logError('Function simulateData(fakeData) wrong params', fakeData);
  //   }
  // }

  // /**
  //  * This function allows you to call an overlay handler
  //  * These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot)
  //  * Returns a Promise
  //  * @public
  //  * @param {Object} msg Message send to OverlayPlugin
  //  */
  // call(msg) {
  //   return new Promise((resolve, reject) => {
  //     this.#sendMessage(msg, (data) => {
  //       let rd;
  //       try {
  //         rd = data == null ? null : JSON.parse(data);
  //       } catch (e) {
  //         logError('Error parse JSON', e, data);
  //         return reject(e);
  //       }
  //       return resolve(rd);
  //     });
  //   });
  // }
}
