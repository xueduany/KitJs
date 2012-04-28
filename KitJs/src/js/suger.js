/**
 * kitjs语法糖
 * 纯链式结构，jQuery API 100%实现
 * @class $Kit.Suger
 * @requires kit.js
 * @requires array.js
 * @requires anim.js
 * @requires dom.js
 * @requires event.js
 * @requires json.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/suger.js">Source code</a>
 * @property {[Element]} nodes Element Array List
 * @property {Number} length Element Array List Length
 */
$Kit.Suger = function() {
	var selector = arguments[0];
	var context = arguments[1];
	if(this.isSuger(context)) {
		context = context.nodes[0];
	}
	if(context != null) {
		this.nodes = $kit.$el(selector, context);
	} else {
		if($kit.isStr(selector)) {
			var canHTML = false;
			if(selector.indexOf('<') == 0) {
				try {
					var html = $kit.newHTML(selector).childNodes;
					this.nodes = $kit.array.clone(html);
					canHTML = true;
				} catch(e) {
				}
			}
			if(!canHTML) {
				this.nodes = $kit.$el(selector);
			}
		} else if($kit.isNode(selector)) {
			this.nodes = [selector];
		} else if($kit.isNodeList(selector)) {
			this.nodes = $kit.array.clone(selector);
		} else if(this.isSuger(selector)) {
			this.nodes = $kit.array.clone(selector.nodes);
		}
	}
	this.length = this.nodes.length;
	this.name = 'kitSuger';
}
$kit.merge($Kit.Suger.prototype,
/**
 * @lends $Kit.Suger.prototype
 */
{
	_new : function(selector) {
		var _suger = new $Kit.Suger(selector);
		_suger.previousSugerObject = this;
		return _suger;
	},
	/**
	 * 给已匹配的nodelist加点料
	 * Add elements to the set of matched elements.
	 * @param {Selector|Element|[Element,Element,Element ...]|HTML|$Kit.Suger Instance Object} selector
	 * @param {Context} [context]
	 * @return {Object} current $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/add/">详细看jQuery的解释，和他一样</a>
	 */
	add : function() {
		var me = this;
		var object = arguments[0];
		var context = arguments[1] || document;
		var re = $kit.array.clone(me.nodes);
		if($kit.isStr(object)) {
			var addNode = $kit.$el(object, context);
			if(addNode == null || addNode.length == 0) {
				addNode = $kit.newHTML(object).childNodes;
			}
			if(addNode != null && addNode.length) {
				$kit.array.ad(re, addNode, {
					ifExisted : true
				});
			}
		} else if($kit.isNode(object)) {
			re.push(object);
		} else if($kit.isNodeList(object)) {
			$kit.array.ad(re, object, {
				ifExisted : true
			});
		} else if(me.isSuger(object)) {
			$kit.array.ad(re, object.nodes, {
				ifExisted : true
			});
		}
		return me._new(re);
	},
	/**
	 * 你懂得，添加样式
	 * Adds the specified class(es) to each of the set of matched elements.
	 * @param {String|Function} className
	 * @return {Object} current $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/addClass/">详细看jQuery的解释，和他一样</a>
	 */
	addClass : function() {
		var me = this;
		var className = arguments[0];
		if($kit.isStr(className)) {
			$kit.each(me.nodes, function(o) {
				$kit.adCls(o, className);
			});
		} else if($kit.isFn(className)) {
			$kit.each(me.nodes, function(o, index) {
				$kit.adCls(o, className.apply(o, [index]));
			});
		}
		return me;
	},
	/**
	 * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
	 * @param {String}
	 * @return {Object} current $Kit.Suger Instance
	 */
	removeClass : function(className) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.rmCls(o, className);
		});
		return me;
	},
	/**
	 * 切换className
	 * Add or remove one or more classes from each element in the set of matched elements, depending on either the class's presence or the value of the switch argument.
	 * @param {String|Function} className
	 * @param {Boolean} switch add or del?
	 * @return {Object} current $Kit.Suger Instance
	 */
	toggleClass : function(className, flag) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			if($kit.isFn(className)) {
				className = className.call(o, index);
			}
			if(flag == null) {
				$kit.toggleCls(o, className);
			} else {
				if(flag == true) {
					$kit.adCls(o, className);
				} else if(flag == false) {
					$kit.rmCls(o, className);
				}
			}
		});
		return me;
	},
	/**
	 * 是否有某个样式
	 * Determine whether any of the matched elements are assigned the given class.
	 * @param {String}
	 * @return {Boolean}
	 */
	hasClass : function(className) {
		var me = this;
		return $kit.hsCls(me.nodes[0], className);
	},
	/**
	 * 将上一次调用的nodelist加到当前的nodelist里面
	 * Add the previous set of elements on the stack to the current set.
	 * @return {Object} new $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/andSelf/">详细看jQuery的解释，和他一样</a>
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
	 * 在previousSibling插入元素
	 * Insert content, specified by the parameter, before each element in the set of matched elements.
	 * @see <a href="http://api.jquery.com/before/">详细看jQuery的解释，和他一样</a>
	 * @param {HTML|Element|[Element]|$Kit.Suger Instance Object|Function} content
	 * @return {Object} current $Kit.Suger Instance
	 */
	before : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'before',
						what : object
					});
				});
			} else if($kit.isNodeList(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'before',
							what : o1
						});
					});
				});
			} else if(me.isSuger(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object.nodes, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'before',
							what : o1
						});
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o, index) {
					me.after(object.call(object, index));
				});
			}
		}
		return me;
	},
	/**
	 * 当前对象的nextSibling插入一个神马东东
	 * Insert content, specified by the parameter, after each element in the set of matched elements.
	 * @see <a href="http://api.jquery.com/after/">详细看jQuery的解释，和他一样</a>
	 * @return {Object} current $Kit.Suger Instance
	 * @param {HTML|Element|[Element]|$Kit.Suger Instance Object|Function} content
	 */
	after : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'after',
						what : object
					});
				});
			} else if($kit.isNodeList(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'after',
							what : o1
						});
					});
				});
			} else if(me.isSuger(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object.nodes, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'after',
							what : o1
						});
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o, index) {
					me.after(object.call(object, index));
				});
			}
		}
		return me;
	},
	/**
	 * 在屁股插入html
	 * Insert content, specified by the parameter, to the end of each element in the set of matched elements.
	 * @see <a href="http://api.jquery.com/append/">详细看jQuery的解释，和他一样</a>
	 * @param {HTML|Element|[Element]|$Kit.Suger Instance Object|Function} content
	 * @return {Object} current $Kit.Suger Instance
	 */
	append : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'last',
						what : object
					});
				});
			} else if($kit.isNodeList(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'last',
							what : o1
						});
					});
				});
			} else if(me.isSuger(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object.nodes, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'last',
							what : o1
						});
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o, index) {
					me.after(object.call(object, index));
				});
			}
		}
		return me;
	},
	/**
	 * 添加到谁的屁股
	 * Insert every element in the set of matched elements to the end of the target.
	 * @see <a href="http://api.jquery.com/appendTo/">详细看jQuery的解释，和他一样</a>
	 * @param {Element|$Kit.Suger Instance Object}
	 * @return {Object} current $Kit.Suger Instance
	 */
	appendTo : function(target) {
		var me = this;
		if($kit.isNode(target)) {
			$kit.each(me.nodes, function(o) {
				target.appendChild(o);
			});
		} else if(me.isSuger(target)) {
			$kit.each(me.nodes, function(o) {
				target.nodes[0].appendChild(o);
			});
		}
		return me;
	},
	/**
	 * 在头部插入
	 * Insert every element in the set of matched elements before the target.
	 * @see <a href="http://api.jquery.com/insertBefore/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector|Element||$Kit.Suger Instance Object}
	 * @param {Element} [context]
	 * @return {Object} current $Kit.Suger Instance
	 */
	insertBefore : function(selector, context) {
		var me = this, target = selector;
		if($kit.isNode(target)) {
			//
		} else if($kit.isSuger(target)) {
			target = target.nodes[0];
		} else if($kit.isStr(target)) {
			target = $kit.$el(selector, context)[0];
		}
		$kit.each(me.nodes, function(o) {
			$kit.insEl({
				where : target,
				what : o,
				pos : 'before'
			});
		});
		return me;
	},
	/**
	 * 在屁股插入
	 * Insert every element in the set of matched elements after the target.
	 * @see <a href="http://api.jquery.com/insertAfter/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector|Element||$Kit.Suger Instance Object}
	 * @param {Element} [context]
	 * @return {Object} current $Kit.Suger Instance
	 */
	insertAfter : function(selector, context) {
		var me = this, target = selector;
		if($kit.isNode(target)) {
			//
		} else if($kit.isSuger(target)) {
			target = target.nodes[0];
		} else if($kit.isStr(target)) {
			target = $kit.$el(selector, context)[0];
		}
		$kit.each(me.nodes, function(o) {
			$kit.insEl({
				where : target,
				what : o,
				pos : 'after'
			});
		});
		return me;
	},
	/**
	 * 在头部插入html
	 * Insert content, specified by the parameter, to the beginning of each element in the set of matched elements.
	 * @see <a href="http://api.jquery.com/prepend/">详细看jQuery的解释，和他一样</a>
	 * @param {HTML|Element|[Element]|$Kit.Suger Instance Object|Function} content
	 * @return {Object} current $Kit.Suger Instance
	 */
	prepend : function() {
		var me = this;
		if(arguments.length) {
			for(var i = 0; i < arguments.length; i++) {
				me.after(arguments[i]);
			}
		} else {
			var object = arguments[0];
			if($kit.isNode(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'first',
						what : object
					});
				});
			} else if($kit.isNodeList(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'first',
							what : o1
						});
					});
				});
			} else if(me.isSuger(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.each(object.nodes, function(o1) {
						$kit.insEl({
							where : o,
							pos : 'first',
							what : o1
						});
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o, index) {
					me.after(object.call(object, index));
				});
			}
		}
		return me;
	},
	/**
	 * 添加到谁的头部
	 * Insert every element in the set of matched elements to the beginning of the target.
	 * @see <a href="http://api.jquery.com/prependTo/">详细看jQuery的解释，和他一样</a>
	 * @param {Element|$Kit.Suger Instance Object}
	 * @return {Object} current $Kit.Suger Instance
	 */
	prependTo : function(target) {
		var me = this;
		if($kit.isNode(target)) {
			$kit.each(me.nodes, function(o) {
				$kit.insEl({
					where : target,
					what : o,
					pos : 'first'
				});
			});
		} else if(me.isSuger(target)) {
			$kit.each(me.nodes, function(o) {
				$kit.insEl({
					where : target.nodes[0],
					what : o,
					pos : 'first'
				});
			});
		}
		return me;
	},
	/**
	 * 属性设置
	 * Get the value of an attribute for the first element in the set of matched elements.
	 * @see <a href="http://api.jquery.com/attr/">详细看jQuery的解释，和他一样</a>
	 * @param {String}
	 * @param {String}
	 * @return {Object|String} current $Kit.Suger Instance or string value
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
	 * 属性，同attr
	 */
	prop : function() {
		return this.attr.apply(this, arguments);
	},
	/**
	 * Remove an attribute from each element in the set of matched elements.
	 * @param {String}
	 * @return {Object} current $Kit.Suger Instance
	 */
	removeAttr : function(attrName) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.attr(o, attrName, null);
		});
		return me;
	},
	/**
	 * Remove an attribute from each element in the set of matched elements.
	 * @param {String}
	 * @return {Object} current $Kit.Suger Instance
	 */
	removeProp : function() {
		return this.removeAttr.apply(this, arguments);
	},
	/**
	 * clone node
	 * @return {Object} new $Kit.Suger Instance
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
	 * Get the first element that matches the selector, beginning at the current element and progressing up through the DOM tree.
	 * @return {Object} new $Kit.Suger Instance
	 */
	closest : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		if($kit.selector.matchesSelector(element, selector)) {
			return me._new(element);
		}
		return me.parent(selector, context);
	},
	/**
	 * 样式
	 * Get the value of a style property for the first element in the set of matched elements.
	 * @return {Object|String} current $Kit.Suger Instance or string value
	 */
	css : function(propertyName, value) {
		var me = this;
		$kit.css(me.nodes[0], propertyName, value);
		return me;
	},
	/**
	 * 判断dom位置是否包含
	 * @param {Element|Selector}
	 * @param {Element} [contenxt]
	 * @return {Boolean}
	 */
	contains : function(selector, context) {
		var me = this, context = context || document;
		var compareNode = $kit.$el(selector, context);
		if(compareNode != null && compareNode.length) {
			return $kit.contains(me.nodes[0], compareNode[0]);
		}
		return false;
	},
	/**
	 * 建立dom与js对象的关系
	 * Store arbitrary data associated with the matched elements.
	 * @see <a href="http://api.jquery.com/data/">详细看jQuery的解释，和他一样</a>
	 * @param {String}
	 * @param {String}
	 * @return {Object} current $Kit.Suger Instance
	 */
	data : function(key, value) {
		var me = this;
		if($kit.isStr(key) && value != null) {
			this.nodes[0][key] = value;
		} else if($kit.isObj(key)) {
			for(var p in key) {
				this.nodes[0][p] = key[p];
			}
		}
		return me;
	},
	/**
	 * Remove a previously-stored piece of data.
	 * @param {String}
	 * @return {Object} current $Kit.Suger Instance
	 */
	removeData : function(dataName) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			o.dataName = undefined;
		});
		return me;
	},
	/**
	 * 从this.nodes里面删除匹配的元素
	 * Remove the set of matched elements from the DOM.
	 * @see <a href="http://api.jquery.com/detach/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector}
	 * @return {Object} new $Kit.Suger Instance
	 */
	detach : function(selector) {
		var me = this;
		var nodesClone = $kit.array.clone(me.nodes);
		$kit.each(nodesClone, function(o) {
			if($kit.selector.matchesSelector(o, selector)) {
				o = null;
			}
		});
		$kit.array.delEmpty(nodesClone);
		return me._new(nodesClone);
	},
	/**
	 * 遍历
	 * Iterate over a jQuery object, executing a function for each matched element.
	 * @param {Function} fn function(index, Element)A function to execute for each matched element.
	 * @return {Object} current $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/each/">详细看jQuery的解释，和他一样</a>
	 */
	each : function(fn) {
		var me = this;
		$kit.each(me.nodes, function(node, index, ary) {
			fn.call(node, index, node);
		});
		return me;
	},
	/**
	 * 删除childNodes
	 * Remove all child nodes of the set of matched elements from the DOM.
	 * @return {Object} current $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/empty/">详细看jQuery的解释，和他一样</a>
	 */
	empty : function() {
		var me = this;
		$kit.each(me.nodes, function(node, index, ary) {
			node.innerHTML = '';
		});
		return me;
	},
	/**
	 * 返回前一个
	 * End the most recent filtering operation in the current chain and return the set of matched elements to its previous state.
	 * @return {Object} previous $Kit.Suger Instance
	 */
	end : function() {
		var me = this;
		if(me.previousSugerObject) {
			return me.previousSugerObject;
		}
		return null;
	},
	/**
	 * 返回数组中第几个元素
	 * Reduce the set of matched elements to the one at the specified index.
	 * @param {Number}
	 * @return {Object} new $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/eq/">详细看jQuery的解释，和他一样</a>
	 */
	eq : function(index) {
		var me = this;
		if(index >= 0) {
			return me._new(me.nodes[index]);
		}
		return me._new(me.nodes[me.nodes.length + index]);
	},
	/**
	 * 过滤，生成新的
	 * Reduce the set of matched elements to those that match the selector or pass the function's test.
	 * @param {Selector|Element|[Element]}
	 * @return {Object} new $Kit.Suger Instance
	 * @see <a href="http://api.jquery.com/filter/">详细看jQuery的解释，和他一样</a>
	 */
	filter : function(selector) {
		var me = this, re = [];
		var find;
		if($kit.isStr(selector)) {
			find = $kit.selector.matches(selector, me.nodes);
		} else if($kit.isNode(selector)) {
			find = [selector];
		} else if($kit.isNodeList(selector)) {
			find = selector;
		}
		$kit.each(me.nodes, function(o) {
			var ifExisted = false;
			$kit.each(find, function(c) {
				if(o == c) {
					ifExisted = true;
					return false;
				}
			});
			if(!ifExisted) {
				re.push(o);
			}
		});
		return me._new(re);
	},
	/**
	 * 找到，生成新的
	 * Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
	 * @param {Selector|Element|[Element]}
	 * @return {Object} new $Kit.Suger Instance
	 */
	find : function(selector) {
		var me = this;
		var find;
		if($kit.isStr(selector)) {
			find = $kit.selector.matches(selector, me.nodes);
		} else if($kit.isNode(selector)) {
			$kit.each(me.nodes, function(o) {
				if(o == selector) {
					find = o;
					return false;
				}
			});
		} else if($kit.isNodeList(selector)) {
			var re = [];
			$kit.each(me.nodes, function(o) {
				var flag = true;
				$kit.each(selector, function(p) {
					if(o == p) {
						$kit.array.ad(re, o, {
							ifExisted : true
						});
					}
				});
			});
			if(re.length) {
				find = re;
			}
		}
		return me._new(find);
	},
	/**
	 * 返回第一个
	 * Reduce the set of matched elements to the first in the set.
	 * @return {Object} new $Kit.Suger Instance
	 */
	first : function() {
		var me = this;
		return me._new(me.nodes[0]);
	},
	/**
	 * 返回包含某种node的
	 * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
	 * @param {Selector|Element}
	 * @see <a href="http://api.jquery.com/has/">详细看jQuery的解释，和他一样</a>
	 */
	has : function(selector) {
		var me = this, re = [];
		$kit.each(me.nodes, function(o, index, ary) {
			if($kit.isStr(selector)) {
				var find = $kit.$el(selector, o);
				if(find != null && find.length > 0) {
					re.push(o);
				}
			} else if($kit.isNode(selector)) {
				if($kit.contains(o, selector)) {
					re.push(o);
				}
			}
		});
		return me._new(re);
	},
	/**
	 * 隐藏
	 * Hide the matched elements.
	 */
	hide : function() {
		var me = this;
		me.nodes[0].style.display = 'none';
		return me;
	},
	/**
	 * 显示
	 */
	show : function() {
		var me = this;
		if(me.nodes[0].style.display == 'none') {
			me.nodes[0].style.display = '';
		}
		return me;
	},
	/**
	 * 返回html
	 * Get the HTML contents of the first element in the set of matched elements.
	 * @see <a href="http://api.jquery.com/html/">详细看jQuery的解释，和他一样</a>
	 * @param {String} [html]
	 */
	html : function(html) {
		return $kit.dom.html(this.nodes[0], html);
	},
	/**
	 * 返回html
	 * Get the combined text contents of each element in the set of matched elements, including their descendants.
	 * @see <a href="http://api.jquery.com/text/">详细看jQuery的解释，和他一样</a>
	 * @param {String} [text]
	 */
	text : function(text) {
		return $kit.dom.text(this.nodes[0], html);
	},
	/**
	 * 返回索引
	 * Search for a given element from among the matched elements.
	 * @param {Element|Selector}
	 * @param {Element} [context]
	 * @return {Number}
	 * @see <a href="http://api.jquery.com/index/">详细看jQuery的解释，和他一样</a>
	 */
	index : function(selector, context) {
		if($kit.isNode(selector)) {
			return $kit.array.indexOf(this.nodes, selector);
		}
		var find = $kit.$el(selector, context);
		return $kit.array.indexOf(this.nodes, find[0]);
	},
	/**
	 * 高度
	 * @param {Number} [value]
	 * @return {Number|$Kit.Suger Instance}
	 */
	height : function(value) {
		var me = this;
		if(value != null) {
			$kit.dom.height(me.nodes[0], value);
			return me;
		}
		return $kit.dom.height(me.nodes[0]);
	},
	/**
	 *  宽度
	 * @param {Number} [value]
	 * @return {Number|$Kit.Suger Instance}
	 */
	width : function(value) {
		var me = this;
		if(value != null) {
			$kit.dom.width(me.nodes[0], value);
			return me;
		}
		return $kit.dom.width(me.nodes[0]);
	},
	/**
	 * 内高度包括padding，不包括border
	 * Get the current computed height for the first element in the set of matched elements, including padding but not border.
	 * @see <a href="http://api.jquery.com/innerHeight/">详细看jQuery的解释，和他一样</a>
	 */
	innerHeight : function() {
		return $kit.dom.innerHeight(this.nodes[0]);
	},
	/**
	 * Get the current computed width for the first element in the set of matched elements, including padding but not border.
	 * @see <a href="http://api.jquery.com/innerWidth/">详细看jQuery的解释，和他一样</a>
	 */
	innerWidth : function() {
		return $kit.dom.innerWidth(this.nodes[0]);
	},
	/**
	 * 包括padding和border
	 * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin. Returns an integer (without "px") representation of the value or null if called on an empty set of elements.
	 * @see <a href="http://api.jquery.com/outerHeight/">详细看jQuery的解释，和他一样</a>
	 * @return {Number}
	 */
	outerHeight : function() {
		return $kit.dom.outerHeight(this.nodes[0]);
	},
	/**
	 * 包括padding和border
	 * Get the current computed width for the first element in the set of matched elements, including padding and border.
	 * @see <a href="http://api.jquery.com/outerWidth/">详细看jQuery的解释，和他一样</a>
	 * @return {Number}
	 */
	outerWidth : function() {
		return $kit.dom.outerWidth(this.nodes[0]);
	},
	/**
	 * 判断是否满足选择器
	 * Check the current matched set of elements against a selector, element, or jQuery object and return true if at least one of these elements matches the given arguments.
	 * @see <a href="http://api.jquery.com/is/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector|$Kit.Suger Instance Object|Element}
	 */
	is : function(selector) {
		if($kit.isNode(selector)) {
			return this.nodes[0] == selector;
		} else if(this.isSuger(selector)) {
			return selector.nodes.length == 1 && this.nodes[0] == selector.nodes[0]
		} else if($kit.isStr(selector)) {
			return $kit.selector.matchesSelector(this.nodes[0], selector);
		}
		return false;
	},
	/**
	 * 最后一个
	 * Reduce the set of matched elements to the final one in the set.
	 * @see <a href="http://api.jquery.com/last/">详细看jQuery的解释，和他一样</a>
	 * @return {Object} new $Kit.Suger Instance
	 */
	last : function() {
		var me = this;
		return me._new(me.nodes[me.nodes.length - 1]);
	},
	/**
	 * 遍历，返回值加入到一个数组
	 * Pass each element in the current matched set through a function, producing a new jQuery object containing the return values.
	 * @see <a href="http://api.jquery.com/map/">详细看jQuery的解释，和他一样</a>
	 * @param {Function}
	 * @return {Array}
	 */
	map : function(fn) {
		var me = this, re = [];
		$kit.each(me.nodes, function(o, idx, ary) {
			re.push(fn.call(o, idx, o));
		});
		return re;
	},
	/**
	 * 去掉匹配的
	 * Remove elements from the set of matched elements.
	 * @see <a href="http://api.jquery.com/andSelf/">详细看jQuery的解释，和他一样</a>
	 * @return {Object} new $Kit.Suger Instance
	 */
	not : function(selector, context) {
		var me = this, re = [];
		if($kit.isNode(selector)) {
			$kit.each(me.nodes, function(o) {
				if(selector != o) {
					re.push(o);
				}
			});
			return me._new(re);
		} else if($kit.isNodeList(selector)) {
			$kit.each(me.nodes, function(o) {
				var existed = false;
				$kit.each(selector, function(c) {
					if(o == c) {
						existed = true;
						return false;
					}
				});
				if(!existed) {
					re.push(o);
				}
			});
			return me._new(re);
		} else if($kit.isStr(selector)) {
			selector = $kit.$el(selector, context);
			$kit.each(me.nodes, function(o) {
				var existed = false;
				$kit.each(selector, function(c) {
					if(o == c) {
						existed = true;
						return false;
					}
				});
				if(!existed) {
					re.push(o);
				}
			});
			return me._new(re);
		} else if($kit.isFn(selector)) {
			$kit.each(me.nodes, function(o, idx) {
				if(selector.call(o, idx) != true) {
					re.push(o);
				}
			});
		}
		return null;
	},
	/**
	 * 注销事件
	 * @param {String} event
	 * @param {Function} [eventFunction]
	 * @return {Object} current $Kit.Suger Instance
	 */
	off : function() {
		var me = this;
		if(arguments.length == 2) {
			var ev = arguments[0];
			var fn = arguments[1];
			$kit.each(me.nodes, function(o) {
				$kit.delEv({
					el : o,
					ev : ev,
					fn : fn
				});
			});
		}
		return me;
	},
	/**
	 * 注销事件，同off
	 * @param {String} event
	 * @param {Function} [eventFunction]
	 * @return {Object} current $Kit.Suger Instance
	 */
	unbind : function() {
		return this.off.apply(this, arguments);
	},
	/**
	 * 注销事件，同off
	 * @param {String} event
	 * @param {Function} [eventFunction]
	 * @return {Object} current $Kit.Suger Instance
	 */
	undelegate : function() {
		return this.off.apply(this, arguments);
	},
	/**
	 * 绑定事件，同on
	 * @param {String} event
	 * @param {Function} eventFunction
	 * @return {Object} current $Kit.Suger Instance
	 */
	bind : function() {
		return this.on.apply(this, arguments);
	},
	/**
	 * 绑定事件，同on
	 * @param {String} event
	 * @param {Function} eventFunction
	 * @return {Object} current $Kit.Suger Instance
	 */
	delegate : function() {
		return this.on.apply(this, arguments);
	},
	/**
	 * 绑定事件
	 * @param {String} event
	 * @param {Function} eventFunction
	 * @return {Object} current $Kit.Suger Instance
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
	/**
	 * 只执行一次的事件
	 * @param {String} event
	 * @param {Function} eventFunction
	 * @return {Object} current $Kit.Suger Instance
	 */
	one : function(event, fn) {
		var me = this;
		var _fn = function(ev, evCfg) {
			fn.call(this, ev, evCfg);
			$kit.delEv(evCfg);
		}
		me.on(event, _fn);
	},
	/**
	 * offset，看$kit.offset
	 * Get the current coordinates of the first element in the set of matched elements, relative to the document.
	 * @return {Object}
	 */
	offset : function() {
		return $kit.offset(this.nodes[0]);
	},
	/**
	 * position，看$kit.position
	 * Get the current coordinates of the first element in the set of matched elements, relative to the offset parent.
	 * @return {Object}
	 */
	position : function() {
		return $kit.dom.position(this.nodes[0]);
	},
	/**
	 * Get the closest ancestor element that is positioned.
	 * @return {Object} new $Kit.Suger Instance
	 */
	offsetParent : function() {
		return this._new(this.nodes[offsetParent]);
	},
	/**
	 * 查找父节点
	 * Get the parent of each element in the current set of matched elements, optionally filtered by a selector.
	 * @see <a href="http://api.jquery.com/parent/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector|Element|$Kit.Suger Instance Object}
	 * @param {Element} [context]
	 * @return {Object} new $Kit.Suger Instance
	 */
	parent : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var parentNode = me.nodes[0];
		while(parentNode != context) {
			parentNode = parentNode.parentNode;
			if($kit.isStr(selector) && $kit.selector.matchesSelector(parentNode, selector)) {
				return me._new(parentNode);
			} else if($kit.isNode(selector) && parentNode == selector) {
				return me._new(parentNode);
			} else if(me.isSuger(selector) && parentNode == selector.nodes[0]) {
				return me._new(parentNode);
			} else {
				break;
			}
		}
		return null;
	},
	/**
	 * 返回所有父节点
	 * Get the ancestors of each element in the current set of matched elements, optionally filtered by a selector.
	 * @param {Selector|Element|$Kit.Suger Instance Object}
	 * @param {Element} [context]
	 * @return {Object} new $Kit.Suger Instance
	 */
	parents : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var parentNode = me.nodes[0];
		var re = [];
		while(parentNode != context) {
			parentNode = parentNode.parentNode;
			if($kit.isStr(selector) && $kit.selector.matchesSelector(parentNode, selector)) {
				re.push(me._new(parentNode));
			} else if($kit.isNode(selector) && parentNode == selector) {
				re.push(me._new(parentNode));
			} else if(me.isSuger(selector) && parentNode == selector.nodes[0]) {
				re.push(me._new(parentNode));
			} else {
				break;
			}
		}
		if(re.length) {
			return me._new(re);
		}
		return null;
	},
	/**
	 * 返回所有父节点直到
	 * Get the ancestors of each element in the current set of matched elements, up to but not including the element matched by the selector, DOM node, or jQuery object.
	 * @param {Selector|Element|$Kit.Suger Instance Object}
	 * @param {Element} [context]
	 * @return {Object} new $Kit.Suger Instance
	 */
	parentsUntil : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var find = $kit.selector.matches(selector, [element]);
		var parentNode = me.nodes[0];
		var re = [];
		while(parentNode != context) {
			parentNode = parentNode.parentNode;
			if($kit.isStr(selector) && $kit.selector.matchesSelector(parentNode, selector)) {
				break;
			} else if($kit.isNode(selector) && parentNode == selector) {
				break;
			} else if(me.isSuger(selector) && parentNode == selector.nodes[0]) {
				break;
			} else {
				re.push(me._new(parentNode));
			}
		}
		if(re.length) {
			return me._new(re);
		}
		return null;
	},
	/**
	 * 下一个元素
	 * Get the immediately following sibling of each element in the set of matched elements. If a selector is provided, it retrieves the next sibling only if it matches that selector.
	 * @see <a href="http://api.jquery.com/next/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector} [selector]
	 * @return {Object} new $Kit.Suger Instance
	 */
	next : function(selector) {
		var re = [], me = this;
		var nextElementSibling = me.nodes[0];
		while(nextElementSibling.nextSibling) {
			nextElementSibling = nextElementSibling.nextSibling;
			if(nextElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				if($kit.isStr(selector)) {
					if($kit.selector.matchesSelector(nextElementSibling, selector)) {
						re.push(nextElementSibling);
						break;
					}
				} else {
					re.push(nextElementSibling);
					break;
				}
			}
		}
		return me._new(re);
	},
	/**
	 * 后面所有元素
	 * Get all following siblings of each element in the set of matched elements, optionally filtered by a selector.
	 * @see <a href="http://api.jquery.com/nextAll/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector} [selector]
	 * @return {Object} new $Kit.Suger Instance
	 */
	nextAll : function(selector) {
		var re = [], me = this;
		var nextElementSibling = me.nodes[0];
		while(nextElementSibling.nextSibling) {
			nextElementSibling = nextElementSibling.nextSibling;
			if(nextElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				if($kit.isStr(selector)) {
					if($kit.selector.matchesSelector(nextElementSibling, selector)) {
						re.push(nextElementSibling);
					}
				} else {
					re.push(nextElementSibling);
				}
			}
		}
		return me._new(re);
	},
	/**
	 * 同级后面所有，不包含selector
	 * Get all following siblings of each element up to but not including the element matched by the selector, DOM node, or jQuery object passed.
	 * @see <a href="http://api.jquery.com/nextUntil/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector ...|Element ...|$Kit.Suger Instance Object ...}
	 * @return {Object} new $Kit.Suger Instance
	 */
	nextUntil : function() {
		var me = this, re = [];
		var nextElementSibling = me.nodes[0];
		while(nextElementSibling.nextSibling) {
			nextElementSibling = nextElementSibling.nextSibling;
			if(nextElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				var flag = true;
				for(var i = 0; i < arguments.length; i++) {
					var selector = arguments[i];
					if($kit.isStr(selector) && $kit.selector.matchesSelector(nextElementSibling, selector)) {
						flag = false;
						break;
					} else if($kit.isNode(selector) && nextElementSibling == selector) {
						flag = false;
						break;
					}
				}
				if(flag) {
					re.push(nextElementSibling);
				}
			}
		}
		return me._new(re);
	},
	/**
	 * 前面
	 * Get the immediately preceding sibling of each element in the set of matched elements, optionally filtered by a selector.
	 * @see <a href="http://api.jquery.com/prev/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector} [selector]
	 * @return {Object} new $Kit.Suger Instance
	 */
	prev : function(selector) {
		var me = this, re = [];
		var previousElementSibling = me.nodes[0];
		while(previousElementSibling.previousSibling) {
			previousElementSibling = previousElementSibling.previousSibling;
			if(previousElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				if($kit.isStr(selector)) {
					if($kit.selector.matchesSelector(previousElementSibling, selector)) {
						re.push(previousElementSibling);
						break;
					}
				} else {
					re.push(previousElementSibling);
					break;
				}
			}
		}
		return me._new(re);
	},
	/**
	 * 之前所有的
	 * Get all preceding siblings of each element in the set of matched elements, optionally filtered by a selector.
	 * @see <a href="http://api.jquery.com/prevAll/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector} [selector]
	 * @return {Object} new $Kit.Suger Instance
	 */
	prevAll : function(selector) {
		var me = this, re = [];
		var previousElementSibling = me.nodes[0];
		while(previousElementSibling.previousSibling) {
			previousElementSibling = previousElementSibling.previousSibling;
			if(previousElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				if($kit.isStr(selector)) {
					if($kit.selector.matchesSelector(previousElementSibling, selector)) {
						re.push(previousElementSibling);
					}
				} else {
					re.push(previousElementSibling);
				}
			}
		}
		return me._new(re);
	},
	/**
	 * 之前所有的，直到
	 * Get all preceding siblings of each element up to but not including the element matched by the selector, DOM node, or jQuery object.
	 * @see <a href="http://api.jquery.com/prevUntil/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector ...|Element ...|$Kit.Suger Instance Object ...}
	 * @return {Object} new $Kit.Suger Instance
	 */
	prevUntil : function(selector) {
		var me = this, re = [];
		var previousElementSibling = me.nodes[0];
		while(previousElementSibling.previousSibling) {
			previousElementSibling = previousElementSibling.previousSibling;
			if(previousElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				var flag = true;
				for(var i = 0; i < arguments.length; i++) {
					var selector = arguments[i];
					if($kit.isStr(selector) && $kit.selector.matchesSelector(previousElementSibling, selector)) {
						flag = false;
						break;
					} else if($kit.isNode(selector) && previousElementSibling == selector) {
						flag = false;
						break;
					}
				}
				if(flag) {
					re.push(previousElementSibling);
				}
			}
		}
		return me._new(re);
	},
	/**
	 * 删除
	 * Remove the set of matched elements from the DOM.
	 * @return {Object} current $Kit.Suger Instance
	 */
	remove : function() {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.rmEl(o);
		});
		return me;
	},
	/**
	 * 替换
	 * Replace each target element with the set of matched elements.
	 * @see <a href="http://api.jquery.com/replaceAll/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector|Element|$Kit.Suger Instance Object}
	 * @param {Element} [context]
	 * @return {Object} current $Kit.Suger Instance
	 */
	replaceAll : function(selector, context) {
		var me = this;
		var target;
		if($kit.isNode(selector)) {
			target = [selector];
		} else if($kit.isStr(selector)) {
			target = $kit.$el(selector, context);
		} else if(me.isSuger(selector)) {
			target = selector.nodes;
		}
		if(target) {
			$kit.each(target, function(o) {
				$kit.rpEl(o, me.nodes[0]);
			});
		}
		return me;
	},
	/**
	 * Replace each element in the set of matched elements with the provided new content.\
	 * @see <a href="http://api.jquery.com/replaceWith/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector|Element|$Kit.Suger Instance Object|Function}
	 * @param {Element} [context]
	 * @return {Object} current $Kit.Suger Instance
	 */
	replaceWith : function(selector, context) {
		var me = this;
		var target;
		if($kit.isNode(selector)) {
			target = selector;
		} else if(me.isSuger(selector)) {
			target = selector.nodes[0];
		} else if($kit.isStr(selector)) {
			target = $kit.$el(selector, context)[0];
		} else if($kit.isFn(selector)) {
			target = selector.call(me.nodes[0]);
		}
		if(target) {
			$kit.rpEl(me.nodes[0], target);
		}
		return me;
	},
	/**
	 * form元素序列化
	 */
	serialize : function() {
		var re = [], me = this;
		$kit.each(me.nodes, function(o) {
			re.push($kit.dom.serialize(o));
		});
		return re.join('&');
	},
	/**
	 * 找到所有同级其他元素
	 * @see <a href="http://api.jquery.com/siblings/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector} [selector]
	 * @return {[Element]}
	 */
	siblings : function(selector) {
		var me = this;
		var siblings = me.nodes[0].parent.childNodes, re = [];
		$kit.each(siblings, function(o) {
			if(o != me.nodes[0]) {
				if(selector == null) {
					re.push(o);
				} else if($kit.selector.matchesSelector(o, selector)) {
					re.push(o);
				}
			}
		});
	},
	/**
	 * 返回nodes长度
	 * @return {Number}
	 */
	size : function() {
		return this.nodes.length;
	},
	/**
	 * Reduce the set of matched elements to a subset specified by a range of indices.
	 * @param {Number}
	 * @param {Number} [end]
	 * @return {Object} new $Kit.Suger Instance
	 */
	slice : function(begin, end) {
		if(end != null) {
			return this._new(this.nodes.slice(begin, end));
		} else if(begin != null) {
			return this._new(this.nodes.slice(begin));
		}
		return this;
	},
	/**
	 * 获得value
	 * Get the current value of the first element in the set of matched elements.
	 * @return {String}
	 */
	val : function() {
		return $kit.val(me.nodes);
	},
	/**
	 * 包围
	 * Wrap an HTML structure around each element in the set of matched elements.
	 * @param {HTML|Element|$Kit.Suger Instance}
	 * @return {Object} new $Kit.Suger Instance
	 */
	wrap : function(node) {
		var me = this;
		if($kit.isNode(node)) {
			$kit.dom.wrap(me.nodes[0], node);
			return me._new(node);
		} else if(me.isSuger(node)) {
			$kit.dom.wrap(me.nodes[0], node.nodes[0]);
			return node;
		} else if($kit.isStr(node)) {
			node = $kit.newHTML(node).childNodes[0];
			$kit.dom.wrap(me.nodes[0], node);
			return me._new(node);
		}
		return null;
	},
	/**
	 * Wrap an HTML structure around all elements in the set of matched elements.
	 * @param {HTML|Element|$Kit.Suger Instance}
	 * @return {Object} new $Kit.Suger Instance
	 */
	wrapAll : function(node) {
		var me = this;
		if($kit.isNode(node)) {
			$kit.dom.wrap(me.nodes[0], node);
			for(var i = 1; i < me.nodes.length; i++) {
				node.appendChild(me.nodes[i]);
			}
			return me._new(node);
		} else if(me.isSuger(node)) {
			$kit.dom.wrap(me.nodes[0], node.nodes[0]);
			for(var i = 1; i < me.nodes.length; i++) {
				node.appendChild(me.nodes[i]);
			}
			return node;
		} else if($kit.isStr(node)) {
			node = $kit.newHTML(node).childNodes[0];
			$kit.dom.wrap(me.nodes[0], node);
			for(var i = 1; i < me.nodes.length; i++) {
				node.appendChild(me.nodes[i]);
			}
			return me._new(node);
		}
		return null;
	},
	/**
	 * Wrap an HTML structure around the content of each element in the set of matched elements.
	 * @param {HTML|Element|$Kit.Suger Instance|Function}
	 * @return {Object} new $Kit.Suger Instance
	 */
	wrapInner : function(node) {
		var me = this;
		if($kit.isNode(node)) {
			me.nodes[0].appendChild(node);
			var innerHTML = me.nodes[0].innerHTML;
			me.nodes[0].innerHTML = '';
			node.innerHTML = innerHTML;
			return me._new(node);
		} else if(me.isSuger(node)) {
			me.nodes[0].appendChild(node.nodes[0]);
			var innerHTML = me.nodes[0].innerHTML;
			me.nodes[0].innerHTML = '';
			node.nodes[0].innerHTML = innerHTML;
			return node;
		} else if($kit.isStr(node)) {
			node = $kit.newHTML(node).childNodes[0];
			me.nodes[0].appendChild(node);
			var innerHTML = me.nodes[0].innerHTML;
			me.nodes[0].innerHTML = '';
			node.innerHTML = innerHTML;
			return me._new(node);
		} else if($kit.isFn(node)) {
			node = node.call(me.nodes[0]);
			return me.wrapInner(node);
		}
		return null;
	},
	/**
	 * Remove the parents of the set of matched elements from the DOM, leaving the matched elements in their place.
	 * @return {Object} new $Kit.Suger Instance
	 */
	unwrap : function() {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.rpEl(o.parentNode, o);
		});
		return me;
	},
	/**
	 * 是否是kitSuger对象
	 * @param {Object}
	 * @return {Boolean}
	 * @private
	 */
	isSuger : function(o) {
		return o != null && $kit.isObj(o) && o.name == 'kitSuger';
	},
	/**
	 * 生成一个新的jquery队列
	 * @param {Selector|Element|[Element]|$Kit.Suger Instance}
	 * @return {Object} new $Kit.Suger Instance
	 */
	pushStack : function(selector) {
		var me = this;
		return me._new(selector);
	},
	/**
	 * Get the children of each element in the set of matched elements, optionally filtered by a selector.
	 * @see <a href="http://api.jquery.com/children/">详细看jQuery的解释，和他一样</a>
	 * @param {Selector} [selector]
	 * @return {Object} new $Kit.Suger Instance
	 */
	children : function(selector) {
		var me = this;
		var re = [];
		$kit.each(me.nodes, function(o) {
			if(selector == null) {
				$kit.array.ad(re, o.childNodes, {
					ifExisted : true
				});
			} else {
				$kit.each(o.childNodes, function(o1) {
					if($kit.selector.matchesSelector(selector, o1)) {
						re.push(o1);
					}
				});
			}
		});
		return me._new(re);
	},
	/**
	 * 返回DOM element
	 * @param {Number} index
	 * @return {[Element]|Element}
	 */
	get : function(index) {
		if(index == null) {
			return this.nodes;
		} else {
			if(index > 0) {
				return this.nodes[index];
			} else {
				return this.nodes[this.nodes.length - index];
			}
		}
	}
});
if($kit.$) {
	$kit._$ = $kit.$;
}
/**
 * $kit.$方法
 * @name $kit.$
 * @global
 * @function
 * @param {Selector|Function|Element|[Element]} arg
 * arg为function时候，相当于dom ready，会将$kit.$方法传递进去为参数1，
 * 例如$kit.$(function($){$.xxxx})这里的function里面的$就等同于$kit.$，相当于别名的功能
 * arg为其他类型的时候，自动生成一个$Kit.Suger实例，相当于jQuyer.$
 * @param {Element} [context]
 * @return {Null|$Kit.Suger Instance Object}
 */
$k = $kit.$ = function() {
	if(arguments[0] == null || arguments[0] == '') {
		return;
	}
	if($kit.isFn(arguments[0])) {
		var fn = arguments[0];
		$kit._$(function() {
			fn($kit.$);
		});
	} else {
		return new $Kit.Suger(arguments[0], arguments[1]);
	}
}
/**
 * @module suger
 * @return global.html#$kit.$el
 */
if(window['define']) {
	define('suger', ['math', 'anim', 'array', 'dom', 'io', 'json', 'selector', 'event'], function() {
		return $kit.$;
	});
}