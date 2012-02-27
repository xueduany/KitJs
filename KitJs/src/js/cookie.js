/**
 * @author Maxime Haineault (max@centdessin.com)
 * @version 0.4
 * @desc JavaScript cookie manipulation class
 * 
 */

Cookie = {

	/**
	 * Get a cookie's value
	 * 
	 * @param integer
	 *            key The token used to create the cookie
	 * @return void
	 */
	get : function(key) {
		// Still not sure that "[a-zA-Z0-9.()=|%/_]+($|;)" match *all* allowed characters in cookies
		tmp = document.cookie.match((new RegExp(key + '=[a-zA-Z0-9.()=|%/_]+($|;)', 'g')));
		if (!tmp || !tmp[0])
			return null;
		else
			return unescape(tmp[0].substring(key.length + 1, tmp[0].length).replace(';', '')) || null;

	},

	/**
	 * Set a cookie
	 * 
	 * @param integer
	 *            key The token that will be used to retrieve the cookie
	 * @param string
	 *            value The string to be stored
	 * @param integer
	 *            ttl Time To Live (hours)
	 * @param string
	 *            path Path in which the cookie is effective, default is "/" (optional)
	 * @param string
	 *            domain Domain where the cookie is effective, default is window.location.host (optional)
	 * @param boolean
	 *            secure Use SSL or not, default false (optional)
	 * 
	 * @return setted cookie
	 */
	set : function(key, value, ttl, path, domain, secure) {
		cookie = [key + '=' + escape(value), 'path=' + ((!path || path == '') ? '/' : path), 'domain=' + ((!domain || domain == '') ? window.location.host : domain)];

		if (ttl)
			cookie.push(Cookie.hoursToExpireDate(ttl));
		if (secure)
			cookie.push('secure');
		return document.cookie = cookie.join('; ');
	},

	/**
	 * Unset a cookie
	 * 
	 * @param integer
	 *            key The token that will be used to retrieve the cookie
	 * @param string
	 *            path Path used to create the cookie (optional)
	 * @param string
	 *            domain Domain used to create the cookie, default is null (optional)
	 * @return void
	 */
	unset : function(key, path, domain) {
		path = (!path || typeof path != 'string') ? '' : path;
		domain = (!domain || typeof domain != 'string') ? '' : domain;
		if (Cookie.get(key))
			Cookie.set(key, '', 'Thu, 01-Jan-70 00:00:01 GMT', path, domain);
	},

	/**
	 * Return GTM date string of "now" + time to live
	 * 
	 * @param integer
	 *            ttl Time To Live (hours)
	 * @return string
	 */
	hoursToExpireDate : function(ttl) {
		if (parseInt(ttl) == 'NaN')
			return '';
		else {
			now = new Date();
			now.setTime(now.getTime() + (parseInt(ttl) * 60 * 60 * 1000));
			return now.toGMTString();
		}
	},

	/**
	 * Return true if cookie functionnalities are available
	 * 
	 * @return boolean
	 */
	test : function() {
		Cookie.set('b49f729efde9b2578ea9f00563d06e57', 'true');
		if (Cookie.get('b49f729efde9b2578ea9f00563d06e57') == 'true') {
			Cookie.unset('b49f729efde9b2578ea9f00563d06e57');
			return true;
		}
		return false;
	},

	/**
	 * If Firebug JavaScript console is present, it will dump cookie string to console.
	 * 
	 * @return void
	 */
	dump : function() {
		if (typeof console != 'undefined') {
			console.log(document.cookie.split(';'));
		}
	}
}

// connector
$kit.cookie = Cookie;