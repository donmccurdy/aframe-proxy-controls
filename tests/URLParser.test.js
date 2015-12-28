var lib = require('../lib/URLParser.js');
var URL = lib.URL;
var URLParser = lib.URLParser;

describe('URLParser', function () {
	it('parses strings to URL instances', function () {
		var url = URLParser.parse('https://www.foo.bar/baz');
		assert(url instanceof URL);
	});
});

describe('URL', function () {
	it('parses a full URL', function () {
		var url = new URL('https://www.foo.bar:9000/baz');
		assert.equal(url.getProtocol(), 'https:');
		assert.equal(url.getHost(), 'www.foo.bar');
		assert.equal(url.getPort(), '9000');
		assert.equal(url.getPathname(), '/baz');
	});

	it('assumes default protocol (HTTP)', function () {
		var url = new URL('www.foo.bar');
		assert.equal(url.getProtocol(), 'http:');
	});

	// Unintuitive, but matches underlying spec.
	it('assumes current port', function () {
		var url = new URL('www.foo.bar');
		assert.equal(url.getPort(), window.location.port);
	});
});
