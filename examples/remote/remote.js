require('../../lib/KeyboardEvent.polyfill');
var Peer = require('peerjs'),
	_ = require('lodash');

/***********************************************
 * Variables
 */

var peer = new Peer({key: '72chxur433kmaemi'}),
	conn = null;

/***********************************************
 * PeerJS Setup
 */

peer.on('open', console.info.bind(console, 'peer:open(%s)'));
peer.on('error', console.warn.bind(console, 'peer:error(%s)'));
peer.on('connection', function(conn) {
	console.info('peer:connection');
	conn.on('data', function(data){
		console.log('peer:data("%s")', data);
	});
});

window.peer = peer;

/***********************************************
 * Client Connection 
 */

var btn = document.querySelector('[data-bind=connect-btn]'),
	input = document.querySelector('[data-bind=connect-id]'),
	form = document.querySelector('[data-bind=connect-form]');

btn.addEventListener('click', function () {
	if (peer && input.value) {
		conn = peer.connect(input.value);
		window.conn = conn;

		conn.on('open', function () {
			init();
			form.textContent = 'Connected to "{id}"'
				.replace('{id}', input.value);
		});
		conn.on('data', console.log.bind(console, 'peer:data(%s)'));
		conn.on('error', console.error.bind(console, 'peer:error(%s)'));
	}
});

/***********************************************
 * KeyboardEvent Bindings
 */

function init () {
	var keys = {},
		prevKeys = {};

	var publish = function () {
		if ( ! _.isEqual(keys, prevKeys)) {
			prevKeys = _.clone(keys);
			conn.send({type: 'keyboard', state: Object.keys(keys)});
		}
	};

	document.addEventListener('keydown', function (e) {
		keys[e.key.toUpperCase()] = true;
		publish();
	});

	document.addEventListener('keyup', function (e) {
		delete keys[e.key.toUpperCase()];
		publish();
	});
}
