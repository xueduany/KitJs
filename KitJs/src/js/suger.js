/**
 * 语法糖
 * 纯链式结构，jquery的思想
 */
$kit.Suger = function() {
	var selector = arguments[0];
	if($kit.isStr(selector)) {
		this.nodes = $kit.$el(selector);
	} else if($kit.isNode(selector)) {
		this.nodes = [selector];
	} else if($kit.isNodeList(selector)) {
		this.nodes = selector;
	}
	if(this.nodes != null) {
		//string
	}
}
$kit.Suger.prototype = {
	_new : function(selector) {
		var _suger = new $kit.Suger(selector);
		_suger.previousSugerObject = this;
		return _suger;
	},
	/**
	 * 给已匹配的nodelist加点料
	 */
	add : function() {
		var me = this;
		var object = arguments[0];
		var context = arguments[1] || document;
		if($kit.isStr(object)) {
			var addNode = $kit.$el(object, context);
			if(addNode == null || addNode.length == 0) {
				addNode = $kit.newHTML(object).childNodes;
			}
			if(addNode != null && addNode.length) {
				$kit.array.ad(me.nodes, addNode, {
					ifExisted : true
				});
			}
		}
		return me;
	},
	/**
	 * 你懂得
	 */
	addClass : function(className) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.adCls(o, className);
		})
		return me;
	},
	/**
	 * 当前对象的nextSibling插入一个神马东东
	 */
	after : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(o)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'after',
						what : object
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'after',
						what : object.call(o, object)
					});
				});
			}
		}
		return me;
	},
	/**
	 * 你懂得
	 */
	ajax : function() {

	},
	/**
	 * 将上一次调用的nodelist加到当前的nodelist里面
	 */
	andSelf : function() {
		var me = this;
		if(me.previousSugerObject) {
			var re = me.previousSugerObject;
			$kit.array.ad(re.nodes, me.nodes);
			return re;
		}
		return me;
	},
	/**
	 * 不着急
	 */
	animate : function() {

	},
	/**
	 * 在屁股插入html
	 */
	append : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(o)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'after',
						what : object
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'after',
						what : object.call(o, object)
					});
				});
			}
		}
		return me;
	},
	/**
	 * 添加到谁的屁股
	 */
	appendTo : function(target) {
		var me = this;
		if($kit.isNode(target)) {
			$kit.each(me.nodes, function(o) {
				target.appendChild(o);
			});
		} else {
			if(target.nodes) {
				$kit.each(me.nodes, function(o) {
					target.nodes[0].appendChild(o);
				});
			}
		}
		return me;
	},
	/**
	 * 属性设置
	 */
	attr : function(attrName, attrValue) {
		var me = this;
		if(attrValue == null) {
			return $kit.attr(me.nodes[0], attrName);
		} else {
			$kit.each(me.nodes, function(o) {
				$kit.attr(o, attrName, attrValue);
			});
		}
		return me;
	},
	/**
	 * 在previousSibling插入元素
	 */
	before : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(o)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'before',
						what : object
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'before',
						what : object.call(o, object)
					});
				});
			}
		}
		return me;
	},
	/**
	 * 绑定事件
	 */
	bind : function() {
		return this.on.apply(this, arguments);
	},
	/**
	 * 失去焦点
	 */
	blur : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'blur'
		});
		return me
	},
	/**
	 * click事件
	 */
	click : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'click'
		});
		return me
	},
	/**
	 * clone node
	 */
	clone : function() {
		var cloneNodes = [], me = this;
		$kit.each(me.nodes, function(o) {
			cloneNodes.push($kit.dom.clone(o));
		});
		return me._new(cloneNodes);
	},
	/**
	 * 从自身开始查找，返回符合条件的元素
	 */
	closest : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var find = $kit.selector.matches(selector, [element]);
		if(find.length && find[0] == element) {
			return me._new(element);
		}
		return me.parent(selector, context);
	},
	
	/**
	 * 查找父节点
	 */
	parent : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var find = $kit.selector.matches(selector, [element]);
		var parentNode = me.nodes[0];
		while(parentNode != context) {
			parentNode = parentNode.parentNode;
			find = $kit.selector.matches(selector, [parentNode]);
			if(find.length && find[0] == parentNode) {
				return me._new(parentNode);
			}
		}
		return null;
	},
	/**
	 * 绑定事件
	 */
	on : function() {
		var me = this;
		if(arguments.length == 2) {
			var ev = arguments[0];
			var fn = arguments[1];
			$kit.each(me.nodes, function(o) {
				$kit.ev({
					el : o,
					ev : ev,
					fn : fn,
					scope : o
				});
			});
		}
		return me;
	},
	nextAll : function() {
		var re = [], me = this;
		$kit.each(me.nodes, function(o) {
			$kit.array.ad(re, $kit.$el('~*', o));
		});
		var _suger = new $kit.Suger(re);
		_suger.previousSugerObject = me;
		return _suger;
	}
}
if($kit.$) {
	$kit._$ = $kit.$;
}
$kit.$ = function() {
	if($kit.isFn(arguments[0])) {
		$kit._$(arguments[0]);
	} else {
		return new $kit.Suger(arguments[0], arguments[1]);
	}
}