/**
 * kitjs验证框架
 * @class $kit.ui.Validator
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Validator/validator.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/Validator/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/Validator/demo.png">
 */
$kit.ui.Validator = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.Validator,
/**
 * @lends $kit.ui.Validator.prototype
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitValidator',
		validatorCls : 'kitjs-validator',
		validatorShowCls : 'validator-show',
		elAttr : 'for',
		/**
		 * 触发方法,如['blur', 'change']
		 * @type {Array<String>}
		 */
		triggleEvent : ['blur', 'change'],
		/**
		 * 验证规则，如[{regExp : /^\s*$/i,message : '不能为空！'}]
		 * @type {Array<Map>}
		 */
		rules : [{
			regExp : /^\s*$/i,
			message : '不能为空！'
		}],
		defaultMessage : '',
		/**
		 * 验证方法
		 * @type {Function(checkStr,rules)return Boolean}
		 */
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
				} else if(rule.fn) {
					if(rule.fn.call(this, checkStr)) {
						return rule.message;
					}
				}
			}
			return false;
		}
	}
});
$kit.merge($kit.ui.Validator.prototype,
/**
 * @lends $kit.ui.Validator.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		if($kit.isEmpty(me.config.el)) {
			throw new Exception('Error', '必须指定一个验证器!')
		}
		me.formEl = $kit.el($kit.attr(me.config.el, me.config.elAttr), $kit.dom.parentEl8tag(me.config.el, 'form'));
		me.bindForm(me.formEl);
		me.config.el[me.config.kitWidgetName] = me;
	},
	/**
	 * 绑定表单
	 */
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
				if(re == false) {
					return re;
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
	/**
	 * 验证方法
	 */
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
	/**
	 * checkRules
	 */
	checkRules : function(checkStr, rules) {
		return this.config.checkRules(checkStr, rules);
	}
});
