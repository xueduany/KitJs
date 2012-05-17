/**
 * 相册效果
 * @class $kit.ui.Gallery
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Gallery/gallery.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/Gallery/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/Gallery/demo.png" width="800">
 */
$kit.ui.Gallery = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.Gallery,
/**
 * @lends $kit.ui.Gallery
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		kitWidgetName : "kitGallery",
		template : {
			galleryHTML : [//
			'<div class="${galleryCls}">', //
			'<ul class="${itemListCls}">', //
			'</ul>', //
			'</div>', //
			'<div class="${galleryControlPanelCls}">', //
			'<button class="${btnPrevCls}">上一个</button>', //
			'<button class="${btnNextCls}">下一个</button>', //
			'</div>'//
			].join(''),
			wrapperCls : 'kitjs-gallery-wrapper',
			galleryCls : 'kitjs-gallery',
			itemHTML : [//
			'<li class="${itemCls}">', //
			'<a>', //
			'<img src="${imgSrc}">', //
			'</a>', //
			'</li>'//
			].join(''),
			itemListCls : 'kitjs-gallery-item-list',
			itemCls : 'kitjs-gallery-item',
			galleryControlPanelCls : 'kitjs-gallery-control-panel',
			btnPrevCls : 'kitjs-gallery-btn-prev',
			btnNextCls : 'kitjs-gallery-btn-next',
			selectedItemCls : 'kitjs-gallery-item-selected',
			previousItemCls : 'kitjs-gallery-item-previous',
			nextItemCls : 'kitjs-gallery-item-next',
			btnDisabledCls : 'kitjs-gallery-btn-disabled'
		},
		el : undefined,
		/**
		 * [{href : '',imgSrc : '1.jpg'}, ...]
		 * @type {Array<Object>}
		 */
		data : undefined,
		/**
		 * 选中第几个
		 * @type {Number}
		 */
		selectedIndex : 0,
		/**
		 * 是否循环
		 * @type {Boolean}
		 */
		loop : false
	}
});
$kit.merge($kit.ui.Gallery.prototype,
/**
 * @lends $kit.ui.Gallery.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		if(!me.config.el) {
			return;
		}
		me.wrapper = document.createElement('div');
		me.wrapper.className = me.config.template.wrapperCls;
		$kit.rpEl(me.config.el, me.wrapper);
		me.wrapper.innerHTML = $kit.tpl(me.config.template.galleryHTML, me.config.template);
		me.gallery = $kit.el8cls(me.config.template.galleryCls, me.wrapper);
		me.screenWidth = me.gallery.offsetWidth;
		me.list = $kit.el8cls(me.config.template.itemListCls, me.wrapper);
		if(me.config.data && me.config.data.length) {
			me.buildList(me.config.data);
		}
		me.control = $kit.el8cls(me.config.template.galleryControlPanelCls, me.wrapper);
		//
		me.initControl();
		return me;
	},
	/**
	 * 填充数据
	 */
	fillData : function(data) {
		me.config.data = data;
	},
	/**
	 * 创建列表
	 */
	buildList : function(data) {
		var me = this;
		if(data && data.length) {
			$kit.each(data, function(item) {
				me.list.appendChild($kit.newHTML($kit.tpl(me.config.template.itemHTML, $kit.join(me.config.template, item))))
			});
		}
		me.initSelectedItemStyle();
	},
	/**
	 * 初始化选中图片的样式
	 */
	initSelectedItemStyle : function() {
		var me = this;
		me.items = $kit.els8cls(me.config.template.itemCls, me.list);
		me.itemsMaxWidth = me.items[0].offsetWidth * me.items.length;
		me.selectedItem = me.items[me.config.selectedIndex];
		$kit.adCls(me.selectedItem, me.config.template.selectedItemCls);
		//
		if(me.config.selectedIndex > 0) {
			me.previousItem = me.items[me.config.selectedIndex - 1];
		} else {
			if(me.config.loop) {
				me.previousItem = me.items[me.items.length - 1];
			}
		}
		$kit.adCls(me.previousItem, me.config.template.previousItemCls);
		//
		if(me.config.selectedIndex < me.items.length - 1) {
			me.nextItem = me.items[me.config.selectedIndex + 1];
		} else {
			if(me.config.loop) {
				me.nextItem = me.items[0];
			}
		}
		$kit.adCls(me.nextItem, me.config.template.nextItemCls);
	},
	/**
	 * 绑定事件
	 */
	initControl : function() {
		var me = this;
		me.btnPrev = $kit.el8cls(me.config.template.btnPrevCls, me.control);
		$kit.ev({
			el : me.btnPrev,
			ev : 'click',
			fn : function(e) {
				var me = this;
				me.prev();
			},
			scope : me
		});
		me.btnNext = $kit.el8cls(me.config.template.btnNextCls, me.control);
		$kit.ev({
			el : me.btnNext,
			ev : 'click',
			fn : function(e) {
				var me = this;
				me.next();
			},
			scope : me
		});
		if(me.config.selectedIndex == me.items.length - 1) {
			$kit.adCls(me.btnNext, me.config.template.btnDisabledCls);
			$kit.attr(me.btnNext, 'disabled', 'true');
		} else if(me.config.selectedIndex == 0) {
			$kit.adCls(me.btnPrev, me.config.template.btnDisabledCls);
			$kit.attr(me.btnPrev, 'disabled', 'true');
		}
	},
	/**
	 * 下一个图片
	 */
	next : function(count) {
		var me = this;
		$kit.rmCls(me.btnPrev, me.config.template.btnDisabledCls);
		$kit.attr(me.btnPrev, 'disabled', null);
		var index = 0;
		if(me.config.selectedIndex < me.items.length - 1) {
			index = me.config.selectedIndex + 1;
		} else {
			if(me.config.loop) {
				index = 0;
			} else {
				index = me.config.selectedIndex;
			}
		}
		if(index == me.items.length - 1) {
			$kit.adCls(me.btnNext, me.config.template.btnDisabledCls);
			$kit.attr(me.btnNext, 'disabled', 'true');
		}
		me.switchItem(index);
	},
	/**
	 * 上一个图片
	 */
	prev : function(count) {
		var me = this;
		$kit.rmCls(me.btnNext, me.config.template.btnDisabledCls);
		$kit.attr(me.btnNext, 'disabled', null);
		var index = 0;
		if(me.config.selectedIndex > 0) {
			index = me.config.selectedIndex - 1;
		} else {
			if(me.config.loop) {
				index = me.items.length - 1;
			} else {
				index = 0;
			}
		}
		if(index == 0) {
			$kit.adCls(me.btnPrev, me.config.template.btnDisabledCls);
			$kit.attr(me.btnPrev, 'disabled', 'true');
		}
		me.switchItem(index);
	},
	/**
	 * 切换图片
	 */
	switchItem : function(selectedIndex) {
		var me = this;
		var itemWidth, moveLeftTo, moveLeftNow;
		itemWidth = me.items[0].offsetWidth;
		moveLeftTo = -(selectedIndex * itemWidth);
		var flagMoveToEnd = false;
		if(Math.abs(moveLeftTo) + me.screenWidth >= me.itemsMaxWidth) {
			moveLeftTo = -(me.itemsMaxWidth - me.screenWidth);
			flagMoveToEnd = true;
		}
		moveLeftNow = $kit.css(me.list, 'left') || 0;
		if(moveLeftTo != moveLeftNow && //
		(//
			flagMoveToEnd || (moveLeftTo <= moveLeftNow - me.screenWidth) || moveLeftTo > moveLeftNow//
		)//
		) {
			flagMoveToEnd = false;
			$kit.anim.motion({
				el : me.list,
				fx : $kit.anim.Fx.easeOutQuad,
				from : {
					left : moveLeftNow + 'px'
				},
				to : {
					left : moveLeftTo + 'px'
				},
				timeout : 'kitjs-switch-gallery'
			});
		}
		me.config.selectedIndex = selectedIndex;
		//
		$kit.rmCls(me.selectedItem, me.config.template.selectedItemCls);
		me.selectedItem = me.items[me.config.selectedIndex];
		$kit.adCls(me.selectedItem, me.config.template.selectedItemCls);
		//
		$kit.rmCls(me.previousItem, me.config.template.previousItemCls);
		if(me.config.selectedIndex > 0) {
			me.previousItem = me.items[me.config.selectedIndex - 1];
		} else {
			if(me.config.loop) {
				me.previousItem = me.items[me.items.length - 1];
			}
		}
		$kit.adCls(me.previousItem, me.config.template.previousItemCls);
		//
		$kit.rmCls(me.nextItem, me.config.template.nextItemCls);
		if(me.config.selectedIndex < me.items.length - 1) {
			me.nextItem = me.items[me.config.selectedIndex + 1];
		} else {
			if(me.config.loop) {
				me.nextItem = me.items[0];
			}
		}
		$kit.adCls(me.nextItem, me.config.template.nextItemCls);
	}
});
