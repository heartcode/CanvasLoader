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
	/**
	* CanvasLoader is a JavaScript UI library that draws and animates circular preloaders using the Canvas HTML object.<br/>
	* A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/>
	* If no id is passed in the constructor, the canvas objects are paced in the document directly.
	* @class CanvasLoader
	* @constructor
	* @param {String} id The id of the placeholder div.
	**/
	"use strict";
	var CanvasLoader = function (id) {
		this.initialize(id);
	}, p = CanvasLoader.prototype, engine, engines = ["canvas", "vml"], shapes = ["oval", "spiral", "square", "rect", "roundRect"], colorReg = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
	/**
	* Creates a new element with the tag and applies the passed properties on it.
	*/
		addEl = function (tag, props, par) {
			var el = document.createElement(tag), n;
			for (n in props) { el[n] = props[n]; }
			if(typeof(par) !== "undefined") {
				par.appendChild(el);
			}
			return el;
		},
	/**
	* Sets the css properties on the element
	*/
		setCSS = function (el, props) {
			var n;
			for (n in props) { el.style[n] = props[n]; }
			return el;
		},
	/**
	* Sets the attributes on the element
	*/
		setAttr = function (el, props) {
			var n;
			for (n in props) { el.setAttribute(n, props[n]); }
			return el;
		},
	/**
	* Checks if the browser supports Canvas
	*/
		canvasSupport = function () {
			return !!document.createElement('canvas').getContext;
		};
	/** 
	* Initialization method.
	* @method initialize
	* @param id String The id of the placeholder div.
	* @protected
	*/
	p.initialize = function (parentId, loaderId) {
		/*
		* Find the containing div by id (passed by the user).
		* If the container element cannot be found we use the document body itself.
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
		this.cont = setCSS(addEl("div", {id: loaderId}, this.mother), {border: "1px solid #ff0000", position: "absolute"});
		if (canvasSupport()) {
		// For browsers with Canvas support...
			engine = engines[0];
			// Create the canvas element
			this.canvas = addEl("canvas", {}, this.cont);
			this.context = this.canvas.getContext("2d");
			// Create the cache canvas element
			this.cacheCanvas = setCSS(addEl("canvas", {}, this.cont), { display: "none" });
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
			this.vml = addEl("group", {}, this.cont);
		}
		// Set the RGB color object
		this.setColor(this.color);
		// Set the instance ready
		p.ready = true;
		// Draw the shapes on the canvas
		this.draw();
		// Start rendering the preloader
		this.show();
	};
/////////////////////////////////////////////////////////////////////////////////////////////
// Property declarations
	/**
	* The div we place the canvas object into.
	* @property container
	* @type Object
	* @protected
	**/
	p.container = {};
	/**
	* The div we draw the shapes into.
	* @property canvas
	* @type Object
	* @protected
	**/
	p.canvas = {};
	/**
	* The canvas context.
	* @property context
	* @type Object
	* @protected
	**/
	p.context = {};
	/**
	* The canvas we use for caching.
	* @property cacheCanvas
	* @type Object
	* @protected
	**/
	p.cacheCanvas = {};
	/**
	* The context of the cache canvas.
	* @property cacheContext
	* @type Object
	* @protected
	**/
	p.cacheContext = {};
	/**
	* Tell if the loader rendering is running.
	* @property running
	* @type Boolean
	* @protected
	**/
	p.running = false;
	/**
	* Tell if the canvas and its context is ready.
	* @property ready
	* @type Boolean
	* @protected
	**/
	p.ready = false;
	/**
	* Add a timer for the rendering.
	* @property timer
	* @type Boolean
	* @protected
	**/
	p.timer = {};
	/**
	* The active shape id for rendering.
	* @property activeId
	* @type Number
	* @protected
	**/
	p.activeId = 0;
	/**
	* The diameter of the loader.
	* @property diameter
	* @type Number
	* @default 40
	* @protected
	**/
	p.diameter = 40;
	/**
	* Sets the diameter of the loader.
	* @method setDiameter
	* @param diameter {Number} The default value is 40.
	* @public
	**/
	p.setDiameter = function (diameter) { this.diameter = Math.round(Math.abs(diameter)); this.redraw(); };
	/**
	* Returns the diameter of the loader.
	* @method getDiameter
	* @return Number
	* @public
	**/
	p.getDiameter = function () { return this.diameter; };
	/**
	* The color of the loader shapes in RGB.
	* @property colorRGB
	* @type Object
	* @protected
	**/
	p.colorRGB = {};
	/**
	* The color of the loader shapes in HEX.
	* @property color
	* @type String
	* @default "#000000"
	* @protected
	**/
	p.color = "#000000";
	/**
	* Sets hexadecimal color of the loader.
	* @method setColor
	* @param color {String} The default value is '#000000'.
	* @public
	**/
	p.setColor = function (color) { this.color = colorReg.test(color) ? color : "#000000"; this.colorRGB = this.getRGB(this.color); this.redraw(); };
	/**
	* Returns the loader color in a hexadecimal form.
	* @method getColor
	* @return String
	* @public
	**/
	p.getColor = function () { return this.color; };
	/**
	* The type of the loader shapes.
	* @property shape
	* @type String
	* @default "oval"
	* @protected
	**/
	p.shape = shapes[0];
	/**
	* Sets the type of the loader shapes.<br/>
	* <br/><b>The acceptable values are:</b>
	* <ul>
	* <li>'circle'</li>
	* <li>'square'</li>
	* <li>'rectangle'</li>
	* <li>'roundedRectangle'</li>
	* </ul>
	* @method setShape
	* @param shape {String} The default value is 'circle'.
	* @public
	**/
	p.setShape = function (shape) {
		var n;
		for (n in shapes) {
			if (shape === shapes[n]) { this.shape = shape; this.redraw(); break; }
		}
	};
	/**
	* Returns the type of the loader shapes.
	* @method getShape
	* @return String
	* @public
	**/
	p.getShape = function () { return this.shape; };
	/**
	* The number of shapes drawn on the loader canvas.
	* @property density
	* @type Number
	* @default 40
	* @protected
	**/
	p.density = 40;
	/**
	* Sets the number of shapes drawn on the loader canvas.
	* @method setDensity
	* @param density {Number} The default value is 40.
	* @public
	**/
	p.setDensity = function (density) { this.density = Math.round(Math.abs(density)); this.redraw(); };
	/**
	* Returns the number of shapes drawn on the loader canvas.
	* @method getDensity
	* @return {Number}
	* @public
	**/
	p.getDensity = function () { return this.density; };
	/**
	* Sets the amount of the modified shapes in percent.
	* @property range
	* @type Number
	* @protected
	**/
	p.range = 1.3;
	/**
	* Sets the amount of the modified shapes in percent.<br/>
	* With this value the user can set what range of the shapes should be scaled and/or faded. The shapes that are out of this range will be scaled and/or faded with a minimum amount only.<br/>
	* This minimum amount is 0.1 which means every shape which is out of the range is scaled and/or faded to 10% of the original values.<br/>
	* The visually acceptable range value should be between 0.4 and 1.5.
	* @method setRange
	* @param range {Number} The default value is 1.3.
	* @public
	**/
	p.setRange = function (range) { this.range = Math.abs(range); this.redraw(); };
	/**
	* Returns the modified shape range in percent.
	* @method getRange
	* @return {Number}
	* @public
	**/
	p.getRange = function () { return this.range; };
	/**
	* The fading of the loader shapes.
	* @property fading
	* @type Boolean
	* @protected
	**/
	p.fading = true;
	/**
	* Sets the fading of the loader shapes.
	* @method setFading
	* @param fading {Boolean} The default value is true.
	* @public
	**/
	p.setFading = function (fading) { this.fading = fading; this.redraw(); };
	/**
	* Returns the fading of the loader shapes.
	* @method getFading
	* @return {Boolean}
	* @public
	**/
	p.getFading = function () { return this.fading; };
	/**
	* The speed of the loader animation.
	* @property speed
	* @type Number
	* @protected
	**/
	p.speed = 2;
	/**
	* Sets the speed of the loader animation.<br/>
	* This value tells the loader how many shapes to skip by each tick.<br/>
	* Using the right combination of the <code>setFPS</code> and the <code>setSpeed</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
	* @method setSpeed
	* @param speed {Number} The default value is 2.
	* @seealso setFPS
	* @public
	**/
	p.setSpeed = function (speed) { this.speed = Math.round(Math.abs(speed)); this.reset(); };
	/**
	* Returns the speed of the loader animation.
	* @method getSpeed
	* @return {Number}
	* @public
	**/
	p.getSpeed = function () { return this.speed; };
	/**
	* The FPS of the loader animation rendering.
	* @property fps
	* @type Number
	* @protected
	**/
	p.fps = 24;
	/**
	* Sets the rendering frequency.<br/>
	* This value tells the loader how many times to refresh and modify the canvas in 1 second.<br/>
	* Using the right combination of the <code>setSpeed</code> and the <code>setFPS</code> methods allows the users to optimize the CPU usage of the loader whilst keeping the animation on a visually pleasing level.
	* @method setFPS
	* @param fps {Number} The default value is 24.
	* @seealso setSpeed
	* @public
	**/
	p.setFPS = function (fps) { this.fps = Math.round(Math.abs(fps)); this.reset(); };
	/**
	* Returns the fps of the loader.
	* @method getFPS
	* @return {Number}
	* @public
	**/
	p.getFPS = function () { return this.fps; };
// End of Property declarations
/////////////////////////////////////////////////////////////////////////////////////////////	
	/**
	* Return the RGB values of the passed color.
	* @method getRGB
	* @param	color (String) The HEX color value to be converted to RGB
	* @protected
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
			// Clean the cache canvas
			this.cacheContext.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
			setAttr(this.canvas, {width: this.diameter, height: this.diameter});
			setAttr(this.cacheCanvas, {width: this.diameter, height: this.diameter});
			while (i < this.density) {
				bitMod = i <= animBits ? 1 - ((1 - minBitMod) / animBits * i) : bitMod = minBitMod;
				angle = 360 - 360 / this.density * i;
				radians = angle / 180 * Math.PI;
				this.cacheContext.save();
				if (this.fading) { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + "," + bitMod.toString() + ")"; } else { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + ",1)"; }
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
					x = Math.cos(radians) * size * 3 + this.cacheCanvas.width * 0.5;
					y = Math.sin(radians) * size * 3 + this.cacheCanvas.height * 0.5;
					this.cacheContext.translate(x, y);
					this.cacheContext.rotate(radians);
					this.cacheContext.translate(-x, -y);
					this.cacheContext.beginPath();
					this.cacheContext.fillRect(x, y - size * 0.5, size, size);
					break;
				case shapes[3]:
					w = size = this.diameter * 0.24;
					h = w * 0.35;
					x = Math.cos(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.width * 0.5;
					y = Math.sin(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.height * 0.5;
					this.cacheContext.translate(x, y);
					this.cacheContext.rotate(radians);
					this.cacheContext.translate(-x, -y);
					this.cacheContext.beginPath();
					this.cacheContext.fillRect(x, y - h * 0.5, w, h);
					break;
				case shapes[4]:
					w = size = this.diameter * 0.24;
					h = w * 0.35;
					radius = h * 0.55;
					x = Math.cos(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.width * 0.5;
					y = Math.sin(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.height * 0.5;
					this.cacheContext.translate(x, y);
					this.cacheContext.rotate(radians);
					this.cacheContext.translate(-x, -y);
					this.cacheContext.beginPath();
					this.cacheContext.moveTo(x + radius, y - h * 0.5);
					this.cacheContext.lineTo(x + w - radius, y - h * 0.5);
					this.cacheContext.quadraticCurveTo(x + w, y - h * 0.5, x + w, y - h * 0.5 + radius);
					this.cacheContext.lineTo(x + w, y - h * 0.5 + h - radius);
					this.cacheContext.quadraticCurveTo(x + w, y - h * 0.5 + h, x + w - radius, y - h * 0.5 + h);
					this.cacheContext.lineTo(x + radius, y - h * 0.5 + h);
					this.cacheContext.quadraticCurveTo(x, y - h * 0.5 + h, x, y - h * 0.5 + h - radius);
					this.cacheContext.lineTo(x, y - h * 0.5 + radius);
					this.cacheContext.quadraticCurveTo(x, y - h * 0.5, x + radius, y - h * 0.5);
					break;
				}
				this.cacheContext.closePath();
				this.cacheContext.fill();
				this.cacheContext.restore();
				++i;
			}
		} else {
			setCSS(this.cont, {width: this.diameter, height: this.diameter});
			setCSS(this.vml, {width: this.diameter, height: this.diameter});
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
				case shapes[3]:
				case shapes[4]:
					w = size * 0.95;
					h = w * 0.28;
					x = d * 0.5 - w;
					y = -h * 0.5;
					arc = this.shape === shapes[4] ? 0.6 : 0; 
					break;
				}
				// Adds the group (shape needed to be grouped for accurate rotation)
				g = setAttr(setCSS(addEl("group", {}, this.vml), {width: d, height: d, rotation: angle}), {coordsize: d + "," + d, coordorigin: -d * 0.5 + "," + (-d * 0.5)});
				// Adds the shape
				s = setCSS(addEl(sh, {stroked: false, arcSize: arc}, g), { width: w, height: h, top: y, left: x});
				// Adds the fill
				f = addEl("fill", {color: this.color, opacity: bitMod}, s);
				++i;
			}
		}
		// Render the changes on the canvas
		this.tick(true);
	};
	/**
	* Cleans the canvas.
	* @method clean
	* @protected
	*/
	p.clean = function () {
		if (engine === engines[0]) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		} else {
			// Cleans the VML element from its children
			if (this.vml.hasChildNodes()) {
				while (this.vml.childNodes.length >= 1) {
					this.vml.removeChild(this.vml.firstChild);
				}
			}
		}
	};
	/**
	* Redraws the canvas.
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
	* Resets the timer.
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
	* Renders the loader animation.
	* @event tick
	* @protected
	*/
	p.tick = function (initialize) {
		var rotUnit = this.density > 360 ? this.density / 360 : 360 / this.density;
		rotUnit *= this.speed;
		if (!initialize) { this.activeId += rotUnit; }
		if (this.activeId >= 360) { this.activeId -= 360; }
		if (engine === engines[0]) {
			this.context.clearRect(0, 0, this.diameter, this.diameter);
			this.context.save();
			this.context.translate(this.diameter * 0.5, this.diameter * 0.5);
			this.context.rotate(Math.PI / 180 * this.activeId);
			this.context.translate(-this.diameter * 0.5, -this.diameter * 0.5);
			this.context.drawImage(this.cacheCanvas, 0, 0, this.diameter, this.diameter);
			this.context.restore();
		} else {
			this.vml.style.rotation = this.activeId;
		}
	};
	/**
	* Shows the rendering of the loader animation.
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
	* Stop the rendering of the loader animation and hides the loader.
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
	* Remove the CanvasLoader instance and all references.
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