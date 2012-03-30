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
		kitWidgetName : 'kitFormComboBox',
		comboboxCls : 'kitjs-form-combobox',
		wrapperCls : 'kitjs-form-combox-wrapper'
	}
});
$kit.merge($kit.ui.Form.ComboBox.prototype, {
	init : function() {
		var me = this;
		me.transform();
	},
	transform : function() {
		var me = this;
		this.wrapper = document.createElement('div');
		$kit.adCls(this.wrapper, this.config.wrapperCls);
		this.inputEl = document.createElement('input');
		this.inputEl.type = 'text';
		this.inputEl.name = me.config.el.name;
		this.wrapper.appendChild(me.inputEl);
		$kit.rpEl(this.config.el, this.wrapper);
		//
		this.fillData();
		this.list = new $kit.ui.Form.List({
			where : me.wrapper,
			list : me.config.data.search(''),
			triggleEl : me.inputEl
		});
		//
	},
	/**
	 * 填充数据
	 */
	fillData : function() {
		if($kit.isEmpty(this.config.data)) {
			this.config.data = new $kit.TreeDict();
			if(this.config.el.tagName && this.config.el.tagName.toLowerCase() == 'select') {
				var select = this.config.el;
				for(var i = 0; i < select.options.length; i++) {
					var option = select.options[i];
					this.config.data.ad(option.text, option.value);
				}
			}
		}
	},
	/**
	 * 智能提示
	 */
	suggestDelay : 500,
	suggest : function() {
		var me = this;
		this._timeout_suggest = setTimeout(function() {
			me.config.data.search(me.inputEl.value);
		}, this.config.suggestDelay);
	}
});
