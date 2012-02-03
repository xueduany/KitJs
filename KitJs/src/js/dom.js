/**
 * Dom扩展
 */
$Kit.Dom = function() {
	//
}
$Kit.Dom.prototype = {
	parentEl8tag : function(el, tagName) {
		return $kit.parentEl(p, function(p) {
			if (p.tagName == tagName) {
				return true;
			}
		});
	},
	parentEl8cls : function(el, cls) {
		return $kit.parentEl(el, function(p) {
			if ($kit.hsCls(p, cls)) {
				return true;
			}
		});
	}
};
$kit.d = $kit.dom = new $Kit.Dom();