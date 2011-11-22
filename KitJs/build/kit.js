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
	//----------------------CONSTANTS----------------------
	CONSTANTS : {
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
	},
	// -----------------------------------string-----------------------------------
	trim : function(str) {
		if(str == null) {
			return null;
		}
		str = str.toString();
		if(str.trim) {
			return str.trim();
		}
		return str.replace(/^\s+|\s+$/g, "");
	},
	ltrim : function(str) {
		if(str == null) {
			return null;
		}
		str = str.toString();
		if(str.trimLeft) {
			return str.trimLeft();
		}
		return str.replace(/^\s+/, "");
	},
	rtrim : function(str) {
		if(str == null) {
			return null;
		}
		str = str.toString();
		if(str.trimRight) {
			return str.trimRight();
		}
		return str.replace(/\s+$/, "");
	},
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
	 * elect interface
	 */
	el : function(selector, root) {
		var me = this;
		var selector = me.trim(selector);
		if(selector.indexOf("#") == 0) {
			return me.el8id(selector.substring(1), root);
		} else if(selector.indexOf(".") == 0) {
			return me.els8cls(selector.substring(1), root);
		} else {
			return me.els8tag(selector, root);
		}
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
	isDefined : function(o) {
		return typeof (o) != "undefined";
	},
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
		var me = this;
		return me.isDefined(o) && typeof (o).toLowerCase() == "function";
	},
	/**
	 * is it can iterator
	 */
	isAry : function(o) {
		var me = this;
		return me.isDefined(o) && (o.constructor.name == "Array" || o.constructor.name == "NodeList");
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
					return getComputedStyle(el, null)[attr];
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
		if(el.className != "" && el.className != null) {
			var a = el.className.split(me.CONSTANTS.REGEXP_SPACE);
			for(var i = 0; i < a.length; i++) {
				if(a[i] == cls) {
					flag = true;
					break;
				}
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
			config.ev = me.trim(config.ev);
			if(!me.isEmpty(config.ev) && !me.isEmpty(config.fn)) {
				// -------webkit support stopImmediatePropagation, so comment this template
				var evReg = config.el[me.CONSTANTS.KIT_EVENT_REGISTER] = config.el[me.CONSTANTS.KIT_EVENT_REGISTER] || {};
				var evRegEv = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_EVENT] = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_EVENT] || {};
				var evRegFn = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION] = evReg[me.CONSTANTS.KIT_EVENT_REGISTER_FUNCTION] || {};
				evRegEv[config.ev] = evRegEv[config.ev] || [];
				evRegFn[config.ev] = evRegFn[config.ev] || (function() {
					try {
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
								EV.preventDefault();
								EV.stopPropagation();
							},
						}, me.evExtra(EV));
						var target = config.el;
						var evQueue = target[me.CONSTANTS.KIT_EVENT_REGISTER][me.CONSTANTS.KIT_EVENT_REGISTER_EVENT][config.ev];
						for(var i = 0; i < evQueue.length; i++) {
							if(window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION]) {
								break;
							}
							var _evConfig = evQueue[i];
							_evConfig.fn.call(_evConfig.scope || _evConfig.el, EV, _evConfig);
						}
						window[me.CONSTANTS.KIT_EVENT_STOPIMMEDIATEPROPAGATION] = false;
					} catch(e) {
						alert(e);
						throw e;
					};
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
	/**
	 * set event extra info
	 */
	evExtra : function(ev) {
		var me = this;
		return me.merge({}, me.evPos(ev))
	},
	/**
	 * get event coordinate info
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
	},
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
		if(count > 100) {
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
/**
 * javascript animation 动画扩展
 */
