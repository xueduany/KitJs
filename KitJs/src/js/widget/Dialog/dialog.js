/**
 * 对话框组件
 * @class $kit.ui.Dialog
 * @require kit.js
 * @require dom.js
 *
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
	defaultConfig : {
		template : {
			html : [//
			'<div class="${dialogCls}">', //
			'<div class="${dialogPanelCls}">', //
			'</div>', //
			'<s class="${closeBtnClss}"></s>', //
			'</div>'//
			].join(''),
			dialogCls : 'kitjs-dialog',
			dialogPanelCls : 'kitjs-dialog-panel',
			closeBtnCls : 'kitjs-dialog-close-btn'
		},
		useMask : false
	}
});
$kit.merge($kit.ui.Dialog.prototype,
/**
 * @lends $kit.ui.Dialog.prototype
 */
{
	init : function() {
		var me = this;
		me.wrapper = $kit.newHTML($kit.tpl(me.config.template.html,me.config.template)).childNodes[0];
		document.body.appendChild(me.wrapper);
		me.panel = $kit.el('div.'+me.config.template.dialogPanelCls)[0];
		if(me.config.useMask) {
			me.mask = new $kit.ui.Mask();
		}
	},
	center : function() {
		var me = this;
		var pos = $kit.dom.clientOffsetCenter(me.wrapper);
		$kit.css(me.wrapper, {
			top : pos.top + 'px',
			left : pos.left + 'px'
		})
	}
});
