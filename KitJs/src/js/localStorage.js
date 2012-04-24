/**
 * 本地存储
 * @class $Kit.LocalStorage
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/localStorage.js">Source code</a>
 */
$Kit.LocalStorage = function() {
	//
	if(!window.localStorage) {
		document.documentElement.style.behavior = 'url(#default#userData)';
	}
}
$kit.merge($Kit.LocalStorage.prototype,
/**
 * @lends $Kit.LocalStorage.prototype
 */
{
	/**
	 * 保存
	 * @param {Object}
	 * @param {Object}
	 * @param {Obejct}
	 */
	set : function(key, val, context) {
		if(window.localStorage) {
			return window.localStorage.setItem(key, val, context);
		} else {
			try {
				document.documentElement.setAttribute(key, value);
				return document.documentElement.save(context || 'default');
			} catch (e) {
			}
		}
	},
	/**
	 * 读取
	 * @param {Object}
	 * @param {Object}
	 */
	get : function(key, context) {
		if(window.localStorage) {
			return window.localStorage.getItem(key, context);
		} else {
			try {
				document.documentElement.load(context || 'default');
				return document.documentElement.getAttribute(key) || '';
			} catch (e) {
			}
		}
	},
	/**
	 * 删除
	 * @param {Object}
	 * @param {Object}
	 */
	rm : function(key, context) {
		if(window.localStorage) {
			return window.localStorage.removeItem(key, context);
		} else {
			try {
				context = context || 'default';
				document.documentElement.load(context);
				document.documentElement.removeAttribute(key);
				return document.documentElement.save(context);
			} catch (e) {
			}
		}
	},
	/**
	 * 清空
	 */
	clear : function() {
		if(window.localStorage) {
			return window.localStorage.clear();
		} else {
			try {
				document.documentElement.expires = -1;
			} catch (e) {
			}
		}
	}
});
/**
 * $Kit.LocalStorage的实例，直接通过这个实例访问$Kit.LocalStorage所有方法
 * @global
 * @type $Kit.LocalStorage
 */
$kit.localStorage = new $Kit.LocalStorage();
