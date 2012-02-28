/**
 * Dom扩展
 */
$Kit.Dom = function() {
	//
}
$Kit.Dom.prototype = {
	/**
	 * 查找父元素
	 */
	parentEl8tag : function(el, tagName) {
		return $kit.parentEl(el, function(p) {
			if(p.tagName.toLowerCase() == tagName.toLowerCase()) {
				return true;
			}
		});
	},
	parentEl8cls : function(el, cls) {
		return $kit.parentEl(el, function(p) {
			if($kit.hsCls(p, cls)) {
				return true;
			}
		});
	},
	/**
	 * 注入js
	 */
	injectJs : function() {
		if(arguments.length == 1) {
			var config = arguments[0];
			var where = config.where || window.document.body;
			var script = document.createElement('script');
			script.type = 'text/javascript';
			if(!$kit.isEmpty(config.src)) {
				script.src = config.src;
				if(!$kit.isEmpty(config.then)) {
					var scope = config.scope || window;
					script.onload = function() {
						config.then.call(scope, script);
					}
				}
			} else if(!$kit.isEmpty(config.content)) {
				script.innerHTML = config.content;
				if(!$kit.isEmpty(config.then)) {
					setTimeout(function() {
						config.then.call(scope, script);
					}, 0);
				}
			}
			where.appendChild(script);
		}
	},
	/**
	 * 注入css
	 */
	injectCss : function() {
		if(arguments.length == 1) {
			var config = arguments[0];
		}
	}
};
$kit.d = $kit.dom = new $Kit.Dom();
