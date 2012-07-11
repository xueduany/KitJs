/*
* 2012年7月开始，准备优化kit的core，独立core和UI两块发展
* @author 薛端阳<xueduanyang1985@163.com>
* @copyright 薛端阳  since 2012.07
*/

/**
 * Kit Js 基类，包含基本dom操作，object类型判断以及ready方法，还有事件委托等
 * @constructor $Kit
 * @param {Object} config 组件配置
 */
$Kit = function(config) {
	this.config = this.join(config, this.constructor.defaultConfig);
	this.CONSTANTS = this.config.CONSTANTS;
}
$Kit.defaultConfig = {
	/**
	 * KitJs内部常量
	 * @enum
	 * @const
	 * @public
	 * @type {Object}
	 */
	CONSTANTS : {
		/**
		 * 异常处理,最大循环次数
		 */
		MAX_CYCLE_COUNT : 1000,
		/**
		 * element节点
		 */
		NODETYPE_ELEMENT : 1,
		NODETYPE_ELEMENT_ATTR : 2,
		/**
		 * 文本节点
		 */
		NODETYPE_TEXTNODE : 3,
		/**
		 * 注释
		 */
		NODETYPE_COMMENT : 8,
		/**
		 * 根
		 */
		NODETYPE_ROOT : 9,
		/**
		 * doc fragment
		 */
		NODETYPE_FRAGMENT : 11,
		/**
		 * contains比较结果-同一个
		 */
		DOCUMENT_POSITION_SAME : 0, //同一个
		/**
		 * contains比较结果-不在一个文档
		 */
		DOCUMENT_POSITION_DISCONNECTED : 1, //不在一个文档
		/**
		 * contains比较结果-b在a前面
		 */
		DOCUMENT_POSITION_PRECEDING : 2, //b在a前面
		/**
		 * contains比较结果-b在a后面
		 */
		DOCUMENT_POSITION_FOLLOWING : 4, //b在a后面
		/**
		 * contains比较结果-b是a祖先
		 */
		DOCUMENT_POSITION_CONTAINS : 10, //b是a祖先
		/**
		 * contains比较结果-b是a儿子
		 */
		DOCUMENT_POSITION_CONTAINED_BY : 20, //b是a儿子
		/**
		 * contains比较结果-不常用
		 */
		DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : 32, //不常用
		/**
		 * 空格正则
		 */
		REGEXP_SPACE : /\s+/g,
		/**
		 * kit事件注册前缀
		 */
		KIT_EVENT_REGISTER : "_kit_event_register_",
		/**
		 * kit事件注册前缀
		 */
		KIT_EVENT_REGISTER_EVENT : "_kit_event_register_event",
		/**
		 * kit事件注册前缀
		 */
		KIT_EVENT_REGISTER_FUNCTION : "_kit_event_register_function",
		/**
		 * kit事件信号--立即停止所有事件
		 */
		KIT_EVENT_STOPIMMEDIATEPROPAGATION : "_kit_event_stopimmediatepropagation_",
		/**
		 * kit事件信号--停止所有事件
		 */
		KIT_EVENT_STOPALLEVENT : "_kit_event_stopallevent_",
		/**
		 * kit DOM ID 默认前缀
		 */
		KIT_DOM_ID_PREFIX : "J_Kit_"
	}
}
$Kit.prototype = {
	constructor : $Kit,
	//
	/* ------------------------------------------------------------- compression ------------------------------------------------------------- */
	//
	/**
	 * 去除所有空格
	 * @param {String}
	 * @return {String}
	 */
	trimAll : function(str) {
		if(str == null) {
			return null;
		}
		str = str.toString();
		return str.replace(/\s+/ig, "");
	},
	//
	/* ------------------------------------------------------------- is something ------------------------------------------------------------- */
	//
	/**
	 * 是否是字符串
	 * @param {Object}
	 * @return {Boolean}
	 */
	isStr : function(o) {
		return typeof (o) == "string";
	},
	/**
	 * 是否数字
	 * @param {Object}
	 * @return {Boolean}
	 */
	isNum : function(o) {
		return isFinite(o)
	},
	/**
	 * 是否是日期
	 * @param {Object}
	 * @return {Boolean}
	 */
	isDate : function(o) {
		return (null != o) && !isNaN(o) && ("undefined" !== typeof o.getDate);
	},
	/**
	 * 是否是对象类型
	 * @param {Object}
	 * @return {Boolean}
	 */
	isObj : function(o) {
		return !!(o && typeof (o) == "object" );
	},
	/**
	 * 是否是方法类型
	 * @param {Object}
	 * @return {Boolean}
	 */
	isFn : function(o) {
		return !!(o && typeof (o) == "function");
	},
	/**
	 * 是否是可以迭代
	 * @param {Object}
	 * @return {Boolean}
	 */
	isAry : function(o) {
		return !!(o && (o.constructor && o.constructor.toString().indexOf("Array") > -1 || this.isNodeList(o)));
	},
	/**
	 * 是否是节点列表
	 * @param {Object}
	 * @return {Boolean}
	 */
	isNodeList : function(o) {
		return !!(o && (o.toString() == "[object NodeList]" || o.toString() == "[object HTMLCollection]" || (o.length && this.isNode(o[0]))));
	},
	/**
	 * 是否是节点
	 * @param {Object}
	 * @return {Boolean}
	 */
	isNode : function(o) {
		return !!(o && o.nodeType);
	},
	/**
	 * 是否为空
	 * @param {Object}
	 * @return {Boolean}
	 */
	isEmpty : function(o) {
		return typeof (o) == "undefined" || o == null || (!this.isNode(o) && this.isAry(o) && o.length == 0 || (this.isStr(o) && o == ""));
	},
	//
	/* ------------------------------------------------------------- array ------------------------------------------------------------- */
	//
	/**
	 * 把可遍历对象转换成为纯数据
	 * @param {Iterated Object}
	 * @return {Array}
	 */
	asArray : function(o) {
		var re = [];
		for(var i = 0; i < o.length; i++) {
			re.push(o[i]);
		}
		return re;
	},
	/**
	 * 数组遍历
	 * @param {Array|NodeList}
	 * @param {Function} fn 遍历执行方法，执行方法中返回false值，则停止继续遍历
	 * @param {Object} [scope] 执行方法的this指针
	 */
	each : function(ary, fn, scope) {
		if(ary == null) {
			return;
		}
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
	//
	/* ------------------------------------------------------------- find dom ------------------------------------------------------------- */
	/**
	 * ==document.getElementById 根据id选择
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {Element}
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
	 * ==document.getElementsByClassName 根据className选择，返回第一个找到的
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {Element|Null}
	 */
	el8cls : function(cls, root) {
		var re = (root || document).getElementsByClassName(cls);
		return (re != null && re.length ) ? re[0] : null;
	},
	/**
	 * ==document.getElementsByClassName 根据className选择，返回所有找到的
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {[Element]|Null}
	 */
	els8cls : function(cls, root) {
		var re = (root || document).getElementsByClassName(cls);
		return re != null && re.length ? this.asArray(re) : null;
	},
	/**
	 * ==document.getElementsByTagName 根据tagName选择，返回所有找到的
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {[Element]|Null}
	 */
	els8tag : function(tagName, root) {
		var re = (root || document).getElementsByTagName(tagName);
		return re != null && re.length ? this.asArray(re) : null;
	},
	/**
	 * ==document.getElementsByTagName 根据tagName选择，返回第一个找到的
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {[Element]|Null}
	 */
	el8tag : function(tagName, root) {
		var re = this.els8tag(tagName, root);
		return re != null && re.length ? re[0] : null;
	},
	/**
	 * ==document.getElementsByName 根据name选择，返回第一个找到的
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {[Element]|Null}
	 */
	el8name : function(name, root) {
		var re = document.getElementsByName(name);
		if(root) {
			for(var i = 0; i < re.length; i++) {
				if(this.contains(root, re[i])) {
					return re[i];
				}
			}
			return null;
		}
		return (re != null && re.length ) ? re[0] : null;
	},
	/**
	 * ==document.getElementsByName 根据name选择，返回所有找到的
	 * 支持root范围判断，如果这个元素不在第二个参数范围里面，返回null
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {[Element]|Null}
	 */
	els8name : function(name, root) {
		var re = document.getElementsByName(name);
		if(root) {
			var _re = [];
			for(var i = 0; i < re.length; i++) {
				if(this.contains(root, re[i])) {
					_re.push(re[i]);
				}
			}
			return _re.length ? _re : null;
		}
		return re != null && re.length ? this.asArray(re) : null;
	},
	/**
	 * 简单Css选择器 支持#id，.className，@formName，还有tagName.className，四种格式
	 * @param {String}
	 * @param {Element} [root] 可选,从哪个根节点查找
	 * @return {[Element]|Null}
	 */
	el : function(selector, root) {
		var me = this;
		if(me.isEmpty(selector)) {
			return;
		} else if(me.isNode(selector) || me.isNodeList(selector)) {
			return selector;
		}
		root = document || root;
		var selector = selector.toString().trim();
		var first = selector.substring(0, 1), left = selector.substring(1), re;
		switch (first) {
			case "#":
				re = me.el8id(left, root);
				re = re == null ? null : [re];
				break;
			case "@":
				re = me.els8name(left, root);
				break;
			case ".":
				re = me.els8cls(left, root);
				break;
			default:
				if(document.querySelectorAll) {
					re = root.querySelectorAll(selector);
				} else {
					var posDot = selector.indexOf(".");
					if(posDot > 0) {
						/*
						 * 如果含有.，表示有tagName.className形式，那么循环遍历，符合条件的进入re
						 */
						var cls = selector.substring(posDot + 1);
						this.each(this.els8tag(0, posDot), function(f) {
							if(this.hsCls(f, cls)) {
								re.push(f);
							}
						});
					} else {
						re = this.els8tag(selector);
					}
				}
		}
		return re;
	},
	//
	/* ------------------------------------------------------------- dom manipulate ------------------------------------------------------------- */
	//
	/**
	 * 比较element位置 如果a包含b返回true，否则返回false
	 * @param {Element}
	 * @param {Element}
	 * @reutn {Boolean}
	 */
	contains : function(a, b) {
		return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16);
	},
	/**
	 * 设置或者获取Element的attribute
	 * @param {Element}
	 * @param {String|Object} attr 可以为属性值，也可以为一个枚举对象，按照key,value顺序批量设置
	 * @param {String} [value]
	 * @reutn {String|Null}
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
				if( attr in el) {
					try {
						el[attr] = null;
					} catch(e) {
					}
				}
				if(el.removeAttribute) {
					el.removeAttribute(attr);
				} else {
					el.setAttribute(attr, null);
				}
				try {
					delete el[attr];
				} catch(e) {
				}
			} else {
				el.setAttribute(attr, value);
			}
		}
	}
}