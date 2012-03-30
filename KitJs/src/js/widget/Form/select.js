$kit.ui.Form.Select = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.Select,
		father : $kit.ui.Form
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Form.Select, {
	defaultConfig : {
		el : undefined,
		minRows : 1,
		autoFixHeight : true,
		textIsEmptyFn : undefined,
		textNotEmptyFn : undefined,
		blurFn : undefined,
		focusFn : undefined,
		kitWidgetName : "kitTextArea",
		textAreaCls : 'kitjs-form-textarea'
	}
});
$kit.merge($kit.ui.Form.Select.prototype, {
	init : function() {
		
	}
});
