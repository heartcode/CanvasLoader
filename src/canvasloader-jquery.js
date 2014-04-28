(function ($) {
  $.fn.hcl = function(settings) {
    return this.each(function() {
        var instance = $.data(this, "hcl");
        // destroy previous instance and prepare for new load
        if (instance && typeof instance.destruct === 'function') {
            instance.destruct();
        }
        // load the new gallery
        $.data(this, "hcl",  new CanvasLoader(this, settings));
    });
  };
})(jQuery);