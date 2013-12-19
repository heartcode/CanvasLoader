(function ($) {
  $.fn.hcl = function(settings) {
    var cl = new CanvasLoader(this[0], settings).show();

    this.show = function() {
      cl.show();
    };

    this.hide = function() {
      cl.hide();
    };

    this.destruct = function() {
      cl.destruct();
    };

    return this;
  };
})(jQuery);