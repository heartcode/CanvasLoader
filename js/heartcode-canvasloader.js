/*
* Copyright (c) 2011 Róbert Pataki
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
* Send me an email:		heartcode@robertpataki.com
* Follow me on Twitter:	http://twitter.com/#iHeartcode
* Blog:					http://heartcode.robertpataki.com
*/

/**
* This lightweight library uses the HTML5 canvas element to draw and animate the most popular preloader shapes (circle, rectangle, square and rounded rectangle).<br/>
* The implementation is (hopefully) very simple and doesn't require any external libraries.<br/>
* @module CanvasLoader
**/
(function (window) {
	"use strict";
	/**
	* CanvasLoader is a JavaScript UI library that draws and animates circular preloaders using the Canvas HTML object.<br/>
	* A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/>
	* If no id is passed in the constructor, the canvas objects are paced in the document directly.
	* @class CanvasLoader
	* @constructor
	* @param {String} id The id of the placeholder div
	**/
	var CanvasLoader = function (id) {
		this.initialize(id);
	}, p = CanvasLoader.prototype, engine, engines = ["canvas", "vml"], shapes = ["oval", "spiral", "square", "rect", "roundRect"], colorReg = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, ie8 = navigator.appVersion.indexOf("MSIE") !== -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) === 8 ? true : false, canvasSupport = !!document.createElement('canvas').getContext,
	/**
	* Creates a new element with the tag and applies the passed properties on it
	* @method addEl
	* @protected
	* @param tag {String} The tag to be created
	* @param par {String} The DOM element the new element will be appended to
	* @param props {Object} Additional properties passed to the new DOM element
	* @return {Object} The DOM element
	*/
		addEl = function (tag, par, props) {
			var el = document.createElement(tag), n;
			for (n in props) { el[n] = props[n]; }
			if(typeof(par) !== "undefined") {
				par.appendChild(el);
			}
			return el;
		},
	/**
	* Sets the css properties on the element
	* @method setCSS
	* @protected
	* @param el {Object} The DOM element to be styled
	* @param props {Object} The style properties
	* @return {Object} The DOM element
	*/
		setCSS = function (el, props) {
			for (var n in props) { el.style[n] = props[n]; }
			return el;
		},
	/**
	* Sets the attributes on the element
	* @method setAttr
	* @protected
	* @param el {Object} The DOM element to add the attributes to
	* @param props {Object} The attributes
	* @return {Object} The DOM element
	*/
		setAttr = function (el, props) {
			for (var n in props) { el.setAttribute(n, props[n]); }
			return el;
		},
	/**
	* Prepares the cache canvas for drawing
	* @method transformContext
	* @protected
	* @param	x {Object} The canvas context to be transformed
	* @param	x {Number} x translation
	* @param	y {Number} y translation
	* @param	r {Number} Rotation radians
	*/
		transformContext = function(c, x, y, r) {
			c.save();
			c.translate(x, y);
			c.rotate(r);
			c.translate(-x, -y);
			c.beginPath();
		};
	/** 
	* Initialization method
	* @method initialize
	* @protected
	* @param parentId (String) The id of the placeholder div, where the loader will be nested into
	* @param loaderId (String) The id of loader
	*/
	p.initialize = function (parentId, loaderId) {
		/*
		* Find the containing div by id
		* If the container element cannot be found we use the document body itself
		*/
		try {
			// Look for the parent element
			if (document.getElementById(parentId) !== undefined) {
				this.mother = document.getElementById(parentId);
			} else {
				this.mother = document.body;
			}
		} catch (error) {
			this.mother = document.body;
		}
		// Creates the parent div of the loader instance
		loaderId = typeof (loaderId) !== "undefined" ? loaderId : "canvasLoader";
		this.cont = addEl("div", this.mother, {id: loaderId});
		if (canvasSupport) {
		// For browsers with Canvas support...
			engine = engines[0];
			// Create the canvas element
			this.canvas = addEl("canvas", this.cont);
			this.context = this.canvas.getContext("2d");
			// Create the cache canvas element
			this.cacheCanvas = setCSS(addEl("canvas", this.cont), { display: "none" });
			this.cacheContext = this.cacheCanvas.getContext("2d");
		} else {
		// For browsers without Canvas support...
			engine = engines[1];
			// Adds the VML stylesheet
			if (typeof (CanvasLoader.vmlSheet) === "undefined") {
				document.getElementsByTagName("head")[0].appendChild(addEl("style"));
				CanvasLoader.vmlSheet = document.styleSheets[document.styleSheets.length - 1];
				var a = ["group", "oval", "roundrect", "fill"], n;
				for (n in a) { CanvasLoader.vmlSheet.addRule(a[n], "behavior:url(#default#VML); position:absolute;"); }
			}
			this.vml = addEl("group", this.cont);
		}
		// Set the RGB color object
		this.setColor(this.color);
		// Sets the instance to be ready
		this.ready = true;
		// Draws the shapes on the canvas
		this.draw();
		// Starts rendering the preloader
		this.show();
	};
/////////////////////////////////////////////////////////////////////////////////////////////
// Property declarations
	/**
	* The div we place the canvas object into
	* @property container
	* @protected
	* @type Object
	**/
	p.container = {};
	/**
	* The div we draw the shapes into
	* @property canvas
	* @protected
	* @type Object
	**/
	p.canvas = {};
	/**
	* The canvas context
	* @property context
	* @protected
	* @type Object
	**/
	p.context = {};
	/**
	* The canvas we use for caching
	* @property cacheCanvas
	* @protected
	* @type Object
	**/
	p.cacheCanvas = {};
	/**
	* The context of the cache canvas
	* @property cacheContext
	* @protected
	* @type Object
	**/
	p.cacheContext = {};
	/**
	* Tells if the canvas and its context is ready
	* @property ready
	* @protected
	* @type Boolean
	**/
	p.ready = false;
	/**
	* Adds a timer for the rendering
	* @property timer
	* @protected
	* @type Boolean
	**/
	p.timer = {};
	/**
	* The active shape id for rendering
	* @property activeId
	* @protected
	* @type Number
	**/
	p.activeId = 0;
	/**
	* The diameter of the loader
	* @property diameter
	* @protected
	* @type Number
	* @default 40
	**/
	p.diameter = 40;
	/**
	* Sets the diameter of the loader
	* @method setDiameter
	* @public
	* @param diameter {Number} The default value is 40
	**/
	p.setDiameter = function (diameter) { this.diameter = Math.round(Math.abs(diameter)); this.redraw(); };
	/**
	* Returns the diameter of the loader.
	* @method getDiameter
	* @public
	* @return {Number}
	**/
	p.getDiameter = function () { return this.diameter; };
	/**
	* The color of the loader shapes in RGB
	* @property colorRGB
	* @protected
	* @type Object
	**/
	p.colorRGB = {};
	/**
	* The color of the loader shapes in HEX
	* @property color
	* @protected
	* @type String
	* @default "#000000"
	**/
	p.color = "#000000";
	/**
	* Sets hexadecimal color of the loader
	* @method setColor
	* @public
	* @param color {String} The default value is '#000000'
	**/
	p.setColor = function (color) { this.color = colorReg.test(color) ? color : "#000000"; this.colorRGB = this.getRGB(this.color); this.redraw(); };
	/**
	* Returns the loader color in a hexadecimal form
	* @method getColor
	* @public
	* @return {String}
	**/
	p.getColor = function () { return this.color; };
	/**
	* The type of the loader shapes
	* @property shape
	* @protected
	* @type String
	* @default "oval"
	**/
	p.shape = shapes[0];
	/**
	* Sets the type of the loader shapes.<br/>
	* <br/><b>The acceptable values are:</b>
	* <ul>
	* <li>'oval'</li>
	* <li>'spiral'</li>
	* <li>'square'</li>
	* <li>'rect'</li>
	* <li>'roundRect'</li>
	* </ul>
	* @method setShape
	* @public
	* @param shape {String} The default value is 'oval'
	**/
	p.setShape = function (shape) {
		var n;
		for (n in shapes) {
			if (shape === shapes[n]) { this.shape = shape; this.redraw(); break; }
		}
	};
	/**
	* Returns the type of the loader shapes
	* @method getShape
	* @public
	* @return {String}
	**/
	p.getShape = function () { return this.shape; };
	/**
	* The number of shapes drawn on the loader canvas
	* @property density
	* @protected
	* @type Number
	* @default 40
	**/
	p.density = 40;
	/**
	* Sets the number of shapes drawn on the loader canvas
	* @method setDensity
	* @public
	* @param density {Number} The default value is 40
	**/
	p.setDensity = function (density) { this.density = Math.round(Math.abs(density)); this.redraw(); };
	/**
	* Returns the number of shapes drawn on the loader canvas
	* @method getDensity
	* @public
	* @return {Number}
	**/
	p.getDensity = function () { return this.density; };
	/**
	* The amount of the modified shapes in percent.
	* @property range
	* @protected
	* @type Number
	**/
	p.range = 1.3;
	/**
	* Sets the amount of the modified shapes in percent.<br/>
	* With this value the user can set what range of the shapes should be scaled and/or faded. The shapes that are out of this range will be scaled and/or faded with a minimum amount only.<br/>
	* This minimum amount is 0.1 which means every shape which is out of the range is scaled and/or faded to 10% of the original values.<br/>
	* The visually acceptable range value should be between 0.4 and 1.5.
	* @method setRange
	* @public
	* @param range {Number} The default value is 1.3
	**/
	p.setRange = function (range) { this.range = Math.abs(range); this.redraw(); };
	/**
	* Returns the modified shape range in percent
	* @method getRange
	* @public
	* @return {Number}
	**/
	p.getRange = function () { return this.range; };
	/**
	* The speed of the loader animation
	* @property speed
	* @protected
	* @type Number
	**/
	p.speed = 2;
	/**
	* Sets the speed of the loader animation.<br/>
	* This value tells the loader how many shapes to skip by each tick.<br/>
	* Using the right combination of the <code>setFPS</code> and the <code>setSpeed</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
	* @method setSpeed
	* @public
	* @param speed {Number} The default value is 2
	**/
	p.setSpeed = function (speed) { this.speed = Math.round(Math.abs(speed)); this.reset(); };
	/**
	* Returns the speed of the loader animation
	* @method getSpeed
	* @public
	* @return {Number}
	**/
	p.getSpeed = function () { return this.speed; };
	/**
	* The FPS value of the loader animation rendering
	* @property fps
	* @protected
	* @type Number
	**/
	p.fps = 24;
	/**
	* Sets the rendering frequency.<br/>
	* This value tells the loader how many times to refresh and modify the canvas in 1 second.<br/>
	* Using the right combination of the <code>setSpeed</code> and the <code>setFPS</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
	* @method setFPS
	* @public
	* @param fps {Number} The default value is 24
	**/
	p.setFPS = function (fps) { this.fps = Math.round(Math.abs(fps)); this.reset(); };
	/**
	* Returns the fps of the loader
	* @method getFPS
	* @public
	* @return {Number}
	**/
	p.getFPS = function () { return this.fps; };
// End of Property declarations
/////////////////////////////////////////////////////////////////////////////////////////////	
	/**
	* Return the RGB values of the passed color
	* @method getRGB
	* @protected
	* @param color {String} The HEX color value to be converted to RGB
	*/
	p.getRGB = function (color) {
		color = color.charAt(0) === "#" ? color.substring(1, 7) : color;
		return {r: parseInt(color.substring(0, 2), 16), g: parseInt(color.substring(2, 4), 16), b: parseInt(color.substring(4, 6), 16) };
	};
	/**
	* Draw the shapes on the canvas
	* @method draw
	* @protected
	*/
	p.draw = function () {
		var i = 0, size, w, h, x, y, angle, radians, radius, animBits = Math.round(this.density * this.range), bitMod, minBitMod = 0, s, g, sh, f, d = 1000, arc = 0;
		if (engine === engines[0]) {
			this.cacheContext.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
			setAttr(this.canvas, {width: this.diameter, height: this.diameter});
			setAttr(this.cacheCanvas, {width: this.diameter, height: this.diameter});
			while (i < this.density) {
				bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
				angle = 360 - 360 / this.density * i;
				radians = angle / 180 * Math.PI;
				this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + "," + bitMod.toString() + ")";
				switch (this.shape) {
				case shapes[0]:
				case shapes[1]:
					size = this.diameter * 0.07;
					x = this.canvas.width * 0.5 + Math.cos(radians) * (this.diameter * 0.5 - size) - this.canvas.width * 0.5;
					y = this.canvas.height * 0.5 + Math.sin(radians) * (this.diameter * 0.5 - size) - this.canvas.height * 0.5;
					this.cacheContext.beginPath();
					if (this.shape === shapes[1]) { this.cacheContext.arc(this.diameter * 0.5 + x, this.diameter * 0.5 + y, size * bitMod, 0, Math.PI * 2, false); } else { this.cacheContext.arc(this.diameter * 0.5 + x, this.diameter * 0.5 + y, size, 0, Math.PI * 2, false); }
					break;
				case shapes[2]:
					size = this.diameter * 0.12;
					x = Math.cos(radians) * (this.cacheCanvas.width * 0.5 - size) + this.cacheCanvas.width * 0.5;
					y = Math.sin(radians) * (this.cacheCanvas.width * 0.5 - size) + this.cacheCanvas.height * 0.5;
					transformContext(this.cacheContext, x, y, radians);
					this.cacheContext.fillRect(x, y - size * 0.5, size, size);
					break;
				case shapes[3]:
				case shapes[4]:
					w = this.diameter * 0.3;
					h = w * 0.27;
					x = Math.cos(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.width * 0.5;
					y = Math.sin(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.height * 0.5;
					transformContext(this.cacheContext, x, y, radians);
					if(this.shape === shapes[3]) {
						this.cacheContext.fillRect(x, y - h * 0.5, w, h);
					} else {
						radius = h * 0.7;
						this.cacheContext.moveTo(x + radius, y - h * 0.5);
						this.cacheContext.lineTo(x + w - radius, y - h * 0.5);
						this.cacheContext.quadraticCurveTo(x + w, y - h * 0.5, x + w, y - h * 0.5 + radius);
						this.cacheContext.lineTo(x + w, y - h * 0.5 + h - radius);
						this.cacheContext.quadraticCurveTo(x + w, y - h * 0.5 + h, x + w - radius, y - h * 0.5 + h);
						this.cacheContext.lineTo(x + radius, y - h * 0.5 + h);
						this.cacheContext.quadraticCurveTo(x, y - h * 0.5 + h, x, y - h * 0.5 + h - radius);
						this.cacheContext.lineTo(x, y - h * 0.5 + radius);
						this.cacheContext.quadraticCurveTo(x, y - h * 0.5, x + radius, y - h * 0.5);
					}
					break;
				}
				this.cacheContext.closePath();
				this.cacheContext.fill();
				this.cacheContext.restore();
				++i;
			}
		} else {
			setCSS(this.cont, {width: this.diameter, height: this.diameter});
			setCSS(this.vml, {width: this.diameter, height: this.diameter, border: "1px solid #ff0000"});
			switch (this.shape) {
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
			while (i < this.density) {
				bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
				angle = 270 - 360 / this.density * i;
				switch (this.shape) {
				case shapes[1]:
					w = h = size * bitMod;
					x = d * 0.5 - size * 0.5 - size * bitMod * 0.5;
					y = (size - size * bitMod) * 0.5;
					break;
				case shapes[0]:
				case shapes[2]:
					if (ie8) {
						y = 0;
						if(this.shape === shapes[2]) {
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
					arc = this.shape === shapes[4] ? 0.6 : 0; 
					break;
				}
				g = setAttr(setCSS(addEl("group", this.vml), {width: d, height: d, rotation: angle}), {coordsize: d + "," + d, coordorigin: -d * 0.5 + "," + (-d * 0.5)});
				s = setCSS(addEl(sh, g, {stroked: false, arcSize: arc}), { width: w, height: h, top: y, left: x});
				f = addEl("fill", s, {color: this.color, opacity: bitMod});
				++i;
			}
		}
		this.tick(true);
	};
	/**
	* Cleans the canvas
	* @method clean
	* @protected
	*/
	p.clean = function () {
		if (engine === engines[0]) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		} else {
			if (this.vml.hasChildNodes()) {
				while (this.vml.childNodes.length >= 1) {
					this.vml.removeChild(this.vml.firstChild);
				}
			}
		}
	};
	/**
	* Redraws the canvas
	* @method redraw
	* @protected
	*/
	p.redraw = function () {
		if (this.ready) {
			this.clean();
			this.draw();
		}
	};
	/**
	* Resets the timer
	* @method reset
	* @protected
	*/
	p.reset = function () {
		if (typeof (this.timer) === "number") {
			this.hide();
			this.show();
		}
	};
	/**
	* Renders the loader animation
	* @method tick
	* @protected
	*/
	p.tick = function (initialize) {
		var rotUnit = this.density > 360 ? this.density / 360 : 360 / this.density;
		rotUnit *= this.speed;
		if (!initialize) { this.activeId += rotUnit; }
		if (this.activeId >= 360) { this.activeId -= 360; }
		if (engine === engines[0]) {
			this.context.clearRect(0, 0, this.diameter, this.diameter);
			transformContext(this.context, this.diameter * 0.5, this.diameter * 0.5, Math.PI / 180 * this.activeId);
			this.context.drawImage(this.cacheCanvas, 0, 0, this.diameter, this.diameter);
			this.context.restore();
		} else {
			this.vml.style.rotation = this.activeId;
		}
	};
	/**
	* Shows the rendering of the loader animation
	* @method show
	* @public
	*/
	p.show = function () {
		if (typeof (this.timer) !== "number") {
			var t = this;
			this.timer = self.setInterval(function () { t.tick(); }, Math.round(1000 / this.fps));
			setCSS(this.cont, {display: "block"});
		}
	};
	/**
	* Stops the rendering of the loader animation and hides the loader
	* @method hide
	* @public
	*/
	p.hide = function () {
		if (typeof (this.timer) === "number") {
			clearInterval(this.timer);			
			delete this.timer;
			setCSS(this.cont, {display: "none"});
		}
	};
	/**
	* Removes the CanvasLoader instance and all its references
	* @method kill
	* @public
	*/
	p.kill = function () {
		if (typeof (this.timer) === "number") { this.hide(); }
		if (engine === engines[0]) {
			this.cont.removeChild(this.canvas);
			this.cont.removeChild(this.cacheCanvas);
		} else {
			this.cont.removeChild(this.vml);
		}
		var n;
		for (n in this) { delete this[n]; }
	};
	window.CanvasLoader = CanvasLoader;
}(window));