$kit.merge($Kit.prototype.CONSTANTS, {
	KIT_EVENT_EXTRA : "KIT_EVENT_EXTRA",
	CLOCKWISE_ROTATION : 1,
	COUNTERCLOCKWISE_ROTATION : -1
});
$kit.merge($Kit.prototype, {
	/**
	 * 动画
	 */
	anim : function(config) {
		var me = this;
		var defaultConfig = {
			timeSeg : 17,
			duration : 1000,
			el : undefined,
			from : undefined,
			to : undefined,
			fx : undefined,
			then : undefined,
			scope : window
		};
		me.mergeIf(config, defaultConfig);
		if (!me.isEmpty(config.el)) {
			config.hold = 0;
			config.timeout = setInterval(function() {
				config.hold += config.timeSeg;
				if (config.hold >= config.duration) {
					for ( var p in config.to) {
						config.el.style[p] = config.to[p];
					}
					clearInterval(config.timeout);
					config.then.call(config.scope, config);
				} else {
					for ( var p in config.to) {
						var sty = me.identifyCssValue(config.from[p]), sty1 = me.identifyCssValue(config.to[p]), reSty = "";
						for ( var i = 0; i < sty1.length; i++) {
							if (i > 0) {
								reSty += " ";
							}
							var o = sty1[i];
							o.value = me.fx(config.fx)(config.hold, (sty == null ? 0 : sty[i].value), (sty == null ? sty1[i].value : (sty1[i].value - sty[i].value)), config.duration)
							reSty += o.prefix + o.value + o.unit + o.postfix;
						}
						config.el.style[p] = reSty;
					}
				}
			}, config.timeSeg);
			return config;
		}
	},
	/**
	 * 分解css的值，知道哪个是value(数字)，那个是单位
	 */
	identifyCssValue : function(cssStr) {
		var me = this;
		if (typeof (cssStr) != "undefined") {
			cssStr = cssStr.toString();
			var a1 = cssStr.match(/([a-z\(]*)([+-]?\d+\.?\d*)([a-z]*)([a-z\)]*)/ig);
			if (a1 != null) {
				var reSty = [];
				for ( var i = 0; i < a1.length; i++) {
					var a = a1[i].match(/([a-z\(]*)([+-]?\d+\.?\d*)([a-z]*)([a-z\)]*)/i);
					var sty = {
						style : a[0],
						prefix : a[1],
						value : parseFloat(a[2]),
						unit : a[3],
						postfix : a[4]
					}
					reSty.push(sty);
				}
				return reSty;
			}
		}
		return null;
	},
	/**
	 * 曲线函数
	 */
	Fx : {
		swing : function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		easeInQuad : function(t, b, c, d) {
			return c * (t /= d) * t + b;
		},
		easeOutQuad : function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		easeInOutQuad : function(t, b, c, d) {
			if ((t /= d / 2) < 1)
				return c / 2 * t * t + b;
			return -c / 2 * ((--t) * (t - 2) - 1) + b;
		},
		easeInCubic : function(t, b, c, d) {
			return c * (t /= d) * t * t + b;
		},
		easeOutCubic : function(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t + 1) + b;
		},
		easeInOutCubic : function(t, b, c, d) {
			if ((t /= d / 2) < 1)
				return c / 2 * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t + 2) + b;
		},
		easeInQuart : function(t, b, c, d) {
			return c * (t /= d) * t * t * t + b;
		},
		easeOutQuart : function(t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		},
		easeInOutQuart : function(t, b, c, d) {
			if ((t /= d / 2) < 1)
				return c / 2 * t * t * t * t + b;
			return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
		},
		easeInQuint : function(t, b, c, d) {
			return c * (t /= d) * t * t * t * t + b;
		},
		easeOutQuint : function(t, b, c, d) {
			return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
		},
		easeInOutQuint : function(t, b, c, d) {
			if ((t /= d / 2) < 1)
				return c / 2 * t * t * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
		},
		easeInSine : function(t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		},
		easeOutSine : function(t, b, c, d) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		},
		easeInOutSine : function(t, b, c, d) {
			return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
		},
		easeInExpo : function(t, b, c, d) {
			return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
		},
		easeOutExpo : function(t, b, c, d) {
			return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
		},
		easeInOutExpo : function(t, b, c, d) {
			if (t == 0)
				return b;
			if (t == d)
				return b + c;
			if ((t /= d / 2) < 1)
				return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
			return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc : function(t, b, c, d) {
			return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
		},
		easeOutCirc : function(t, b, c, d) {
			return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
		},
		easeInOutCirc : function(t, b, c, d) {
			if ((t /= d / 2) < 1)
				return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
			return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
		},
		easeInElastic : function(t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if (t == 0)
				return b;
			if ((t /= d) == 1)
				return b + c;
			if (!p)
				p = d * .3;
			if (a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			} else
				var s = p / (2 * Math.PI) * Math.asin(c / a);
			return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		},
		easeOutElastic : function(t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if (t == 0)
				return b;
			if ((t /= d) == 1)
				return b + c;
			if (!p)
				p = d * .3;
			if (a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			} else
				var s = p / (2 * Math.PI) * Math.asin(c / a);
			return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
		},
		easeInOutElastic : function(t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if (t == 0)
				return b;
			if ((t /= d / 2) == 2)
				return b + c;
			if (!p)
				p = d * (.3 * 1.5);
			if (a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			} else
				var s = p / (2 * Math.PI) * Math.asin(c / a);
			if (t < 1)
				return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
		},
		easeInBack : function(t, b, c, d, s) {
			if (s == undefined)
				s = 1.70158;
			return c * (t /= d) * t * ((s + 1) * t - s) + b;
		},
		easeOutBack : function(t, b, c, d, s) {
			if (s == undefined)
				s = 1.70158;
			return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		},
		easeInOutBack : function(t, b, c, d, s) {
			if (s == undefined)
				s = 1.70158;
			if ((t /= d / 2) < 1)
				return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
			return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
		},
		easeInBounce : function(t, b, c, d) {
			return c - $.easing.easeOutBounce(d - t, 0, c, d) + b;
		},
		easeOutBounce : function(t, b, c, d) {
			if ((t /= d) < (1 / 2.75)) {
				return c * (7.5625 * t * t) + b;
			} else if (t < (2 / 2.75)) {
				return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
			} else if (t < (2.5 / 2.75)) {
				return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
			} else {
				return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
			}
		},
		easeInOutBounce : function(t, b, c, d) {
			if (t < d / 2)
				return $.easing.easeInBounce(t * 2, 0, c, d) * .5 + b;
			return $.easing.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
		}
	},
	/**
	 * 根据类型返回对应的曲线函数，或者自定义函数
	 */
	fx : function(type) {
		var me = this;
		if (me.isStr(type) && me.has(me.Fx, type)) {
			return me.Fx[type];
		} else if (me.isFn(type)) {
			return type;
		}
		return me.Fx.swing;
	}
});
$_kit = $kit;
$kit = new $Kit();
$kit.mergeIf($kit, $_kit);
$_kit = null;
