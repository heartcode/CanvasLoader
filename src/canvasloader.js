/*
* Copyright (c) 2014 Róbert Pataki
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
* 
* ----------------------------------------------------------------------------------------
* 
* Check out my GitHub:		http://github.com/robertpataki/
* Send me an email:			robert@robertpataki.com
* Follow me on Twitter:		http://twitter.com/robertpataki
* Blog:						http://robertpataki.com
*/

/**
* CanvasLoader uses the HTML5 canvas element in modern browsers and VML in IE6/7/8 to create and animate the most popular preloader shapes (oval, spiral, rectangle, square and rounded rectangle).<br/><br/>
* It is important to note that CanvasLoader doesn't show up and starts rendering automatically on instantiation. To start rendering and display the loader use the <code>show()</code> method.
* @module CanvasLoader
**/
(function (window) {
	'use strict';
	/**
	* CanvasLoader is a JavaScript UI library that draws and animates circular preloaders using the Canvas HTML object.<br/><br/>
	* A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/><br/>
	* If no id is passed in the constructor, the canvas objects are paced in the document directly.
	* @class CanvasLoader
	* @constructor
	* @param {Object} 		target					The target DOM element to place the spinner into
	* @param {Object} 		[settings]				Settings to customise the spinner instance
	*	@param {Number} 	[settings.diameter]		The expected diameter
	*	@param {Number} 	[settings.density]		The number of the shapes
	*	@param {Number} 	[settings.color]		The color of the shapes
	*	@param {Number} 	[settings.range]		The weight of the trail
	*	@param {Number} 	[settings.duration]		The duration of 1 spin animation to completely go around
	*	@param {Number} 	[settings.shape]		The shape type (oval, rect, square, roundRect)
	*	@param {String} 	[settings.id] 			The id of the CanvasLoader instance
	* 
	* 
	**/
	var CanvasLoader = function (target, settings) {
		settings = settings || {};
		this._init(target, settings);
	};
	var proto = CanvasLoader.prototype;



	///
	///
	///
	//////////////
	//// Private fields
	/////////////
	///
	///
	///

	/**
	* The type of supported spinner shapes
	* @property 	_shapes
	* @private
	* @type 		{Object}
	*/
	proto._shapes = ['oval', 'spiral', 'square', 'rect', 'roundRect'];
	
	/**
	* Regular expression for matching Hexadecimal colour values
	* @property 	_colorRegEx
	* @private
	* @type 		{Object}
	*/
	proto._colorRegEx = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;

	/**
	* Check for canvas support
	* @property 	_supportsCanvas
	* @private
	* @type 		{Boolean}
	*/
	proto._supportsCanvas = !!document.createElement('canvas').getContext;

	/**
	* Holds settings (this is updated with user settings)
	* @property 	_settings
	* @private
	* @type 		{Object}
	*/
	proto._settings = {
		shape: 'oval',
		color: '#000000',
		diameter: 40,
		range: 0.2,
		density: 40,
		duration: 1,
		autoShow: true
	};

	/**
	* Holds default settings
	* @property 	_defaultSettings
	* @private
	* @type 		{Object}
	*/
	proto._defaultSettings = proto._settings;

	/**
	* The div we place the canvas object into
	* @property _container
	* @private
	* @type 	{Object}
	**/
	proto._container = null;
	/**
	* The div we draw the shapes into
	* @property _canvas
	* @private
	* @type 	{Object}
	**/
	proto._canvas = null;
	/**
	* The canvas context
	* @property _context
	* @private
	* @type 	{Object}
	**/
	proto._context = null;
	/**
	* The canvas we use for caching
	* @property _cacheCanvas
	* @private
	* @type 	{Object}
	**/
	proto._cacheCanvas = null;
	/**
	* The context of the cache canvas
	* @property _cacheContext
	* @private
	* @type 	{Object}
	**/
	proto._cacheContext = null;
	/**
	* Adds a timer for the rendering
	* @property _timer
	* @private
	* @type 	{Boolean}
	**/
	proto._timer = 0;
	/**
	* The active shape id for rendering
	* @property _currentId
	* @private
	* @type 	{Number}
	**/
	proto._currentId = 0;
	/**
	* The diameter of the loader
	* @property _diameter
	* @private
	* @type 	{Number}
	* @default 	40
	**/
	proto._diameter = proto._settings.diameter;
	/**
	* The color of the loader shapes in RGB
	* @property _cRGB
	* @private
	* @type 	{Object}
	**/
	proto._cRGB = {};
	/**
	* The color of the loader shapes in HEX
	* @property 	_color
	* @private
	* @type 		{String}
	* @default 	'#000000'
	**/
	proto._color = proto._settings.color;
	/**
	* The type of the loader shapes
	* @property _shape
	* @private
	* @type String
	* @default 'oval'
	**/
	proto._shape = proto._settings.shape;
	/**
	* The number of shapes drawn on the loader canvas
	* @property _density
	* @private
	* @type Number
	* @default 40
	**/
	proto._density = proto._settings.density;
	/**
	* The amount of the modified shapes in percent.
	* @property _range
	* @private
	* @type 	{Number}
	**/
	proto._range = proto._settings.range;
	/**
	* The duration of a 360 degree rotation in seconds
	* @property _duration
	* @private
	* @type 	{Number}
	**/
	proto._duration = proto._settings.duration;


	///
	///
	///
	//////////////
	//// Private methods
	/////////////
	///
	///
	///
	///
	
	/**
	* Creates a new element with the tag and applies the passed properties on it
	* @private
	* @method 	proto._addElement
	* @param 	tag 		{String} 	The tag to be created
	* @param 	par 		{String} 	The DOM element the new element will be appended to
	* @param 	opt 		{Object} 	Additional properties passed to the new DOM element
	* @return 				{Object} 	The DOM element
	*/
	proto._addElement = function (tag, par, opt) {
		var el = document.createElement(tag), n;
		for (n in opt) {
			el[n] = opt[n];
		}

		if(typeof par !== 'undefined') {
			par.appendChild(el);
		}
		return el;
	},

	/**
	* Sets the css properties on the element
	* @private
	* @method 	proto._setCSS
	* @param 	el 			{Object} 	The DOM element to be styled
	* @param 	opt 		{Object} 	The style properties
	* @return 				{Object}	The DOM element
	*/
	proto._setCSS = function (el, opt) {
		for (var n in opt) { el.style[n] = opt[n]; }
		return el;
	},

	/**
	* Sets the attributes on the element
	* @private
	* @method 	proto._setAttribute
	* @param 	el 			{Object}	The DOM element to add the attributes to
	* @param 	opt 		{Object}	The attributes
	* @return 				{Object}	The DOM element
	*/
	proto._setAttribute = function (el, opt) {
		for (var n in opt) { el.setAttribute(n, opt[n]); }
		return el;
	},

	/**
	 * Returns if the browser supports CSS animations
	 * @private
	 * @method 		proto._supportsCSSAnimation
	 * @return 		{Boolean}
	 */
	proto._supportsCSSAnimation = function () {
		var el = document.body.appendChild(document.createElement('div'));
		var result = false;
		var prefs = ('webkit moz o ms khtml').split(' ');

		for(var i = 0; i <= prefs.length; i++) {			
			var pref = i === prefs.length ? 'animation' : prefs[i] + 'Animation';

			if(typeof el.style[pref] !== 'undefined') {
				result = true;
				break;
			}
		}

		return result;
	},

	/**
	* Transforms the cache canvas before drawing
	* @private
	* @method 	proto._transformCachedCanvasContext
	* @param	canvasContext 	{Object}	The canvas context to be transformed
	* @param	x 				{Number}	x translation
	* @param	y 				{Number}	y translation
	* @param	rads 			{Number}	Rotation in radians
	*/
	proto._transformCachedCanvasContext = function(canvasContext, x, y, rads) {
		canvasContext.save();
		canvasContext.translate(x, y);
		canvasContext.rotate(rads);
		canvasContext.translate(-x, -y);
		canvasContext.beginPath();
	};
	
	/** 
	* Initialization method
	* @method _init
	* @private
	* @param 	target 		{Object} 	The target DOM element to place the spinner into
	* @param 	settings 	{Object}	Settings to customise the spinner instance
	**/
	proto._init = function (target, settings) {

		var arg = this._settings;

		this.dad = target;

		// Creates the parent div of the loader instance
		this._container = proto._addElement('div', this.dad, {className: 'canvasloader'});

		if (this._supportsCanvas) {
		// For browsers with Canvas support..
			// Createse the canvas element
			this._canvas = proto._addElement('canvas', this._container);
			this._context = this._canvas.getContext('2d');
			// Create the cache canvas element
			this._cacheCanvas = proto._setCSS(proto._addElement('canvas', this._container), { display: 'none' });
			this._cacheContext = this._cacheCanvas.getContext('2d');
		} else {
			console.warn('[CanvasLoader] - Browser won\'t support canvas, bye!');
		}

	    // Shape setup
	    var shape = settings.shape || arg.shape;
	    for (var i = 0; i < this._shapes.length; i++) {
	      if (shape === this._shapes[i]) {
	        this._shape = shape;
	        break;
	      }
	    }

		// Diameter setup
		var diameter = settings.diameter || arg.diameter;
		// this._diameter = Math.round(Math.abs(diameter));
		this._diameter = diameter;

		this._setCSS(this.dad, {'marginLeft': Math.round(diameter * -0.5) + 'px'});

	    // Density setup
	    var density = settings.density || arg.density;
	    this._density = Math.round(Math.abs(density));
	    if (this._density > 360) { this._density = 360; }
	    this._currentId = 0;

	    // Colour setup
	    var color = settings.color;
	    this._color = this._colorRegEx.test(color) ? color : arg.color;
	    this._cRGB = this._getRGB(this._color);
	    
	    // Range setup
	    this._range = Math.abs(settings.range || arg.range);
	    
	    // Spin duration setup
	    this._duration = Math.abs(settings.duration || arg.duration);

	    // Initial rendering
		this._draw();

		//Hides the preloader
		this._setCSS(this._container, {visibility: 'hidden', display: 'none'});

		var autoShow = settings.autoShow || arg.autoShow;
		if(autoShow) {
			this.show();
		}
	};

	/**
	* Return the RGB values of the passed color
	* @private
	* @method 	_getRGB
	* @param 	color 		{String}	The HEX color value to be converted to RGB
	*/
	proto._getRGB = function (c) {
		c = c.charAt(0) === '#' ? c.substring(1, 7) : c;
		return {r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
	};

	/**
	* Return the default settings
	* @private
	* @method 	_getDefaults
	*/
	proto._getDefaults = function () {
		return this._defaultSettings;
	};

	/**
	* Draw the shapes on the canvas
	* @private
	* @method 	_draw
	*/
	proto._draw = function () {
		var i = 0, size, w, h, x, y, ang, rads, rad, de = this._density, animBits = Math.round(de * this._range), bitMod, minBitMod = 0, s, g, sh, f, d = 1000, arc = 0, c = this._cacheContext, di = this._diameter, e = 0.47, pr = window.devicePixelRatio || 1;
		c.clearRect(0, 0, d, d);
		
		this._setAttribute(this._canvas, {width: di * pr, height: di * pr});
		this._setCSS(this._canvas, {width: di + 'px', height: di + 'px'});
		this._setAttribute(this._cacheCanvas, {width: di * pr, height: di * pr});
		this._setCSS(this._cacheCanvas, {width: di + 'px', height: di + 'px'});
		c.scale(pr, pr);
		this._context.scale(pr, pr);

		while (i < de) {
			bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
			ang = 270 - 360 / de * i;
			rads = ang / 180 * Math.PI;
			c.fillStyle = 'rgba(' + this._cRGB.r + ',' + this._cRGB.g + ',' + this._cRGB.b + ',' + bitMod.toString() + ')';
			switch (this._shape) {
			case this._shapes[0]:
			case this._shapes[1]:
				size = di * 0.07;
				x = di * e + Math.cos(rads) * (di * e - size) - di * e;
				y = di * e + Math.sin(rads) * (di * e - size) - di * e;
				c.beginPath();
				if (this._shape === this._shapes[1]) { c.arc(di * 0.5 + x, di * 0.5 + y, size * bitMod, 0, Math.PI * 2, false); } else { c.arc(di * 0.5 + x, di * 0.5 + y, size, 0, Math.PI * 2, false); }
				break;
			case this._shapes[2]:
				size = di * 0.12;
				x = Math.cos(rads) * (di * e - size) + di * 0.5;
				y = Math.sin(rads) * (di * e - size) + di * 0.5;
				this._transformCachedCanvasContext(c, x, y, rads);
				c.fillRect(x, y - size * 0.5, size, size);
				break;
			case this._shapes[3]:
			case this._shapes[4]:
				w = di * 0.3;
				h = w * 0.27;
				x = Math.cos(rads) * (h + (di - h) * 0.13) + di * 0.5;
				y = Math.sin(rads) * (h + (di - h) * 0.13) + di * 0.5;
				this._transformCachedCanvasContext(c, x, y, rads);
				if(this._shape === this._shapes[3]) {
					c.fillRect(x, y - h * 0.5, w, h);
				} else {
					rad = h * 0.55;
					c.moveTo(x + rad, y - h * 0.5);
					c.lineTo(x + w - rad, y - h * 0.5);
					c.quadraticCurveTo(x + w, y - h * 0.5, x + w, y - h * 0.5 + rad);
					c.lineTo(x + w, y - h * 0.5 + h - rad);
					c.quadraticCurveTo(x + w, y - h * 0.5 + h, x + w - rad, y - h * 0.5 + h);
					c.lineTo(x + rad, y - h * 0.5 + h);
					c.quadraticCurveTo(x, y - h * 0.5 + h, x, y - h * 0.5 + h - rad);
					c.lineTo(x, y - h * 0.5 + rad);
					c.quadraticCurveTo(x, y - h * 0.5, x + rad, y - h * 0.5);
				}
				break;
			}
			c.closePath();
			c.fill();
			c.restore();
			++i;
		}
		this._render(true);
	};

	proto._render = function(initialRendering) {
		if(this._supportsCSSAnimation()) {
			this._context.drawImage(this._cacheCanvas, 0, 0, this._diameter, this._diameter);
			
			document.body.style['background'] = 'rgba(255, 0, 0, 0.2)';
			var animPrefixes = ['webkitAnimation', 'mozAnimation', 'oAnimation', 'msAnimation', 'khtmlAnimation', 'animation'];
			var animProps = 'spin ' + this._duration + 's' + ' steps(' + this._density + ') infinite';
			var animObject = {};

			for (var i = 0; i < animPrefixes.length; i++) {
				animObject[animPrefixes[i]] = animProps;
			}
			this._setCSS(this._canvas, animObject);
		} else {
			if(typeof initialRendering !== 'undefined') {
				this._currentId += 360 / this._density;
			} else {
				this._currentId = 0;
			}

			this._context.clearRect(0, 0, this._diameter, this._diameter);
			this._transformCachedCanvasContext(this._context, this._diameter * 0.5, this._diameter * 0.5, this._currentId / 180 * Math.PI);
			this._context.drawImage(this._cacheCanvas, 0, 0, this._diameter, this._diameter);
			this._context.restore();

			if (!this._timer) {
				var self = this;
				this._timer = setInterval(function () { self._draw(); }, Math.round(self._duration * 1000 / this._density));
			}
		}
	}

	///
	///
	///
	//////////////
	//// Public methods
	/////////////
	///
	///
	///

	/**
	* Return argument value by key if defined
	* @param 	key		{String}	The key to look up
	* @return 						The value of the key
	* @method get
	*/
	proto.get = function(key) {
		if(key === 'defaults') {
			return this._getDefaults();
		}

		if(this._settings.hasOwnProperty(key) && this.hasOwnProperty('_' + key)) {
		  return this['_' + key];
		}
	};

	/**
	* Shows the rendering of the loader animation
	* @method show
	* @chainable
	* @return 		{CanvasLoader}		The CanvasLoader instance
	*/
	proto.show = function () {
		this._setCSS(this._container, {visibility: 'visible', display: 'block'});
		this._render();
    	return self;
	};
	
	/**
	* Stops the rendering of the loader animation and hides the loader
	* @method hide
	* @chainable
	* @return 		{CanvasLoader}		The CanvasLoader instance
	*/
	proto.hide = function () {

		// TODO - we probably will need to remove the CSS animation when hiding the spinner

		if(this._timer) {
			clearInterval(this._timer);
			this._timer = null;

			this._setCSS(this._container, {visibility: 'hidden', display: 'none'});	
		}
		return this;
	};

	/**
	* Clears the DOM and resets all params
	* @method destruct
	*/
	proto.destruct = function () {
		this.hide();
		this.dad.removeChild(this._container);

		for (var n in this) {
			delete this[n];
			this[n] = null;
		}
	};

	window.CanvasLoader = CanvasLoader;
}(window));