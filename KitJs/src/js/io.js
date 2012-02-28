/**
 * ajax
 */
$Kit.IO = function() {

}
$Kit.IO.prototype = {
	/**
	 * ajax
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
	 * ajax get
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
	 */
	josnp : function(config) {
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
			if(config.callback) {
				if(script.readyState) {//ie
					script.onreadystatechange = function() {
						a.push(script.readyState);
						if(script.readyState == "loaded" || script.readyState == "complete") {
							script.onreadystatechange = null;
							config.callback && config.callback();
						}
					}
				} else {
					script.onload = function() {
						config.callback && config.callback();
					}
				}
			}
			script.src = url;
			document.body.appendChild(script);
		}
	}
};
$kit.io = new $Kit.IO();
