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
		transformCls : 'kitjs-form-combobox',
		inputCls : 'kitjs-form-combobox-input',
		wrapperCls : 'kitjs-form-combox-wrapper',
		suggestDelay : 500
	}
});
$kit.merge($kit.ui.Form.ComboBox.prototype, {
	init : function() {
		var me = this;
		//me.transform();
	},
	transform : function() {
		var me = this;
		this.wrapper = document.createElement('div');
		$kit.adCls(this.wrapper, this.config.wrapperCls);
		this.inputEl = document.createElement('input');
		this.inputEl.className = me.config.inputCls;
		this.inputEl.type = 'text';
		//formEl
		this.formEl = document.createElement('input');
		this.formEl.type = 'hidden';
		if(me.config.el.name) {
			this.formEl.name = me.config.el.name;
		}
		//
		this.wrapper.appendChild(me.inputEl);
		this.wrapper.appendChild(me.formEl);
		$kit.rpEl(this.config.el, this.wrapper);
		//
		this.fillData();
		this.list = new $kit.ui.Form.List({
			where : me.wrapper,
			list : me.config.data.search(''),
			triggleEl : me.inputEl,
			formEl : me.formEl,
			setValue : function(key, value) {
				me.setValue(key, value, me.list.selectedLi);
				me.newEv({
					ev : 'change'
				});
			}
		});
		$kit.ev({
			el : me.inputEl,
			ev : 'input change',
			fn : function(e) {
				var me = this;
				me._inputChange();
			},
			scope : me
		});
		$kit.ev({
			el : me.inputEl,
			ev : 'propertychange',
			fn : function(e) {
				var me = this;
				if(e.propertyName.toLowerCase() == 'value') {
					me._inputChange();
				}
			},
			scope : me
		});
		$kit.ev({
			el : me.inputEl,
			ev : 'focus',
			fn : function(e) {
				var me = this;
				me.hasFocus = true;
			},
			scope : me
		});
		$kit.ev({
			el : me.inputEl,
			ev : 'blur',
			fn : function(e) {
				var me = this;
				me.hasFocus = false;
				me._inputChange();
			},
			scope : me
		});
		//
	},
	_inputChange : function() {
		var me = this;
		clearTimeout(me._timeout_suggest);
		me._timeout_suggest = setTimeout(function() {
			me.suggest();
			me._setFormValue();
			me.newEv({
				ev : 'change'
			});
		}, me.config.suggestDelay);
	},
	/**
	 * 给隐藏表单元素赋值
	 */
	_setFormValue : function() {
		var me = this;
		if(me.list.listItemCount == 1 && me.inputEl.value == $kit.el8cls(me.list.config.listItemCls, me.list.listEl).innerHTML) {
			me.formEl.value = $kit.attr($kit.el8cls(me.list.config.listItemCls, me.list.listEl), 'value');
		} else {
			me.formEl.value = me.inputEl.value;
		}
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
	suggest : function() {
		var me = this;
		$kit.adCls(me.wrapper, 'suggesting');
		setTimeout(function() {
			me.list.buildList(me.config.data.search(me.inputEl.value));
			if(me.hasFocus && me.list._flag_listEl_mouseclick_select_ev != true) {
				me.list.show();
			}
			setTimeout(function() {
				$kit.rmCls(me.wrapper, 'suggesting')
			}, 200);
		}, 0);
	},
	/**
	 * js赋值API
	 */
	setValue : function(key, value, selectedLi) {
		var me = this;
		if(key == null) {
			return;
		}
		me.inputEl.value = key;
		value = value || null;
		if(value == null) {
			value = this.data.get(key);
		}
		me.formEl.value = value;
		selectedLi = selectedLi || null;
		if(selectedLi == null) {
			var a = [];
			if(me.list.listEl.getElementsByClassName) {
				a = $kit.els8cls(me.list.config.listItemCls);
			} else {
				a = me.list.listEl.childNodes;
			}
			for(var i = 0; i < a.length; i++) {
				if($kit.hsCls(a[i], me.list.listItemCls)) {
					if(a[i].innerHTML == key) {
						selectedLi = a[i];
					}
				}
			}
		}
		me.list.selectedLi = selectedLi;
	}
});
