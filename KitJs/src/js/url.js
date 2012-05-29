/**
 * url扩展
 * @class $Kit.Url
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/url.js">Source code</a>
 */
$Kit.Url = function(url) {
	this._fields = {
		'Username' : 4,
		'Password' : 5,
		'Port' : 7,
		'Protocol' : 2,
		'Host' : 6,
		'Pathname' : 8,
		'URL' : 0,
		'Querystring' : 9,
		'Fragment' : 10
	};
	this._values = {};
	this._regex = null;
	this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;

	for(var f in this._fields) {
		this['get' + f] = this._makeGetter(f);
		if( typeof url != 'undefined') {
			this.parse(url);
		}
	}
}
$kit.merge($Kit.Url.prototype,
/**
 * @lends $Kit.Url.prototype
 */
{
	/**
	 * 通过解析url，返回包含用户名，密码，端口，协议，路径名，请求参数的map对象
	 * @param {String}
	 * @return {Map}
	 */
	parse : function(url) {
		for(var f in this._fields) {
			this._values[f] = '';
		}
		var r = this._regex.exec(url);
		if(!r)
			throw "URLParser::_parse -> Invalid URL"
		for(var f in this._fields)
		if( typeof r[this._fields[f]] != 'undefined') {
			this._values[f] = r[this._fields[f]];
		}
		if(this._values['Querystring'].length) {
			var queryString = this._values['Querystring'];
			var params = {};
			var a = queryString.split('&');
			for(var i = 0; i < a.length; i++) {
				var o = a[i];
				var a1 = o.split('=');
				var k = a1[0];
				var v = decodeURI(a1[1]);
				if( k in params) {
					if($kit.isAry(params[k])) {
						//
					} else {
						var old = params[k];
						params[k] = [];
						params[k].push(old);
					}
					params[k].push(v);
				} else {
					params[k] = v;
				}
			}
			this._values.Params = params;
		}
		return this._values;
	},
	_makeGetter : function(field) {
		return function() {
			return this._values[field];
		}
	},
	getParam : function(key) {
		if(this._values.Params) {
			return this._values.Params[key]
		}
		return null;
	}
});
/**
 * $Kit.Url的实例，直接通过这个实例访问$Kit.Url所有方法
 * @global
 * @alias $kit.url
 * @type $Kit.Url
 */
$kit.url = new $Kit.Url(location.href);
