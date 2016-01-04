/**
 * Client controls via WebRTC datastream, for A-Frame VR.
 *
 * @namespace proxy-controls
 * @param {string} url - URL of remote WebRTC connection broker.
 * @param {key} key - API key for PeerJS service.
 * @param {id} id - ID for local client.
 * @param {number} [easing=20] - How fast the movement decelerates. If you hold the
 * keys the entity moves and if you release it will stop. Easing simulates friction.
 * @param {number} [acceleration=65] - Determines the acceleration given
 * to the entity when pressing the keys.
 * @param {bool} [enabled=true] - To completely enable or disable the controls
 * @param {bool} [fly=false] - Determines if the direction of the movement sticks
 * to the plane where the entity started off or if there are 6 degrees of
 * freedom as a diver underwater or a plane flying.
 * @param {string} [wsAxis='z'] - The axis that the W and S keys operate on
 * @param {string} [adAxis='x'] - The axis that the A and D keys operate on
 * @param {bool} [wsInverted=false] - WS Axis is inverted
 * @param {bool} [adInverted=false] - AD Axis is inverted
 * @param {debug} [debug=false] - Whether to show debugging information in the log.
 */
require('./lib/Object.polyfill.js');

var Peer = require('peerjs'),
	URLParser = require('./lib/URLParser').URLParser;

module.exports = {
	/*******************************************************************
	* Schema
	*/

	schema: {
		enabled: { default: true },
		debug: { default: false },

		// WebRTC configuration.
		url: { default: '' },
		key: { default: '' },
		id: { default: '' }
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
		/** @type {Peer} WebRTC P2P connection broker. */
		this.peer = null;

		/** @type {DataConnection} DataConnection to remote client. */
		this.conn = null;

		/** @type {Element} Overlay element to display local client ID. */
		this.overlay = null;

		/** @type {Array<Gamepad>} Gamepad states from remote client. */
		this.gamepads = [];

		/** @type {Array<string>} Pressed keys on remote client keyboard. */
		this.keys = [];

		this.setupConnection();
	},

	/*******************************************************************
	* WebRTC Connection
	*/

	setupConnection: function () {
		var id = this.data.id || null;

		if (this.data.key && this.data.url) {
			console.warn('If both key and url are provided, only key will be used.');
		} else if (!this.data.key && !this.data.url) {
			console.warn('WebRTC connection cannot be made without API key or host.');
		}

		if (this.data.key) {
			this.peer = new Peer(id, {
				key: this.data.key,
				debug: this.data.debug ? 3 : 0
			});
		} else if (this.data.url) {
			var url = URLParser.parse(this.data.url);
			this.peer = new Peer(id, {
				host: url.getProtocol() + '//' + url.getHost(),
				path: url.getPathname(),
				port: url.getPort(),
				debug: this.data.debug ? 3 : 0
			});
		}

		// Debugging
		if (this.data.debug) {
			this.peer.on('open', console.info.bind(console, 'peer:open("%s")'));
		}

		this.peer.on('open', this.createOverlay.bind(this));
		this.peer.on('connection', this.onConnection.bind(this));
		this.peer.on('error', function (error) {
			if (this.data.debug) console.error('peer:error(%s)', error.message);
			if (error.type === 'browser-incompatible') {
				this.createOverlay('Client Controls: Sorry, current browser does not support WebRTC.');
			}
		}.bind(this));
	},

	onConnection: function (conn) {
		if (this.data.debug) console.info('peer:connection(%s)', conn.peer);
		conn.on('data', this.onEvent.bind(this));
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
			return;
		}

		switch (event.type) {
			case 'keyboard':
				this.keys = event.state;
				if (this.data.debug) {
					console.log('event:keyboard(⬇️)');
					console.log(event.state);
				}
				break;
			case 'gamepad':
				this.gamepads = event.state;
				if (this.data.debug) {
					console.log('event:gamepad(⬇️)');
					console.log(event.state);
				}
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
		var keyboard = {};
		for (var i = 0; i < this.keys.length; i++) {
			keyboard[this.keys[i]] = true;
		}
		return keyboard;
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
