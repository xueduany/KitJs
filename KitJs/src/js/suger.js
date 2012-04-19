/**
 * 语法糖
 * 纯链式结构，jquery的思想
 */
$kit.Suger = function() {
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
		}
	}
	this.length = this.nodes.length;
	this.name = 'kitSuger';
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
		}
		return me._new(re);
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
	 * 属性
	 */
	prop : function() {
		return this.attr.apply(this, arguments);
	},
	/**
	 * 删除
	 */
	remove : function(selector) {
		var me = this;
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
		if($kit.selector.matchesSelector(element, selector)) {
			return me._new(element);
		}
		return me.parent(selector, context);
	},
	/**
	 * 样式
	 */
	css : function(propertyName, value) {
		var me = this;
		$kit.css(me.nodes[0], propertyName, value);
		return me;
	},
	/**
	 * 判断dom位置是否包含
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
	 * 双击
	 */
	dblclick : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'dblclick'
		});
		return me
	},
	/**
	 * 不着急
	 */
	delay : function() {

	},
	/**
	 * 就是on
	 */
	delegate : function() {
		return this.on.apply(this, arguments);
	},
	/**
	 * 从this.nodes里面删除匹配的元素
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
	 * 不着急
	 */
	die : function() {

	},
	/**
	 * 遍历
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
	 */
	eq : function(index) {
		var me = this;
		if(index >= 0) {
			return me._new(me.nodes[index]);
		}
		return me._new(me.nodes[me.nodes.length + index]);
	},
	/**
	 * error事件
	 */
	error : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'error'
		});
		return me
	},
	/**
	 * 不着急
	 */
	fadeIn : function() {

	},
	fadeOut : function() {

	},
	fadeTo : function() {

	},
	/**
	 * 过滤，生成新的
	 */
	filter : function(selector) {
		var me = this, re = [];
		var find = $kit.selector.matches(selector, me.nodes);
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
	 */
	find : function(selector) {
		var me = this;
		var find = $kit.selector.matches(selector, me.nodes);
		return me._new(find);
	},
	/**
	 * 返回第一个
	 */
	first : function() {
		var me = this;
		return me._new(me.nodes[0]);
	},
	/**
	 * 焦点事件
	 */
	focus : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'focus'
		});
		return me
	},
	/**
	 * 返回包含某种node的
	 */
	has : function(selector) {
		var me = this, re = [];
		$kit.each(me.nodes, function(o, index, ary) {
			var find = $kit.$el(selector, o);
			if(find != null && find.length > 0) {
				re.push(o);
			}
		});
		return me._new(re);
	},
	/**
	 * 是否有某个样式
	 */
	hasClass : function(className) {
		var me = this;
		return $kit.hsCls(me.nodes[0], className);
	},
	/**
	 * 隐藏
	 */
	hide : function() {
		var me = this;
		me.nodes[0].style.display = 'none';
		return me;
	},
	/**
	 * hover事件
	 */
	hover : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'mouseover'
		});
		return me
	},
	/**
	 * 返回html
	 */
	html : function() {
		return this.nodes[0].innerHTML;
	},
	/**
	 * 返回索引
	 */
	index : function(selector, context) {
		if($kit.isNode(selector)) {
			return $kit.array.indexOf(this.nodes, selector);
		}
		var find = $kit.$el(selector, context);
		return $kit.array.indexOf(this.nodes, find[0]);
	},
	/**
	 * 内高度包括padding，不包括border
	 */
	innerHeight : function() {
		return $kit.dom.innerHeight(this.nodes[0]);
	},
	innerWidth : function() {
		return $kit.dom.innerWidth(this.nodes[0]);
	},
	/**
	 * 把当前的插入到node的后面
	 */
	insertAfter : function(selector, context) {
		var me = this, target = selector;
		if(!$kit.isNode(target)) {
			target = $kit.$el(selector, context)[0];
		}
		$kit.each(me.nodes, function(o) {
			$kit.insEl({
				where : selector,
				what : o,
				pos : 'after'
			});
		});
		return me;
	},
	insertBefore : function() {
		var me = this, target = selector;
		if(!$kit.isNode(target)) {
			target = $kit.$el(selector, context)[0];
		}
		$kit.each(me.nodes, function(o) {
			$kit.insEl({
				where : selector,
				what : o,
				pos : 'before'
			});
		});
		return me;
	},
	/**
	 * 判断是否满足选择器
	 */
	is : function(selector) {
		var find = $kit.selector(selector, this.nodes[0]);
		if(find != null && find.length) {
			return true;
		}
		return false;
	},
	/**
	 * key事件
	 */
	keydown : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'keydown'
		});
		return me;
	},
	keypress : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'keypress'
		});
		return me;
	},
	keyup : function() {
		var me = this;
		$kit.newEv({
			el : me.nodes[0],
			ev : 'keyup'
		});
		return me;
	},
	/**
	 * 最后一个
	 */
	last : function() {
		var me = this;
		return me._new(me.nodes[me.nodes.length - 1]);
	},
	/**
	 * 不着急
	 */
	live : function() {

	},
	load : function() {

	},
	/**
	 * 遍历，返回值加入到一个数组
	 */
	map : function(fn) {
		var me = this, re = [];
		$kit.each(me.nodes, function(o, idx, ary) {
			re.push(fn.call(o, idx, o));
		});
		return re;
	},
	/**
	 * mouse事件
	 */
	mousedown : function() {
	},
	mouseenter : function() {
	},
	mouseleave : function() {
	},
	mousemove : function() {
	},
	mouseout : function() {
	},
	mouseover : function() {
	},
	mouseup : function() {
	},
	/**
	 * 下一个元素
	 */
	next : function() {
		var me = this;
		return me._new($kit.$el('+*', me.nodes[0]));
	},
	nextAll : function() {
		var re = [], me = this;
		var nextElementSibling = me.nodes[0];
		while(nextElementSibling.nextSibling) {
			nextElementSibling = nextElementSibling.nextSibling;
			if(nextElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				re.push(nextElementSibling);
			}
		}
		var _suger = new $kit.Suger(re);
		_suger.previousSugerObject = me;
		return _suger;
	},
	/**
	 * 同级后面所有，不包含selector
	 */
	nextUntil : function(selector) {
		var me = this, re = [];
		var nextElementSibling = me.nodes[0];
		while(nextElementSibling.nextSibling) {
			nextElementSibling = nextElementSibling.nextSibling;
			if(nextElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				if($kit.selector.matchesSelector(nextElementSibling, selector)) {
					break;
				}
				re.push(nextElementSibling);
			}
		}
		return me._new(re);
	},
	/**
	 * 去掉匹配的
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
		} else if($kit.isNodes(selector)) {
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
		}
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
	},
	/**
	 * 不着急
	 */
	off : function() {

	},
	on : function() {

	},
	one : function() {

	},
	/**
	 * offset
	 */
	offset : function() {
		return $kit.offset(this.nodes[0]);
	},
	offsetParent : function() {
		return this._new(this.nodes[offsetParent]);
	},
	/**
	 * 包括padding和border
	 */
	outerHeight : function() {
		return $kit.dom.outerHeight(this.nodes[0]);
	},
	outerWidth : function() {
		return $kit.dom.outerWidth(this.nodes[0]);
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
	parents : function(selector, context) {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var find = $kit.selector.matches(selector, [element]);
		var parentNode = me.nodes[0];
		var re = [];
		while(parentNode != context) {
			parentNode = parentNode.parentNode;
			find = $kit.selector.matches(selector, [parentNode]);
			if(find.length && find[0] == parentNode) {
				re.push(parentNode);
			}
		}
		if(re.length) {
			return me._new(re);
		}
		return null;
	},
	parentsUntil : function() {
		var me = this;
		context = context || document;
		var me = this, element = me.nodes[0];
		var find = $kit.selector.matches(selector, [element]);
		var parentNode = me.nodes[0];
		var re = [];
		while(parentNode != context) {
			parentNode = parentNode.parentNode;
			find = $kit.selector.matches(selector, [parentNode]);
			if(find.length && find[0] == parentNode) {
				break;
			} else {
				re.push(parentNode);
			}
		}
		if(re.length) {
			return me._new(re);
		}
		return null;
	},
	/**
	 * 前插，类似append是后插
	 */
	prepend : function() {
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
						pos : 'first',
						what : object
					});
				});
			} else if($kit.isFn(object)) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : o,
						pos : 'first',
						what : object.call(o, object)
					});
				});
			}
		}
		return me;
	},
	prependTo : function() {
		var me = this;
		if($kit.isNode(target)) {
			$kit.each(me.nodes, function(o) {
				$kit.insEl({
					where : target,
					what : o,
					pos : 'first'
				});
			});
		} else {
			if(target.nodes) {
				$kit.each(me.nodes, function(o) {
					$kit.insEl({
						where : target.nodes[0],
						what : o,
						pos : 'first'
					});
				});
			}
		}
		return me;
	},
	/**
	 * 前面
	 */
	prev : function() {
		var me = this, re = [];
		var previousElementSibling = me.nodes[0];
		while(previousElementSibling.previousSibling) {
			previousElementSibling = previousElementSibling.previousSibling;
			if(previousElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				re.push(previousElementSibling);
				break;
			}
		}
		return me._new(re);
	},
	prevAll : function() {
		var me = this, re = [];
		var previousElementSibling = me.nodes[0];
		while(previousElementSibling.previousSibling) {
			previousElementSibling = previousElementSibling.previousSibling;
			if(previousElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				re.push(previousElementSibling);
			}
		}
		return me._new(re);
	},
	prevUntil : function(selector) {
		var me = this, re = [];
		var previousElementSibling = me.nodes[0];
		while(previousElementSibling.previousSibling) {
			previousElementSibling = previousElementSibling.previousSibling;
			if(previousElementSibling.nodeType == $kit.CONSTANTS.NODETYPE_ELEMENT) {
				if($kit.selector.matchesSelector(previousElementSibling, selector)) {
					break;
				}
				re.push(previousElementSibling);
			}
		}
		return me._new(re);
	},
	/**
	 * 删除
	 */
	remove : function() {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.rmEl(o);
		});
		return me;
	},
	removeAttr : function(attrName) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.attr(o, attrName, null);
		});
		return me;
	},
	removeClass : function(className) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.rmCls(o, className);
		});
		return me;
	},
	removeDate : function(dataName) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			o.dataName = undefined;
		});
		return me;
	},
	removeProp : function() {
		return this.removeAttr.apply(this, arguments);
	},
	/**
	 * 替换
	 */
	replaceAll : function(selector, context) {
		var me = this;
		var target = $kit.$el(selector, context);
		$kit.each(target, function(o) {
			$kit.rpEl(o, me.nodes[0]);
		});
		return me;
	},
	replaceWith : function(selector) {
		var me = this;
		if($kit.isNode(selector)) {
			$kit.rpEl(o, selector);
		} else if(me.isSuger(selector)) {
			$kit.rpEl(o, selector.nodes[0]);
		}
		return me;
	},
	/**
	 * resize事件
	 */
	resize : function() {

	},
	scroll : function() {

	},
	scrollLeft : function() {

	},
	scrollTop : function() {

	},
	select : function() {

	},
	/**
	 * form元素序列化
	 */
	serialize : function() {

	},
	serializeArray : function() {

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
	 * 找到所有同级其他元素
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
	 * 不着急
	 */
	size : function() {

	},
	slice : function() {

	},
	slideDown : function() {

	},
	slideTriggle : function() {

	},
	slideUp : function() {

	},
	stop : function() {

	},
	/**
	 * innerText
	 */
	text : function(text) {
		var me = this;
		if(text == null) {
			return $kit.dom.text(me.nodes[0]);
		}
		$kit.dom.text(me.nodes[0], text);
		return me;
	},
	/**
	 * 切换className
	 */
	toggleClass : function(className) {
		var me = this;
		$kit.each(me.nodes, function(o) {
			$kit.toggleCls(o, className);
		});
		return me;
	},
	/**
	 * 获得value
	 */
	val : function() {
		return $kit.val(me.nodes);
	},
	/**
	 * 高度 宽度
	 */
	height : function(value) {
		var me = this;
		if(value != null) {
			$kit.dom.height(me.nodes[0], value);
			return me;
		}
		return $kit.dom.height(me.nodes[0]);
	},
	width : function(value) {
		var me = this;
		if(value != null) {
			$kit.dom.width(me.nodes[0], value);
			return me;
		}
		return $kit.dom.width(me.nodes[0]);
	},
	/**
	 * 包围
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
	wrapInner : function() {
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
	/**
	 * 是否是kitSuger对象
	 */
	isSuger : function(o) {
		return o != null && $kit.isObj(o) && o.name == 'kitSuger';
	},
	/**
	 * 生成一个新的jquery队列
	 */
	pushStack : function(selector) {
		var me = this;
		return me._new(selector);
	}
}
if($kit.$) {
	$kit._$ = $kit.$;
}
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
		return new $kit.Suger(arguments[0], arguments[1]);
	}
}