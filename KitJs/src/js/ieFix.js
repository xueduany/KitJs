$kit.merge(String.prototype, {
	trim : function() {
		if(/^\s+|\s+$/g.test(this)) {
			return this.replace(/^\s+|\s+$/g, '');
		} else {
			return this;
		}
	}
});
$kit.merge($Kit.prototype, {
	/**
	 * 是否ie...
	 */
	isIE : function(o) {
		if(document.all) {
			return true;
		}
		return false;
	},
	/**
	 * 是否html元素
	 */
	isNodeList : function(o) {
		return !!(o && $kit.isObj(o) && 'length' in o && o.item)
	},
	/**
	 * by cls
	 */
	el8cls : function(cls, root) {
		var a = (root || document), me = this, re = null;
		me.each(document.getElementsByTagName('*', root), function(o) {
			if(me.hsCls(o, cls)) {
				re = o;
				return false;
			}
		});
		return re;
	},
	/**
	 * els by cls
	 */
	els8cls : function(cls, root) {
		var a = (root || document), me = this, re = [];
		re.item = function() {
		};
		me.each(document.getElementsByTagName('*', root), function(o) {
			if(me.hsCls(o, cls)) {
				re.push(o);
			}
		});
		return re;
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
					if(l.toLowerCase() == 'opacity') {
						try {
							el.filters.item("alpha").opacity = attr[l] * 100;
						} catch(e) {
							try {
								el.style.filter = 'alpha(opacity=' + attr[l] * 100 + ')';
							} catch(e) {
							}
						}
					} else {
						l = me._camelCssName(l);
						el.style[l] = attr[l];
					}
				}
			} else {
				attr = me._camelCssName(attr);
				var re = el.currentStyle[attr];
				if(attr.toLowerCase() == 'opacity' && el.filters.length) {
					try {
						re = el.filters.item("alpha").opacity / 100;
					} catch(e) {
					}
				}
				return parseFloat(re);
			}
		} else {
			attr = me._camelCssName(attr);
			if(attr.toLowerCase() == 'opacity') {
				try {
					el.filters.item("alpha").opacity = value * 100;
				} catch(e) {
					try {
						el.style.filter = 'alpha(opacity=' + value * 100 + ')';
					} catch(e) {
					}
				}
			} else {
				el.style[attr] = value;
			}
		}
	},
	_camelCssName : function(str) {
		var firstLetter = str.substr(0, 1);
		var mainStr = str.substr(1);
		var a = mainStr.split('-');
		for(var i = 1; i < a.length; i++) {
			a[i] = a[i].substr(0, 1).toUpperCase() + a[i].substr(1);
		}
		return firstLetter + a.join('');
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
			element.parentNode.replaceChild(me.newHTML(html), element);
		} else if($kit.isNode(html)) {
			element.parentNode.replaceChild(html, element);
		}
	}
});
//reinit
$kit = new $Kit();

$kit.$ = function(fn, caller) {
	var caller = window || caller;
	IEContentLoaded(caller, fn);
	/*
	*
	* IEContentLoaded.js
	*
	* Author: Diego Perini (diego.perini at gmail.com) NWBOX S.r.l.
	* Summary: DOMContentLoaded emulation for IE browsers
	* Updated: 05/10/2007
	* License: GPL
	* Version: TBD
	*
	* Copyright (C) 2007 Diego Perini & NWBOX S.r.l.
	*
	* This program is free software: you can redistribute it and/or modify
	* it under the terms of the GNU General Public License as published by
	* the Free Software Foundation, either version 2 of the License, or
	* (at your option) any later version.
	*
	* This program is distributed in the hope that it will be useful,
	* but WITHOUT ANY WARRANTY; without even the implied warranty of
	* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	* GNU General Public License for more details.
	*
	* You should have received a copy of the GNU General Public License
	* along with this program.  If not, see http://javascript.nwbox.com/IEContentLoaded/GNU_GPL.txt.
	*
	*/

	// @w	window reference
	// @fn	function reference
	function IEContentLoaded(w, fn) {
		var d = w.document, done = false,
		// only fire once
		init = function() {
			if(!done) {
				done = true;
				fn();
			}
		};
		// polling for no errors
		(function() {
			try {
				// throws errors until after ondocumentready
				d.documentElement.doScroll('left');
			} catch (e) {
				setTimeout(arguments.callee, 50);
				return;
			}
			// no errors, fire
			init();
		})();
		// trying to always fire before onload
		d.onreadystatechange = function() {
			if(d.readyState == 'complete') {
				d.onreadystatechange = null;
				init();
			}
		};
	}

}