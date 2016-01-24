require('./lib/Object.polyfill.js');
require('whatwg-fetch');

var SocketPeer = require('socketpeer');

var PROXY_URL = '';
if (typeof process !== 'undefined') {
  PROXY_URL = process.env.npm_package_config_proxy_host
    + ':' + process.env.npm_package_config_proxy_port;
}

/**
 * Client controls via WebRTC datastream, for A-Frame.
 *
 * @namespace proxy-controls
 * @param {string} proxyUrl - URL of remote WebRTC connection broker.
 * @param {string} proxyPath - Proxy path on connection broken service.
 * @param {string} pairCode - ID for local client. If not specified, a random
 *                          code is fetched from the server.
 * @param {bool} [enabled=true] - To completely enable or disable the remote updates.
 * @param {debug} [debug=false] - Whether to show debugging information in the log.
 */
module.exports = {
  /*******************************************************************
  * Schema
  */

  schema: {
    enabled: { default: true },
    debug: { default: false },

    // WebRTC/WebSocket configuration.
    proxyUrl: { default: PROXY_URL },
    pairCode: { default: '' }
  },


  /*******************************************************************
  * Styles
  */

  styles: {
    overlay: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      maxWidth: 'calc(100% - 40px)',
      boxSizing: 'border-box',
      padding: '0.5em',
      color: '#FFF',
      background: 'rgba(0,0,0,0.5)',
      borderRadius: '3px',
      fontFamily: 'monospace',
      fontSize: '1.2em'
    }
  },

  /*******************************************************************
  * Initialization
  */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    /** @type {SocketPeer} WebRTC/WebSocket connection. */
    this.peer = null;

    /** @type {Element} Overlay element to display local client ID. */
    this.overlay = null;

    /** @type {Object} State tracking, keyed by event type. */
    this.state = {};

    if (this.data.pairCode) {
      this.setupConnection(this.data.pairCode);
    } else {
      fetch(this.data.proxyUrl + '/ajax/pair-code')
        .then(function (response) { return response.json(); })
        .then(function (data) { return data.pairCode; })
        .then(this.setupConnection.bind(this))
        .catch(console.error.bind(console));
    }
  },

  /*******************************************************************
  * WebRTC Connection
  */

  setupConnection: function (pairCode) {
    if (!this.data.proxyUrl) {
      console.error('proxy-controls "proxyUrl" property not found.');
      return;
    }

    var peer = this.peer = new SocketPeer({
      pairCode: pairCode,
      url: this.data.proxyUrl + '/socketpeer/'
    });

    // Debugging
    if (this.data.debug) {
      peer.on('connect', console.info.bind(console, 'peer:connect("%s")'));
      peer.on('upgrade', console.info.bind(console, 'peer:upgrade("%s")'));
    }

    this.createOverlay('Pair code: "' + pairCode + '"');
    peer.on('connect', this.onConnection.bind(this));
    peer.on('disconnect', this.createOverlay.bind(this, pairCode));
    peer.on('error', function (error) {
      if (this.data.debug) console.error('peer:error(%s)', error.message);
    }.bind(this));
  },

  onConnection: function () {
    if (this.data.debug) console.info('peer:connection()');
    this.peer.on('data', this.onEvent.bind(this));
    this.overlay.remove();
  },

  createOverlay: function (text) {
    this.overlay = document.createElement('div');
    this.overlay.textContent = text;
    Object.assign(this.overlay.style, this.styles.overlay);
    document.body.appendChild(this.overlay);
  },

  /*******************************************************************
  * Remote event propagation
  */

  onEvent: function (event) {
    if (!event.type) {
      if (this.data.debug) console.warn('Missing event type.');
    } else if (event.type === 'ping') {
      this.peer.send(event);
    } else {
      this.state[event.type] = event.state;
    }
  },

  /*******************************************************************
  * Accessors
  */

  /**
   * Returns true if the ProxyControls instance is currently connected to a
   * remote peer and able to accept input events.
   *
   * @return {boolean}
   */
  isConnected: function () {
    var peer = this.peer || {};
    return peer.socketConnected || peer.rtcConnected;
  },

  /**
   * Returns the Gamepad instance at the given index, if any.
   *
   * @param  {number} index
   * @return {Gamepad}
   */
  getGamepad: function (index) {
    return (this.state.gamepad || {})[index];
  },

  /**
   * Returns an object representing keyboard state. Object will have keys
   * for every pressed key on the keyboard, while unpressed keys will not
   * be included. For example, while pressing Shift+A, this function would
   * return: `{SHIFT: true, A: true}`.
   *
   * @return {Object}
   */
  getKeyboard: function () {
    return this.state.keyboard || {};
  },

  /**
   * Generic accessor for custom input types.
   *
   * @param {string} type
   * @return {Object}
   */
  get: function (type) {
    return this.state[type];
  },

  /*******************************************************************
  * Dealloc
  */

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () {
    if (this.peer) this.peer.destroy();
  }
};
