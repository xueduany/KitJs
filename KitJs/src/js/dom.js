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
			if(config.id && $kit.el8id(config.id)) {
				return;
			}
			var where = config.where || window.document.body;
			var script = document.createElement('script');
			$kit.attr(script, 'type', 'text/javascript');
			if(config.id) {
				$kit.attr(script, 'id', config.id);
			}
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
	// **Dynamic CSS injection**
	// Takes a string of css, inserts it into a `<style>`, then injects it in at the very top of the `<head>`. This ensures any user-defined styles will take precedence.
	injectCss : function(audio, string) {
		if(arguments.length == 1) {
			var config = arguments[0];
			if(config.id && $kit.el8id(config.id)) {
				return;
			}
			var where = config.where || document.getElementsByTagName('head')[0];
			var css;
			if(!$kit.isEmpty(config.url)) {
				css = document.createElement('link');
				config.id && $kit.attr(css, 'id', config.id);
				$kit.attr(css, {
					rel : 'stylesheet',
					url : config.url
				});
			} else if(!$kit.isEmpty(config.text)) {
				css = document.createElement('style');
				config.id && $kit.attr(css, 'id', config.id);
				$kit.attr(css, 'type', 'text/css');
				css.innerHTML = config.text;
			}
			if(css) {
				$kit.insEl({
					pos : 'last',
					what : css,
					where : where
				});
			}
		}
	}
};
$kit.d = $kit.dom = new $Kit.Dom();
