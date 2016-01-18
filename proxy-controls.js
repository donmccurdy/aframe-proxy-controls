/**
 * Client controls via WebRTC datastream, for A-Frame.
 *
 * @namespace proxy-controls
 * @param {string} url - URL of remote WebRTC connection broker.
 * @param {key} key - API key for PeerJS service.
 * @param {id} id - ID for local client.
 * @param {bool} [enabled=true] - To completely enable or disable the remote updates.
 * @param {debug} [debug=false] - Whether to show debugging information in the log.
 */
require('./lib/Object.polyfill.js');

var SocketPeer = require('socketpeer');

module.exports = {
	/*******************************************************************
	* Schema
	*/

	schema: {
		enabled: { default: true },
		debug: { default: false },

		// WebRTC/WebSocket configuration.
		url: { default: 'http://localhost:3001/socketpeer/' },
		room: { default: 'my-room' }
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

		/** @type {Array<Gamepad>} Gamepad states from remote client. */
		this.gamepads = [];

		/** @type {Object} Pressed keys on remote client keyboard [key]->true. */
		this.keys = {};

		this.setupConnection();
	},

	/*******************************************************************
	* WebRTC Connection
	*/

	setupConnection: function () {
		if (!this.data.room || !this.data.url) {
			console.error('proxy-controls "room" and "url" properties not found.');
		}

		var peer = this.peer = new SocketPeer({
			pairCode: this.data.room,
			url: this.data.url
	  	});

		// Debugging
		if (this.data.debug) {
			peer.on('connect', console.info.bind(console, 'peer:connect("%s")'));
			peer.on('upgrade', console.info.bind(console, 'peer:upgrade("%s")'));
		}

		// peer.on('connect', this.createOverlay.bind(this));
		peer.on('connect', this.onConnection.bind(this));
		peer.on('error', function (error) {
			if (this.data.debug) console.error('peer:error(%s)', error.message);
		}.bind(this));
	},

	onConnection: function () {
		if (this.data.debug) console.info('peer:connection()');
		this.peer.on('data', this.onEvent.bind(this));
		// this.overlay.remove();
	},

	// createOverlay: function (text) {
	// 	this.overlay = document.createElement('div');
	// 	this.overlay.textContent = text;
	// 	Object.assign(this.overlay.style, this.styles.overlay);
	// 	document.body.appendChild(this.overlay);
	// },

	/*******************************************************************
	* Remote event propagation
	*/

	onEvent: function (event) {
		if (!event.type) {
			if (this.data.debug) console.warn('Missing event type.');
			return;
		}

		switch (event.type) {
			case 'keyboard':
				this.keys = event.state;
				break;
			case 'gamepad':
				this.gamepads = event.state;
				break;
			default:
				if (this.data.debug) console.warn('Unknown event type: "%s"', event.type);
				return;
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
		return this.gamepads[index];
	},

	/**
	 * Returns an object representing keyboard state. Object will have keys
	 * for every pressed key on the keyboard, while unpressed keys will not
	 * be included. For example, while pressing Shift+A, this function would
	 * return: `{SHIFT: true, A: true}`.
	 *
	 * @return {Object} [description]
	 */
	getKeyboard: function () {
		return this.keys;
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
