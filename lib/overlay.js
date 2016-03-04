
var STYLES = {
  overlay: {
    default: [
      'position: absolute;',
      'top: 20px;',
      'left: 20px;',
      'max-width: calc(100% - 40px);',
      'box-sizing: border-box;',
      'padding: 0.5em;',
      'color: #FFF;',
      'background: rgba(0,0,0,0.35);',
      'font-family: Source Sans Pro, Helvetica Neue, Helvetica, Arial, sans-serif;',
      'font-size: 1.2em;'
    ],
    desktop : [
      'top: auto;',
      'left: auto;',
      'bottom: 90px;',
      'right: 20px;'
    ]
  },
  link: {
    default: [
      'display: none;'
    ],
    desktop: [
      'display: inline;',
      'padding: 0.2em 0.4em 0.35em;',
      'color: #444;',
      'background: rgba(255,255,255,0.65);',
      'float: right;',
      'text-decoration: none;',
      'margin-top: 0.4em;'
    ],
    hover: [
      'background: rgba(255,255,255,0.8);'
    ]
  },
  x: {
    default: [
      'position: absolute;',
      'top: -10px;',
      'right: -10px;',
      'height: 20px;',
      'width: 20px;',
      'line-height: 20px;',
      'text-align: center;',
      'border-radius: 50%;',
      'background: rgba(0,0,0,0.35);',
      'color: #FFF;',
      'cursor: pointer;'
    ]
  }
};

/**
 * Helper class for the canvas overlay, which has to be rendered and styled
 * in JavaScript, just because.
 *
 * @param {string} pairCode
 * * @param {string} linkUrl
 * @param {boolean} includeStyles
 */
var Overlay = function (pairCode, linkUrl, includeStyles) {
	/** @type {string} Pair code. */
	this.pairCode = pairCode;

	/** @type {string} URL for 'Connect' button. */
	this.linkUrl = linkUrl;

  /** @type {Element} Overlay element. */
  this.el = document.createElement('div');

  /** @type {Element} Overlay stylesheet. */
  this.stylesheet = null;

  if (includeStyles) {
  	this.stylesheet = document.createElement('style');
  	this.appendStyles();
  }

  this.render();
};

Overlay.prototype.render = function () {
  var overlayLink = document.createElement('a'),
      overlayLinkWrap = document.createElement('div'),
      overlayClose = document.createElement('div');
  overlayLink.textContent = '› Connect';
  overlayLink.href = this.linkUrl + '/#/connect';
  overlayLink.target = '_blank';
  overlayLink.classList.add('overlay-link');

  this.el.textContent = 'Pair code: “' + this.pairCode + '”';
  this.el.classList.add('overlay');

  overlayClose.innerHTML = '&times;';
  overlayClose.classList.add('overlay-x');
  overlayClose.addEventListener('click', this.el.remove.bind(this.el));

  overlayLinkWrap.appendChild(overlayLink);
  this.el.appendChild(overlayLinkWrap);
  this.el.appendChild(overlayClose);
  document.body.appendChild(this.el);
};

Overlay.prototype.appendStyles = function () {
  var style = this.stylesheet;
  style.type = 'text/css';
  document.head.appendChild(style);
  style.sheet.insertRule(''
    + '@media screen and (min-width: 550px) { .overlay { '
    +   STYLES.overlay.desktop.join('')
    + ' }}',
    0
  );
  style.sheet.insertRule(''
    + '@media screen and (min-width: 550px) { .overlay-link { '
    +   STYLES.link.desktop.join('')
    + ' }}',
    0
  );
  style.sheet.insertRule('.overlay { ' + STYLES.overlay.default.join('') + ' }', 0);
  style.sheet.insertRule('.overlay-x { ' + STYLES.x.default.join('') + ' }', 0);
  style.sheet.insertRule('.overlay-link { ' + STYLES.link.default.join('') + ' }', 0);
  style.sheet.insertRule('.overlay-link:hover { ' + STYLES.link.hover.join('') + ' }', 0);
};

Overlay.prototype.destroy = function () {
	this.el.remove();
	if (this.stylesheet) this.stylesheet.remove();
};

module.exports = Overlay;
