/*
 * Kit Js
 * a javascript library used to mobile phone web develop
 * author: xueduanyang1985@163.com
 * 3q & enjoy it!
 */
$Kit = function(config) {
	var me = this;
	var defaultConfig = {

	}
	me.config = me.join(config, defaultConfig);
	me.CONSTANTS = {
		NODETYPE_ELEMENT : 1,
		NODETYPE_ELEMENT_ATTR : 2,
		NODETYPE_TEXTNODE : 3,
		NODETYPE_COMMENT : 8,
		NODETYPE_ROOT : 9,
		NODETYPE_FRAGMENT : 11,
		//
		REGEXP_SPACE : /\s+/g,
		//
		KIT_EVENT_REGISTER : "_kit_event_register_",
		KIT_EVENT_REGISTER_EVENT : "_kit_event_register_event",
		KIT_EVENT_REGISTER_FUNCTION : "_kit_event_register_function",
		KIT_EVENT_STOPIMMEDIATEPROPAGATION : "_kit_event_stopimmediatepropagation_",
		KIT_EVENT_STOPALLEVENT : "_kit_event_stopallevent_",
		KIT_DOM_ID_PREFIX : "J_Kit_"
	}
	// -----------------------------init------------------------------------
	window[me.CONSTANTS.KIT_EVENT_STOPALLEVENT] = false;
	window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = false;
	me.SYSINFO = {}
	var inf = me.iOSInfo();
	if(inf != null) {
		me.merge(me.SYSINFO, inf);
	}
	/**
	 * dom ready
	 */
	me.$ = function(fn) {
		me.ev({
			ev : "load",
			fn : fn
		});
	}
}
$Kit.prototype = {
	// -----------------------------------string-----------------------------------
	trim : function(str) {
		if(str == null) {
			return null;
		}
		return str.replace(/^\s+|\s+$/g, "");
	},
	ltrim : function(str) {
		if(str == null) {
			return null;
		}
		return str.replace(/^\s+/, "");
	},
	rtrim : function(str) {
		if(str == null) {
			return null;
		}
		return str.replace(/\s+$/, "");
	},
	trimAll : function(str) {
		return str.replace(/\s+/ig, "");
	},
	// -----------------------------------array-----------------------------------
	/**
	 * remove some from array
	 */
	arydel : function(ary, del) {
		var me = this;
		if(me.isAry(del)) {
			for(var i = 0; i < del.length; i++) {
				me.arydel(ary, del[i]);
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
	inAry : function(a, o) {
		var me = this, flag = false;
		for(var i = 0; i < a.length; i++) {
			if(me.isAry(o)) {
				for(var j = 0; j < o.length; j++) {
					if(a[i] == o[j]) {
						flag = true;
						break;
					}
				}
			} else {
				if(a[i] == o) {
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
		return (root || document).getElementById(id);
	},
	/**
	 * by cls
	 */
	el8cls : function(cls, root) {
		var a = (root || document).getElementsByClassName(cls);
		return (a == null && a.length == 0) ? null : a[0];
	},
	/**
	 * by tagName
	 */
	els8tag : function(tagName, root) {
		return (root || document).getElementsByTagName(tagName);
	},
	el8tag : function(tagName, root) {
		var me = this;
		var re = me.els8tag(tagName, root);
		return re != null && re.length > 0 ? re[0] : null;
	},
	/**
	 * els by cls
	 */
	els8cls : function(cls, root) {
		return (root || document).getElementsByClassName(cls);
	},
	/**
	 * els by name
	 */
	els8name : function(name, root) {
		return (root || document).getElementsByName(name);
	},
	/**
	 * parentNode search
	 */
	parentEl : function(config) {
		var me = this;
		var defaultConfig = {
			root : document.body,
			condition : null,
			el : null,
			scope : window
		};
		me.mergeIf(config, defaultConfig);
		var el = config.el, n = 0, scope = config.scope, root = config.root;
		if(el != null && config.condition == null && me.isFn(condition)) {
			do {
				if(condition.apply(scope, [el, n, root]) == true) {
					break;
				} else {
					if(el.parentNode != null && el != root) {
						el = el.parentNode;
					} else {
						el = null;
					}
				}
			} while(el!=null);
		}
		return el;
	},
	// -----------------------------------is something-----------------------------------
	/**
	 * boolean isString
	 */
	isStr : function(o) {
		return typeof (o) == "string";
	},
	/**
	 * boolean isObject
	 */
	isObj : function(o) {
		return typeof (o) == "object";
	},
	/**
	 * boolean is function
	 */
	isFn : function(o) {
		return typeof (o).toLowerCase() == "function";
	},
	/**
	 * is it can iterator
	 */
	isAry : function(o) {
		var me = this;
		return typeof (o) == "array" || (me.isObj(o) && o != null && "length" in o && o.length > 0);
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
	// -----------------------------------dom manipulate-----------------------------------
	/**
	 * get/set attr
	 */
	attr : function(el, attr, value) {
		var me = this;
		if(el != null) {
			if(value == null) {
				if(me.isObj(attr)) {
					for(var l in attr) {
						el.setAttribute(l, attr[l]);
					}
				} else {
					return el.getAttribute(attr);
				}
			} else {
				el.setAttribute(attr, value);
			}
		}
		return null;
	},
	/**
	 * set/get style
	 */
	css : function(el, attr, value) {
		var me = this;
		if(el != null) {
			if(value == null) {
				if(me.isObj(attr)) {
					for(var l in attr) {
						el.style[l] = attr[l];
					}
				} else {
					return document.defaultView.getComputedStyle(el, null)[attr];
				}
			} else {
				el.style[attr] = value;
			}
		}
		return null;
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
		var range = element.ownerDocument.createRange();
		range.selectNodeContents(element);
		element.parentNode.replaceChild(range.createContextualFragment(html), element);
		range.detach();
	},
	/**
	 * remove node
	 */
	rmEl : function(element) {
		element.parentNode.removeChild(element, true);
	},
	/**
	 * add className
	 */
	adCls : function(el, clss) {
		var me = this;
		if(me.isAry(clss)) {
			for(var i = 0; i < clss.length; i++) {
				me.adCls(el, clss[i]);
			}
		} else {
			var a = el.className.split(me.CONSTANTS.REGEXP_SPACE), flag = true;
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
		}
	},
	/**
	 * remove className
	 */
	rmCls : function(el, clss) {
		var me = this;
		var a = el.className.split(me.CONSTANTS.REGEXP_SPACE), b = [];
		if(a.length) {
			b = me.arydel(a, clss);
		}
		if(b.length) {
			el.className = b.join(" ");
		} else {
			el.className = "";
		}
	},
	/**
	 * has class true?
	 */
	hasCls : function(el, cls) {
		var me = this, flag = false;
		var a = el.className.split(me.CONSTANTS.REGEXP_SPACE);
		for(var i = 0; i < a.length; i++) {
			if(a[i] == cls) {
				flag = true;
				break;
			}
		}
		return flag;
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
		for(var i = 0; i < config.node.childNodes.length; i++) {
			var o = config.node.childNodes[i];
			if(o.childNodes.length) {
				me.traversal(me.merge(config, {
					node : o
				}));
			} else {
				if(!me.isEmpty(config.fn)) {
					config.fn.apply(o, [o, config.root])
				}
			}
		}
	},
	/**
	 * nextElementSibling/Dom traversal
	 */
	nextEl : function(el) {
		var nextEl = null;
		if(el.nextElementSibling != null) {
			nextEl = el.nextElementSibling;
		} else {
			var parent = el.parentNode;
			while(parent != null && parent.parentNode != null && parent == parent.parentNode.lastElementChild) {
				parent = parent.parentNode;
			}
			var firstEl = parent.nextElementSibling.firstElementChild;
			while(firstEl != null && firstEl.children.length > 0 && firstEl.firstElementChild != null) {
				firstEl = firstEl.firstElementChild;
			}
			nextEl = firstEl;
		}
		return nextEl;
	},
	/**
	 * previousElementSibling/Dom traversal
	 */
	prevEl : function(el) {
		var prevEl = null;
		if(el.previousElementSibling != null) {
			prevEl = el.previousElementSibling;
		} else {
			var parent = el.parentNode;
			while(parent != null && parent.parentNode != null && parent == parent.parentNode.firstElementChild) {
				parent = parent.parentNode;
			}
			var lastEl = parent.previousElementSibling.lastElementChild;
			while(lastEl != null && lastEl.children.length > 0 && lastEl.lastElementChild != null) {
				lastEl = lastEl.lastElementChild;
			}
			prevEl = lastEl;
		}
		return prevEl;
	},
	/**
	 * return a documentFragment with html
	 */
	newHTML : function(html) {
		var box = document.createElement("div");
		box.innerHTML = html;
		var o = document.createDocumentFragment();
		while(box.childNods.length) {
			o.appendChild(box.childNodes[0]);
		}
		box = null;
		return o;
	},
	/**
	 * offset
	 */
	offset : function(el) {
		if(el == null) {
			return;
		}
		var offsetPar = el.offsetParent, //
		top = el.offsetTop, //
		left = el.offsetLeft, //
		width = el.offsetWidth, //
		height = el.offsetHeight;
		while(el != offsetPar) {
			el = offsetPar;
			top += el.offsetTop;
			left += el.offsetLeft;
		}
		return {
			top : top,
			left : left,
			width : width,
			height : height
		}
	},
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
			var _el = me.el8id(config.el);
			if(!me.isEmpty(_el)) {
				me.ev(me.join(config, {
					el : _el
				}));
			}
		} else if(me.isAry(config.ev)) {
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
			config.ev = me.trim(config.ev);
			if(!me.isEmpty(config.ev)) {
				// -------webkit support stopImmediatePropagation, so comment this template
				var evReg = config.el[me.CONSTANTS.KIT_EVENT_REGISTER] = config.el[me.CONSTANTS.KIT_EVENT_REGISTER] || {};
				var evRegEv = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_EVENT] = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_EVENT] || {};
				var evRegFn = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION] = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION] || {};
				evRegEv[config.ev] = evRegEv[config.ev] || [];
				evRegFn[config.ev] = evRegFn[config.ev] || (function() {
					// stop global event on-off
					if(window[me.CONSTANTS.KIT_EVENT_STOPALLEVENT]) {
						return;
					}
					var EV = arguments[0];
					me.merge(EV, {
						stopNow : function() {
							EV.stopPropagation();
							EV.preventDefault();
							window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = true;
						},
						stopDefault : function() {
							EV.preventDefault();
						},
						stopGoOn : function() {
							EV.stopPropagation();
						}
					});
					var target = config.el;
					var evQueue = target[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
					for(var i = 0; i < evQueue.length; i++) {
						if(window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION]) {
							break;
						}
						var _evConfig = evQueue[i];
						_evConfig.fn.call(_evConfig.scope || _evConfig.el, EV);
					}
					window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = false;
				});
				config.el.addEventListener(config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev], false);
				evRegEv[config.ev].push(config);
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
			config.ev = me.trim(config.ev);
			if(!me.isEmpty(config.ev)) {
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
						config.el.removeEventListener(config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev], false);
						delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev];
					}
				} else {
					delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
					config.el.removeEventListener(config.ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev], false);
					delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][config.ev];
				}
			} else {
				for(var _ev in config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT]) {
					config.el.removeEventListener(_ev, config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION][_ev], false);
				}
				delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT];
				delete config.el[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION];
			}
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
				b[r] = a[i][r];
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
		for(var i = 1; i < a.length; i++) {
			for(var r in a[i]) {
				a[0][r] = a[i][r];
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
	has : function(collection, object, ignoreCase) {
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
	},
	// -----------------------------------log-----------------------------------
	log : function(info, config) {
		try {
			var me = this;
			config = me.merge({
				borderColor : "#000"
			}, config);
			if(me.isAry(info)) {
				info = info.join("");
			}
			if(document.body) {
				var div = document.body.appendChild(document.createElement("div"));
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
		for(var i = 0; i < a.length; i++) {
			a[i].parentNode.removeChild(a[i]);
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
		var id = me.CONSTANTS.KIT_DOM_ID_PREFIX + me.only();
		var count;
		if(arguments.length == 1) {
			count = arguments[0];
		} else {
			count = 0;
		}
		count++;
		if(count > 100) {
			throw "error!";
		}
		if(!me.isEmpty(el8id(id))) {
			return me.onlyId(count);
		}
		return id
	},
	iOSInfo : function() {
		var me = this, regExp_appleDevice = /\(([a-z; ]+)CPU ([a-z ]*)OS ([\d_]+) like Mac OS X/i;
		var ver, device, re;
		if(regExp_appleDevice.test(navigator.userAgent)) {
			var a = navigator.userAgent.match(regExp_appleDevice);
			ver = me.trim(a[3]);
			ver = ver.replace(/_/g, ".");
			device = me.trim(a[1]);
			device = device.substring(0, device.indexOf(";"));
			re = {
				device : device,
				ver : ver
			}
		}
		return re;
	},
	/**
	 * config include array, exclude, fn, scope iterator each element in array not include exclude
	 */
	each : function(config) {
		var me = this, a = config.array;
		for(var __i = 0; __i < a.length; __i++) {
			if(me.inAry(config.exclude, a[__i])) {
				continue;
			} else {
				config.fn.call(config.scope || this, a[__i], __i, a);
			}
		}
	},
	/**
	 * subClass inherit superClass
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
	}
}
$kit = new $Kit();
/**
 * register widget
 */
$kit.ui = {};
