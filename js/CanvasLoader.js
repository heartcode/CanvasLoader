/*
	Copyright (c) 2011 Róbert Pataki

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	
	----------------------------------------------------------------------------------------
	
	Documentation, more shapes and more optimized version are all on their way, so stay tuned.
	If you like the idea, join me for a ride and fork the repo on GitHub, let's make a cool, easy-to-use, HTML based preloader for the design and dev community together!
	
	Check out my GitHub:	https://github.com/heartcode/
	Send me an email:		heartcode@robertpataki.com
	Follow me on Twitter:	http://twitter.com/#iHeartcode
	Blog:					http://heartcode.robertpataki.com
	
 * */
 
(function(window, document) {

	/**
	* 
	* @class CanvasLoader
	* @constructor
	* @param {String} id
	* @param {String} diameter
	* @param {String} color
	**/
	CanvasLoader = function(options) {
		this.initialize(options);
	};
	// Define the shapes
	var CIRCLE = "circle";
	var SQUARE = "square";
	var TRIANGLE = "triangle";
	var shapes = [CIRCLE, SQUARE, TRIANGLE];
	
	var p = CanvasLoader.prototype;
	
	/** 
	* Initialization method.
	* @method initialize
	* @protected
	*/
	p.initialize = function(options) {
		
		// Store the user settings
		for(var r in options) {
			if(this[r] != undefined) this[r] = options[r];
		}
		
		/*
		* Find the containing div by id (passed by the user).
		* If the container element cannot be found we use the document body itself
		*/
		try {
			// Look for the parent element
			if(document.getElementById(options["id"]) != undefined) {
				this._container = document.getElementById(options["id"]);
			}
			else {
				this._container = document.body;
			}
		}
		catch(error) {
			this._container = document.body;
		}
		
		// Create the canvas element
		this._canvas = document.createElement("canvas");
		this._context = this._canvas.getContext("2d");
		this._canvas.id = "CanvasLoader";
		this._container.appendChild(this._canvas);
		this._canvas.width = this._canvas.height = this.diameter;
		
		// Create the cache canvas element
		this._cacheCanvas = document.createElement("canvas");
		document.body.appendChild(this._cacheCanvas);
		this._cacheContext = this._cacheCanvas.getContext("2d");
		this._cacheCanvas.width = this._cacheCanvas.height = this.diameter;
		this._cacheCanvas.style.display = "none";
		
		// Set the RGB color object
		this.setColor(this.color);
		
		// Set the instance ready
		p._ready = true;
		
		// Draw the shapes on the canvas
		this.draw();
	};
	
/////////////////////////////////////////////////////////////////////////////////////////////
// Property declarations
	
	/**
	* The div we place the canvas object into.
	* @property _container
	* @type Object
	**/
	p._container = null;
	
	/**
	* The div we draw the shapes into.
	* @property _canvas
	* @type Object
	**/
	p._canvas = null;
	
	/**
	* The canvas context.
	* @property _context
	* @type Object
	**/
	p._context = null;
	
	/**
	* The canvas we use for caching.
	* @property _cacheCanvas
	* @type Object
	**/
	p._cacheCanvas = null;
	
	/**
	* The context of the cache canvas.
	* @property _cacheContext
	* @type Object
	**/
	p._cacheContext = null;
	
	/**
	* Tell if the loader rendering is running.
	* @property running
	* @type Boolean
	**/
	p._running = false;
	
	/**
	* Tell if the canvas and its context is ready.
	* @property _ready
	* @type Boolean
	**/
	p._ready = false;
	
	/**
	* Add a timer for the rendering.
	* @property _timer
	* @type Boolean
	**/
	p._timer = null;
	
	/**
	* The active shape id for rendering.
	* @property _activeId
	* @type Number
	**/
	p._activeId = 0;
	
	/**
	* The diameter of the loader.
	* @property diameter
	* @type Number
	**/
	p.diameter = 50;
	p.setDiameter = function(diameter) { if(!isNaN(diameter)) this.diameter = Math.round(Math.abs(diameter)); this.redraw(); };
	p.getDiameter = function() { return this.diameter; };

	/**
	* The color of the loader shapes in RGB.
	* @property _colorRGB
	* @type Object
	**/
	p._colorRGB = null;
	
	/**
	* The color of the loader shapes in HEX.
	* @property color
	* @type String
	**/
	p.color = "#000000";
	var colorReg = /^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/;
	p.setColor = function(color) { this.color = colorReg.test(color) ? color : "#000000"; this._colorRGB = this.getRGB(this.color); this.redraw(); };
	p.getColor = function() { return this.color; };
	
	/**
	* The type of the loader shapes.
	* @property shape
	* @type String
	**/
	p.shape = CIRCLE;
	p.setShape = function(shape) { 
		var i = 0;
		while(i < shapes.length) {
			if(shape == shapes[i]) { this.shape = shape; this.redraw(); break; } 
			++i;
		}
	};
	p.getShape = function() { return this.shape; };
	
	/**
	* The number of shapes drawn on the loader canvas.
	* @property density
	* @type Number
	**/
	p.density = 120;
	p.setDensity = function(density) { if(!isNaN(density)) this.density = Math.round(Math.abs(density)); this.redraw(); };
	p.getDensity = function() { return this.density; };
	
	/**
	* The range of the animated loader shapes.
	* @property range
	* @type Number
	**/
	p.range = 0.95;
	p.setRange = function(range) {if(!isNaN(range)) this.range = Math.abs(range); this.redraw(); };
	p.getRange = function() { return this.range; };
	
	/**
	* The scaling of the loader shapes.
	* @property scaling
	* @type Boolean
	**/
	p.scaling = true;
	p.setScaling = function(scaling) { if(typeof(scaling) == "boolean") this.scaling = scaling; this.redraw(); };
	p.getScaling = function() { return this.scaling; };
	
	/**
	* The fading of the loader shapes.
	* @property fading
	* @type Boolean
	**/
	p.fading = true;
	p.setFading = function(fading) { if(typeof(fading) == "boolean") this.fading = fading; this.redraw(); };
	p.getFading = function() { return this.fading; };
	
	/**
	* The speed of the loader animation.
	* @property _speed
	* @type Number
	**/
	p.speed = 1;
	p.setSpeed = function(speed) {if(!isNaN(speed) && Math.abs(speed) > 0) this.speed = Math.round(Math.abs(speed)); this.reset();};
	p.getSpeed = function() { return this.speed; };
	
	/**
	* The FPS of the loader animation rendering.
	* @property fps
	* @type Number
	**/
	p.fps = 12;
	// [GS]etter for the FPS
	p.getFPS = function() { return this.fps };
	p.setFPS = function(fps) { if(!isNaN(fps)) this.fps = Math.round(Math.abs(fps)); this.reset();};
	
// End of Property declarations
/////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	* Return the RGB values of the passed color.
	*/
	p.getRGB = function(color) {
		var hexObject = {};
		
		color = color.charAt(0) == "#" ? color.substring(1, 7) : color;
				
		hexObject.r = parseInt(color.substring(0,2),16);
		hexObject.g = parseInt(color.substring(2,4),16);
		hexObject.b = parseInt(color.substring(4,6),16);
			
		return hexObject;
	};
	
	/**
	* Draw the shapes on the canvas
	*/
	p.draw = function() {		
		var i = 0;
		var size = this.diameter * .07;
		var radians;
		var x, y, a;
		var animBits = Math.round(this.density * this.range);
		var minBitMod = 1/animBits;
		var bitMod;
		
		// Clean the cache canvas
		this._cacheContext.clearRect(0, 0, this._cacheCanvas.width, this._cacheCanvas.height);
		this._canvas.width = this._canvas.height = this._cacheCanvas.width = this._cacheCanvas.height = this.diameter;
		
		// Draw the shapes
		switch(this.shape)
		{
			case "circle":
				while(i<this.density)
				{						
					if(i <= animBits) bitMod = 1-i*minBitMod;
					
					radians = (this.density - i) * ((Math.PI * 2) / this.density);
					x = this._canvas.width*.5 + Math.cos(radians) * (this.diameter*.45 - size) - this._canvas.width*.5;
					y = this._canvas.height*.5 + Math.sin(radians) * (this.diameter*.45 - size) - this._canvas.height*.5;
					
					this._cacheContext.beginPath();
					if(this.fading) this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + "," + bitMod + ")";
					else this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + ",1)";
					if(this.scaling) this._cacheContext.arc(this.diameter*0.5 + x,this.diameter*0.5 + y,size*bitMod,0,Math.PI*2,false);
					else this._cacheContext.arc(this.diameter*0.5 + x,this.diameter*0.5 + y,size,0,Math.PI*2,false);
					this._cacheContext.closePath();
					this._cacheContext.fill();
					
					++i;
				}
			break;
		}
		
		// Render the changes on the canvas
		this.tick(true);
	};
	
	/**
	* Clean the canvas
	*/
	p.clean = function() {
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
	};
	
	/**
	* Redraw the loader
	*/
	p.redraw = function() {
		if(this._ready) {
			this.clean();
			this.draw();
		}
	};
	
	/**
	* Reset the timer
	*/
	p.reset = function() {
		if(this._running) {
			this.stop();
			this.start();
		}
	};
	
	/**
	* Remove the CanvasLoader instance
	*/
	p.remove = function() {};
	
	/**
	* Render the loader
	*/
	p.tick = function(initialize) {
		var rotUnit = this.density > 360 ? this.density / 360 : 360 / this.density;
		rotUnit *= this.speed;
		if(!initialize) this._activeId += rotUnit;
		if(this._activeId > 360) this._activeId -= 360;
		
		this._context.clearRect(0, 0, this.diameter, this.diameter);
		this._context.save();
		this._context.translate(this.diameter*0.5, this.diameter*0.5);
		this._context.rotate(Math.PI/180*this._activeId);
		this._context.translate(-this.diameter*0.5, -this.diameter*0.5);
		this._context.drawImage(this._cacheCanvas, 0, 0, this.diameter, this.diameter);
		this._context.restore();
	};
	
	/**
	* Start the rendering
	*/
	p.start = function() {
		if(!this._running) {
			this._running = true;
			var t = this;
			this._timer = self.setInterval(function(){t.tick();}, Math.round(1000/this.fps));
		}
	};
	
	/**
	* Stop the rendering
	*/
	p.stop = function() {
		if(this._running) {
			this._running = false;
			this._running = false;
			clearInterval(this._timer);
			this._timer = null;
			delete this._timer;
		}
	};
	
	window.CanvasLoader = CanvasLoader;
	document.CanvasLoader = CanvasLoader;
	
})(window, document);