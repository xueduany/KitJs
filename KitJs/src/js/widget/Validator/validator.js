$kit.ui.Validator = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.Validator, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitValidator',
		validatorCls : 'kitjs-validator',
		validatorShowCls : 'validator-show',
		elAttr : 'for',
		triggleEvent : ['blur', 'change'],
		rules : [{
			regExp : /^\s*$/i,
			message : '不能为空！'
		}],
		defaultMessage : '',
		checkRules : function(checkStr, rules) {
			for(var i = 0; i < rules.length; i++) {
				var rule = rules[i];
				if(rule.notNull) {
					if(/^\s*$/i.test(checkStr)) {
						return rule.message;
					}
				} else if(rule.minLength) {
					if(checkStr.length < rule.minLength) {
						return rule.message;
					}
				} else if(rule.maxLength) {
					if(checkStr.length < rule.maxLength) {
						return rule.message;
					}
				} else if(rule.isEmail) {
					if(!/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i.test(checkStr)) {
						return rule.message;
					}
				} else if(rule.equalWith) {
					var compareNode = $kit.el(rule.equalWith);
					if(!$kit.isEmpty(compareNode) && checkStr != $kit.val(compareNode)) {
						return rule.message;
					}
				} else if(rule.notEqualWith) {
					var compareNode = $kit.el(rule.notEqualWith);
					if($kit.isEmpty(compareNode) && checkStr == $kit.val(compareNode)) {
						return rule.message;
					}
				} else if(rule.regExp) {
					if(rule.regExp.test(checkStr)) {
						return rule.message;
					}
				}
			}
			return false;
		}
	}
});
$kit.merge($kit.ui.Validator.prototype, {
	init : function() {
		var me = this;
		if($kit.isEmpty(me.config.el)) {
			throw new Exception('Error', '必须指定一个验证器!')
		}
		me.formEl = $kit.el($kit.attr(me.config.el, me.config.elAttr), $kit.dom.parentEl8tag(me.config.el, 'form'));
		me.bindForm(me.formEl);
		me.config.el[me.config.kitWidgetName] = me;
	},
	bindForm : function(formEl) {
		var me = this;
		$kit.ev({
			el : formEl,
			ev : me.config.triggleEvent,
			fn : me.validateFn,
			scope : me
		});
		var form = formEl.form || formEl[0].form;
		if($kit.isNode(form)) {
			if($kit.isEmpty(form.onsubmit)) {
				//
			} else {
				if($kit.isFn(form.onsubmit) && form._flag_kit_validator_bindVailidateEv != true) {
					form._onsubmit = form.onsubmit;
				}
			}
			form.onsubmit = function() {
				var validators = $kit.els8cls(me.config.validatorCls, form);
				var re = true;
				// run test
				for(var i = 0; i < validators.length; i++) {
					var o = validators[i];
					if(o[me.config.kitWidgetName]) {
						var f = o[me.config.kitWidgetName];
						f.validateFn.call(f);
					}
				}
				//
				for(var i = 0; i < validators.length; i++) {
					var o = validators[i];
					if($kit.hsCls(o, me.config.validatorShowCls)) {
						re = false;
						break;
					}
				}
				var originFormSubmitRe = true;
				if(form._onsubmit) {
					originFormSubmitRe = form._onsubmit.call(this);
				}
				return re && originFormSubmitRe;
			}
			form._flag_kit_validator_bindVailidateEv = true;
		}
	},
	validateFn : function() {
		var me = this;
		if(!$kit.isEmpty(me.config.rules)) {
			var checkResult = me.checkRules($kit.val(me.formEl), me.config.rules);
			if(checkResult != false) {
				me.config.el.innerHTML = checkResult;
				$kit.adCls(me.config.el, me.config.validatorShowCls);
			} else {
				me.config.el.innerHTML = me.config.defaultMessage;
				$kit.rmCls(me.config.el, me.config.validatorShowCls);
			}
		}
	},
	checkRules : function(checkStr, rules) {
		return this.config.checkRules(checkStr, rules);
	}
});
