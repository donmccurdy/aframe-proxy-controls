var Aframe = require('aframe-core');
var component = require('../proxy-controls.js');
var entityFactory = require('./helpers').entityFactory;

Aframe.registerComponent('proxy-controls', component);

describe('proxy controls', function () {
	beforeEach(function (done) {
		this.el = entityFactory();
		this.el.addEventListener('loaded', function () {
			done();
		});
	});

	describe('proxy controls proxiness', function () {
		it('is good', function () {
			assert.equal(1, 1);
		});
	});
});
