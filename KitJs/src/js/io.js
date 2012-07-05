/**
 * ajax
 * @class $Kit.IO
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/ajax.js">Source code</a>
 */
$Kit.IO = function() {
	//
}
$kit.merge($Kit.IO.prototype,
/**
 * @lends $Kit.IO.prototype
 */
{
	/**
	 * ajax
	 * @param {Object} config
	 * @param {String} config.url
	 * @param {Object} [config.params] {key:value}格式
	 * @param {Stirng} [config.method] get或者post或者delete或者...，默认get
	 * @param {Boolean} [config.async] 是否异步，默认true，异步
	 * @param {Object} [config.head] requestHead {key:value}格式
	 * @param {Obejct} [config.body] {key:value}格式
	 * @param {Function} [config.onProgress] 处理中回调，bigpipe
	 * @param {Function} [config.onSuccess] 成功回调
	 * @param {Function} [config.onError] 错误回调
	 * @param {Function} [config.onOvertime] 超时回调
	 * @param {Number} [config.overtime] 默认3000，单位毫秒
	 * @param {Function} [config.readyStateChangeFn] ready状态回调
	 */
	ajax : function(config) {
		var me = this;
		var xmlhttp = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		var defaultConfig = {
			url : undefined,
			params : undefined,
			method : 'GET',
			async : true,
			head : undefined,
			body : null,
			onProgress : undefined,
			onSuccess : undefined,
			onError : undefined,
			onOvertime : undefined,
			overtime : 3000,
			readyStateChangeFn : function() {
				if(xmlhttp.readyState == 3) {
					clearTimeout(xmlhttp.timeoutOvertime);
					config.onProgress && config.onProgress(xmlhttp, xmlhttp.responseText, xmlhttp);
					//
					if($kit.isFn(config.onError)) {
						xmlhttp.timeoutOvertime = setTimeout(function() {
							config.onError.call(xmlhttp, xmlhttp.responseText, xmlhttp);
						}, config.overtime);
					}
				} else if(xmlhttp.readyState == 4) {
					clearTimeout(xmlhttp.timeoutOvertime);
					if(xmlhttp.status == '200') {
						config.onSuccess && config.onSuccess.call(xmlhttp, xmlhttp.responseText, xmlhttp);
					} else if(/^\d{3}$/.test(xmlhttp.status)) {
						if(/^[45]\d{2}$/.test(xmlhttp.status)) {
							config.onError && config.onError.call(xmlhttp, xmlhttp.responseText, xmlhttp);
						}
					}
					//
					var methodName = 'onHTTP' + xmlhttp.status;
					config[methodName] && config[methodName].call(xmlhttp, xmlhttp.responseText, xmlhttp);
				}
			}
		}
		$kit.mergeIf(config, defaultConfig);
		//
		if(config.head) {
			for(var k in config.head) {
				var v = config.head[k];
				xmlhttp.setRequestHeader(k, v);
			}
		}
		var url = config.url;
		if(!$kit.isEmpty(config.params)) {
			if(config.url.indexOf('?') == config.url.length - 1) {
				url += $kit.concat(config.params, '&', '=');
			} else {
				url += '?' + $kit.concat(config.params);
			}
		}
		var body = $kit.concat(config.body, '&', '=');
		//
		xmlhttp.open(config.method, url, config.async);
		xmlhttp.onreadystatechange = config.readyStateChangeFn;
		xmlhttp.send(config.body);
		//
		if($kit.isFn(config.onOvertime)) {
			xmlhttp.timeoutOvertime = setTimeout(function() {
				config.onOvertime.call(xmlhttp, xmlhttp);
			}, config.overtime);
		}
	},
	/**
	 * get
	 * @param {Object} config
	 * @param {String} config.url
	 * @param {Object} [config.params] {key:value}格式
	 * @param {Boolean} [config.async] 是否异步，默认true，异步
	 * @param {Function} [config.onSuccess] 成功回调
	 */
	get : function(config) {
		var me = this;
		var defaultConfig = {
			method : 'GET',
			async : true,
			body : undefined,
			onSuccess : function(res, xmlhttp) {
				try {
					res = eval(res);
				} catch(e) {
				}
				config.onSuccess.call(xmlhttp, res, xmlhttp);
			}
		}
		return me.ajax($kit.join(config, defaultConfig));
	},
	/**
	 * 同步get
	 * @param {Object} config
	 * @param {String} config.url
	 * @param {Object} [config.params] {key:value}格式
	 * @param {Function} [config.onSuccess] 成功回调
	 */
	syncGet : function(config) {
		var me = this;
		var defaultConfig = {
			method : 'GET',
			async : false,
			body : undefined,
			onSuccess : function(res, xmlhttp) {
				try {
					res = eval(res);
				} catch(e) {
				}
				config.onSuccess.call(xmlhttp, res, xmlhttp);
			}
		}
		return me.ajax($kit.join(config, defaultConfig));
	},
	/**
	 * post
	 * @param {Object} config
	 * @param {String} config.url
	 * @param {Obejct} [config.body] {key:value}格式
	 * @param {Boolean} [config.async] 是否异步，默认true，异步
	 * @param {Function} [config.onSuccess] 成功回调
	 */
	post : function(config) {
		var me = this;
		var defaultConfig = {
			method : 'POST',
			async : true,
			onSuccess : function(res, xmlhttp) {
				try {
					res = eval(res);
				} catch(e) {
				}
				config.onSuccess.call(xmlhttp, res, xmlhttp);
			}
		}
		return me.ajax($kit.join(config, defaultConfig));
	},
	/**
	 * 同步post
	 * @param {Object} config
	 * @param {String} config.url
	 * @param {Obejct} [config.body] {key:value}格式
	 * @param {Function} [config.onSuccess] 成功回调
	 */
	syncPost : function(config) {
		var me = this;
		var defaultConfig = {
			method : 'POST',
			async : false,
			onSuccess : function(res, xmlhttp) {
				try {
					res = eval(res);
				} catch(e) {
				}
				config.onSuccess.call(xmlhttp, res, xmlhttp);
			}
		}
		return me.ajax($kit.join(config, defaultConfig));
	},
	/**
	 * jsonp
	 * @param {Object} config
	 * @param {Object} config.url
	 * @param {Object} config.params
	 * @param {Object} config.onSuccess
	 */
	jsonp : function(config) {
		if(config.url) {
			var url = config.url;
			if(config.params) {
				if(config.url.indexOf('?') == config.url.length - 1) {
					url += $kit.concat(config.params, '&', '=');
				} else {
					url += '?' + $kit.concat(config.params);
				}
			}
			var script = document.createElement('script');
			if(config.onSuccess) {
				if(script.readyState) {//ie
					script.onreadystatechange = function() {
						if(script.readyState == "loaded" || script.readyState == "complete") {
							script.onreadystatechange = null;
							config.onSuccess && config.onSuccess();
						}
					}
				} else {
					script.onload = function() {
						config.onSuccess && config.onSuccess();
					}
				}
			}
			script.src = url;
			document.body.appendChild(script);
		}
	}
});
/**
 * $Kit.IO的实例，直接通过这个实例访问$Kit.IO所有方法
 * @global
 * @name $kit.io
 * @type $Kit.IO
 */
$kit.io = new $Kit.IO();
