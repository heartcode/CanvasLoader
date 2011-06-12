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
 * */

(function(window, document, undefined){

	// Define the CanvasLoader object
	var CanvasLoader = {
			
			// Array containing all indicators created by CanvasLoader on the current page
			indicatorList: [],
			
			//Default settings
			settings: {
					parentId:	document,
					canvasId:	"CanvasLoaderCanvas",
					fps:		1,
					shape:		"circle",
					density:	12,
					range:		1,
					diameter:	60,
					color:		"#ff0000",
					speed:		0.1,				//0-1
					scale:		false,
					fade:		false,
					caching:	true
				},
			
			// Return if the Stage instance is ready
			canvasReady: function (instance) {
				return instance.canvasCtx != undefined;
			},
			
			// Return a HEX color in RGB
			getRGB: function(color) {				
				var hexObject = {};
				
				color = color.charAt(0) == "#" ? color.substring(1, 7) : color;
						
				hexObject.r = parseInt(color.substring(0,2),16);
				hexObject.g = parseInt(color.substring(2,4),16);
				hexObject.b = parseInt(color.substring(4,6),16);
					
				return hexObject;
			},
			
			// Redraw the passed instance's Stage object
			redraw: function (instance) {
				if(this.canvasReady(instance)) {
					CanvasLoader.removeShapes(instance);
					CanvasLoader.addShapes(instance);
				}
			},
				
			// Draw the appropriate shapes into the passed instance's Stage object
			addShapes: function (instance) {
				
				if(this.canvasReady(instance))
				{										
					var i = 0;
					var l = instance.density;
					var size = instance.diameter * .07;
					var radians;
					var x, y, a;
					var animBits = Math.round(instance.density * instance.range);
					var minBitMod = 1/animBits;
					var bitMod;	
					
					if(CanvasLoader.canvasReady(instance))
					{
						instance.ccanvasCtx.clearRect(0, 0, instance.ccanvas.width, instance.ccanvas.height);
						instance.ccanvas.width = instance.ccanvas.height = instance.diameter;
						
					}
					
					switch(instance.shape)
					{
						case "circle":
							while(i<l)
							{						
								if(i <= animBits) bitMod = 1-i*minBitMod;
								
								radians = (instance.density - i) * ((Math.PI * 2) / instance.density);
								x = instance.canvas.width*.5 + Math.cos(radians) * (instance.diameter*.45 - size) - instance.canvas.width*.5;
								y = instance.canvas.height*.5 + Math.sin(radians) * (instance.diameter*.45 - size) - instance.canvas.height*.5;
								
								instance.ccanvasCtx.beginPath();
								if(instance.fade) instance.ccanvasCtx.fillStyle = "rgba(" + instance.colorRGB.r + "," + instance.colorRGB.g + "," + instance.colorRGB.b + "," + bitMod + ")";
								else instance.ccanvasCtx.fillStyle = "rgba(" + instance.colorRGB.r + "," + instance.colorRGB.g + "," + instance.colorRGB.b + ",1)";
								if(instance.scale) instance.ccanvasCtx.arc(instance.ccanvas.width*0.5 + x,instance.ccanvas.height*0.5 + y,size*bitMod,0,Math.PI*2,false);
								else instance.ccanvasCtx.arc(instance.ccanvas.width*0.5 + x,instance.ccanvas.height*0.5 + y,size,0,Math.PI*2,false);
								instance.ccanvasCtx.closePath();
								instance.ccanvasCtx.fill();
								
								++i;
							}
						break;
					}
					
					instance.bitmapData = instance.ccanvasCtx.getImageData(0, 0, instance.ccanvas.width, instance.ccanvas.height);
					//console.log("FileSize: " + instance.bitmapData.data.length / 1024);
					
					// Init refresh
					instance.tick(true);
				}
			},
			
			// Remove all shapes from the passed instance's Stage object 
			removeShapes: function(instance) {
				instance.canvasCtx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
			},
			
			// Define the core class
			core: function (options) {
				
				// Add the canvas to the indicator list on the global object
				this.id = CanvasLoader.indicatorList.push(this) - 1;
				this.canvas = {};
				this.canvasCtx = undefined;
				
				// Cache canvas
				this.ccanvas = {};
				this.ccanvasCtx = undefined;
				this.bitmapData = {};
				
				// Instance activity
				this.running = false;
				
				// Create an object for the RGB color values
				this.colorRGB = {};
				
				// The active shape id in the refresh sequence
				this.activeId = 0;
				
				// Store default settings in the settings object
				this.settings = CanvasLoader.settings;
				
				// Set up default settings of the Indicator instance
				var r;
				for(r in CanvasLoader.settings)
				{
					if(typeof(this[r] != undefined)) this[r] = this.settings[r];
				}
				
				// Set up user defined settings
				for(r in options)
				{
					if(typeof(this.settings[r] != undefined)) this.settings[r] = options[r];
					if(typeof(this[r] != undefined)) this[r] = options[r];
				}
				
				// Create the canvas elements in the parent element
				try
				{
					var parentElement = this.settings.parentId != document ? document.getElementById(this.settings.parentId) : this.settings.parentId;
					this.canvas = document.createElement("canvas");
					if(parentElement == document) document.body.appendChild(this.canvas);
					else parentElement.appendChild(this.canvas);
					this.canvasCtx = this.canvas.getContext("2d");
					this.canvas.id = this.settings.canvasId;
					this.canvas.width = this.canvas.height = this.settings.diameter;
					
					this.ccanvas = document.createElement("canvas");
					if(parentElement == document) document.body.appendChild(this.ccanvas);
					else parentElement.appendChild(this.ccanvas);
					this.ccanvasCtx = this.ccanvas.getContext("2d");
					this.ccanvas.id = "c" + this.settings.canvasId;
					this.ccanvas.width = this.ccanvas.height = this.settings.diameter;
					this.ccanvas.style.display = "none";
					CanvasLoader.addShapes(this);
				}
				catch (error)
				{
					console.log("parent element doesn't exist! [" + this.settings.parentId + "]" + error);
				}
			},
			
			// Function for creating a new instance of CanvasLoader
			create: function (settings) {
				// Create the new instance and return it
				return new CanvasLoader.core(settings);
			},
			
			// Remove the passed CanvasLoader instance
			remove: function(instance) {
				instance.stop();
				CanvasLoader.removeShapes(instance);
				var r;
				for(r in instance)
				{
					delete instance[r];
				}
				instance.settings = null;
				delete instance.settings;
				instance = null;
				delete instance;
				
				return true;
			}
		};	
	
	// Methods the core instances will have access to
	CanvasLoader.core.prototype = {
		
		// Method for setting and getting the diameter of the Indicator instance
		set diameter(value) {
			if(!isNaN(value)){
				this.settings.diameter = value;
				if(CanvasLoader.canvasReady(this)) this.canvas.width = this.canvas.height = this.diameter;
				CanvasLoader.redraw(this);
			}
		},
		get diameter() {
			return this.settings.diameter;
		},
		// Method for setting and getting the fading of the Indicator instance
		set fade(value) {
			this.settings.fade = value;
			CanvasLoader.redraw(this);
		},
		get fade() {
			return this.settings.fade;
		},
		
		// Method for setting and getting the scaling of the Indicator instance bits
		set scale(value) {
			this.settings.scale = value;
			CanvasLoader.redraw(this);
		},
		get scale() {
			return this.settings.scale;
		},
		
		// Method for setting and getting the color of the Indicator instance
		set color(value) {
			this.settings.color = value;
			this.colorRGB = CanvasLoader.getRGB(value);
			CanvasLoader.redraw(this);
		},
		get color() {
			return this.settings.color;
		},
		
		// Method for setting and getting the shape of the Indicator instance
		set shape(value) {
			this.settings.shape = value;
			CanvasLoader.redraw(this);
		},
		get shape() {
			return this.settings.shape;
		},
		
		// Method for setting and getting the density of the Indicator instance
		set density(value) {
			this.settings.density = value;
			CanvasLoader.redraw(this);
		},
		get density() {
			return this.settings.density;
		},
		
		// Method for setting and getting the range of the Indicator instance
		set range(value) {
			this.settings.range = value;
			CanvasLoader.redraw(this);
		},
		get range() {
			return this.settings.range;
		},
		
		// Method for setting and getting the refreshing speed of the Indicator instance
		set speed(value) {
			this.activeId = 0;
			this.settings.speed = parseInt(value);
		},
		get speed() {
			return this.settings.speed;
		},
		
		// Method for setting and getting the fps of the Indicator instance
		set fps(value) {
			this.settings.fps = value;
			if(this.running) {
				this.stop();
				this.start();
			}
		},
		get fps() {
			return this.settings.fps;
		},
		
		
		// Refresh the indicator instance
		tick: function(initialize) {
			var rotUnit = this.density > 360 ? this.density / 360 : 360 / this.density;
			rotUnit *= this.speed;
			if(!initialize) this.activeId += rotUnit;
			if(this.activeId > 360) this.activeId -= 360;
			
			this.canvasCtx.save();
			this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.canvasCtx.translate(this.canvas.width*0.5, this.canvas.height*0.5);
			this.canvasCtx.rotate(Math.PI/180*this.activeId);
			this.canvasCtx.translate(-this.canvas.width*0.5, -this.canvas.height*0.5);
			this.canvasCtx.drawImage(this.ccanvas, 0, 0, this.ccanvas.width, this.ccanvas.height);
			this.canvasCtx.restore();
		},
		
		// Add the timer to refresh the indicator instance
		start: function() {
			this.running = true;
			var t = this;
			this.timer = self.setInterval(function(){t.tick();}, Math.round(1000/this.fps));
		},
		
		// Remove the refreshing timer
		stop: function() {
			this.running = false;
			clearInterval(this.timer);
			this.timer = null;
			delete this.timer;
		}
	};
		
	// Attach the CanvasLoader object to the window object for access outside of this file
	window.CanvasLoader = CanvasLoader;
	

})(window, document);