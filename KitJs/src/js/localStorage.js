/**
 * 本地存储
 */
$Kit.LocalStorage = function() {
	//
	if (!window.localStorage) {
		document.documentElement.style.behavior = 'url(#default#userData)';
	}
}
$Kit.LocalStorage.prototyp = {
	setItem : function(key, val, context) {
		if (window.localStorage) {
			return window.localStorage.setItem(key, val, context);
		} else {
			try {
				document.documentElement.setAttribute(key, value);
				return document.documentElement.save(context || 'default');
			} catch (e) {
			}
		}
	},
	getItem : function(key, context) {
		if (window.localStorage) {
			return window.localStorage.getItem(key, context);
		} else {
			try {
				document.documentElement.load(context || 'default');
				return document.documentElement.getAttribute(key) || '';
			} catch (e) {
			}
		}
	},
	removeItem : function(key, context) {
		if (window.localStorage) {
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
	clear : function() {
		if (window.localStorage) {
			return window.localStorage.clear();
		} else {
			try {
				document.documentElement.expires = -1;
			} catch (e) {
			}
		}
	}
}
$kit.localStorage = new $Kit.LocalStorage();