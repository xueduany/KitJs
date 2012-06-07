/**
 * 多线程
 * @class $Kit.Multithread
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/multithread.js">Source code</a>
 * @example <a href="http://xueduany.github.com/KitJs/KitJs/demo/MultiThread/demo.html">KitJs多线程demo演示</a>
 */
$Kit.Multithread = function(url) {
	this.threadPool = {};
	this.currentThreadId = 0;
	this.iterateDefaultTimeOut = 300;
}
$kit.merge($Kit.Multithread.prototype,
/**
 * @lends $Kit.Multithread.prototype
 */
{
	/**
	 * 创建一个新线程
	 * @param {Function}
	 * @return {Number} 返回线程id
	 */
	newThread : function(fn) {
		if($kit.isFn(fn)) {
			var threadId = $kit.only();
			this.threadPool[threadId] = this.threadPool[threadId] || {};
			this.threadPool[threadId].fn = fn;
			this.threadPool[threadId]['executeStack'] = [];
			//this.threadPool[threadId].fn = fn.toString().trim().replace(/function\s*\([\w\d,\s]*\)\s*\{/, '');
			//this.threadPool[threadId].fn = this.threadPool[threadId].fn.substring(0, this.threadPool[threadId].fn.length - 1);
			//this.threadPool[threadId].fn = 'this.currentThreadId = "' + threadId + '";' + this.threadPool[threadId].fn
			//this.threadPool[threadId].fn = this.parse(this.threadPool[threadId].fn);
			return threadId;
		}
	},
	/**
	 * 根据线程id运行线程
	 * @param {Number}
	 */
	run : function(threadId) {
		if(this.threadPool[threadId]) {
			this.currentThreadId = threadId;
			//(function() {
			//eval(this.threadPool[threadId].fn);
			this.threadPool[threadId].fn();
			//}).call(this);
		}
	},
	parse : function(fnString) {
		//
	},
	/**
	 * 延时线程执行
	 * @param {Function}
	 * @param {Number}
	 */
	sleep : function(fn, timeOut) {
		if(this.threadPool[this.currentThreadId] == null) {
			return;
		}
		timeOut = timeOut || 0;
		this.threadPool[this.currentThreadId ]['executeStack'] = this.threadPool[this.currentThreadId ]['executeStack'] || [];
		var self = this;
		var currentThreadId = this.currentThreadId;
		var timeOutId = setTimeout(function() {
			(function() {
				this.currentThreadId = currentThreadId;
				this.threadPool[this.currentThreadId]['executeStack'].pop();
				fn();
			}).call(self);
		}, timeOut);
		this.threadPool[this.currentThreadId ]['executeStack'].push(timeOutId);
	},
	/**
	 * 杀死线程
	 * @param {Number}
	 * @return {Boolean}
	 */
	killThread : function(threadId) {
		if(this.threadPool[threadId]) {
			do {
				var id = 0;
				if(this.threadPool[threadId]['executeStack']) {
					id = this.threadPool[threadId]['executeStack'].pop();
					try {
						clearTimeout(id);
						clearInterval(id);
					} catch(e) {

					}
				}
			} while(id>0)
			delete this.threadPool[threadId];
			return true;
		}
		return false;
	},
	/**
	 * 循环，替代标准的while,for等
	 * @param {Function|Boolean|String}
	 * @param {Function}
	 */
	iterate : function(condition, fn) {
		var timeout = this.iterateDefaultTimeOut;
		var self = this;
		var currentThreadId = this.currentThreadId;
		var intervalId;
		function f1() {
			var flag = false;
			if($kit.isFn(condition)) {
				flag = condition();
			} else if($kit.isStr(condition)) {
				flag = eval(condition);
			} else {
				flag = condition;
			}
			//
			if(flag) {
				fn();
				(function() {
					clearInterval(intervalId);
					intervalId = setInterval(function() {
						(function() {
							if(this.threadPool[currentThreadId] != null) {
								this.currentThreadId = currentThreadId;
								var executeStack = this.threadPool[currentThreadId]['executeStack'];
								//this.threadPool[this.currentThreadId ]['executeStack'].push(f);
								if(executeStack.length <= 1) {
									clearInterval(intervalId);
									executeStack.pop();
									f1.call(self)
								}
							} else {
								clearInterval(intervalId);
							}
						}).call(self);
					}, timeout);
					if(this.threadPool[this.currentThreadId] && this.threadPool[this.currentThreadId]['executeStack']) {
						this.threadPool[this.currentThreadId ]['executeStack'].push(intervalId);
					}
				}).call(self);
			} else {
				clearInterval(intervalId);
			}
		}
		f1.call(this);
	}
});
/**
 * $Kit.Multithread的实例，直接通过这个实例访问$Kit.Multithread所有方法
 * @global
 * @alias $kit.multithread
 * @type $Kit.Multithread
 */
$kit.multithread = new $Kit.Multithread();
