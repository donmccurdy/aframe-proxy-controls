var Aframe = require('aframe-core'),
    component = require('../proxy-controls.js'),
    entityFactory = require('./helpers').entityFactory;

Aframe.registerComponent('proxy-controls', component);

describe('proxy controls', function () {
  var ctrl,
      fetchPromise;

  beforeEach(function () {
    fetchPromise = Promise.resolve({json: function () { return {pairCode: 'pair-code'}; }});
    sinon.stub(window, 'fetch', function () { return fetchPromise; });
  });

  afterEach(function () {
    window.fetch.restore();
  });

  beforeEach(function (done) {
    this.el = entityFactory();
    this.el.setAttribute('proxy-controls', 'proxyUrl: http://foo.bar.baz');
    this.el.addEventListener('loaded', function () {
      ctrl = this.el.components['proxy-controls'];
      done();
    }.bind(this));
  });

  describe('keyboard events', function () {
    it('returns recent keyboard state', function () {
      var state = {hi: 'im a keyboard'};
      ctrl.onEvent({type: 'keyboard', state: state});
      expect(ctrl.getKeyboard()).to.equal(state);
    });
  });

  describe('gamepad events', function () {
    it('returns recent gamepad state', function () {
      var state = {hi: 'im a gamepad'};
      ctrl.onEvent({type: 'gamepad', state: [state]});
      expect(ctrl.getGamepad(0)).to.equal(state);
    });
  });

  describe('arbitrary event support', function () {
    it('returns arbitrary input state', function () {
      var state = {hi: 'im a USB-powered plush toy'};
      ctrl.onEvent({type: 'plush-toy', state: state});
      expect(ctrl.get('plush-toy')).to.equal(state);
    });
  });

  describe('pair code overlay', function () {

    it('displays pair code in overlay and inserts styles', function () {
      expect(ctrl.overlay.el.textContent).to.contain('pair-code');
      expect(ctrl.overlay.stylesheet).to.be.ok;
    });

    it('hides overlay for enableOverlay:false', function () {
      ctrl.overlay.destroy();
      ctrl.overlay = null;

      ctrl.data.enableOverlay = false;
      ctrl.createOverlay('pair-code');
      expect(ctrl.overlay).to.be.null;
    });

    it('omits styles for enableOverlayStiles:false', function () {
      ctrl.overlay.destroy();
      ctrl.overlay = null;

      ctrl.data.enableOverlayStyles = false;
      ctrl.createOverlay('pair-code');
      expect(ctrl.overlay).to.be.ok;
      expect(ctrl.overlay.stylesheet).to.be.null;
    });
    
  });

});
