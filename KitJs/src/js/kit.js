/*
 * Kit Js
 * a javascript library used to mobile phone web develop
 * author: 薛端阳<xueduanyang1985@163.com>
 * 3q & enjoy it!
 */
$Kit = function(config) {
	var me = this;
	var defaultConfig = {

	}
	me.config = me.join(config, defaultConfig);
	// -----------------------------init------------------------------------
	window[me.CONSTANTS.KIT_EVENT_STOPALLEVENT] = false;
	window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = false;
	me.SYSINFO = {}
	var inf = me.iOSInfo();
	if(inf != null) {
		me.merge(me.SYSINFO, inf);
	}
	/**
	 * register widget
	 */
	me.ui = {};
}
$Kit.prototype = {
	//----------------------CONSTANTS----------------------
	CONSTANTS : {
		//异常处理,最大循环次数
		MAX_CYCLE_COUNT : 1000,
		//
		NODETYPE_ELEMENT : 1,
		NODETYPE_ELEMENT_ATTR : 2,
		NODETYPE_TEXTNODE : 3,
		NODETYPE_COMMENT : 8,
		NODETYPE_ROOT : 9,
		NODETYPE_FRAGMENT : 11,
		//
		DOCUMENT_POSITION_SAME : 0, //同一个
		DOCUMENT_POSITION_DISCONNECTED : 1, //不在一个文档
		DOCUMENT_POSITION_PRECEDING : 2, //b在a前面
		DOCUMENT_POSITION_FOLLOWING : 4, //b在a后面
		DOCUMENT_POSITION_CONTAINS : 10, //b是a祖先
		DOCUMENT_POSITION_CONTAINED_BY : 20, //b是a儿子
		DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : 32, //不常用
		//
		REGEXP_SPACE : /\s+/g,
		//事件注册
		KIT_EVENT_REGISTER : "_kit_event_register_",
		//事件
		KIT_EVENT_REGISTER_EVENT : "_kit_event_register_event",
		//方法
		KIT_EVENT_REGISTER_FUNCTION : "_kit_event_register_function",
		//立即停止所有事件
		KIT_EVENT_STOPIMMEDIATEPROPAGATION : "_kit_event_stopimmediatepropagation_",
		//停止所有事件触发
		KIT_EVENT_STOPALLEVENT : "_kit_event_stopallevent_",
		//DOM ID 默认前缀
		KIT_DOM_ID_PREFIX : "J_Kit_"
	},
	// -----------------------------------is
	// something-----------------------------------
	isIE : function(o) {
		return /MSIE/i.test(navigator.userAgent);
	},
	isChrome : function(o) {
		return /Chrome/i.test(navigator.userAgent);
	},
	isFirefox : function(o) {
		return /Firefox/i.test(navigator.userAgent);
	},
	/**
	 * boolean isString
	 */
	isDefined : function(o) {
		return typeof (o) != "undefined";
	},
	isStr : function(o) {
		return typeof (o) == "string";
	},
	isNum : function(o) {
		return isFinite(o)
	},
	/**
	 * boolean isObject
	 */
	isObj : function(o) {
		return !!(o && typeof (o) == "object" );
	},
	/**
	 * boolean is function
	 */
	isFn : function(o) {
		return !!(o && typeof (o) == "function");
	},
	/**
	 * is it can iterator
	 */
	isAry : function(o) {
		var me = this;
		return !!(o && (o.constructor && o.constructor.toString().indexOf("Array") > -1 || me.isNodeList(o)));
	},
	/**
	 * 是否html元素
	 */
	isNodeList : function(o) {
		return !!(o && (o.toString() == '[object NodeList]' || o.toString() == '[object HTMLCollection]' || (o.length && this.isNode(o[0]))));
	},
	isNode : function(o) {
		return !!(o && o.nodeType);
	},
	/**
	 * is string can be split into a array which elements total > 2
	 */
	isCanSplit2Ary : function(o, sign) {
		var me = this;
		return me.isStr(o) && o.split(sign || /\s+/g).length > 1;
	},
	isEmpty : function(o) {
		var me = this;
		return typeof (o) == "undefined" || o == null || (me.isAry(o) && o.length == 0 || (me.isStr(o) && o == ""));
	},
	// -----------------------------------string-----------------------------------
	trimAll : function(str) {
		if(str == null) {
			return null;
		}
		str = str.toString();
		return str.replace(/\s+/ig, "");
	},
	// -----------------------------------array-----------------------------------
	/**
	 * remove some from array
	 */
	aryDel : function(ary, del) {
		var me = this;
		if(!me.isAry(ary)) {
			return;
		}
		if(me.isAry(del)) {
			for(var i = 0; i < del.length; i++) {
				me.aryDel(ary, del[i]);
			}
		} else {
			for(var j = 0; j < ary.length; j++) {
				if(ary[j] == del) {
					ary.splice(j, 1);
				}
			}
		}
		return ary;
	},
	/**
	 * if someone in array
	 */
	inAry : function(ary, o) {
		var me = this, flag = false;
		if(!me.isAry(ary)) {
			return;
		}
		for(var i = 0; i < ary.length; i++) {
			if(me.isAry(o)) {
				for(var j = 0; j < o.length; j++) {
					if(ary[i] == o[j]) {
						flag = true;
						break;
					}
				}
			} else {
				if(ary[i] == o) {
					flag = true;
					break;
				}
			}
		}
		return flag;
	},
	// -----------------------------------find dom-----------------------------------
	/**
	 * by id
	 */
	el8id : function(id, root) {
		var me = this, re = document.getElementById(id);
		if(root) {
			if(me.contains(root, re)) {
				return re;
			}
			return null;
		}
		return re;
	},
	/**
	 * by cls
	 */
	el8cls : function(cls, root) {
		var re = (root || document).getElementsByClassName(cls);
		return (re != null && re.length ) ? re[0] : null;
	},
	/**
	 * by tagName
	 */
	els8tag : function(tagName, root) {
		var re = (root || document).getElementsByTagName(tagName);
		return re != null && re.length ? re : null;
	},
	el8tag : function(tagName, root) {
		var me = this;
		var re = me.els8tag(tagName, root);
		return re != null && re.length ? re[0] : null;
	},
	/**
	 * els by cls
	 */
	els8cls : function(cls, root) {
		var re = (root || document).getElementsByClassName(cls);
		return re != null && re.length ? re : null;
	},
	/**
	 * els by name
	 */
	el8name : function(name, root) {
		var me = this, re = document.getElementsByName(name);
		if(root) {
			for(var i = 0; i < re.length; i++) {
				if(me.contains(root, re[i])) {
					return re[i];
				}
			}
			return null;
		}
		return (re != null && re.length ) ? re[0] : null;
	},
	el8nm : function(name, root) {
		var me = this;
		return me.el8name(name, root);
	},
	els8name : function(name, root) {
		var me = this, re = document.getElementsByName(name);
		if(root) {
			var _re = [];
			for(var i = 0; i < re.length; i++) {
				if(me.contains(root, re[i])) {
					_re.push(re[i]);
				}
			}
			return _re.length ? _re : null;
		}
		return re != null && re.length ? re : null;
	},
	els8nm : function(name, root) {
		var me = this;
		return me.els8name(name, root);
	},
	/**
	 * elect interface
	 */
	el : function(selector, root) {
		var me = this;
		if(me.isEmpty(selector)) {
			return;
		} else if(me.isNode(selector) || me.isNodeList(selector)) {
			return selector;
		}
		var selector = selector.toString().trim();
		if(selector.indexOf("#") == 0) {
			return me.el8id(selector.substring(1), root);
		} else if(selector.indexOf(".") == 0) {
			return me.els8cls(selector.substring(1), root);
		} else if(selector.indexOf("@") == 0) {
			return me.els8name(selector.substring(1), root);
		} else {
			var re = [];
			if(selector.indexOf(".") > 0 && selector.indexOf(".") < selector.length) {
				var a = me.els8tag(selector.substring(0, selector.indexOf(".")), root);
				var cls = selector.substr(selector.indexOf(".") + 1);
				for(var i = 0; !me.isEmpty(a) && i < a.length; i++) {
					if(me.hsCls(a[i], cls)) {
						re.push(a[i]);
					}
				}
			} else {
				re = me.els8tag(selector, root);
			}
			return re;
		}

	},
	// -----------------------------------dom manipulate-----------------------------------
	/**
	 * 比较element位置
	 * 如果a包含b返回true，否则返回false
	 */
	contains : function(a, b) {
		return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16);
	},
	/**
	 * get/set attr
	 */
	attr : function(el, attr, value) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		if(!me.isDefined(value)) {
			if(me.isObj(attr)) {
				for(var l in attr) {
					el.setAttribute(l, attr[l]);
				}
			} else {
				return el.getAttribute(attr);
			}
		} else {
			if(value == null) {
				el.removeAttribute(attr);
			} else {
				el.setAttribute(attr, value);
			}
		}
	},
	/**
	 * set/get style
	 */
	css : function(el, attr, value) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		if(value == null) {
			if(me.isObj(attr)) {
				for(var l in attr) {
					el.style[l] = attr[l];
				}
			} else {
				var re = getComputedStyle(el, null)[attr]
				return parseFloat(re);
			}
		} else {
			el.style[attr] = value;
		}
	},
	/**
	 * 取值
	 * div等取innerHTML
	 * textarea等form元素取value
	 */
	val : function(el) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		if(me.isNode(el) && ('value' in el)) {
			return el.value;
		} else if(me.isNodeList(el) && el.length > 1) {
			var a = [];
			for(var i = 0; i < el.length; i++) {
				if(el[i].checked && el[i].value) {
					a.push(el[i].value);
				}
			}
			return a.join(',');
		} else if(el.length == 1) {
			return me.val(el[0]);
		}
		return el.innerHTML;
	},
	/**
	 * insert element
	 */
	insEl : function(config) {
		var me = this, defaultConfig = {
			pos : "last",
			what : null,
			where : null
		}
		config = me.join(defaultConfig, config);
		var what = config.what, where = config.where;
		if(what != null && "nodeType" in where) {
			switch (config.pos.toString().toLowerCase()) {
				case "first" :
					if(me.isStr(what)) {
						where.insertAdjacentHTML("afterBegin", what);
					} else {
						where.insertAdjacentElement("afterBegin", what);
					}
					break;
				case "before" :
				case "previous" :
					if(me.isStr(what)) {
						where.insertAdjacentHTML("beforeBegin", what);
					} else {
						where.insertAdjacentElement("beforeBegin", what);
					}
					break;
				case "after" :
				case "nextsibling" :
					if(me.isStr(what)) {
						where.insertAdjacentHTML("afterEnd", what);
					} else {
						where.insertAdjacentElement("afterEnd", what);
					}
					break;
				case "last" :
					if(me.isStr(what)) {
						where.insertAdjacentHTML("beforeEnd", what);
					} else {
						where.insertAdjacentElement("beforeEnd", what);
					}
					break;
				default:
				//i don`t know how to do that
			}
		}
	},
	/**
	 * replace element
	 */
	rpEl : function(element, html) {
		var me = this;
		if(me.isEmpty(element) || me.isEmpty(html)) {
			return;
		}
		if($kit.isStr(html)) {
			var range = element.ownerDocument.createRange();
			range.selectNodeContents(element);
			element.parentNode.replaceChild(range.createContextualFragment(html), element);
			range.detach();
		} else if($kit.isNode(html)) {
			element.parentNode.replaceChild(html, element);
		}
	},
	/**
	 * remove node
	 */
	rmEl : function(element) {
		var me = this;
		if(me.isEmpty(element)) {
			return;
		}
		if(me.isAry(element)) {
			for(var i = 0; i < element.length; i++) {
				me.rmEl(element[i]);
			}
		} else {
			me.traversal({
				root : element,
				fn : function(node) {
					me.delEv({
						el : node
					});
				}
			});
			element.parentNode.removeChild(element, true);
		}
	},
	/**
	 * add className
	 */
	adCls : function(el, cls) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		/*
		 if(me.isAry(clss)) {
		 for(var i = 0; i < clss.length; i++) {
		 me.adCls(el, clss[i]);
		 }
		 } else {
		 var a = me.isEmpty(el.className) ? [] :
		 el.className.split(me.CONSTANTS.REGEXP_SPACE), flag = true;
		 for(var i = 0; i < a.length; i++) {
		 if(a[i] == clss) {
		 flag = false;
		 break;
		 }
		 }
		 if(flag) {
		 a.push(clss);
		 el.className = a.join(" ");
		 }
		 }*/
		var re = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		if(re.test(el.className))
			return;
		//el.className += ' ' + cls;
		el.className = el.className.split(/\s+/).join(' ') + ' ' + cls;
	},
	/**
	 * remove className
	 */
	rmCls : function(el, cls) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		/*
		 var a = me.isEmpty(el.className) ? [] :
		 el.className.split(me.CONSTANTS.REGEXP_SPACE), b = [];
		 if(a.length) {
		 b = me.aryDel(a, clss);
		 }
		 if(b.length) {
		 el.className = b.join(" ");
		 } else {
		 el.className = "";
		 me.attr(el, 'class', null);
		 }*/
		var re = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		if(el.className)
			el.className = el.className.replace(re, ' ');
	},
	/**
	 * has class true?
	 */
	hsCls : function(el, cls) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		/*
		 if(!me.isEmpty(el.className)) {
		 var a = el.className.split(me.CONSTANTS.REGEXP_SPACE);
		 for(var i = 0; i < a.length; i++) {
		 if(a[i] == cls) {
		 flag = true;
		 break;
		 }
		 }
		 }
		 return flag;
		 */
		var re = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		return re.test(el.className);
	},
	/**
	 * 切换css，有则删，无则加
	 */
	toggleCls : function(el, cls) {
		var me = this;
		if(me.hsCls(el, cls)) {
			me.rmCls(el, cls);
		} else {
			me.adCls(el, cls);
		}
	},
	/**
	 * Dom traversal
	 */
	traversal : function(config) {
		var me = this, defaultConfig = {
			root : document.body
		}
		me.merge(config, defaultConfig);
		if(me.isEmpty(config.node)) {
			config.node = config.root;
		}
		if($kit.isFn(config.fn)) {
			config.fn.apply(o, [o, config.root])
		} else {
			return;
		}
		for(var i = 0; i < config.node.childNodes.length; i++) {
			var o = config.node.childNodes[i];
			me.traversal(me.merge(config, {
				node : o
			}));
		}

	},
	/**
	 * nextElementSibling/Dom traversal
	 */
	nextEl : function(el, condition, scope) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		var next = null;
		if(el.nextElementSibling != null) {
			next = el.nextElementSibling;
		} else {
			var parent = el.parentNode;
			while(parent != null && parent.parentNode != null && parent == parent.parentNode.lastElementChild) {
				parent = parent.parentNode;
			}
			var firstEl = parent.nextElementSibling.firstElementChild;
			while(firstEl != null && firstEl.children.length > 0 && firstEl.firstElementChild != null) {
				firstEl = firstEl.firstElementChild;
			}
			next = firstEl;
		}
		if(next != null) {
			var condition = condition || null, scope = scope || null;
			if(me.isFn(condition)) {
				if(condition.call(scope, next, el) == true) {
					return next;
				} else if(condition.call(scope, next, el) == false) {
					return null;
				} else {
					var allNodes = document.getElementsByTagName("*");
					if(next != allNodes[allNodes.length - 1]) {
						return me.nextEl(next, condition, scope);
					} else {
						return null;
					}
				}
			}
		}
		return next;
	},
	/**
	 * previousElementSibling/Dom traversal
	 */
	prevEl : function(el, condition, scope) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		var prev = null;
		if(el.previousElementSibling != null) {
			prev = el.previousElementSibling;
		} else {
			var parent = el.parentNode;
			while(parent != null && parent.parentNode != null && parent == parent.parentNode.firstElementChild) {
				parent = parent.parentNode;
			}
			var lastEl = parent.previousElementSibling.lastElementChild;
			while(lastEl != null && lastEl.children.length > 0 && lastEl.lastElementChild != null) {
				lastEl = lastEl.lastElementChild;
			}
			prev = lastEl;
		}
		if(prev != null) {
			var condition = condition || null, scope = scope || null;
			if(me.isFn(condition)) {
				if(condition.call(scope, prev, el) == true) {
					return prev;
				} else if(condition.call(scope, prev, el) == false) {
					return null;
				} else {
					var allNodes = document.getElementsByTagName("*");
					if(prev != allNodes[0]) {
						return me.prevEl(prev, condition, scope);
					} else {
						return null;
					}
				}
			}
		}
		return prev;
	},
	/**
	 * parentNode search
	 */
	parentEl : function(el, condition, scope) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		var parent = null;
		if(el.parentNode != null && el.parentNode != el) {
			parent = el.parentNode;
			var condition = condition || null, scope = scope || null;
			if(me.isFn(condition)) {
				if(condition.call(scope, parent, el) == true) {
					return parent;
				} else if(condition.call(scope, parent, el) == false) {
					return null;
				} else {
					return me.parentEl(parent, condition, scope);
				}
			}
		}
		return parent;
	},
	/**
	 * return a documentFragment with html
	 */
	newHTML : function(html) {
		var me = this;
		if(me.isEmpty(html)) {
			return;
		}
		var box = document.createElement("div");
		box.innerHTML = html;
		var o = document.createDocumentFragment();
		while(box.childNodes && box.childNodes.length) {
			o.appendChild(box.childNodes[0]);
		}
		box = null;
		return o;
	},
	/**
	 * offset
	 */
	offset : function(el) {
		var me = this;
		if(me.isEmpty(el)) {
			return;
		}
		var top = el.offsetTop, //
		left = el.offsetLeft, //
		width = el.offsetWidth, //
		height = el.offsetHeight;
		while(el.offsetParent != null && el.offsetParent != document.body) {
			el = el.offsetParent;
			top += el.offsetTop;
			left += el.offsetLeft;
		}
		return {
			top : top,
			left : left,
			width : width,
			height : height,
			bottom : top + height,
			right : left + width
		}
	},
	/**
	 * 获取可视区域信息
	 */
	viewport : function() {
		var cWidth, cHeight, sWidth, sHeight, sLeft, sTop;
		if(document.compatMode == "BackCompat") {
			cWidth = document.body.clientWidth;
			cHeight = document.body.clientHeight;
			sWidth = document.body.scrollWidth;
			sHeight = document.body.scrollHeight;
			sLeft = document.body.scrollLeft;
			sTop = document.body.scrollTop;
		} else {//document.compatMode == "CSS1Compat"
			cWidth = document.documentElement.clientWidth;
			cHeight = document.documentElement.clientHeight;
			sWidth = document.documentElement.scrollWidth;
			sHeight = document.documentElement.scrollHeight;
			sLeft = document.documentElement.scrollLeft == 0 ? document.body.scrollLeft : document.documentElement.scrollLeft;
			sTop = document.documentElement.scrollTop == 0 ? document.body.scrollTop : document.documentElement.scrollTop;
		}
		return {
			clientWidth : cWidth,
			clientHeight : cHeight,
			scrollWidth : sWidth,
			scrollHeight : sHeight,
			scrollLeft : sLeft,
			scrollTop : sTop
		}
	},
	// -----------------------------------event-----------------------------------
	// -----------------------------------event-----------------------------------
	/**
	 * register event
	 *
	 * @el : event triggle element
	 * @ev : event
	 * @fn : event call out function
	 * @scope : execute context
	 */
	ev : function(config) {
		var me = this, defaultConfig = {
			el : window,
			ev : null,
			fn : null
		}
		config = me.join(defaultConfig, config);
		if(me.isAry(config.el)) {
			for(var i = 0; i < config.el.length; i++) {
				me.ev(me.join(config, {
					el : config.el[i]
				}));
			}
		} else if(me.isCanSplit2Ary(config.el)) {
			var a = config.el.split(me.CONSTANTS.REGEXP_SPACE)
			for(var i = 0; i < a.length; i++) {
				var _el = me.el8id(a[i]);
				if(!me.isEmpty(_el)) {
					me.ev(me.join(config, {
						el : _el
					}));
				}
			}
		} else if(me.isStr(config.el)) {
			var _el = me.el(config.el);
			if(me.isEmpty(_el)) {
				_el = me.el("#" + config.el);
			}
			if(!me.isEmpty(_el)) {
				me.ev(me.join(config, {
					el : _el
				}));
			}
		} else if(me.isAry(config.ev)) { a
			for(var i = 0; i < config.ev.length; i++) {
				me.ev(me.join(config, {
					ev : config.ev[i]
				}));
			}
		} else if(me.isCanSplit2Ary(config.ev)) {
			var a = config.ev.split(me.CONSTANTS.REGEXP_SPACE);
			for(var i = 0; i < a.length; i++) {
				me.ev(me.join(config, {
					ev : a[i]
				}));
			}
		} else {
			if(!me.isEmpty(config.el) && !me.isEmpty(config.ev) && !me.isEmpty(config.fn)) {
				config.ev = config.ev.toString().trim();
				// -------webkit support stopImmediatePropagation, so comment
				// this template
				var evReg = config.el[me.CONSTANTS.KIT_EVENT_REGISTER] = config.el[me.CONSTANTS.KIT_EVENT_REGISTER] || {};
				var evRegEv = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_EVENT] = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_EVENT] || {};
				var evRegFn = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION] = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION] || {};
				evRegEv[config.ev] = evRegEv[config.ev] || [];
				evRegFn[config.ev] = evRegFn[config.ev] || (function() {
					/*try {*/
					// stop global event on-off
					if(window[me.CONSTANTS.KIT_EVENT_STOPALLEVENT]) {
						return;
					}
					var EV = arguments[0] || window.event;

					me.merge(EV, {
						target : EV.target || EV.srcElement,
						currentTarget : config.el,
						relatedTarget : EV.relatedTarget ? EV.relatedTarget : EV.toElement || EV.fromElement,
						stopNow : function() {
							EV.stopPropagation && EV.stopPropagation();
							EV.preventDefault && EV.preventDefault();
							//
							EV.cancelBubble = true;
							EV.returnValue = false;
							//
							window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = true;
						},
						stopDefault : function() {
							EV.preventDefault && EV.preventDefault();
							EV.returnValue = false;
						},
						stopGoOn : function() {
							EV.preventDefault && EV.preventDefault();
							EV.stopPropagation && EV.stopPropagation();
							//
							EV.cancelBubble = true;
							EV.returnValue = false;
						}
					}, me.evExtra(EV));
					var target = config.el;
					var evQueue = target[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
					var returnValue;
					for(var i = 0; i < evQueue.length; i++) {
						if(window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION]) {
							break;
						}
						var _evConfig = evQueue[i];
						returnValue = _evConfig.fn.call(_evConfig.scope || _evConfig.el, EV, _evConfig);
					}
					window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = false;
					/*
					 } catch(e) {
					 alert(e);
					 throw e;
					 };*/
					return returnValue;
				});
				if(document.attachEvent) {
					config.el.attachEvent('on' + config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev]);
				} else {
					config.el.addEventListener(config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev], false);
				}
				evRegEv[config.ev].push(config);
			} else {
				if(!me.isEmpty(config.el) && !me.isEmpty(config.ev) && me.isEmpty(config.fn)) {
					if(window[me.CONSTANTS.KIT_EVENT_STOPALLEVENT]) {
						return;
					}
					// var evt = document.createEvent('Event');
					// evt.initEvent(config.ev, true, true);
					// config.el.dispatchEvent(evt);
					me.newEv({
						el : config.el,
						type : 'Events',
						ev : config.ev,
						bubbles : true,
						cancelable : true
					});
				}
			}
		}
	},
	/**
	 * remove event register
	 */
	delEv : function(config) {
		var me = this, defaultConfig = {
			el : window,
			ev : null,
			fn : null,
			scope : this
		}
		config = me.join(defaultConfig, config);
		if(me.isAry(config.el)) {
			for(var i = 0; i < config.el.length; i++) {
				me.delEv(me.join(config, {
					el : config.el[i]
				}));
			}
		} else if(me.isCanSplit2Ary(config.el)) {
			var a = config.el.split(me.CONSTANTS.REGEXP_SPACE)
			for(var i = 0; i < a.length; i++) {
				var _el = me.el8id(a[i]);
				if(!me.isEmpty(_el)) {
					me.delEv(me.join(config, {
						el : _el
					}));
				}
			}
		} else if(me.isStr(config.el)) {
			var _el = me.el8id(config.el);
			if(me.isEmpty(_el)) {
				_el = me.el("#" + config.el);
			}
			if(!me.isEmpty(_el)) {
				me.delEv(me.join(config, {
					el : _el
				}));
			}
		} else if(me.isAry(config.ev)) {
			for(var i = 0; i < config.ev.length; i++) {
				me.delEv(me.join(config, {
					ev : config.ev[i]
				}));
			}
		} else if(me.isCanSplit2Ary(config.ev)) {
			var a = config.ev.split(me.CONSTANTS.REGEXP_SPACE)
			for(var i = 0; i < a.length; i++) {
				me.delEv(me.join(config, {
					ev : a[i]
				}));
			}
		} else {
			if(!me.isEmpty(config.ev)) {
				config.ev = config.ev.toString().trim();
				if(!me.isEmpty(config.fn)) {
					var evQueue = config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
					for(var i = 0; i < evQueue.length; i++) {
						var _config = evQueue[i];
						if(_config.fn == config.fn || _config.fn.toString() == config.fn.toString() || me.trimAll(_config.fn.toString()) == me.trimAll(config.fn.toString())) {
							evQueue.splice(i, 1);
						}
					}
					if(evQueue.length == 0) {
						delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
						rm(config.el, config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev]);
						delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev];
					}
				} else {
					delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
					rm(config.el, config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev]);
					delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev];
				}
			} else {
				if($kit.isEmpty(config.el[me.CONSTANTS.KIT_EVENT_REGISTER]) || $kit.isEmpty(config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT])) {
					return;
				}
				for(var _ev in config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT]) {
					rm(config.el, _ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][_ev]);
				}
				delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT];
				delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION];
			}
		}
		function rmEv(el, e, fn) {
			if(document.attachEvent) {
				el.detachEvent('on' + e, fn);
			} else {
				el.removeEventListener(e, fn, false);
			}
		}

	},
	newEv : function(config) {
		var me = this, defaultConfig = {
			el : window,
			type : 'Events',
			ev : null,
			bubbles : false,
			cancelable : false
		}
		config = me.join(defaultConfig, config);
		if(!$kit.isEmpty(config.ev)) {
			if(document.createEvent) {
				var e = document.createEvent(config.type);
				e.initEvent(config.ev, config.bubbles, config.cancelable);
				config.el.dispatchEvent(e);
			} else {
				config.el.fireEvent('on' + config.ev);
			}
		}
	},
	/**
	 * set event extra info
	 * @private
	 */
	evExtra : function(ev) {
		var me = this;
		return me.merge({}, me.evPos(ev))
	},
	/**
	 * get event coordinate info
	 * @private
	 */
	evPos : function(ev) {
		if(ev.type.indexOf("touch") == 0 && ev.targetTouches && ev.targetTouches.length) {
			return {
				firstFingerClientX : ev.targetTouches[0].clientX,
				firstFingerClientY : ev.targetTouches[0].clientY,
				firstFingerPageX : ev.targetTouches[0].pageX,
				firstFingerPageY : ev.targetTouches[0].pageY
			}
		}
		return {
			firstFingerClientX : ev.clientX,
			firstFingerClientY : ev.clientY,
			firstFingerPageX : ev.pageX,
			firstFingerPageY : ev.pageY
		}
	},
	// -----------------------------------object manipulate-----------------------------------
	/**
	 * combine object
	 */
	join : function() {
		var a = arguments, b = {};
		if(a.length == 0) {
			return;
		}
		for(var i = 0; i < a.length; i++) {
			for(var r in a[i]) {
				if(!$kit.isEmpty(a[i][r])) {
					b[r] = a[i][r];
				}
			}
		}
		return b;
	},
	/**
	 * draw from another
	 */
	merge : function() {
		var a = arguments;
		if(a.length < 2) {
			return;
		}
		if(a[0] != null) {
			for(var i = 1; i < a.length; i++) {
				for(var r in a[i]) {
					a[0][r] = a[i][r];
				}
			}
		}
		return a[0];
	},
	/**
	 * if first one has , do not override
	 */
	mergeIf : function() {
		var a = arguments;
		if(a.length < 2) {
			return;
		}
		for(var i = 1; i < a.length; i++) {
			for(var r in a[i]) {
				if(a[0][r] == null) {
					a[0][r] = a[i][r];
				}
			}
		}
		return a[0];
	},
	/**
	 * is collection include object
	 */
	/*
	has : function(collection, object, ignoreCase) {
	if( typeof (collection) == "undefined" || typeof (object) == "undefined") {
	return false;
	}
	var me = this, flag = false, ignoreCase = (ignoreCase == true ? ignoreCase : false);
	if(me.isAry(collection)) {
	for(var i = 0; i < collection.length; i++) {
	if(collection[i] == object || (ignoreCase && collection[i].toLowerCase() == object.toLowerCase())) {
	flag = true;
	break;
	}
	}
	} else {
	if(collection != null) {
	if( object in collection) {
	flag = true;
	} else if(ignoreCase) {
	for(var p in collection) {
	if(p.toString().toLowerCase() == object.toString().toLowerCase()) {
	flag = true;
	break;
	}
	}
	}
	}
	}
	return flag;
	},*/

	// -----------------------------------log-----------------------------------
	log : function(info, config) {
		try {
			var me = this;
			config = me.merge({
				borderColor : "#000",
				container : null
			}, config);
			if(me.isAry(info)) {
				info = info.join("");
			}
			if(document.body) {
				var div;
				if(config.container == null) {
					div = document.body.appendChild(document.createElement("div"));
				} else {
					div = config.container.appendChild(document.createElement("div"));
				}
				div.className = "J_Debug_Info";
				div.style.borderBottom = "1px solid " + config.borderColor || "#000";
				try {
					div.innerText += info;
				} catch (e) {
					div.innerText += e.toString();
				}
			} else {
				alert(info);
			}
		} catch(e) {
			alert("error!" + e);
			throw e;
		}
	},
	clsLog : function() {
		var me = this;
		var a = me.els8cls("J_Debug_Info");
		while(a.length) {
			a[0].parentNode.removeChild(a[0]);
		}
	},
	// -----------------------------------else-----------------------------------
	only : function() {
		var rnd = Math.random(10000);
		return rnd.toString().substr(2, 10);
	},
	/**
	 * generate unique DOM id
	 */
	onlyId : function() {
		var me = this;
		var id = me.CONSTANTS.KIT_DOM_ID_PREFIX + me.only();
		var count;
		if(arguments.length == 1) {
			count = arguments[0];
		} else {
			count = 0;
		}
		count++;
		if(count > me.CONSTANTS.MAX_CYCLE_COUNT) {
			throw "error!";
		}
		if(!me.isEmpty(me.el8id(id))) {
			return me.onlyId(count);
		}
		return id
	},
	iOSInfo : function() {
		var me = this, regExp_appleDevice = /\(([a-z; ]+)CPU ([a-z ]*)OS ([\d_]+) like Mac OS X/i;
		var ver, device, re;
		if(regExp_appleDevice.test(navigator.userAgent)) {
			var a = navigator.userAgent.match(regExp_appleDevice);
			ver = a[3].toString().trim();
			ver = ver.replace(/_/g, ".");
			device = a[1].toString().trim();
			device = device.substring(0, device.indexOf(";"));
			re = {
				device : device,
				ver : ver
			}
		}
		return re;
	},
	/**
	 * config include array, exclude, fn, scope iterator each element in array
	 * not include exclude
	 */
	// each : function(config) {
	// var me = this;
	// var a = config.array;
	// for(var i = 0; i < a.length; i++) {
	// if(me.inAry(config.exclude, a[i])) {
	// continue;
	// } else {
	// config.fn.call(config.scope || this, a[i], i, a);
	// }
	// }
	// },
	each : function(ary, fn, scope) {
		var me = this;
		if(me.isFn(fn)) {
			if(me.isAry(ary)) {
				for(var i = 0; i < ary.length; i++) {
					var re = fn.call(scope || window, ary[i], i, ary);
					if(re == false) {
						break;
					}
				}
			} else if(me.isObj(ary)) {
				var i = 0;
				for(var k in ary) {
					i++;
					var re = fn.call(scope || window, ary[k], k, ary, i);
					if(re == false) {
						break;
					}
				}
			}
		}
	},
	/**
	 * 合并字符串
	 */
	concat : function(o, connectStr, connectOper) {
		if($kit.isStr(o)) {
			return o;
		}
		var connectStr = '&' || connectStr;
		var connectOper = '=' || connectOper;
		if($kit.isAry(o)) {
			return o.join(connectStr);
		}
		var reStr = [];
		$kit.each(o, function(v, k) {
			reStr.push(k + connectOper + v);
		});
		return reStr.join(connectStr);
	},
	/**
	 * subClass inherit superClass
	 * 简单继承
	 */
	inherit : function(config) {
		var me = this, child = config.child, father = config.father;
		var _arguments = undefined || config.arguments;
		try {
			_arguments = arguments.callee.caller.arguments;
		} catch(e) {
			//don`t pass arguments of constructor
		}
		me.mergeIf(child.prototype, new father(_arguments));
		child.prototype.constructor = child;
		child.superClass = father;
	},
	/**
	 * 模板的简单实现
	 *
	 * @public
	 * @param {string}模板文本
	 * @param {object}替换对象
	 *
	 * <pre>
	 * render('this is ${obj}', {
	 * 	obj : 'car'
	 * });
	 * 结果：this is car
	 * </pre>
	 */
	tpl : function(templ, data) {
		// 充分利用变量，为单个节点提速
		// 正则尽快匹配失败
		// 理论上可以作为JSON的key，支持很多字符
		return templ.replace(/(\$)(\{([^}]*)\})/gm, function(value, clear, origin, key) {
			key = key.split('.');
			value = data[key.shift()];
			for(var i = 0; i < key.length; i++) {
				value = value[key[i]];
			}
			return (value === null || value === undefined) ? (!!clear ? '' : origin) : value;
		});
	}
}
$kit = new $Kit();
/**
 * dom ready
 */
$kit.$ = function(fn, caller) {
	var caller = document || caller;
	$kit.ev({
		el : caller,
		ev : 'DOMContentLoaded',
		fn : fn,
		scope : caller
	});
}