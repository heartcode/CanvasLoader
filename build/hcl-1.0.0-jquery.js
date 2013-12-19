/*
* Copyright (c) 2013 Róbert Pataki
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
* Check out my GitHub:	http://github.com/heartcode/
* Send me an email:			heartcode@robertpataki.com
* Follow me on Twitter:	http://twitter.com/#iHeartcode
* Blog:									http://heartcode.robertpataki.com
*/

/**
* CanvasLoader uses the HTML5 canvas element in modern browsers and VML in IE6/7/8 to create and animate the most popular preloader shapes (oval, spiral, rectangle, square and rounded rectangle).<br/><br/>
* It is important to note that CanvasLoader doesn't show up and starts rendering automatically on instantiation. To start rendering and display the loader use the <code>show()</code> method.
* @module CanvasLoader
**/
(function (window) {
	"use strict";
	/**
	* CanvasLoader is a JavaScript UI library that draws and animates circular preloaders using the Canvas HTML object.<br/><br/>
	* A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/><br/>
	* If no id is passed in the constructor, the canvas objects are paced in the document directly.
	* @class CanvasLoader
	* @constructor
	* @param {Object} 	target								The target DOM element to place the spinner into
	* @param {Object} 	[settings]						Settings to customise the spinner instance
	*	@param {Number} 	[settings.diameter]		The expected diameter
	*	@param {Number} 	[settings.density]		The number of the shapes
	*	@param {Number} 	[settings.color]			The color of the shapes
	*	@param {Number} 	[settings.range]			The weight of the trail
	*	@param {Number} 	[settings.speed]			The speed
	*	@param {Number} 	[settings.fps]				The FPS
	*	@param {Number} 	[settings.shape]			The shape type (oval, rect, square, roundRect)
	*	@param {String} 	[settings.id] 				The id of the CanvasLoader instance
	*	@param {Boolean} 	[settings.safeVML]		Whether or not density should be capped in IE
	* 
	* 
	**/
	var CanvasLoader = function (target, settings) {
		settings = settings || {};
		this._init(target, settings);
	}, p = CanvasLoader.prototype, engine, engines = ["canvas", "vml"], shapes = ["oval", "spiral", "square", "rect", "roundRect"], cRX = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, ie8 = navigator.appVersion.indexOf("MSIE") !== -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) === 8 ? true : false, canSup = !!document.createElement("canvas").getContext, safeDensity = 40, safeVML = true,
	
		/**
		* Creates a new element with the tag and applies the passed properties on it
		* @private
		* @method _addEl
		* @param tag {String} The tag to be created
		* @param par {String} The DOM element the new element will be appended to
		* @param opt {Object} Additional properties passed to the new DOM element
		* @return {Object} The DOM element
		*/
		_addEl = function (tag, par, opt) {
			var el = document.createElement(tag), n;
			for (n in opt) {
				el[n] = opt[n];
			}

			if(typeof par !== "undefined") {
				par.appendChild(el);
			}
			return el;
		},

		/**
		* Sets the css properties on the element
		* @private
		* @method _setCSS
		* @param el {Object} The DOM element to be styled
		* @param opt {Object} The style properties
		* @return {Object} The DOM element
		*/
		_setCSS = function (el, opt) {
			for (var n in opt) { el.style[n] = opt[n]; }
			return el;
		},

		/**
		* Sets the attributes on the element
		* @private
		* @method _setAttr
		* @param el {Object} The DOM element to add the attributes to
		* @param opt {Object} The attributes
		* @return {Object} The DOM element
		*/
		_setAttr = function (el, opt) {
			for (var n in opt) { el.setAttribute(n, opt[n]); }
			return el;
		},

		/**
		* Transforms the cache canvas before drawing
		* @private
		* @method _transCon
		* @param	x {Object} The canvas context to be transformed
		* @param	x {Number} x translation
		* @param	y {Number} y translation
		* @param	r {Number} Rotation radians
		*/
		_transCon = function(c, x, y, r) {
			c.save();
			c.translate(x, y);
			c.rotate(r);
			c.translate(-x, -y);
			c.beginPath();
		};


	//////////////
	//// Private fields
	/////////////

	/**
   * Holds all accessible arguments (and defaults) on the CL instance
   * @private
   * @type {Object}
   */
  p._settings = {
    shape: "oval",
    color: "#000000",
    diameter: 40,
    range: 0.2,
    density: 40,
    speed: 2,
    fps: 60
  };

	/**
	* The div we place the canvas object into
	* @property _cont
	* @private
	* @type Object
	**/
	p._cont = null;
	/**
	* The div we draw the shapes into
	* @property _can
	* @private
	* @type Object
	**/
	p._can = null;
	/**
	* The canvas context
	* @property _con
	* @private
	* @type Object
	**/
	p._con = null;
	/**
	* The canvas we use for caching
	* @property _cCan
	* @private
	* @type Object
	**/
	p._cCan = null;
	/**
	* The context of the cache canvas
	* @property _cCon
	* @private
	* @type Object
	**/
	p._cCon = null;
	/**
	* Adds a timer for the rendering
	* @property _timer
	* @private
	* @type Boolean
	**/
	p._timer = 0;
	/**
	* The active shape id for rendering
	* @property _currentId
	* @private
	* @type Number
	**/
	p._currentId = 0;
	/**
	* The diameter of the loader
	* @property _diameter
	* @private
	* @type Number
	* @default 40
	**/
	p._diameter = p._settings.diameter;
	/**
	* The color of the loader shapes in RGB
	* @property _cRGB
	* @private
	* @type Object
	**/
	p._cRGB = {};
  /**
  * The color of the loader shapes in HEX
  * @property _color
  * @private
  * @type String
  * @default "#000000"
  **/
  p._color = p._settings.color;
	/**
	* The type of the loader shapes
	* @property _shape
	* @private
	* @type String
	* @default "oval"
	**/
	p._shape = p._settings.shape;
	/**
	* The number of shapes drawn on the loader canvas
	* @property _density
	* @private
	* @type Number
	* @default 40
	**/
	p._density = p._settings.density;
	/**
	* The amount of the modified shapes in percent.
	* @property _range
	* @private
	* @type Number
	**/
	p._range = p._settings.range;
	/**
	* The speed of the loader animation
	* @property _speed
	* @private
	* @type Number
	**/
	p._speed = p._settings.speed;
	/**
	* The FPS value of the loader animation rendering
	* @property _fps
	* @private
	* @type Number
	**/
	p._fps = p._settings.fps;


	
	//////////////
	//// Private methods
	/////////////
	
	/** 
	* Initialization method
	* @method _init
	* @private
	* @param target {Object} The target DOM element to place the spinner into
	* @param settings {Object} Settings to customise the spinner instance
	**/
	p._init = function (target, settings) {
    var t = this,
    	arg = t._settings;

		t.mum = target;

		// Creates the parent div of the loader instance
		t._cont = _addEl("div", t.mum, {className: "canvasloader"});

		if (canSup) {
		// For browsers with Canvas support...
			engine = engines[0];
			// Createse the canvas element
			t._can = _addEl("canvas", t._cont);
			t._con = t._can.getContext("2d");
			// Create the cache canvas element
			t._cCan = _setCSS(_addEl("canvas", t._cont), { display: "none" });
			t._cCon = t._cCan.getContext("2d");
		} else {
		// For browsers without Canvas support...
			engine = engines[1];
			// Adds the VML stylesheet
			if (typeof CanvasLoader.vmlSheet === "undefined") {
				document.getElementsByTagName("head")[0].appendChild(_addEl("style"));
				CanvasLoader.vmlSheet = document.styleSheets[document.styleSheets.length - 1];
				var a = ["group", "oval", "roundrect", "fill"];
				for ( var n = 0; n < a.length; ++n ) { CanvasLoader.vmlSheet.addRule(a[n], "behavior:url(#default#VML); position:absolute;"); }
			}
			t.vml = _addEl("group", t._cont);
		}	

    // Shape setup
    var shape = settings.shape || arg.shape;
    for (var i = 0; i < shapes.length; i++) {
      if (shape === shapes[i]) {
        t._shape = shape;
        break;
      }
    }

    // safeVML for safe IE rendering
    safeVML = settings.safeVML || true;

		// Diameter setup
		var diameter = settings.diameter || arg.diameter;
		t._diameter = Math.round(Math.abs(diameter));

		_setCSS(this.mum, {"margin-left": Math.round(diameter * -0.5) + 'px'});

    // Density setup
    var density = settings.density || arg.density;
    if (safeVML && engine === engines[1]) {
      t._density = Math.round(Math.abs(density)) <= safeDensity ? Math.round(Math.abs(density)) : safeDensity;
    } else {
      t._density = Math.round(Math.abs(density));
    }
    if (t._density > 360) { t._density = 360; }
    t._currentId = 0;

    // Colour setup
    var color = settings.color;
    t._color = cRX.test(color) ? color : arg.color;
    t._cRGB = t._getRGB(t._color);
    
    // Range setup
    t._range = Math.abs(settings.range || arg.range);
    
    // Speed setup
    t._speed = Math.round(Math.abs(settings.speed || arg.speed));
    
    // FPS setup
    t._fps = Math.round(Math.abs(settings.fps || arg.fps));

    // Initial rendering
		t._draw();

		//Hides the preloader
		_setCSS(t._cont, {visibility: "hidden", display: "none"});
	};

	/**
	* Return the RGB values of the passed color
	* @private
	* @method _getRGB
	* @param color {String} The HEX color value to be converted to RGB
	*/
	p._getRGB = function (c) {
		c = c.charAt(0) === "#" ? c.substring(1, 7) : c;
		return {r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
	};

	/**
	* Draw the shapes on the canvas
	* @private
	* @method _draw
	*/
	p._draw = function () {
		var t = this, i = 0, size, w, h, x, y, ang, rads, rad, de = t._density, animBits = Math.round(de * t._range), bitMod, minBitMod = 0, s, g, sh, f, d = 1000, arc = 0, c = t._cCon, di = t._diameter, e = 0.47;
		if (engine === engines[0]) {
			c.clearRect(0, 0, d, d);
			_setAttr(t._can, {width: di, height: di});
			_setAttr(t._cCan, {width: di, height: di});
			while (i < de) {
				bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
				ang = 270 - 360 / de * i;
				rads = ang / 180 * Math.PI;
				c.fillStyle = "rgba(" + t._cRGB.r + "," + t._cRGB.g + "," + t._cRGB.b + "," + bitMod.toString() + ")";
				switch (t._shape) {
				case shapes[0]:
				case shapes[1]:
					size = di * 0.07;
					x = di * e + Math.cos(rads) * (di * e - size) - di * e;
					y = di * e + Math.sin(rads) * (di * e - size) - di * e;
					c.beginPath();
					if (t._shape === shapes[1]) { c.arc(di * 0.5 + x, di * 0.5 + y, size * bitMod, 0, Math.PI * 2, false); } else { c.arc(di * 0.5 + x, di * 0.5 + y, size, 0, Math.PI * 2, false); }
					break;
				case shapes[2]:
					size = di * 0.12;
					x = Math.cos(rads) * (di * e - size) + di * 0.5;
					y = Math.sin(rads) * (di * e - size) + di * 0.5;
					_transCon(c, x, y, rads);
					c.fillRect(x, y - size * 0.5, size, size);
					break;
				case shapes[3]:
				case shapes[4]:
					w = di * 0.3;
					h = w * 0.27;
					x = Math.cos(rads) * (h + (di - h) * 0.13) + di * 0.5;
					y = Math.sin(rads) * (h + (di - h) * 0.13) + di * 0.5;
					_transCon(c, x, y, rads);
					if(t._shape === shapes[3]) {
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
		} else {
			_setCSS(t._cont, {width: di, height: di});
			_setCSS(t.vml, {width: di, height: di});
			switch (t._shape) {
			case shapes[0]:
			case shapes[1]:
				sh = "oval";
				size = d * 0.14;
				break;
			case shapes[2]:
				sh = "roundrect";
				size = d * 0.12;
				break;
			case shapes[3]:
			case shapes[4]:
				sh = "roundrect";
				size = d * 0.3;
				break;
			}
			w = h = size;
			x = d * 0.5 - h;
			y = -h * 0.5;		
			while (i < de) {
				bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
				ang = 270 - 360 / de * i;
				switch (t._shape) {
				case shapes[1]:
					w = h = size * bitMod;
					x = d * 0.5 - size * 0.5 - size * bitMod * 0.5;
					y = (size - size * bitMod) * 0.5;
					break;
				case shapes[0]:
				case shapes[2]:
					if (ie8) {
						y = 0;
						if(t._shape === shapes[2]) {
							x = d * 0.5 -h * 0.5;
						}
					}
					break;
				case shapes[3]:
				case shapes[4]:
					w = size * 0.95;
					h = w * 0.28;
					if (ie8) {
						x = 0;
						y = d * 0.5 - h * 0.5;
					} else {
						x = d * 0.5 - w;
						y = -h * 0.5;
					}
					arc = t._shape === shapes[4] ? 0.6 : 0; 
					break;
				}
				g = _setAttr(_setCSS(_addEl("group", t.vml), {width: d, height: d, rotation: ang}), {coordsize: d + "," + d, coordorigin: -d * 0.5 + "," + (-d * 0.5)});
				s = _setCSS(_addEl(sh, g, {stroked: false, arcSize: arc}), { width: w, height: h, top: y, left: x});
				f = _addEl("fill", s, {color: t._color, opacity: bitMod});
				++i;
			}
		}
		t._tick(true);
	};

	/**
	* Renders the loader animation
	* @private
	* @method _tick
	*/
	p._tick = function (init) {
		var t = this, c = t._con, di = t._diameter;
		if (!init) { t._currentId += 360 / t._density * t._speed; }
		if (engine === engines[0]) {
			c.clearRect(0, 0, di, di);
			_transCon(c, di * 0.5, di * 0.5, t._currentId / 180 * Math.PI);
			c.drawImage(t._cCan, 0, 0, di, di);
			c.restore();
		} else {
			if (t._currentId >= 360) { t._currentId -= 360; }
			_setCSS(t.vml, {rotation:t._currentId});
		}
	};


	//////////////
	//// Public methods
	/////////////

	/**
	* Shows the rendering of the loader animation
	* @method show
	* @chainable
	* @return {CanvasLoader} The CanvasLoader instance
	*/
	p.show = function () {
		var t = this;
		if(!t._timer) {
			t._timer = self.setInterval(function () { t._tick(); }, Math.round(1000 / t._fps));
			_setCSS(t._cont, {visibility: "visible", display: "block"});
		}
    return t;
	};
	
	/**
	* Stops the rendering of the loader animation and hides the loader
	* @method hide
	* @chainable
	* @return {CanvasLoader} The CanvasLoader instance
	*/
	p.hide = function () {
		var t = this;
		if(t._timer) {
			clearInterval(t._timer);
			t._timer = null;

			_setCSS(t._cont, {visibility: "hidden", display: "none"});	
		}
		return t;
	};

	/**
	* Clears the DOM and resets all params
	* @method destruct
	*/
	p.destruct = function () {
		var t = this, n;
		t.hide();
		t.mum.removeChild(t._cont);

		for (n in t) {
			delete t[n];
			t[n] = null;
		}
	};

	/**
   * Return argument value by key if defined
   * @param  {String} 	key The key to look up
   * @return 						The value of the key
   * @method get
   */
  p.get = function(key) {
    if(this._settings.hasOwnProperty(key) && this.hasOwnProperty("_" + key)) {
      return this["_" + key];
    }
  };

	window.CanvasLoader = CanvasLoader;
}(window));;(function ($) {
  $.fn.hcl = function(settings) {
    var cl = new CanvasLoader(this[0], settings).show();

    this.show = function() {
      return cl.show();
    };

    this.hide = function() {
      return cl.hide();
    };

    this.get = function(key) {
      return cl.get(key);
    };

    this.destruct = function() {
      cl.destruct();
      cl = null;
    };

    return this;
  };
})(jQuery);