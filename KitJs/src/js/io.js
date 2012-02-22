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
		var xmlhttp = new XMLHttpRequest();
		var defaultConfig = {
			url : undefined,
			method : 'GET',
			async : true,
			head : undefined,
			body : null,
			onRequestProgress : undefined,
			onRequestComplete : undefined,
			onRequestError : undefined,
			readyStateChangeFn : function() {
				if(xmlhttp.readyState == 3) {
					config.onRequestProgress && config.onRequestProgress(xmlhttp, xmlhttp.responseText, xmlhttp);
				} else if(xmlhttp.readyState == 4) {
					if(xmlhttp.status == '200') {
						config.onRequestComplete && config.onRequestComplete.call(xmlhttp, xmlhttp.responseText, xmlhttp);
					} else if(/^\d{3}$/.test(xmlhttp.status)) {
						if(/^[45]\d{2}$/.test(xmlhttp.status)) {
							config.onRequestError && config.onRequestError.call(xmlhttp, xmlhttp.responseText, xmlhttp);
						}
						var methodName = 'onHTTP' + xmlhttp.status;
						config[methodName] && config[methodName].call(xmlhttp, xmlhttp.responseText, xmlhttp);
					}
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
		xmlhttp.open(config.method, config.url, config.async);
		xmlhttp.onreadystatechange = config.readyStateChangeFn;
		xmlhttp.send(config.body);
	},
	/**
	 * ajax get
	 */
	get : function(config) {
		var me = this;
		var defaultConfig = {
			url : config.url,
			method : 'GET',
			async : true,
			head : config.head,
			onRequestProgress : undefined,
			onRequestComplete : config.onSuccess,

		}
		return me.ajax($kit.join(config, defaultConfig));
	},
	/**
	 * jsonp
	 */
	josnp : function() {

	}
};
$kit.io = new $Kit.IO();
