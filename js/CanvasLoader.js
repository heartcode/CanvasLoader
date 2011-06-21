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

(function(window) {

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
	var p = CanvasLoader.prototype;
	
	/** 
	* Initialization method.
	* @method initialize
	* @protected
	*/
	p.initialize = function(options) {
		
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
				console.log("No parent element found!");
				this._container = document.body;
			}
		}
		catch(error) {
			console.log("No parent element found!");
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
		this.color = this.color;
		
		// Store the user settings
		for(var r in options) {
			if(this[r] != undefined) this[r] = options[r];
		}
		
		// Set the instance ready
		p._ready = true;
		
		// Draw the shapes on the canvas
		this.draw();
		
		// Set the aligning of the loader
		this.align();
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
	* @property _running
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
	* @property color
	* @type String
	**/
	p._diameter = 50;
	// [GS]etter for the diameter of the loader
	p.__defineGetter__("diameter", function(){ return this._diameter; });
	p.__defineSetter__("diameter", function(diameter){ if(!isNaN(diameter))this._diameter = Math.round(Math.abs(diameter)); if(this.redraw !== undefined) this.redraw(); this.align(); });

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
	// [GS]etter for the color of the loader shapes
	p.__defineGetter__("color", function(){ return this._color; });
	p.__defineSetter__("color", function(color){ this._color = color; this._colorRGB = this.getRGB(color); if(this.redraw !== undefined) this.redraw(); });
	
	/**
	* The type of the loader shapes.
	* @property _shape
	* @type String
	**/
	p._shape = "circle";
	// [GS]etter for the Shapes of the loader
	p.__defineGetter__("shape", function(){ return this._shape; });
	p.__defineSetter__("shape", function(shape){ this._shape = shape; if(this.redraw !== undefined) this.redraw(); });
	
	/**
	* The number of shapes drawn on the loader canvas.
	* @property _density
	* @type Number
	**/
	p._density = 120;
	// [GS]etter for the density of the loader shapes
	p.__defineGetter__("density", function(){ return this._density; });
	p.__defineSetter__("density", function(density){ this._density = density; if(this.redraw !== undefined) this.redraw(); });
	
	/**
	* The range of the animated loader shapes.
	* @property _range
	* @type Number (between 0 and 1)
	**/
	p._range = 0.95;
	// [GS]etter for the range of the animated loader shapes
	p.__defineGetter__("range", function(){ return this._range; });
	p.__defineSetter__("range", function(range){ this._range = range; if(this.redraw !== undefined) this.redraw(); });
	
	/**
	* The scaling of the loader shapes.
	* @property _scale
	* @type Boolean
	**/
	p._scale = true;
	// [GS]etter for the scaling of the loader shapes
	p.__defineGetter__("scale", function(){ return this._scale; });
	p.__defineSetter__("scale", function(scale){ this._scale = scale; if(this.redraw !== undefined) this.redraw(); });
	
	/**
	* The fading of the loader shapes.
	* @property _fade
	* @type Boolean
	**/
	p._fade = true;
	// [GS]etter for the fading of the loader shapes
	p.__defineGetter__("fade", function(){ return this._fade; });
	p.__defineSetter__("fade", function(fade){ this._fade = fade; if(this.redraw !== undefined) this.redraw(); });
	
	/**
	* The speed of the loader animation.
	* @property _speed
	* @type Number
	**/
	p._speed = 1;
	// [GS]etter for the speed of the circular loader animation
	p.__defineGetter__("speed", function(){ return this._speed; });
	p.__defineSetter__("speed", function(speed){ this._speed = speed; });
	
	/**
	* The aligning of the canvas element.
	* @property _center
	* @type Boolean
	**/
	p._center = false;
	// [GS]etter for the aligning of the canvas parent (center-center or top-left)
	p.__defineGetter__("center", function(){ return this._center; });
	p.__defineSetter__("center", function(center){ this._center = center; this.align(); });
	
	/**
	* The FPS of the loader animation rendering.
	* @property _fps
	* @type Number
	**/
	p._fps = 12;
	// [GS]etter for the FPS
	p.__defineGetter__("fps", function(){ return this._fps; });
	p.__defineSetter__("fps", function(fps){ this._fps = fps; this.reset(); });	
	
// End of Property declarations
/////////////////////////////////////////////////////////////////////////////////////////////

	/**
	* Set the aligning of the canvas
	*/
	p.align = function() {
		if(this._ready) {
			if(this.center) {
				with(this._canvas) {
					style["left"] = "50%";
					style["top"] = "50%";
					style["margin-left"] = -this.diameter*0.5 + "px";
					style["margin-top"] = -this.diameter*0.5 + "px";
				}
			}
			else {
				with(this._canvas) {
					style.position = "relative";
					style.left = "0px";
					style.top = "0px";
				}
			}
		}
	};
	
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
		this._cacheContext.clearRect(0, 0, this.diameter, this.diameter);
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
					if(this.fade) this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + "," + bitMod + ")";
					else this._cacheContext.fillStyle = "rgba(" + this._colorRGB.r + "," + this._colorRGB.g + "," + this._colorRGB.b + ",1)";
					if(this.scale) this._cacheContext.arc(this.diameter*0.5 + x,this.diameter*0.5 + y,size*bitMod,0,Math.PI*2,false);
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
		this._context.clearRect(0, 0, this.diameter, this.diameter);
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
		
		this._context.save();
		this._context.clearRect(0, 0, this.diameter, this.diameter);
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
			clearInterval(this._timer);
			this._timer = null;
			delete this._timer;
		}
	};
	
	window.CanvasLoader = CanvasLoader;
	
})(window, document);