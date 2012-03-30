$kit.ui.Form.ComboBox = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.ComboBox,
		father : $kit.ui.Form
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Form.ComboBox, {
	defaultConfig : {
		el : undefined,
		inputEl : undefined,
		kitWidgetName : 'kitFormComboBox',
		comboboxCls : 'kitjs-form-combobox',
		wrapperCls : 'kitjs-form-combox-wrapper',
		listItemCls : 'kitjs-form-combox-listItem'
	}
});
$kit.merge($kit.ui.Form.ComboBox.prototype, {
	init : function() {
		var me = this;
		me.transform();
	},
	transform : function() {
		var me = this;
		me.wrapper = document.createElement('div');
		$kit.adCls(me.wrapper, me.config.wrapperCls);
		this.menu = document.createElement('ul');
		if(me.config.el.tagName && me.config.el.tagName.toLowerCase() == 'select') {
			var select = me.config.el;
			for(var i = 0; i < select.options.length; i++) {
				var li = document.createElement();
				$kit.adCls(li, )
			}
		}
		$kit.rpEl(me.config.el, me.wrapper);
		$kit.insEl({
			where : me.wrapper,
			pos : 'last',
			what : this.menu
		});
	}
});
