/**
 * kitjs瀑布流
 * @class $kit.ui.Waterfall
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 */
$kit.ui.Waterfall = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.Waterfall,
/**
 * @lends $kit.ui.Waterfall
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		el : undefined,
		container : undefined,
		kitWidgetName : 'kitWaterfall',
		/**
		 * Horizontal alignment of waterfall items with container.
		 * Enum: 'left','center','right'.
		 * @type String
		 */
		align : 'center',
		/**
		 * Minimum col count of waterfall items.
		 * Event window resize to 0.
		 * @type Number
		 */
		minColCount : 1,
		diff : 0,
		colWidth : 220,
		effect : {
			fx : $kit.anim.fx('swing'),
			duration : 500,
			from : {
				opacity : 0
			},
			to : {
				opacity : 1
			}
		},
		waterfallCls : 'kitjs-waterfall',
		colAttrName : 'data-waterfall-col'
	}
});
$kit.merge($kit.ui.Waterfall.prototype,
/**
 * @lends $kit.ui.Waterfall.prototype
 */
{
	init : function() {
		var me = this;
		me.recalculate();
		$kit.ev({
			el : window,
			ev : 'resize',
			fn : function() {
				clearTimeout(me.timeResize);
				me.timeResize = setTimeout(function() {
					me.doResize();
				}, 1000);
			},
			scope : me
		});
		me.__onScroll = function() {
			clearTimeout(me.timeoutDoScroll);
			me.timeoutDoScroll = setTimeout(function() {
				me.doScroll();
			}, 150);
		}
		me.start();
		me.__onScroll();
	},
	doResize : function() {
		var me = this, //
		containerRegion = me._containerRegion || {};
		// 宽度没变就没必要调整
		if(containerRegion && $kit.offset(me.config.container).width === containerRegion.width) {
			return;
		}
		me.newEv('resizeBegin');
		me.adjust();
		me.newEv('resizeEnd');
	},
	/**
	 * Readjust existing waterfall item.
	 * @param {Function} [callback] Callback function to be called after adjust.
	 */
	adjust : function(callback) {
		var me = this, items = $kit.el('.' + me.config.waterfallCls, me.config.container);
		/* 正在加，直接开始这次调整，剩余的加和正在调整的一起处理 */
		/* 正在调整中，取消上次调整，开始这次调整 */
		if(me.isAdjusting()) {
			me._adjuster.stop();
			me._adjuster = 0;
		}
		/*计算容器宽度等信息*/
		me.recalculate();
		var num = items.length;

		function check() {
			num--;
			if(num <= 0) {
				$kit.css(me.config.container, 'height', Math.max.apply(Math, me.config.curColHeights));
				me._adjuster = 0;
				callback && callback.call(me);
				// me.fire('adjustComplete', {
				// items : items
				// });
			}
		}

		if(!num) {
			return callback && callback.call(me);
		}

		return me._adjuster = me.timedChunk(items, function(item) {
			me.adjustItemAction(me, false, item, check);
		});
	},
	timedChunk : function(items, process, context, callback) {
		var todo = [].concat(items), stopper = {}, timer;
		if(todo.length > 0) {
			timer = setTimeout(function() {
				var start = +new Date();
				do {
					var item = todo.shift();
					process.call(context, item);
				} while (todo.length > 0 && (+new Date() - start < 50));

				if(todo.length > 0) {
					timer = setTimeout(arguments.callee, 25);
				} else {
					callback && callback.call(context, items);
				}
			}, 25);
		} else {
			callback && setTimeout(function() {
				callback.apply(context, items)
			}, 0);
		}

		stopper.stop = function() {
			if(timer) {
				clearTimeout(timer);
				todo = [];
				// $kit.each(items, function(item) {
				// item.stop();
				// });
			}
		};
		return stopper;
	},
	recalculate : function() {
		var me = this;
		//
		me.config.curColHeights = me.config.curColHeights || [];
		var container = me.config.container, //
		containerWidth = $kit.offset(container).width, //

		curColHeights = me.config.curColHeights;
		// 当前列数
		curColHeights.length = Math.max(parseInt(containerWidth / me.config.colWidth), me.config.minColCount);
		// 当前容器宽度
		me._containerRegion = {
			width : containerWidth
		};
		$kit.each(curColHeights, function(v, i) {
			curColHeights[i] = 0;
		});
		me.config.colItems = [];
	},
	adjustItemAction : function(me, add, itemRaw, callback) {
		var effect = me.config.effect, //
		item = itemRaw, //
		align = me.config.align, //
		curColHeights = me.config.curColHeights, //
		container = me.config.container, //
		curColCount = curColHeights.length, //
		col = 0, //
		containerRegion = me._containerRegion, //
		guard = Number.MAX_VALUE;

		if(!curColCount) {
			return undefined;
		}

		// 固定左边或右边
		if($kit.hsCls(item, "ks-waterfall-fixed-left")) {
			col = 0;
		} else if($kit.hsCls(item, "ks-waterfall-fixed-right")) {
			col = curColCount > 0 ? curColCount - 1 : 0;
		} else {
			// 否则找到最短的列
			for(var i = 0; i < curColCount; i++) {
				if(curColHeights[i] < guard) {
					guard = curColHeights[i];
					col = i;
				}
			}
		}

		// 元素保持间隔不变，居中
		var margin = align === 'left' ? 0 : Math.max(containerRegion.width - curColCount * me.config.colWidth, 0), colProp;

		if(align === 'center') {
			margin /= 2;
		}
		colProp = {
			// 元素间固定间隔好点
			left : (col * me.config.colWidth + margin ) + 'px',
			top : curColHeights[col] + 'px'
		};

		/*
		 不在容器里，就加上
		 */
		if(add) {
			// 初始需要动画，那么先把透明度换成 0
			$kit.css(item, colProp);
			container.appendChild(item);
			if(effect) {
				// has layout to allow to compute height
				//item.css("visibility", "hidden");
				$kit.anim.motion($kit.merge({
					el : item
				}, effect));
			}
			callback && callback();
		}
		// 否则调整，需要动画
		else {
			var adjustEffect = me.config.effect;
			if(adjustEffect) {
				//item.animate(colProp, adjustEffect.duration, adjustEffect.easing, callback);
				//$kit.css(item, colProp);
				$kit.anim.motion($kit.merge({
					el : item
				}, effect, {
					from : {
						top : $kit.css(item, 'top') + 'px',
						left : $kit.css(item, 'left') + 'px'
					},
					to : colProp,
					then : function() {
						callback && callback();
					}
				}));
			} else {
				$kit.css(item, colProp);
				callback && callback();
			}
		}

		// 加入到 dom 树才能取得高度
		var mTop = $kit.css(item, 'margin-top'), mBot = $kit.css(item, 'margin-bottom');
		curColHeights[col] += item.offsetHeight + (isNaN(mTop) ? 0 : mTop) + (isNaN(mBot) ? 0 : mBot);
		var colItems = me.config.colItems;
		colItems[col] = colItems[col] || [];
		colItems[col].push(item);
		$kit.attr(item, me.config.colAttrName, col);

		return item;
	},
	addItem : function(itemRaw) {
		var me = this,
		// update curColHeights first
		// because may slideDown to affect height
		item = me.adjustItemAction(me, true, itemRaw), effect = me.config.effect;
		// then animate
		// if(effect && effect.effect) {
		// // 先隐藏才能调用 fadeIn slideDown
		// item.hide();
		// item.css("visibility", "");
		// item[effect.effect](effect.duration, 0, effect.easing);
		// }
	},
	//
	doScroll : function() {
		var me = this;
		if(me.__loading) {
			return;
		}
		// 如果正在调整中，等会再看
		// 调整中的高度不确定，现在不适合判断是否到了加载新数据的条件
		if(me.isAdjusting()) {
			// 恰好 __onScroll 是 buffered . :)
			me.__onScroll();
			return;
		}
		var container = me.config.container, //
		colHeight = $kit.offset(me.config.container).top, //
		diff = me.config.diff, //
		curColHeights = me.config.curColHeights;
		// 找到最小列高度
		if(curColHeights && curColHeights.length) {
			colHeight += Math.min.apply(Math, curColHeights);
		} else {
			colHeight = 0;
		}
		// 动态载
		// 最小高度(或被用户看到了)低于预加载线
		var viewport = $kit.viewport();
		if(diff + viewport.scrollTop + viewport.clientHeight > colHeight) {
			me.newEv('loadData');
			me.loadData();
		}
	},
	loadData : function() {
		var me = this, container = me.config.container;

		me.__loading = 1;

		var load = me.config.load;
		load && load(success, end);

		function success(items, callback) {
			me.__loading = 0;
			me.addItems(items, callback);
		}

		function end() {
			me.end();
		}

	},
	/**
	 * Start monitor scroll on window.
	 */
	start : function() {
		var me = this;
		if(!me.__started) {
			$kit.ev({
				el : window,
				ev : 'scroll',
				fn : me.__onScroll
			});
			me.__started = 1;
		}
	},
	/**
	 * Stop monitor scroll on window.
	 */
	end : function() {
		$kit.delEv({
			el : window,
			ev : 'scroll',
			fn : this.__onScroll
		});
	},
	/**
	 * Use end instead.
	 * @deprecated 1.3
	 */
	pause : function() {
		this.end();
	},
	/**
	 * Use start instead.
	 * @deprecated 1.3
	 */
	resume : function() {
		this.start();
	},
	/**
	 * Destroy this instance.
	 */
	destroy : function() {
		var me = this;
		$kit.delEv({
			el : window,
			ev : "scroll",
			fn : me.__onScroll
		});
		me.__started = 0;
	},
	/**
	 * Whether is adjusting waterfall items.
	 * @returns Boolean
	 */
	isAdjusting : function() {
		return !!this._adjuster;
	},
	/**
	 * Whether is adding waterfall item.
	 * @since 1.3
	 * @returns Boolean
	 */
	isAdding : function() {
		return !!this._adder;
	},
	/**
	 * Ajust the height of one specified item.
	 * @param {NodeList} item Waterfall item to be adjusted.
	 * @param {Object} cfg Config object.
	 * @param {Function} cfg.callback Callback function after the item is adjusted.
	 * @param {Function} cfg.process Adjust logic function.
	 * If returns a number, it is used as item height after adjust.
	 * else use item.outerHeight(true) as item height after adjust.
	 * @param {Object} cfg.effect Same as {@link Waterfall#adjustEffect}
	 * @param {Number} cfg.effect.duration
	 * @param {String} cfg.effect.easing
	 */
	adjustItem : function(item, cfg) {
		var me = this;
		cfg = cfg || {};

		if(me.isAdjusting()) {
			return;
		}

		var originalOuterHeight = item.outerHeight(true), outerHeight;

		if(cfg.process) {
			outerHeight = cfg.process.call(me);
		}

		if(outerHeight === undefined) {
			outerHeight = item.outerHeight(true);
		}

		var diff = outerHeight - originalOuterHeight, //
		curColHeights = me.config.curColHeights, //
		col = parseInt($kit.attr(item, me.config.colAttrName)), //
		colItems = me.config.colItems[col], //
		items = [], //
		original = Math.max.apply(Math, curColHeights), //
		now;

		for(var i = 0; i < colItems.length; i++) {
			if(colItems[i][0] === item[0]) {
				break;
			}
		}
		i++;

		while(i < colItems.length) {
			items.push(colItems[i]);
			i++;
		}

		curColHeights[col] += diff;
		now = Math.max.apply(Math, curColHeights);

		if(now != original) {
			$kit.css(me.config.container, 'height', now);
		}

		var effect = cfg.effect, num = items.length;

		if(!num) {
			return cfg.callback && cfg.callback.call(me);
		}

		function check() {
			num--;
			console.log(1);
			if(num <= 0) {
				me._adjuster = 0;
				cfg.callback && cfg.callback.call(me);
			}
		}

		if(effect === undefined) {
			effect = me.config.effect;
		}

		return me._adjuster = me.timedChunk(items, function(item) {
			if(effect) {
				// item.animate({
				// top : parseInt(item.css("top")) + diff
				// }, effect.duration, effect.easing, check);
				$kit.anim.motion($kit.merge({
					el : item
				}, effect, {
					from : {
						top : $kit.css(item, 'top'),
						left : $kit.css(item, 'left')
					},
					to : colProp,
					then : check
				}));
			} else {
				$kit.css(item, "top", parseInt(item.css("top")) + diff);
				check();
			}
		});
	},
	/**
	 * Remove a waterfall item.
	 * @param {NodeList} item Waterfall item to be removed.
	 * @param {Object} cfg Config object.
	 * @param {Function} cfg.callback Callback function to be called after remove.
	 * @param {Object} cfg.effect Same as {@link Waterfall#adjustEffect}
	 * @param {Number} cfg.effect.duration
	 * @param {String} cfg.effect.easing
	 */
	removeItem : function(item, cfg) {
		cfg = cfg || {};
		var me = this, callback = cfg.callback;
		me.adjustItem(item, S.mix(cfg, {
			process : function() {
				item.remove();
				return 0;
			},
			callback : function() {
				var col = parseInt(item.attr(me.config.colAttrName)), colItems = me.config.colItems[col];
				for(var i = 0; i < colItems.length; i++) {
					if(colItems[i][0] == item[0]) {
						colItems.splice(i, 1);
						break;
					}
				}
				callback && callback();
			}
		}));
	},
	/**
	 * Add array of waterfall items to current instance.
	 * @param {NodeList[]} items Waterfall items to be added.
	 * @param {Function} [callback] Callback function to be called after waterfall items are added.
	 */
	addItems : function(items, callback) {
		var me = this;

		/* 正在调整中，直接这次加，和调整的节点一起处理 */
		/* 正在加，直接这次加，一起处理 */
		me._adder = me.timedChunk(items, me.addItem, me, function() {
			$kit.css(me.config.container, 'height', (Math.max.apply(Math, me.config.curColHeights)));
			me._adder = 0;
			callback && callback.call(me);
		});
		return me._adder;
	},
	/**
	 * 注册自定义事件
	 * @param {Object} config
	 * @param {String} config.ev
	 * @param {Function} config.fn
	 */
	ev : function() {
		if(arguments.length == 1) {
			var evCfg = arguments[0];
			var scope = evCfg.scope || this;
			if($kit.isFn(evCfg.fn) && $kit.isStr(evCfg.ev)) {
				var evCfg = {
					ev : evCfg.ev,
					fn : evCfg.fn,
					scope : this
				};
				this.event = this.event || {};
				this.event[evCfg.ev] = this.event[evCfg.ev] || [];
				this.event[evCfg.ev].push(evCfg);
			}
		}
	},
	/**
	 * 触发自定义事件
	 * @param {Object} config
	 * @param {String} config.ev
	 */
	newEv : function() {
		if(arguments.length == 1 && !$kit.isEmpty(this.event)) {
			var evAry, evCfg, _evCfg = {};
			if($kit.isStr(arguments[0])) {
				var ev = arguments[0];
				evAry = this.event[ev];
			} else if($kit.isObj(arguments[0])) {
				_evCfg = arguments[0];
				evAry = this.event[_evCfg.ev];
			}
			if(!$kit.isEmpty(evAry)) {
				for(var i = 0; evAry != null && i < evAry.length; i++) {
					evCfg = $kit.merge(evAry[i], _evCfg);
					var e = {
						target : this,
						type : evCfg.ev
					}
					evCfg.fn.call(evCfg.scope, e, evCfg);
				}
			}
		}
	}
});
