var Aframe = require('aframe-core');
var component = require('../index.js').component;
var entityFactory = require('./helpers').entityFactory;

Aframe.registerComponent('proxy-controls', component);

describe('client controls', function () {
	beforeEach(function (done) {
		this.el = entityFactory();
		this.el.addEventListener('loaded', function () {
			done();
		});
	});

	describe('client controls property', function () {
		it('is good', function () {
			assert.equal(1, 1);
		});
	});
});
