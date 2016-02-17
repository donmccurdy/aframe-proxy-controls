require('./lib/Object.polyfill.js');
require('whatwg-fetch');

var SocketPeer = require('socketpeer'),
    Overlay = require('./lib/overlay');

var PROXY_URL = 'https://proxy-controls.donmccurdy.com';
if (typeof process !== 'undefined') {
  PROXY_URL = process.env.npm_package_config_proxy_url || PROXY_URL;
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
    pairCode: { default: '' },

    // Overlay styles
    enableOverlay: {default: true },
    enableOverlayStyles: { default: true }
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

    /** @type {Overlay} Overlay to display pair code. */
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

  tick: function () {},

  /*******************************************************************
  * WebRTC Connection
  */

  setupConnection: function (pairCode) {
    var data = this.data;

    if (!data.proxyUrl) {
      console.error('proxy-controls "proxyUrl" property not found.');
      return;
    }

    var peer = this.peer = new SocketPeer({
      pairCode: pairCode,
      url: data.proxyUrl + '/socketpeer/'
    });

    this.el.emit('proxycontrols.paircode', {pairCode: pairCode});
    this.createOverlay(pairCode);

    peer.on('connect', this.onConnection.bind(this));
    peer.on('disconnect', this.createOverlay.bind(this, pairCode));
    peer.on('error', function (error) {
      if (data.debug) console.error('peer:error(%s)', error.message);
    });

    // Debugging
    if (data.debug) {
      peer.on('connect', console.info.bind(console, 'peer:connect("%s")'));
      peer.on('upgrade', console.info.bind(console, 'peer:upgrade("%s")'));
    }
  },

  onConnection: function () {
    if (this.data.debug) console.info('peer:connection()');
    if (this.overlay) this.overlay.destroy();
    this.peer.on('data', this.onEvent.bind(this));
  },

  createOverlay: function (pairCode) {
    if (this.data.enableOverlay) {
      this.overlay = new Overlay(
        pairCode,
        this.data.proxyUrl + '/#/connect',
        this.data.enableOverlayStyles
      );
    }
  },

  /*******************************************************************
  * Remote event propagation
  */

  onEvent: function (event) {
    if (!this.data.enabled) {
      return;
    } else if (!event.type) {
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
    if (this.overlay) this.overlay.destroy();
  }
};
