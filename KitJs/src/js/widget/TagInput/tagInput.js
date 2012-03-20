/**
 * Tag系统
 * 模仿stackOverFlow的表单提交tag系统
 */
$kit.ui.TagInput = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.TagInput, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitTag',
		splitChar : ',',
		tagValueMaxLength : 100,
		tagClass : 'kitjs_tagInput',
		wrapperId : undefined,
		template : {
			markup : [//
			'<div class="${wrapperCls}">', //
			'<input type="text" name="${tagInputName}" class="${tagInputCls}">', //
			'</div>'//
			].join(''),
			wrapperCls : 'tag-wrapper',
			tagInputCls : 'tag-input',
			//
			tagMarkup : [//
			'<div class="${tagCls}">', //
			'${tagValue}', //
			'<s class="${closeBtnCls}"></s>', //
			'</div>'//
			].join(''),
			tagCls : 'tag',
			closeBtnCls : 'close-btn'
		}
	}
});
$kit.merge($kit.ui.TagInput.prototype, {
	init : function() {
		var me = this;
		if(me.config.wrapperId && $kit.el('#' + me.config.wrapperId)) {
			//
		} else {
			$kit.rpEl(me.config.el, $kit.newHTML($kit.tpl(me.config.template.markup, $kit.merge(me.config.template, {
				tagInputName : me.config.el.name
			}))));
		}
		me.wrapper = $kit.el('#' + me.config.wrapperId);
		me.tagInput = $kit.el8cls(me.config.template.tagInputCls, me.wrapper);
		$kit.ev({
			el : me.tagInput,
			ev : 'input',
			fn : function(e) {
				var me = this;
				me.handleInput();
			},
			scope : me
		})
	},
	handleInput : function() {
		var me = this;
		var inputStr = me.tagInput.value.toString();
		var lastChar = inputStr.substring(inputStr.length - 2);
		var tagStr = inputStr.substring(0, inputStr.length - 1);
		if(lastChar == me.config.splitChar) {
			$kit.insEl({
				pos : 'before',
				where : me.tagInput,
				what : $kit.newHTML($kit.tpl(me.config.template.tagMarkup, me.config.template))
			})
		}
		me.tagInput.value == '';
	}
});
