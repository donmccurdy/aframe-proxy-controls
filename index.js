/**
 * Client controls via WebRTC datastream, for A-Frame VR.
 */
var Peer = require('peerjs');

module.exports.component = {
	schema: {
		url: { default: '' },
		key: { default: '' },
		id: { default: '' },
		debug: { default: '' }
	},

	/**
	 * Called once when component is attached. Generally for initial setup.
	 */
	init: function () {
		/** @type {Peer} WebRTC P2P connection broker. */
		this.peer = null;

		/** @type {DataConnection} DataConnection to remote client. */
		this.conn = null;
	},

	/**
	 * Called when component is attached and when component data changes.
	 * Generally modifies the entity based on the data.
	 */
	update: function () {
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
			this.peer = new Peer(id, {
				host: this.getHost(),
				path: this.getPath(),
				port: this.getPort(),

				debug: this.data.debug ? 3 : 0
			});
		}

		if (this.data.debug) {
			this.peer.on('open', console.info.bind(console, 'peer:open("%s")'));
			this.peer.on('error', console.warn.bind(console, 'peer:error("%s")'));
			window.clientControls = this;
		}
	},

	getHost: function () {
		var a = this._getAnchor();
		return a.protocol + '//' + a.host;
	},

	getPath: function () {
		return this._getAnchor().pathname;
	},

	getPort: function () {
		return this._getAnchor().port || 80;
	},

	/**
	 * Helper function for URL parsing.
	 * @return {!Element}
	 * @private
	 */
	_getAnchor: function () {
		var a = document.createElement('A');
		a.href = this.data.url;
		return a;
	},

	/**
	 * Called when a component is removed (e.g., via removeAttribute).
	 * Generally undoes all modifications to the entity.
	 */
	remove: function () {
		if (this.peer) this.peer.destroy();
	}
};
