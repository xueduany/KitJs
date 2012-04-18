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
	parentEl8tag : function(el, tagName, topEl) {
		var topEl = topEl || document.body;
		return $kit.parentEl(el, function(p) {
			if(p.tagName && p.tagName.toLowerCase() == tagName.toLowerCase()) {
				return true;
			}
			if(p == topEl) {
				return false;
			}
		}, topEl);
	},
	parentEl8cls : function(el, cls, topEl) {
		var topEl = topEl || document.body;
		return $kit.parentEl(el, function(p) {
			if($kit.hsCls(p, cls)) {
				return true;
			}
			if(p == topEl) {
				return false;
			}
		}, topEl);
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
	},
	/**
	 * 删除样式
	 */
	rmClsAll : function(cls, top) {
		var a = $kit.el8cls(cls, top);
		while(a) {
			$kit.rmCls(a, cls);
			a = $kit.el8cls(cls, top);
		}
	},
	/**
	 * 通过className前缀取className
	 */
	getClassNameByPrefix : function(el, prefixCls) {
		var clsAry = el.className.split(/\s+/);
		var re = null;
		if(clsAry && clsAry.length) {
			$kit.each(clsAry, function(o) {
				if(o.indexOf(prefixCls) == 0) {
					re = o;
					return false;
				}
			});
		}
		return re;
	},
	/**
	 * innerText
	 */
	text : function(el, text) {
		if(el != null && 'innerText' in el) {
			if(text) {
				el.innerText = text;
			} else {
				return el.innerText;
			}
		} else {
			if(text) {
				el.textContent = text;
			} else {
				return el.textContent;
			}
		}
	},
	/**
	 * innerHTML
	 */
	html : function(el, html) {
		if(html) {
			if(el != null && 'innerHTML' in el) {
				el.innerHTML = html;
			}
		} else {
			return el.innerHTML;
		}
	},
	/**
	 * clone a node
	 */
	clone : function(node) {
		if(document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>") {
			return node.cloneNode(true);
		} else {
			var fragment = document.createDocumentFragment(), //
			doc = fragment.createElement ? fragment : document;
			doc.createElement(node.tagName);
			var div = doc.createElement('div');
			fragment.appendChild(div);
			div.innerHTML = node.outerHTML;
			return div.firstChild;
		}
	},
	/**
	 * height+padding+border
	 */
	height : function(node, value) {
		var me = this;
		if(node != null) {
			if(value == null) {
				return $kit.offset(node).height;
			}
			if(document.compatMode == "BackCompat") {
				node.style.height = value;
			} else {
				node.style.height = value//
				- ($kit.css(node, 'border-top-width') || 0)//
				- ($kit.css(node, 'border-bottom-width') || 0)//
				- ($kit.css(node, 'padding-top-width') || 0)//
				- ($kit.css(node, 'padding-bottom-width') || 0)//
				;
			}
		}
		return $kit.viewport().clientHeight;
	},
	width : function(node, value) {
		var me = this;
		if(node != null) {
			if(value == null) {
				return $kit.offset(node).width;
			}
			if(document.compatMode == "BackCompat") {
				node.style.width = value;
			} else {
				node.style.width = value//
				- ($kit.css(node, 'border-left-width') || 0)//
				- ($kit.css(node, 'border-right-width') || 0)//
				- ($kit.css(node, 'padding-left-width') || 0)//
				- ($kit.css(node, 'padding-right-width') || 0)//
				;
			}
		}
		return $kit.viewport().clientHeight;
	},
	/**
	 * height + padding
	 */
	innerHeight : function(node) {
		var me = this;
		if(document.compatMode == "BackCompat") {
			return $kit.css(node, 'height') - ($kit.css(node, 'border-top-width') || 0) - ($kit.css(node, 'border-bottom-width') || 0);
		}
		return $kit.css(node, 'height') + ($kit.css(node, 'padding-top-width') || 0) - ($kit.css(node, 'padding-bottom-width') || 0);
	},
	/**
	 * width + padding
	 */
	innerWidth : function(node) {
		var me = this;
		if(document.compatMode == "BackCompat") {
			return $kit.css(node, 'width') - ($kit.css(node, 'border-left-width') || 0) - ($kit.css(node, 'border-right-width') || 0);
		}
		return $kit.css(node, 'width') + ($kit.css(node, 'padding-left-width') || 0) - ($kit.css(node, 'padding-right-width') || 0);
	},
	outerHeight : function(node) {
		var me = this;
		if(document.compatMode == "BackCompat") {
			return $kit.css(node, 'height');
		}
		return $kit.css(node, 'height') + ($kit.css(node, 'padding-top-width') || 0) - ($kit.css(node, 'padding-bottom-width') || 0)//
		+ ($kit.css(node, 'border-top-width') || 0) + ($kit.css(node, 'border-bottom-width') || 0);
	},
	outerWidth : function(node) {
		var me = this;
		if(document.compatMode == "BackCompat") {
			return $kit.css(node, 'width');
		}
		return $kit.css(node, 'width') + ($kit.css(node, 'padding-left-width') || 0) - ($kit.css(node, 'padding-right-width') || 0)//
		+ ($kit.css(node, 'border-left-width') || 0) + ($kit.css(node, 'border-right-width') || 0);
	},
	/**
	 * 包围一个html
	 */
	wrap : function(node, html) {
		if($kit.isNode(html)) {
			//
		} else if($kit.isStr(html)) {
			html = $kit.newHTML(html).childNodes[0];
		} else {
			return;
		}
		$kit.insEl({
			where : node,
			what : html,
			pos : 'before'
		});
		html.appendChild(node);
	}
};
$kit.d = $kit.dom = new $Kit.Dom();
