/**
 * Cookie扩展
 * @class $Kit.Cookie
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/cookie.js">Source code</a>
 */
$Kit.Cookie = function(config) {
	//
}
$kit.merge($Kit.Cookie.prototype,
/**
 * @lends $Kit.Cookie.prototype
 */
{

	/**
	 * 获取cookie值
	 * @param {String}
	 * @return {Object|Null}
	 */
	get : function(key) {
		// Still not sure that "[a-zA-Z0-9.()=|%/_]+($|;)" match *all* allowed characters in cookies
		tmp = document.cookie.match((new RegExp(key + '=[a-zA-Z0-9.()=|%/_]+($|;)', 'g')));
		if(!tmp || !tmp[0]) {
			return null;
		} else {
			return unescape(tmp[0].substring(key.length + 1, tmp[0].length).replace(';', '')) || null;
		}
	},
	/**
	 * 塞cookie，塞多了你不怕肚子疼？
	 * @param {String} 存cookie里面的key
	 * @param {String} 保存值
	 * @param {Number} ttl 存活时间(hours)
	 * @param {String} [path] 影响的路径Path in which the cookie is effective, default is "/" (optional)
	 * @param {String} [domain] Domain where the cookie is effective, default is window.location.host (optional)
	 * @param {String} [secure] Use SSL or not, default false (optional)
	 */
	set : function(key, value, ttl, path, domain, secure) {
		cookie = [key + '=' + escape(value), 'path=' + ((!path || path == '') ? '/' : path), 'domain=' + ((!domain || domain == '') ? window.location.host : domain)];
		if(ttl) {
			cookie.push(Cookie.hoursToExpireDate(ttl));
		}
		if(secure) {
			cookie.push('secure');
		}
		return document.cookie = cookie.join('; ');
	},
	/**
	 * 删除
	 * @param {String} key The token that will be used to retrieve the cookie
	 * @param {String} path Path used to create the cookie (optional)
	 * @param {String} domain Domain used to create the cookie, default is null (optional)
	 */
	rm : function(key, path, domain) {
		path = (!path || typeof path != 'string') ? '' : path;
		domain = (!domain || typeof domain != 'string') ? '' : domain;
		if(Cookie.get(key)) {
			Cookie.set(key, '', 'Thu, 01-Jan-70 00:00:01 GMT', path, domain);
		}
	},
	/**
	 * Return GTM date string of "now" + time to live
	 * @param {Number} ttl Time To Live (hours)
	 * @return {String}
	 */
	hoursToExpireDate : function(ttl) {
		if(parseInt(ttl) == 'NaN') {
			return '';
		} else {
			now = new Date();
			now.setTime(now.getTime() + (parseInt(ttl) * 60 * 60 * 1000));
			return now.toGMTString();
		}
	},
	/**
	 * Return true if cookie functionnalities are available
	 * @return {Boolean}
	 */
	test : function() {
		Cookie.set('b49f729efde9b2578ea9f00563d06e57', 'true');
		if(Cookie.get('b49f729efde9b2578ea9f00563d06e57') == 'true') {
			Cookie.unset('b49f729efde9b2578ea9f00563d06e57');
			return true;
		}
		return false;
	},
	/**
	 * If Firebug JavaScript console is present, it will dump cookie string to console.
	 */
	dump : function() {
		if( typeof console != 'undefined') {
			console.log(document.cookie.split(';'));
		}
	}
});
/**
 * $Kit.Cookie实例，直接通过这个实例访问$Kit.Cookie所有方法
 * @global
 * @type $Kit.Cookie
 */
$kit.cookie = new $Kit.Cookie();
