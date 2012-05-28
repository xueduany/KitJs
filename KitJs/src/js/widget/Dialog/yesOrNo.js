/**
 * 对话框组件，yes Or no Or cancel
 * @class $kit.ui.Dialog.YesOrNo
 * @extends $kit.ui.Dialog
 * @require kit.js
 * @require dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Dialog/yesOrNo.js">Source code</a>
 */
$kit.ui.Dialog.YesOrNo = function(config) {
	var me = this;
	$kit.inherit({
		child : $kit.ui.Dialog.YesOrNo,
		father : $kit.ui.Dialog
	});
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.Dialog.YesOrNo, {
	defaultConfig : $kit.mergeIf(
	/**
	 * @member defaultConfig
	 * @memberOf $kit.ui.Dialog.YesOrNo
	 * @enum
	 */
	{
		html : [//
		'<div class="${dialogCls}">', //
		'<div class="${dialogTitleCls}"></div>', //
		'<div class="${dialogPanelCls}">', //
		'<div class="${confirmTextCls}">${confirmText}</div>', //
		'<div class="${confirmButtonsCls}">', //
		'<a class="${yesCls}">${yesText}</a>', //
		'<a class="${noCls}">${noText}</a>', //
		'<a class="${cancelCls}">${cancelText}</a>', //
		'</div>', //
		'</div>', //
		'<a class="${closeBtnCls}">╳</a>', //
		'</div>'//
		].join(''),
		yesText : '是',
		noText : '否',
		cancelText : '取消',
		confirmTextCls : 'kitjs-dialog-confirm-text',
		confirmButtonsCls : 'kitjs-dialog-confirm-buttons',
		yesCls : 'confirm-yes',
		noCls : 'confirm-no',
		cancelCls : 'confirm-cancel',
		confirmText : '请确认你的请求？',
		//
		// yes的跳转方法
		yesThen : null,
		// no的跳转方法
		noThen : null,
		// 取消的跳转方法
		cancelThen : null
	}, $kit.ui.Dialog.defaultConfig)
});
$kit.merge($kit.ui.Dialog.YesOrNo.prototype,
/**
 * @lends $kit.ui.Dialog.YesOrNo.prototype
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
		me.yesBtn = $kit.el8cls(me.config.yesCls, me.wrapper);
		me.noBtn = $kit.el8cls(me.config.noCls, me.wrapper);
		me.cancelBtn = $kit.el8cls(me.config.cancelCls, me.wrapper);
		$kit.ev({
			el : me.closeBtn,
			ev : 'click',
			fn : me.hide,
			scope : me
		});
		$kit.ev({
			el : me.yesBtn,
			ev : 'click',
			fn : function(e) {
				me.config.yesThen && me.config.yesThen();
				me.hide();
			},
			scope : me
		});
		$kit.ev({
			el : me.noBtn,
			ev : 'click',
			fn : function(e) {
				me.config.noThen && me.config.noThen();
				me.hide();
			},
			scope : me
		});
		$kit.ev({
			el : me.cancelBtn,
			ev : 'click',
			fn : function(e) {
				me.config.cancelThen && me.config.cancelThen();
				me.hide();
			},
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
	 * 点击yes执行方法
	 * @param {Function}
	 */
	setYesThen : function(fn) {
		this.config.yesThen = fn;
	},
	/**
	 * 点击no执行方法
	 * @param {Function}
	 */
	setNoThen : function(fn) {
		this.config.noThen = fn;
	},
	/**
	 * 点击cancel执行方法
	 * @param {Function}
	 */
	setCancelThen : function(fn) {
		this.config.cancelThen = fn;
	}
});
