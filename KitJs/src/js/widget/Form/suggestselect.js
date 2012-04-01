$kit.ui.Form.ComboBox.Select = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.ComboBox.Select,
		father : $kit.ui.Form.ComboBox
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Form.ComboBox.Select, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitFormSuggestSelect',
		transformCls : 'kitjs-form-suggestselect',
		inputCls : 'kitjs-form-suggestselect-input',
		wrapperCls : 'kitjs-form-suggestselect-wrapper',
		suggestDelay : 500
	}
});
$kit.merge($kit.ui.Form.ComboBox.Select.prototype, {
	/**
	 * 给隐藏表单元素赋值
	 */
	_setFormValue : function() {
		var me = this;
		if(me.list.listItemCount == 1 && me.inputEl.value == $kit.el8cls(me.list.config.listItemCls, me.list.listEl).innerHTML) {
			var li = $kit.el8cls(me.list.config.listItemCls, me.list.listEl);
			me.formEl.value = $kit.attr(li, 'value');
		}
	},
	_blur : function() {
		var me = this;
		if($kit.isEmpty(me.list.selectedLi)) {
			me.inputEl.value = '';
		} else {
			me.inputEl.value = me.list.selectedLi.innerHTML;
		}
	}
});
