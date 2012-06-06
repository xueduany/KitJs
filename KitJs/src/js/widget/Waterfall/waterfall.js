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
 * @lends $kit.ui.Waterfall.prototype
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitWaterfall',
		validatorCls : 'kitjs-waterfall'
	}
});
$kit.merge($kit.ui.Waterfall.prototype,
/**
 * @lends $kit.ui.Waterfall.prototype
 */
{
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
		colHeight = $kit.dom.offset(me.config.container).top, //
		diff = me.config.diff, //
		curColHeights = me.config.curColHeights;
		// 找到最小列高度
		if(curColHeights.length) {
			colHeight += Math.min.apply(Math, curColHeights);
		}
		// 动态载
		// 最小高度(或被用户看到了)低于预加载线
		var viewport = $kit.viewport();
		if(diff + viewport.scrollTop + viewport.scrollHeight > colHeight) {
			loadData.call(me);
		}
	},
	loadData : function() {
		var me = this, container = me.config.container;

		self.__loading = 1;

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
	_init : function() {
		var me = this;
		me.__onScroll = S.buffer(doScroll, SCROLL_TIMER, self);
		// 初始化时立即检测一次，但是要等初始化 adjust 完成后.
		me.__onScroll();
		me.start();
	},
	/**
	 * Start monitor scroll on window.
	 * @since 1.3
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
	timedChunk : function(items, process, context, callback) {
		var todo = [].concat(S.makeArray(items)), stopper = {}, timer;
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
			callback && S.later(callback, 0, false, context, [items]);
		}

		stopper.stop = function() {
			if(timer) {
				clearTimeout(timer);
				todo = [];
				items.each(function(item) {
					item.stop();
				});
			}
		};
		return stopper;
	},
	doResize : function() {
		var me = this, containerRegion = me._containerRegion || {};
		// 宽度没变就没必要调整
		if(containerRegion && $kit.offset(me.config.container).width() === containerRegion.width) {
			return
		}
		me.adjust();
	},
	recalculate : function() {
		var me = this, container = me.config.container, containerWidth = $kit.offset(container).width, curColHeights = me.config.curColHeights;
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
	adjustItemAction : function(self, add, itemRaw, callback) {
		var effect = self.get("effect"), item = $(itemRaw), align = self.get("align"), curColHeights = self.get("curColHeights"), container = self.get("container"), curColCount = curColHeights.length, col = 0, containerRegion = self._containerRegion, guard = Number.MAX_VALUE;

		if(!curColCount) {
			return undefined;
		}

		// 固定左边或右边
		if(item.hasClass("ks-waterfall-fixed-left")) {
			col = 0;
		} else if(item.hasClass("ks-waterfall-fixed-right")) {
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
		var margin = align === 'left' ? 0 : Math.max(containerRegion.width - curColCount * self.get("colWidth"), 0), colProp;

		if(align === 'center') {
			margin /= 2;
		}
		colProp = {
			// 元素间固定间隔好点
			left : col * self.get("colWidth") + margin,
			top : curColHeights[col]
		};

		/*
		 不在容器里，就加上
		 */
		if(add) {
			// 初始需要动画，那么先把透明度换成 0
			item.css(colProp);
			if(effect && effect.effect) {
				// has layout to allow to compute height
				item.css("visibility", "hidden");
			}
			container.append(item);
			callback && callback();
		}
		// 否则调整，需要动画
		else {
			var adjustEffect = self.get("adjustEffect");
			if(adjustEffect) {
				item.animate(colProp, adjustEffect.duration, adjustEffect.easing, callback);
			} else {
				item.css(colProp);
				callback && callback();
			}
		}

		// 加入到 dom 树才能取得高度
		curColHeights[col] += item.outerHeight(true);
		var colItems = self.get("colItems");
		colItems[col] = colItems[col] || [];
		colItems[col].push(item);
		item.attr("data-waterfall-col", col);

		return item;
	},
	addItem : function(itemRaw) {
		var self = this,
		// update curColHeights first
		// because may slideDown to affect height
		item = adjustItemAction(self, true, itemRaw), effect = self.get("effect");
		// then animate
		if(effect && effect.effect) {
			// 先隐藏才能调用 fadeIn slideDown
			item.hide();
			item.css("visibility", "");
			item[effect.effect](effect.duration, 0, effect.easing);
		}
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
	_init : function() {
		var self = this;
		// 一开始就 adjust 一次，可以对已有静态数据处理
		doResize.call(self);
		self.__onResize = S.buffer(doResize, RESIZE_DURATION, self);
		$(win).on("resize", self.__onResize);
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
		var self = this;
		cfg = cfg || {};

		if(self.isAdjusting()) {
			return;
		}

		var originalOuterHeight = item.outerHeight(true), outerHeight;

		if(cfg.process) {
			outerHeight = cfg.process.call(self);
		}

		if(outerHeight === undefined) {
			outerHeight = item.outerHeight(true);
		}

		var diff = outerHeight - originalOuterHeight, curColHeights = self.get("curColHeights"), col = parseInt(item.attr("data-waterfall-col")), colItems = self.get("colItems")[col], items = [], original = Math.max.apply(Math, curColHeights), now;

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
			self.get("container").height(now);
		}

		var effect = cfg.effect, num = items.length;

		if(!num) {
			return cfg.callback && cfg.callback.call(self);
		}

		function check() {
			num--;
			if(num <= 0) {
				self._adjuster = 0;
				cfg.callback && cfg.callback.call(self);
			}
		}

		if(effect === undefined) {
			effect = self.get("adjustEffect");
		}

		return self._adjuster = timedChunk(items, function(item) {
			if(effect) {
				item.animate({
					top : parseInt(item.css("top")) + diff
				}, effect.duration, effect.easing, check);
			} else {
				item.css("top", parseInt(item.css("top")) + diff);
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
		var self = this, callback = cfg.callback;
		self.adjustItem(item, S.mix(cfg, {
			process : function() {
				item.remove();
				return 0;
			},
			callback : function() {
				var col = parseInt(item.attr("data-waterfall-col")), colItems = self.get("colItems")[col];
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
	 * Readjust existing waterfall item.
	 * @param {Function} [callback] Callback function to be called after adjust.
	 */
	adjust : function(callback) {
		S.log("waterfall:adjust");
		var self = this, items = self.get("container").all(".ks-waterfall");
		/* 正在加，直接开始这次调整，剩余的加和正在调整的一起处理 */
		/* 正在调整中，取消上次调整，开始这次调整 */
		if(self.isAdjusting()) {
			self._adjuster.stop();
			self._adjuster = 0;
		}
		/*计算容器宽度等信息*/
		recalculate.call(self);
		var num = items.length;

		function check() {
			num--;
			if(num <= 0) {
				self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
				self._adjuster = 0;
				callback && callback.call(self);
				self.fire('adjustComplete', {
					items : items
				});
			}
		}

		if(!num) {
			return callback && callback.call(self);
		}

		return self._adjuster = timedChunk(items, function(item) {
			adjustItemAction(self, false, item, check);
		});
	},
	/**
	 * Add array of waterfall items to current instance.
	 * @param {NodeList[]} items Waterfall items to be added.
	 * @param {Function} [callback] Callback function to be called after waterfall items are added.
	 */
	addItems : function(items, callback) {
		var self = this;

		/* 正在调整中，直接这次加，和调整的节点一起处理 */
		/* 正在加，直接这次加，一起处理 */
		self._adder = timedChunk(items, addItem, self, function() {
			self.get("container").height(Math.max.apply(Math, self.get("curColHeights")));
			self._adder = 0;
			callback && callback.call(self);
			self.fire('addComplete', {
				items : items
			});
		});
		return self._adder;
	},
	/**
	 * Destroy current instance.
	 */
	destroy : function() {
		$(win).detach("resize", this.__onResize);
	}
});
