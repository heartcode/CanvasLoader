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
	* @param {String} _diameter
	* @param {String} color
	**/
	CanvasLoader = function(options) {
		this.initialize(options);
	};
	// Define the shapes
	var shapes = ["circle", "square", "rectangle", "roundedRectangle"];
	
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
		this._canvas.width = this._canvas.height = this._diameter;
		
		// Create the cache canvas element
		this._cacheCanvas = document.createElement("canvas");
		document.body.appendChild(this._cacheCanvas);
		this._cacheContext = this._cacheCanvas.getContext("2d");
		this._cacheCanvas.width = this._cacheCanvas.height = this._diameter;
		this._cacheCanvas.style.display = "none";
		
		// Set the RGB color object
		this.setColor(this._color);
		
		// Set the instance ready
		p._ready = true;
		
		// Draw the shapes on the canvas
		this._draw();
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
	* The _diameter of the loader.
	* @property _diameter
	* @type Number
	**/
	p._diameter = 50;
	p.setDiameter = function(diameter) { if(!isNaN(diameter)) this._diameter = Math.round(Math.abs(diameter)); this._redraw(); };
	p.getDiameter = function() { return this._diameter; };

	/**
	* The color of the loader shapes in RGB.
	* @property _colorRGB
	* @type Object
	**/
	p._colorRGB = null;
	
	/**
	* The color of the loader shapes in HEX.
	* @property _color
	* @type String
	**/
	p._color = "#000000";
	var colorReg = /^\#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
	p.setColor = function(color) { this._color = colorReg.test(color) ? color : "#000000"; this._colorRGB = this._getRGB(this._color); this._redraw(); };
	p.getColor = function() { return this._color; };
	
	/**
	* The type of the loader shapes.
	* @property _shape
	* @type String
	**/
	p._shape = shapes[2];
	p.setShape = function(shape) { 
		var i = 0;
		while(i < shapes.length) {
			if(shape == shapes[i]) { this._shape = shape; this._redraw(); break; } 
			++i;
		}
	};
	p.getShape = function() { return this._shape; };
	
	/**
	* The number of shapes drawn on the loader canvas.
	* @property _density
	* @type Number
	**/
	p._density = 12;
	p.setDensity = function(density) { if(!isNaN(density)) this._density = Math.round(Math.abs(density)); this._redraw(); };
	p.getDensity = function() { return this._density; };
	
	/**
	* The range of the animated loader shapes.
	* @property _range
	* @type Number
	**/
	p._range = 0.95;
	p.setRange = function(range) {if(!isNaN(range)) this._range = Math.abs(range); this._redraw(); };
	p.getRange = function() { return this._range; };
	
	/**
	* The scaling of the loader shapes.
	* @property _scaling
	* @type Boolean
	**/
	p._scaling = true;
	p.setScaling = function(scaling) { if(typeof(scaling) == "boolean") this._scaling = scaling; this._redraw(); };
	p.getScaling = function() { return this._scaling; };
	
	/**
	* The fading of the loader shapes.
	* @property _fading
	* @type Boolean
	**/
	p._fading = true;
	p.setFading = function(fading) { if(typeof(fading) == "boolean") this._fading = fading; this._redraw(); };
	p.getFading = function() { return this._fading; };
	
	/**
	* The speed of the loader animation.
	* @property _speed
	* @type Number
	**/
	p._speed = 1;
	p.setSpeed = function(speed) {if(!isNaN(speed) && Math.abs(speed) > 0) this._speed = Math.round(Math.abs(speed)); this._reset();};
	p.getSpeed = function() { return this._speed; };
	
	/**
	* The FPS of the loader animation rendering.
	* @property _fps
	* @type Number
	**/
	p._fps = 2;
	// [GS]etter for the FPS
	p.getFPS = function() { return this._fps };
	p.setFPS = function(fps) { if(!isNaN(fps)) this._fps = Math.round(Math.abs(fps)); this._reset();};
	
