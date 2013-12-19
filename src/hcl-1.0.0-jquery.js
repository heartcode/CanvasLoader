(function ($) {
  $.fn.hcl = function(settings) {
    var cl = new CanvasLoader(this[0], settings).show();

    this.show = function() {
      return cl.show();
    };

    this.hide = function() {
      return cl.hide();
    };

    this.get = function(key) {
      return cl.get(key);
    };

    this.destruct = function() {
      cl.destruct();
      cl = null;
    };

    return this;
  };
})(jQuery);