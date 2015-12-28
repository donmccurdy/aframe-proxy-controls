/**
 * URLParser
 *
 * Small utility for parsing a URL into its components.
 *
 * Exports:
 * - URLParser, a static class for providing URL instances.
 * - URL, a wrapper around the URL, able to return its components.
 *
 * Usage:
 *
 * ```js
 * var url = URLParser.parse('https://www.foo.bar/baz');
 * var path = url.getHost(); // => '/baz'
 * ```
 */

var URL = function (url) {
	this.anchor = document.createElement('A');
	this.anchor.href = url;
};

URL.prototype.getProtocol = function () {
	return this.anchor.protocol;
};

URL.prototype.getHost = function () {
	return this.anchor.hostname;
};

URL.prototype.getPathname = function () {
	return this.anchor.pathname;
};

URL.prototype.getPort = function () {
	return this.anchor.port || 80;
};

var URLParser = {
	instances: {},
	parse: function (url) {
		return this.instances[url] || new URL(url);
	}
};

module.exports = {
	URLParser: URLParser,
	URL: URL
};
