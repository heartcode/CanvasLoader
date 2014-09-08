/**
* Copyright (c) 2012 Zensations
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
*/

/**
 * Simple jquery module to apply heartcode canvas loader to arbitrary elements
 * and style them with css font-styling properties.
 */
(function($) {
  $.fn.canvasLoader = function(config) {
    $.each(this, function(index, item){
      config = $.extend({
        'shape': 'spiral',
        'color': '#000000',
        'diameter': 16,
        'density': 40,
        'range': 1.3,
        'fps': 24,
        'speed': 2
      }, config);
      // shape is defined by font-family
      var shapes = ['oval', 'rect', 'roundRect', 'spiral', 'square'];
      var shape = $(item).css('font-family');
      if ($.inArray(shape, shapes)) {
        config.shape = shape;
      }

      // color maps to ... color!
      config.color = rgb2hex($(item).css('color'));

      // get min of height and width and apply it to diameter
      var size = parseInt($(item).css('font-size'));
      if (size > 0) {
        config.diameter = size;
      }

      // letter-spacing is turned into density
      var density = parseInt($(item).css('letter-spacing'));
      if (density > 0) {
        config.density = density;
      }

      // text-indent maps to range
      var range = parseFloat($(item).css('text-indent'));
      if (range > 0) {
        config.range = range;
      }

      // word spacing equals the frames per second
      var fps = parseInt($(item).css('word-spacing'))
      if (fps > 0) {
        config.fps = fps;
      }

      // speed is determined by font weight
      var speed = parseInt($(item).css('font-weight'));
      if (speed > 0) {
        config.speed = speed;
      }

      if (!item.canvasLoader) {
        item.canvasLoader = new CanvasLoader(item);
      }

      item.canvasLoader.setColor(config.color);
      item.canvasLoader.setShape(config.shape);
      item.canvasLoader.setDiameter(config.diameter);
      item.canvasLoader.setDensity(config.density);
      item.canvasLoader.setRange(config.range);
      item.canvasLoader.setSpeed(config.speed);
      item.canvasLoader.setFPS(config.fps);
      item.canvasLoader.show();
    });
  };

  function rgb2hex(rgb){
    if (rgb.substr(0, 1) === '#') {
        return rgb;
    }
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" +
      ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
      ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
  }
}(jQuery));

