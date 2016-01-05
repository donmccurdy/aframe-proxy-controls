require('keyboardevent-key-polyfill').polyfill();

var EventEmitter = require('events'),
	Peer = require('peerjs'),
	util = require('util');

var ProxyControlsClient = function (apiKey) {
	EventEmitter.call(this);

	/** @type {string} PeerJS API key. */
	this.apiKey = apiKey;

	/** @type {Peer} PeerJS instance, connected to broker server. */
	this.peer = null;

	/** @type {DataConnection} Peer-to-peer connection receiving events. */
	this.conn = null;

	this.init();
};

util.inherits(ProxyControlsClient, EventEmitter);

/**
 * Initializes PeerJS connection with broker server, and begins listening for
 * client connections.
 */
ProxyControlsClient.prototype.init = function () {
	this.peer = new Peer({key: this.apiKey});
	this.peer.on('open', console.info.bind(console, 'peer:open(%s)'));
	this.peer.on('error', console.warn.bind(console, 'peer:error(%s)'));
	this.peer.on('connection', console.info.bind(console, 'peer:connection'));
};

/**
 * Connect to remote application by PeerJS ID.
 * @param  {string} id
 */
ProxyControlsClient.prototype.connect = function (id) {
	this.conn = this.peer.connect(id);
	this.conn.on('open', function () {
		console.info('peer:open(%s)', id);
		this.bindKeyboardEvents();
		this.bindGamepadEvents();
		this.emit('open', {id: id});
	}.bind(this));
	this.conn.on('data', console.log.bind(console, 'peer:data(%s)'));
	this.conn.on('error', console.error.bind(console, 'peer:error(%s)'));
};

/**
 * Binds keyboard events to shared datachannel.
 */
ProxyControlsClient.prototype.bindKeyboardEvents = function () {
	var keys = {};

	var publish = function () {
		this.conn.send({type: 'keyboard', state: Object.keys(keys)});
	}.bind(this);

	document.addEventListener('keydown', function (e) {
		if (keys[e.key]) return;
		keys[e.key] = true;
		publish();
	});

	document.addEventListener('keyup', function (e) {
		if (!keys[e.key]) return;
		delete keys[e.key];
		publish();
	});
};

/**
 * Binds Gamepad events to shared datachannel. 
 */
ProxyControlsClient.prototype.bindGamepadEvents = function () {
	var publish = function () {
		var gamepads = [];
		for (var i = 0; i < 4; i++) {
			var gamepad = navigator.getGamepads()[i];
			if (gamepad) {
				gamepads.push(cloneGamepad(gamepad));
			}
		}
		if (gamepads.length) {
			this.conn.send({type: 'gamepad', state: gamepads});
		}
		window.requestAnimationFrame(publish);
	}.bind(this);

	var cloneGamepad = function (gamepad) {
		var clone = {
			axes: gamepad.axes,
			buttons: [],
			connected: gamepad.connected,
			id: gamepad.id,
			index: gamepad.index,
			mapping: gamepad.mapping,
			timestamp: gamepad.timestamp,
		};

		for (var i = 0; i < gamepad.buttons.length; i++) {
			clone.buttons.push({
				pressed: gamepad.buttons[i].pressed,
				value: gamepad.buttons[i].value
			});
		}

		return clone;
	};

	window.requestAnimationFrame(publish);
};

module.exports = window.ProxyControlsClient = ProxyControlsClient;