// End of Property declarations
/////////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	* Return the RGB values of the passed color.
	*/
	p._getRGB = function(color) {
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
	p._draw = function() {		
		var i = 0;
		var size = this._diameter * .07;
		var radians;
		var x, y, a, angle, minBitMod;
		var animBits = Math.round(this._density * this._range);
		var bitMod;
		
		// Clean the cache canvas
		this._cacheContext.clearRect(0, 0, this._cacheCanvas.width, this._cacheCanvas.height);
		this._canvas.width = this._canvas.height = this._cacheCanvas.width = this._cacheCanvas.height = this._diameter;
		
		// Draw the shapes
		switch(this._shape)
		{
			case shapes[0]:
				minBitMod = 0.1;
				while(i<this._density)
				{						
					if(i <= animBits) bitMod = 1-((1-minBitMod)/animBits*i);
					else bitMod = minBitMod;
					
					radians = (this._density - i) * ((Math.PI * 2) / this._density);
					x = this._canvas.width*.5 + Math.cos(radians) * (this._diameter*.45 - size) - this._canvas.width*.5;
					y = this._canvas.height*.5 + Math.sin(radians) * (this._diameter*.45 - size) - this._canvas.height*.5;
					
					this._cacheContext.beginPath();
					if(this._fading) this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + "," + bitMod + ")";
					else this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + ",1)";
					if(this._scaling) this._cacheContext.arc(this._diameter*0.5 + x,this._diameter*0.5 + y,size*bitMod,0,Math.PI*2,false);
					else this._cacheContext.arc(this._diameter*0.5 + x,this._diameter*0.5 + y,size,0,Math.PI*2,false);
					this._cacheContext.closePath();
					this._cacheContext.fill();
					
					++i;
				}
			break;
			case shapes[1]:
				size = this._canvas.width * .12;
				minBitMod = 0.1;
				while(i<this._density)
				{						
					if(i <= animBits) bitMod = 1-((1-minBitMod)/animBits*i);
					else bitMod = minBitMod;
					angle = 360-360/this._density*i;
					radians = (angle)/180*Math.PI;
					x = Math.cos(radians) * size*3 + this._cacheCanvas.width*0.5;
					y = Math.sin(radians) * size*3 + this._cacheCanvas.height*0.5;
					
					this._cacheContext.save();
					this._cacheContext.translate(x, y);
					this._cacheContext.rotate(radians);
					this._cacheContext.translate(-x, -y);
					this._cacheContext.beginPath();
					if(this._fading) this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + "," + bitMod + ")";
					else this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + ",1)";
					this._cacheContext.fillRect(x,y-size*.5,size,size);
					this._cacheContext.closePath();
					this._cacheContext.fill();
					this._cacheContext.restore();
					
					++i;
				}
			break;
			case shapes[2]:
				var w = this._cacheCanvas.width * .2;
				var h = w*0.3;
				minBitMod = 0.1;
				while(i<this._density)
				{				
					if(i <= animBits) bitMod = 1-((1-minBitMod)/animBits*i);
					else bitMod = minBitMod;
					angle = 360-360/this._density*i;
					radians = (angle)/180*Math.PI;
					if(this._scaling) {
						//w *= bitMod;
						x = Math.cos(radians) * (h + (this._cacheCanvas.height - h) * 0.2) + this._cacheCanvas.width*.5;
						y = Math.sin(radians) * (h + (this._cacheCanvas.height - h) * 0.2) + this._cacheCanvas.height*.5;
					}
					else {
						x = Math.cos(radians) * (h + (this._cacheCanvas.height - h) * 0.2) + this._cacheCanvas.width*.5
						y = Math.sin(radians) * (h + (this._cacheCanvas.height - h) * 0.2) + this._cacheCanvas.height*.5;
					}
					this._cacheContext.save();
					this._cacheContext.translate(x, y);
					this._cacheContext.rotate(radians);
					this._cacheContext.translate(-x, -y);
					this._cacheContext.beginPath();
					if(this._fading) this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + "," + bitMod + ")";
					else this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + ",1)";
					this._cacheContext.fillRect(x,y-h*.5,w,h);
					this._cacheContext.closePath();
					this._cacheContext.fill();
					this._cacheContext.restore();
					
					++i;
				}
			break;
		}
		
		// Render the changes on the canvas
		this._tick(true);
	};
	
	/**
	* Clean the canvas
	*/
	p._clean = function() {
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
	};
	
	/**
	* Redraw the loader
	*/
	p._redraw = function() {
		if(this._ready) {
			this._clean();
			this._draw();
		}
	};
	
	/**
	* Reset the timer
	*/
	p._reset = function() {
		if(this._running) {
			this.stop();
			this.start();
		}
	};
	
	/**
	* Render the loader
	*/
	p._tick = function(initialize) {
		var rotUnit = this._density > 360 ? this._density / 360 : 360 / this._density;
		rotUnit *= this._speed;
		if(!initialize) this._activeId += rotUnit;
		if(this._activeId > 360) this._activeId -= 360;
		
		this._context.clearRect(0, 0, this._diameter, this._diameter);
		this._context.save();
		this._context.translate(this._diameter*0.5, this._diameter*0.5);
		this._context.rotate(Math.PI/180*this._activeId);
		this._context.translate(-this._diameter*0.5, -this._diameter*0.5);
		this._context.drawImage(this._cacheCanvas, 0, 0, this._diameter, this._diameter);
		this._context.restore();
	};
	
	/**
	* Start the rendering
	*/
	p.start = function() {
		if(!this._running) {
			this._running = true;
			var t = this;
			this._timer = self.setInterval(function(){t._tick();}, Math.round(1000/this._fps));
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
	
	/**
	* Remove the CanvasLoader instance
	*/
	p.remove = function() {
		if(this._running) this.stop();
		this._container.removeChild(this._canvas);
	};
	
	window.CanvasLoader = CanvasLoader;
	document.CanvasLoader = CanvasLoader;
	
})(window, document);