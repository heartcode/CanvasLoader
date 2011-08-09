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
(function (window, document) {
	
	'use strict';

	/**
	* CanvasLoader is a JavaScript UI library which draws and animates circular preloaders using the Canvas HTML object.<br/>
	* A CanvasLoader instance creates two canvas elements which are placed into a placeholder div (the id of the div has to be passed in the constructor). The second canvas is invisible and used for caching purposes only.<br/>
	* If no id is passed in the constructor, the canvas objects are paced in the document directly.
	* @class CanvasLoader
	* @constructor
	* @param {String} id The id of the placeholder div.
	**/
	var CanvasLoader = function (id) {
		this.initialize(id);
	}, p = CanvasLoader.prototype, shapes = ["circle", "square", "rectangle", "roundedRectangle"], colorReg = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
	
	/** 
	* Initialization method.
	* @method initialize
	* @param id String The id of the placeholder div.
	* @protected
	*/
	p.initialize = function (id) {
		
		/*
		* Find the containing div by id (passed by the user).
		* If the container element cannot be found we use the document body itself.
		*/
		try {
			// Look for the parent element
			if (document.getElementById(id) !== undefined) {
				this.container = document.getElementById(id);
			} else {
				this.container = document.body;
			}
		} catch (error) {
			this.container = document.body;
		}
		
		// Create the canvas element
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
		this.canvas.id = "CanvasLoader";
		this.container.appendChild(this.canvas);
		this.canvas.width = this.canvas.height = this.diameter;
		
		// Create the cache canvas element
		this.cacheCanvas = document.createElement("canvas");
		document.body.appendChild(this.cacheCanvas);
		this.cacheContext = this.cacheCanvas.getContext("2d");
		this.cacheCanvas.width = this.cacheCanvas.height = this.diameter;
		this.cacheCanvas.style.display = "none";
		
		// Set the RGB color object
		this.setColor(this.color);
		
		// Set the instance ready
		p.ready = true;
		
		// Draw the shapes on the canvas
		this.draw();
		
		// Start rendering the preloader
		this.start();
	};
	
/////////////////////////////////////////////////////////////////////////////////////////////
// Property declarations
	
	/**
	* The div we place the canvas object into.
	* @property container
	* @type Object
	* @protected
	**/
	p.container = null;
	
	/**
	* The div we draw the shapes into.
	* @property canvas
	* @type Object
	* @protected
	**/
	p.canvas = null;
	
	/**
	* The canvas context.
	* @property context
	* @type Object
	* @protected
	**/
	p.context = null;
	
	/**
	* The canvas we use for caching.
	* @property cacheCanvas
	* @type Object
	* @protected
	**/
	p.cacheCanvas = null;
	
	/**
	* The context of the cache canvas.
	* @property cacheContext
	* @type Object
	* @protected
	**/
	p.cacheContext = null;
	
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
	p.timer = null;
	
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
	p.setDiameter = function (diameter) { if (!isNaN(diameter)) { this.diameter = Math.round(Math.abs(diameter)); this.redraw(); } };
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
	p.colorRGB = null;
	
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
	* @default "circle"
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
		var i = 0;
		while (i < shapes.length) {
			if (shape === shapes[i]) { this.shape = shape; this.redraw(); break; } 
			i += 1;
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
	p.setDensity = function (density) { if (!isNaN(density)) { this.density = Math.round(Math.abs(density)); this.redraw(); } };
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
	p.setRange = function (range) { if (!isNaN(range)) { this.range = Math.abs(range); this.redraw(); } };
	/**
	* Returns the modified shape range in percent.
	* @method getRange
	* @return {Number}
	* @public
	**/
	p.getRange = function () { return this.range; };
	
	/**
	* The scaling of the loader shapes.
	* @property scaling
	* @type Boolean
	* @protected
	**/
	p.scaling = false;
	/**
	* Sets the scaling of the loader shapes.
	* @method setScaling
	* @param scaling {Boolean} The default value is false.
	* @public
	**/
	p.setScaling = function (scaling) { if (typeof (scaling) === "boolean") { this.scaling = scaling; this.redraw(); } };
	/**
	* Returns the scaling of the loader shapes.
	* @method getScaling
	* @return Boolean
	* @public
	**/
	p.getScaling = function () { return this.scaling; };
	
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
	p.setFading = function (fading) { if (typeof fading === "boolean") { this.fading = fading; this.redraw(); } };
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
	p.setSpeed = function (speed) {if (!isNaN(speed) && Math.abs(speed) > 0) { this.speed = Math.round(Math.abs(speed)); this.reset(); } };
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
	p.setFPS = function (fps) { if (!isNaN(fps)) { this.fps = Math.round(Math.abs(fps)); this.reset(); } };
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
		var hexObject = {};
		
		color = color.charAt(0) === "#" ? color.substring(1, 7) : color;
				
		hexObject.r = parseInt(color.substring(0, 2), 16);
		hexObject.g = parseInt(color.substring(2, 4), 16);
		hexObject.b = parseInt(color.substring(4, 6), 16);
			
		return hexObject;
	};
	
	/**
	* Draw the shapes on the canvas
	* @method draw
	* @protected
	*/
	p.draw = function () {		
		var i = 0, size = this.diameter * 0.07, radians, radius, w, h, x, y, angle, minBitMod = 0.1, animBits = Math.round(this.density * this.range), bitMod;
		
		// Clean the cache canvas
		this.cacheContext.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
		this.canvas.width = this.canvas.height = this.cacheCanvas.width = this.cacheCanvas.height = this.diameter;
		
		// Draw the shapes
		switch (this.shape) {
		case shapes[0]:
			while (i < this.density) {						
				if (i <= animBits) { bitMod = 1 - ((1 - minBitMod) / animBits * i); } else { bitMod = minBitMod; }
				radians = (this.density - i) * ((Math.PI * 2) / this.density);
				x = this.canvas.width * 0.5 + Math.cos(radians) * (this.diameter * 0.45 - size) - this.canvas.width * 0.5;
				y = this.canvas.height * 0.5 + Math.sin(radians) * (this.diameter * 0.45 - size) - this.canvas.height * 0.5;
				this.cacheContext.beginPath();
				if (this.fading) { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + "," + bitMod.toString() + ")"; } else { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + ",1)"; }
				if (this.scaling) { this.cacheContext.arc(this.diameter * 0.5 + x, this.diameter * 0.5 + y, size * bitMod, 0, Math.PI * 2, false); } else { this.cacheContext.arc(this.diameter * 0.5 + x, this.diameter * 0.5 + y, size, 0, Math.PI * 2, false); }
				this.cacheContext.closePath();
				this.cacheContext.fill();
				i += 1;
			}
			break;
		case shapes[1]:
			size = this.canvas.width * 0.12;
			while (i < this.density) {						
				if (i <= animBits) { bitMod = 1 - ((1 - minBitMod) / animBits * i); } else { bitMod = minBitMod; }
				angle = 360 - 360 / this.density * i;
				radians = angle / 180 * Math.PI;
				x = Math.cos(radians) * size * 3 + this.cacheCanvas.width * 0.5;
				y = Math.sin(radians) * size * 3 + this.cacheCanvas.height * 0.5;
				this.cacheContext.save();
				this.cacheContext.translate(x, y);
				this.cacheContext.rotate(radians);
				this.cacheContext.translate(-x, -y);
				this.cacheContext.beginPath();
				if (this.fading) { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + "," + bitMod.toString() + ")"; } else { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + ",1)"; }
				this.cacheContext.fillRect(x, y - size * 0.5, size, size);
				this.cacheContext.closePath();
				this.cacheContext.fill();
				this.cacheContext.restore();
				i += 1;
			}
			break;
		case shapes[2]:
			w = this.cacheCanvas.width * 0.24;
			h = w * 0.35;
			while (i < this.density) {				
				if (i <= animBits) { bitMod = 1 - ((1 - minBitMod) / animBits * i); } else { bitMod = minBitMod; }
				angle = 360 - 360 / this.density * i;
				radians = angle / 180 * Math.PI;
				x = Math.cos(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.width * 0.5;
				y = Math.sin(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.height * 0.5;
				this.cacheContext.save();
				this.cacheContext.translate(x, y);
				this.cacheContext.rotate(radians);
				this.cacheContext.translate(-x, -y);
				this.cacheContext.beginPath();
				if (this.fading) { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + "," + bitMod.toString() + ")"; } else { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + ",1)"; }
				this.cacheContext.fillRect(x, y - h * 0.5, w, h);
				this.cacheContext.closePath();
				this.cacheContext.fill();
				this.cacheContext.restore();
				i += 1;
			}
			break;
		case shapes[3]:
			w = this.cacheCanvas.width * 0.24;
			h = w * 0.35;
			radius = h * 0.65;
			while (i < this.density) {				
				if (i <= animBits) { bitMod = 1 - ((1 - minBitMod) / animBits * i); } else { bitMod = minBitMod; }
				angle = 360 - 360 / this.density * i;
				radians = angle / 180 * Math.PI;
				x = Math.cos(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.width * 0.5;
				y = Math.sin(radians) * (h + (this.cacheCanvas.height - h) * 0.13) + this.cacheCanvas.height * 0.5;
				this.cacheContext.save();
				this.cacheContext.translate(x, y);
				this.cacheContext.rotate(radians);
				this.cacheContext.translate(-x, -y);
				if (this.fading) { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + "," + bitMod.toString() + ")"; } else { this.cacheContext.fillStyle = "rgba(" + this.colorRGB.r + "," + this.colorRGB.g + "," + this.colorRGB.b + ",1)"; }			this.cacheContext.beginPath();
				this.cacheContext.moveTo(x + radius, y - h * 0.5);
				this.cacheContext.lineTo(x + w - radius, y - h * 0.5);
				this.cacheContext.quadraticCurveTo(x + w, y - h * 0.5, x + w, y - h * 0.5 + radius);
				this.cacheContext.lineTo(x + w, y - h * 0.5 + h - radius);
				this.cacheContext.quadraticCurveTo(x + w, y - h * 0.5 + h, x + w - radius, y - h * 0.5 + h);
				this.cacheContext.lineTo(x + radius, y - h * 0.5 + h);
				this.cacheContext.quadraticCurveTo(x, y - h * 0.5 + h, x, y - h * 0.5 + h - radius);
				this.cacheContext.lineTo(x, y - h * 0.5 + radius);
				this.cacheContext.quadraticCurveTo(x, y - h * 0.5, x + radius, y - h * 0.5);
				this.cacheContext.closePath();
				this.cacheContext.fill();
				this.cacheContext.restore();
				i += 1;
			}
			break;
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
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
		if (this.running) {
			this.stop();
			this.start();
		}
	};
	
	/**
	* Renders the loader animation.
	* @event tick
	* @protected
	*/
	p.tick = function (initialize) {
		var tau = 2 * Math.PI;
		var frameRadians = tau * this.speed / 60 / this.fps; // this.speed = RPM
		if (!initialize) { this.activeId += frameRadians; }
		if (this.activeId > tau) { this.activeId -= tau; }
		
		this.context.clearRect(0, 0, this.diameter, this.diameter);
		this.context.save();
		this.context.translate(this.diameter * 0.5, this.diameter * 0.5);
		this.context.rotate(this.activeId);
		this.context.translate(-this.diameter * 0.5, -this.diameter * 0.5);
		this.context.drawImage(this.cacheCanvas, 0, 0, this.diameter, this.diameter);
		this.context.restore();
	};
	
	/**
	* Start the rendering of the loader animation.
	* @method start
	* @public
	*/
	p.start = function () {
		if (!this.running) {
			this.running = true;
			var t = this;
			this.timer = self.setInterval(t.tick, Math.round(1000 / this.fps));
		}
	};
	
	/**
	* Stop the rendering of the loader animation.
	* @method stop
	* @public
	*/
	p.stop = function () {
		if (this.running) {
			this.running = false;
			this.running = false;
			clearInterval(this.timer);
			this.timer = null;
			delete this.timer;
		}
	};
	
	/**
	* Remove the CanvasLoader instance.
	* @method remove
	* @public
	*/
	p.remove = function () {
		if (this.running) { this.stop(); }
		this.container.removeChild(this.canvas);
	};
	
	window.CanvasLoader = CanvasLoader;
	document.CanvasLoader = CanvasLoader;
}(window, document));