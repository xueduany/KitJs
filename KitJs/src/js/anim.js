/**
 * javascript animation 动画扩展
 * @class $Kit.Animation
 * @requires kit.js
 * @requires array.js
 * @requires selector.js
 * @requires math.js
 * @requires dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/anim.js">Source code</a>
 */
$Kit.Animation = $Kit.Anim = function(config) {
	//保存动画句柄
	this.handleMap = {};
}
$kit.merge($Kit.Anim.prototype,
/**
 * @lends $Kit.Animation.prototype
 */
{
	/**
	 * 动画
	 * @param {Object} config
	 * @param {Integer} [config.timeSeg] 默认值17，单位毫秒
	 * @param {Integer} [config.duration] 默认值1000，单位毫秒
	 * @param {Element|NodeList|Selector} config.el 需要进行动画的元素，或者元素数组
	 * @param {RegExp} [config.elSplitRegExp] 参数config.el可以为selector的字符，多个selector字符可以用config.elSplitRegExp合并成一个字符
	 * @param {Object} [config.from] 动画开始第一帧的元素初始Css样式，如{opacity:0,display:'none'}，
	 * 其中key为cssStyleName，value为cssStyleValue，这里支持Css3的样式属性如{'-webkit-transform':'scale(1) translateX(1000px)'},也是可以支持的。
	 * @param {Object} config.to 动画最后一帧的元素Css样式
	 * @param {Function} [config.fx] 动画算法，可以通过$kit.anim.fx(type)的方式取得动画算法，也可以直接$kit.anim.Fx.easeInQuad的方式取得算法
	 * @param {Function} [config.then] 动画结束后的匿名方法
	 * @param {Object} [config.scope] config.then方法的this指针
	 * @param {Object} [config.reverse] config.reverse控制是否翻转，实现摇头效果
	 * @param {Number|String} [config.timeout] 因为动画是用setInterval实现的，所有一个timeout句柄，你可以用指定的timeout的句柄数字，也可以用一个String标记
	 * 在$kit.anim.handleMap[timeout]会保存的anim的timeout句柄数字，下一次的motion方法也传入timeout，即可实现终止上一次的动画继续进行，进行新的动画，也可以使用
	 * clearInterval终止当前进行的动画
	 * @see <a href="http://xueduany.github.com/KitJs/KitJs/demo/Animation/demo.html">动画样例</a>
	 */
	motion : function(config) {
		var me = this;
		var defaultConfig = {
			timeSeg : 17,
			duration : 1000,
			el : undefined,
			elSplitRegExp : /\s+/,
			from : undefined,
			to : undefined,
			fx : undefined,
			reverse : false,
			then : undefined,
			scope : window,
			exceptStyleArray : ["scrollTop", "scrollLeft"],
			timeout : undefined
		};
		$kit.mergeIf(config, defaultConfig);
		if(!$kit.isEmpty(config.el)) {
			config.hold = 0;
			//config.el
			if($kit.isStr(config.el)) {
				var elArray = config.el.split(config.elSplitRegExp);
				var configEl = [];
				$kit.each(elArray, function(o) {
					$kit.array.ad(configEl, $kit.selector.el(o), {
						ifExisted : true
					});
				});
				config.el = configEl;
			}
			//
			var f1 = false, timeoutStr;
			if($kit.isStr(config.timeout)) {
				timeoutStr = config.timeout;
				clearInterval(me.handleMap[config.timeout]);
				f1 = true;
			} else if($kit.isNum(config.timemout)) {
				clearInterval(config.timeout);
			}
			// 重置初始样式
			for(var p in config.from) {
				$kit.each(($kit.isNode(config.el) ? [config.el] : config.el), function(node) {
					me.setStyle({
						el : node,
						styleName : p,
						styleValue : config.from[p],
						exceptStyleArray : config.exceptStyleArray,
						elSplitRegExp : config.elSplitRegExp
					});
				});
			}
			var count = 0;
			config.timeout = setInterval(function() {
				config.hold += config.timeSeg;
				//结束时状态
				if(config.hold >= config.duration) {
					clearInterval(config.timeout);
					config.timeout = null;
					delete me.handleMap[config.timeout];
					for(var p in config.to) {
						$kit.each(($kit.isNode(config.el) ? [config.el] : config.el), function(node) {
							me.setStyle({
								el : node,
								styleName : p,
								styleValue : config.to[p],
								exceptStyleArray : config.exceptStyleArray,
								elSplitRegExp : config.elSplitRegExp
							});
						});
					}
					if($kit.isFn(config.then)) {
						config.then.call(config.scope, config);
					}
				} else {
					//过程中状态
					for(var p in config.to) {
						$kit.each(($kit.isNode(config.el) ? [config.el] : config.el), function(node) {
							var reSty = "", sty, sty1;
							if(config.from == null || !( p in config.from)) {
								var _from = $kit.cssStr(node, p);
								if(_from != null && _from.toString().indexOf('rgb') == '0' && config.to[p].toString().indexOf('#') == 0) {
									var re = '#';
									$kit.each(_from.match(/\d+/g), function(d, i) {
										if(i == 3) {
											return false;
										}
										re += $kit.math.padZero($kit.math.convert(d, 10, 16), (config.to[p].length - 1) / 3);
									});
									_from = re;
								}
								sty = me.identifyCssValue(_from);
							} else {
								sty = me.identifyCssValue(config.from[p]);
							}
							sty1 = me.identifyCssValue(config.to[p]);
							if(sty == null || sty1 == null || sty.length != sty1.length) {
								return;
							}
							for(var i = 0; i < sty1.length; i++) {
								if(i > 0) {
									reSty += " ";
								}
								var o = sty1[i];
								var changeValue;
								if(o.value.indexOf('#') == 0) {//rgb
									if(sty[i].value.length == 4) {
										sty[i].value = sty[i].value.substring(0, 1) + sty[i].value.substring(1, 2)//
										+ sty[i].value.substring(1, 2) + sty[i].value.substring(1, 2)//
										+ sty[i].value.substring(2, 3) + sty[i].value.substring(2, 3)//
										+ sty[i].value.substring(3, 4) + sty[i].value.substring(3, 4);
									}
									if(sty1[i].value.length == 4) {
										sty1[i].value = sty1[i].value.substring(0, 1) + sty1[i].value.substring(1, 2)//
										+ sty1[i].value.substring(1, 2) + sty1[i].value.substring(1, 2)//
										+ sty1[i].value.substring(2, 3) + sty1[i].value.substring(2, 3)//
										+ sty1[i].value.substring(3, 4) + sty1[i].value.substring(3, 4);
									}
									var rgbFrom = {
										r : 0,
										g : 0,
										b : 0
									}
									if(sty != null) {
										rgbFrom = {
											r : parseFloat($kit.math.convert(sty[i].value.substring(1, 3), 16, 10)),
											g : parseFloat($kit.math.convert(sty[i].value.substring(3, 5), 16, 10)),
											b : parseFloat($kit.math.convert(sty[i].value.substring(5, 7), 16, 10))
										}
									}
									var rgbTo = {
										r : parseFloat($kit.math.convert(sty1[i].value.substring(1, 3), 16, 10)),
										g : parseFloat($kit.math.convert(sty1[i].value.substring(3, 5), 16, 10)),
										b : parseFloat($kit.math.convert(sty1[i].value.substring(5, 7), 16, 10))
									}
									var rgb = {
										r : me.fx(config.fx)(config.hold, rgbFrom.r, rgbTo.r - rgbFrom.r, config.duration),
										g : me.fx(config.fx)(config.hold, rgbFrom.g, rgbTo.g - rgbFrom.g, config.duration),
										b : me.fx(config.fx)(config.hold, rgbFrom.b, rgbTo.b - rgbFrom.b, config.duration)
									}
									changeValue = '#' + $kit.math.padZero($kit.math.convert(rgb.r, 10, 16), 2) + //
									$kit.math.padZero($kit.math.convert(rgb.g, 10, 16), 2) + //
									$kit.math.padZero($kit.math.convert(rgb.b, 10, 16), 2);
								} else {
									var t = config.hold;
									var b = sty == null ? 0 : parseFloat(sty[i].value);
									var c = sty == null ? parseFloat(sty1[i].value) : parseFloat(sty1[i].value) - parseFloat(sty[i].value);
									var d = config.duration;
									changeValue = me.fx(config.fx)(t, b, c, d);
									if(config.reverse && count % 2 == 1) {
										changeValue = -changeValue;
									}
								}
								reSty += o.prefix + changeValue + o.unit + o.postfix;
							}
							var reSty1 = reSty;
							$kit.each(reSty.match(/rgba?\s*\((\d+\.?\d*\s*,?)+\s*\)/ig), function(o) {
								var o1 = o;
								$kit.each(o.match(/(\d+\.?\d*)/g), function(p, i, ary) {
									o1 = o1.replace(p, parseFloat(p) > 1 ? Math.round(p) : p);
								});
								reSty1 = reSty1.replace(o, o1);
							});
							reSty = reSty1;
							me.setStyle({
								el : node,
								styleName : p,
								styleValue : reSty,
								exceptStyleArray : config.exceptStyleArray,
								elSplitRegExp : config.elSplitRegExp
							});
						});
					}
				}
				count++;
			}, config.timeSeg);
			if(f1) {
				me.handleMap[timeoutStr] = config.timeout;
			}
			return config;
		}
	},
	/**
	 * 分解css的值，知道哪个是value(数字)，那个是单位
	 * @param {String}
	 * @private
	 */
	identifyCssValue : function(cssStr) {
		var me = this;
		if( typeof (cssStr) != "undefined") {
			cssStr = cssStr.toString();
			var a1 = cssStr.match(/([a-z\(,\s]*)([+\-]?\d+\.?\d*|#[\da-f]{6}|#[\da-f]{3})([a-z|%]*)([a-z\)]*)/ig);
			if(a1 != null) {
				var reSty = [];
				for(var i = 0; i < a1.length; i++) {
					var a = a1[i].match(/([a-z\(,\s]*)([+\-]?\d+\.?\d*|#[\da-f]{6}|#[\da-f]{3})([a-z|%]*)([a-z\)]*)/i);
					var sty = {
						style : a[0],
						prefix : a[1],
						value : a[2],
						unit : a[3],
						postfix : a[4]
					}
					reSty.push(sty);
				}
				return reSty;
			}
		}
		return null;
	},
	/**
	 * 设置样式
	 * @private
	 */
	setStyle : function() {
		if(arguments.length == 1 && $kit.isObj(arguments[0])) {
			var config = arguments[0];
			var//
			styleName = config.styleName, //
			styleValue = config.styleValue, //
			elSplitRegExp = /\s+/ || config.elSplitRegExp, //
			exceptStyleArray = ["scrollTop", "scrollLeft"] || config.exceptStyleArray;
			if($kit.isStr(config.el)) {
				elArray = config.el.split(elSplitRegExp);
			} else if($kit.isAry(config.el)) {
				elArray = config.el;
			} else {
				elArray = [config.el];
			}
			for(var k = 0; k < elArray.length; k++) {
				var el = $kit.el(elArray[k]);
				if($kit.isNode(el)) {
					if($kit.inAry(exceptStyleArray, styleName)) {
						if(styleName.toLowerCase() == 'scrolltop') {
							if(el == document.body) {
								scrollTo($kit.viewport().scrollLeft, styleValue);
							} else {
								el.scrollTop = styleValue;
							}
						} else if(styleName.toLowerCase() == 'scrollleft') {
							if(el == document.body) {
								scrollTo(styleValue, $kit.viewport().scrollTop);
							} else {
								el.scrollLeft = styleValue;
							}
						} else {
							try {
								$kit.css(el, styleName, styleValue);
							} catch(e) {
							}
						}
					} else {
						try {
							$kit.css(el, styleName, styleValue);
						} catch(e) {
						}
					}
				} else if($kit.isNodeList(el)) {
					for(var j = 0; j < el.length; j++) {
						if($kit.inAry(exceptStyleArray, styleName)) {
							if(styleName.toLowerCase() == 'scrolltop') {
								if(el[j] == document.body) {
									scrollTo($kit.viewport().scrollLeft, styleValue);
								} else {
									el[j].scrollTop = styleValue;
								}
							} else if(styleName.toLowerCase() == 'scrollleft') {
								if(el[j] == document.body) {
									scrollTo(styleValue, $kit.viewport().scrollTop);
								} else {
									el[j].scrollLeft = styleValue;
								}
							} else {
								try {
									$kit.css(el[j], styleName, styleValue);
								} catch(e) {
								}
							}
						} else {
							try {
								$kit.css(el[j], styleName, styleValue);
							} catch(e) {
							}
						}
					}
				}
			}
		}
	},
	/**
	 * 曲线函数
	 * @enum {Function}
	 */
	Fx : {
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		swing : function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInQuad : function(t, b, c, d) {
			return c * (t /= d) * t + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutQuad : function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutQuad : function(t, b, c, d) {
			if((t /= d / 2) < 1)
				return c / 2 * t * t + b;
			return -c / 2 * ((--t) * (t - 2) - 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInCubic : function(t, b, c, d) {
			return c * (t /= d) * t * t + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutCubic : function(t, b, c, d) {
			return c * (( t = t / d - 1) * t * t + 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutCubic : function(t, b, c, d) {
			if((t /= d / 2) < 1)
				return c / 2 * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t + 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInQuart : function(t, b, c, d) {
			return c * (t /= d) * t * t * t + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutQuart : function(t, b, c, d) {
			return -c * (( t = t / d - 1) * t * t * t - 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutQuart : function(t, b, c, d) {
			if((t /= d / 2) < 1)
				return c / 2 * t * t * t * t + b;
			return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInQuint : function(t, b, c, d) {
			return c * (t /= d) * t * t * t * t + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutQuint : function(t, b, c, d) {
			return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutQuint : function(t, b, c, d) {
			if((t /= d / 2) < 1)
				return c / 2 * t * t * t * t * t + b;
			return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInSine : function(t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutSine : function(t, b, c, d) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutSine : function(t, b, c, d) {
			return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInExpo : function(t, b, c, d) {
			return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutExpo : function(t, b, c, d) {
			return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutExpo : function(t, b, c, d) {
			if(t == 0)
				return b;
			if(t == d)
				return b + c;
			if((t /= d / 2) < 1)
				return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
			return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInCirc : function(t, b, c, d) {
			return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutCirc : function(t, b, c, d) {
			return c * Math.sqrt(1 - ( t = t / d - 1) * t) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutCirc : function(t, b, c, d) {
			if((t /= d / 2) < 1)
				return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
			return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInElastic : function(t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if(t == 0)
				return b;
			if((t /= d) == 1)
				return b + c;
			if(!p)
				p = d * .3;
			if(a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			} else
				var s = p / (2 * Math.PI) * Math.asin(c / a);
			return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutElastic : function(t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if(t == 0)
				return b;
			if((t /= d) == 1)
				return b + c;
			if(!p)
				p = d * .3;
			if(a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			} else
				var s = p / (2 * Math.PI) * Math.asin(c / a);
			return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutElastic : function(t, b, c, d) {
			var s = 1.70158;
			var p = 0;
			var a = c;
			if(t == 0)
				return b;
			if((t /= d / 2) == 2)
				return b + c;
			if(!p)
				p = d * (.3 * 1.5);
			if(a < Math.abs(c)) {
				a = c;
				var s = p / 4;
			} else
				var s = p / (2 * Math.PI) * Math.asin(c / a);
			if(t < 1)
				return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInBack : function(t, b, c, d, s) {
			if(s == undefined)
				s = 1.70158;
			return c * (t /= d) * t * ((s + 1) * t - s) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutBack : function(t, b, c, d, s) {
			if(s == undefined)
				s = 1.70158;
			return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutBack : function(t, b, c, d, s) {
			if(s == undefined)
				s = 1.70158;
			if((t /= d / 2) < 1)
				return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
			return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInBounce : function(t, b, c, d) {
			return c - $kit.anim.Fx.easeOutBounce(d - t, 0, c, d) + b;
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeOutBounce : function(t, b, c, d) {
			if((t /= d) < (1 / 2.75)) {
				return c * (7.5625 * t * t) + b;
			} else if(t < (2 / 2.75)) {
				return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
			} else if(t < (2.5 / 2.75)) {
				return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
			} else {
				return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
			}
		},
		/**
		 * @param {Number} t current time（当前时间）
		 * @param {Number} b beginning value（初始值）置0，即b=0；
		 * @param {Number} c change in value（变化量）置1，即c=1；
		 * @param {Number} d duration（持续时间） 置1，即d=1。
		 * @return {Number}
		 */
		easeInOutBounce : function(t, b, c, d) {
			if(t < d / 2)
				return $kit.anim.Fx.easeInBounce(t * 2, 0, c, d) * .5 + b;
			return $kit.anim.Fx.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
		}
	},
	/**
	 * 根据类型返回对应的曲线函数，或者自定义函数
	 * @param {String} [type] 如swing,easeInBounce等等
	 * @return {Function}
	 */
	fx : function(type) {
		var me = this;
		if($kit.isStr(type) && me.Fx[type]) {
			return me.Fx[type];
		} else if($kit.isFn(type)) {
			return type;
		}
		return me.Fx.swing;
	},
	/**
	 * 渐隐
	 * @param {Element}
	 * @param {Number} [duration]
	 * @param {Function} [fx]
	 * @param {Function} [callback]
	 */
	fadeIn : function(el, duration, fx, callback) {
		var me = this;
		if(!$kit.isNode(el)) {
			var _el = $kit.$el(el);
			if(_el.length == 1) {
				el = _el[0];
			} else {
				return;
			}
		}
		if(el['kitjs-anim-fade-timeout']) {
			clearInterval(el['kitjs-anim-fade-timeout']);
		}
		if(duration) {
			if(duration.toLowerCase && duration.toLowerCase() == 'fast') {
				duration = 200;
			} else if(duration.toLowerCase && duration.toLowerCase() == 'slow') {
				duration = 600;
			}
			if(fx) {
				if(callback) {

				} else {
					callback = fx;
					fx = me.Fx.easeOutQuad;
				}
			} else {
				fx = me.Fx.swing;
				if($kit.isFn(duration)) {
					callback = duration;
					duration = 300;
				}
			}
		} else {
			duration = 300;
			fx = me.Fx.easeOutQuad;
		}
		var to = {
			opacity : 1
		}
		var config = {
			duration : duration,
			el : el,
			to : to,
			fx : fx,
			then : callback
		}
		var _config = me.motion(config);
		el['kitjs-anim-fade-timeout'] = _config.timeout;
		//return _config;
	},
	/**
	 * 渐显
	 * @param {Element}
	 * @param {Number} [duration]
	 * @param {Function} [fx]
	 * @param {Function} [callback]
	 */
	fadeOut : function(el, duration, fx, callback) {
		var me = this;
		if(!$kit.isNode(el)) {
			var _el = $kit.$el(el);
			if(_el.length == 1) {
				el = _el[0];
			} else {
				return;
			}
		}
		if(el['kitjs-anim-fade-timeout']) {
			clearInterval(el['kitjs-anim-fade-timeout']);
		}
		if(duration) {
			if(duration.toLowerCase && duration.toLowerCase() == 'fast') {
				duration = 200;
			} else if(duration.toLowerCase && duration.toLowerCase() == 'slow') {
				duration = 600;
			}
			if(fx) {
				if(callback) {

				} else {
					callback = fx;
					fx = me.Fx.easeOutQuad;
				}
			} else {
				fx = me.Fx.swing;
				if($kit.isFn(duration)) {
					callback = duration;
					duration = 300;
				}
			}
		} else {
			duration = 300;
			fx = me.Fx.easeOutQuad;
		}
		var to = {
			opacity : 0
		}
		var config = {
			duration : duration,
			el : el,
			to : to,
			fx : fx,
			then : callback
		}
		var _config = me.motion(config);
		el['kitjs-anim-fade-timeout'] = _config.timeout;
		//return _config;
	},
	/**
	 * 滑下
	 * @param {Element}
	 * @param {Number} [duration]
	 * @param {Function} [fx]
	 * @param {Function} [callback]
	 */
	slideDown : function(el, duration, fx, callback) {
		var me = this;
		if(!$kit.isNode(el)) {
			var _el = $kit.$el(el);
			if(_el.length == 1) {
				el = _el[0];
			} else {
				return;
			}
		}
		if(arguments.length == 3) {
			if($kit.isNode(el) && $kit.isFn(duration) && $kit.isFn(fx) && callback == null) {
				callback = fx;
				fx = duration;
				duration = 300;
			} else if($kit.isNode(el) && $kit.isNum(duration) && $kit.isFn(fx) && callback == null) {
				callback = fx;
				fx = me.Fx.easeOutQuad;
				duration = duration;
			}
		} else if(arguments.length == 2 && $kit.isNode(el) && $kit.isFn(duration)) {
			callback = duration;
			duration = 300;
			fx = me.Fx.easeOutQuad;
		}
		if(el['kitjs-anim-slide-timeout']) {
			clearInterval(el['kitjs-anim-slide-timeout']);
		}
		var wrapper = el['kitjs-anim-wrapper']
		if(wrapper) {
			var hold = 0;
			var timeSeg = 17;
			var begin = wrapper['kitjs-anim-el'].offsetHeight;
			var beginWrapper = wrapper.offsetHeight;
			var beginTop = $kit.css(el, 'top');
			duration = $kit.isNum(duration) ? duration : 300;
			fx = $kit.isFn(fx) ? fx : me.Fx.easeOutQuad;
			if(hold == 0) {
				$kit.css(el, {
					position : 'absolute',
					top : 0,
					left : 0
				});
			}
			el['kitjs-anim-slide-timeout'] = setInterval(function() {
				if(hold >= duration) {
					clearInterval(el['kitjs-anim-slide-timeout']);
					//el['kitjs-anim-slide-timeout'] = null;
					$kit.css(wrapper, {
						height : begin
					});
					$kit.css(el, {
						top : 0,
						position : 'static'
					});
					//el['kitjs-anim-wrapper'] = null;
					$kit.attr(wrapper, 'kitjs-anim-el', null);
					$kit.attr(el, 'kitjs-anim-wrapper', null);
					$kit.rpEl(wrapper, el);
					callback && callback();
				} else {
					$kit.css(wrapper, {
						height : fx(hold, beginWrapper, begin - beginWrapper, duration) + 'px'
					});
					$kit.css(el, {
						top : fx(hold, beginTop, -beginTop, duration) + 'px'
					});
				}
				hold += timeSeg;
			}, timeSeg);
		} else {
			//
		}
	},
	/**
	 * 滑上
	 * @param {Element}
	 * @param {Number} [duration]
	 * @param {Function} [fx]
	 * @param {Function} [callback]
	 */
	slideUp : function(el, duration, fx, callback) {
		var me = this;
		if(!$kit.isNode(el)) {
			var _el = $kit.$el(el);
			if(_el.length == 1) {
				el = _el[0];
			} else {
				return;
			}
		}
		if(arguments.length == 3) {
			if($kit.isNode(el) && $kit.isFn(duration) && $kit.isFn(fx) && callback == null) {
				callback = fx;
				fx = duration;
				duration = 300;
			} else if($kit.isNode(el) && $kit.isNum(duration) && $kit.isFn(fx) && callback == null) {
				callback = fx;
				fx = me.Fx.easeOutQuad;
				duration = duration;
			}
		} else if(arguments.length == 2 && $kit.isNode(el) && $kit.isFn(duration)) {
			callback = duration;
			duration = 300;
			fx = me.Fx.easeOutQuad;
		}
		if(el['kitjs-anim-slide-timeout']) {
			clearInterval(el['kitjs-anim-slide-timeout']);
		}
		var wrapper = el['kitjs-anim-wrapper']
		if(wrapper) {
			//
			wrapper['kitjs-anim-el'] = el;
		} else {
			wrapper = $kit.dom.wrap(el, '<div class="kitjs-anim-wrapper" style="overflow:hidden;position:relative;display:block;"></div>');
			el['kitjs-anim-wrapper'] = wrapper;
			wrapper['kitjs-anim-el'] = el;
			$kit.css(wrapper, {
				height : el.offsetHeight + 'px',
				width : el.offsetWidth + 'px'
			});
		}
		var hold = 0;
		var timeSeg = 17;
		var begin = wrapper.offsetHeight;
		duration = $kit.isNum(duration) ? duration : 500;
		fx = $kit.isFn(fx) ? fx : me.Fx.easeOutQuad;
		if(hold == 0) {
			$kit.css(el, {
				position : 'absolute',
				top : 0,
				left : 0
			});
		}
		el['kitjs-anim-slide-timeout'] = setInterval(function() {
			if(hold >= duration) {
				clearInterval(el['kitjs-anim-slide-timeout']);
				//el['kitjs-anim-slide-timeout'] = null;
				$kit.attr(el, 'kitjs-anim-slide-timeout', null);
				$kit.css(wrapper, {
					height : 0
				});
				$kit.css(el, {
					top : -begin
				});
				callback && callback();
			} else {
				$kit.css(wrapper, {
					height : fx(hold, begin, 0 - begin, duration) + 'px'
				});
				$kit.css(el, {
					top : fx(hold, 0, 0 - begin, duration) + 'px'
				});
			}
			hold += timeSeg;
		}, timeSeg);
	}
});
/**
 * $Kit.Animation的实例，直接通过这个实例访问$Kit.Animation所有方法
 * @global
 * @type $Kit.Animation
 */
$kit.anim = new $Kit.Anim();
