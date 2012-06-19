/**
 * 对话框组件
 * @class $kit.ui.Dialog
 * @require kit.js
 * @require dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Dialog/dialog.js">Source code</a>
 */
$kit.ui.Dialog = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.Dialog,
/**
 * @lends $kit.ui.Dialog
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		html : [//
		'<div class="${dialogCls}">', //
		'<div class="${dialogTitleCls}"></div>', //
		'<div class="${dialogPanelCls}">', //
		'</div>', //
		'<a class="${closeBtnCls}">╳</a>', //
		'</div>'//
		].join(''),
		dialogCls : 'kitjs-dialog',
		dialogTitleCls : 'kitjs-dialog-title',
		dialogPanelCls : 'kitjs-dialog-panel',
		closeBtnCls : 'kitjs-dialog-close-btn',
		//
		useMask : false,
		draggable : true,
		title : 'Dialog'
	}
});
$kit.merge($kit.ui.Dialog.prototype,
/**
 * @lends $kit.ui.Dialog.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		me.wrapper = $kit.newHTML($kit.tpl(me.config.html,me.config)).childNodes[0];
		document.body.appendChild(me.wrapper);
		me.title = $kit.el8cls(me.config.dialogTitleCls, me.wrapper);
		me.panel = $kit.el8cls(me.config.dialogPanelCls, me.wrapper);
		me.closeBtn = $kit.el8cls(me.config.closeBtnCls, me.wrapper);
		$kit.ev({
			el : me.closeBtn,
			ev : 'click',
			fn : me.hide,
			scope : me
		});
		if(me.title && me.config.title) {
			me.title.innerHTML = me.config.title;
		}
		if(me.config.useMask) {
			me.mask = new $kit.ui.Mask();
		}
		if(me.config.draggable) {
			$kit.event.draggable(me.title);
		}
		return me;
	},
	/**
	 * 居中
	 */
	center : function() {
		var me = this;
		var pos = $kit.dom.clientOffsetCenter(me.wrapper);
		$kit.css(me.wrapper, {
			top : pos.top + 'px',
			left : pos.left + 'px'
		});
	},
	/**
	 * 显示
	 */
	show : function() {
		var me = this;
		if(me.config.useMask && me.mask) {
			me.mask.show();
		}
		me.wrapper.style.display = '';
	},
	/**
	 * 隐藏
	 */
	hide : function() {
		var me = this;
		if(me.config.useMask && me.mask) {
			me.mask.hide();
		}
		me.wrapper.style.display = 'none';
	},
	/**
	 * 销毁
	 */
	destroy : function() {
		$kit.rmEl(this.wrapper);
	}
});
