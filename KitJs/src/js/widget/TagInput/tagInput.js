/**
 * Tag系统
 * 模仿stackOverFlow的表单提交tag系统
 * @class $kit.ui.TagInput
 * @requires kit.js
 * @requires ieFix.js
 * @requires array.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/TagInput/tagInput.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/TagInput/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/TagInput/demo.png">
 */
$kit.ui.TagInput = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.TagInput,
/**
 * @lends $kit.ui.TagInput
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitTag',
		splitChar : ',',
		tagValueMaxLength : 100,
		tagClass : 'kitjs_tagInput',
		wrapperId : undefined,
		template : {
			markup : [//
			'<div class="${wrapperCls}" id=${wrapperId}>', //
			'<span class="${tagInputWrapperCls}">', //
			'<input type="text" name="${tagInputName}" class="${tagInputCls}">', //
			'</span>', //
			'</div>'//
			].join(''),
			wrapperCls : 'tag-wrapper',
			tagInputCls : 'tag-input',
			tagInputWrapperCls : 'taginput-wrapper',
			//
			tagMarkup : [//
			'<div class="${tagCls}" alt=${tagValue}>', //
			'${tagValue}', //
			'<s class="${closeBtnCls}">x</s>', //
			'</div>'//
			].join(''),
			tagCls : 'tag',
			closeBtnCls : 'close-btn'
		}
	}
});
$kit.merge($kit.ui.TagInput.prototype,
/**
 * @lends $kit.ui.TagInput.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		if(me.config.wrapperId && $kit.el('#' + me.config.wrapperId)) {
			//
		} else {
			me.config.wrapperId = $kit.onlyId();
			$kit.insEl({
				pos : 'before',
				where : me.config.el,
				what : $kit.tpl(me.config.template.markup, $kit.merge(me.config.template, {
					tagInputName : me.config.el.name,
					wrapperId : me.config.wrapperId
				}))
			});
			me.config.el.style.display = 'none';
			me.ev({
				ev : 'input',
				fn : me.handleInput
			});
		}
		me.wrapper = $kit.el('#' + me.config.wrapperId);
		me.tagInput = $kit.el8cls(me.config.template.tagInputCls, me.wrapper);
		me.tagInputWrapper = me.tagInput.parentNode;
		if($kit.isIE()) {
			$kit.ev({
				el : me.tagInput,
				ev : 'propertychange',
				fn : function(e) {
					if(e.propertyName == 'value') {
						this.newEv('input');
					}
				},
				scope : me
			});
		} else {
			$kit.ev({
				el : me.tagInput,
				ev : 'input change',
				fn : function(e) {
					this.newEv('input');
				},
				scope : me
			});
		}
	},
	/**
	 * 处理输入
	 */
	handleInput : function() {
		var me = this;
		var inputStr = me.tagInput.value.toString();
		var lastChar = inputStr.substring(inputStr.length - 1);
		var tagStr = inputStr.substring(0, inputStr.length - 1);
		var _html = $kit.tpl(me.config.template.tagMarkup, $kit.merge(me.config.template, {
			tagValue : tagStr
		}));
		if(lastChar == me.config.splitChar) {
			var existedTagArray = me.config.el.value.split(me.config.splitChar);
			var flagExisted = $kit.array.hs(existedTagArray, tagStr, {
				ignoreCase : true
			});
			if(!flagExisted) {
				$kit.insEl({
					pos : 'before',
					where : me.tagInputWrapper,
					what : _html
				});
				var tagNode = $kit.prevEl(me.tagInputWrapper, function(el) {
					if(!$kit.contains(me.wrapper, el)) {
						return false;
					}
					if($kit.hsCls(el, me.config.template.tagCls)) {
						return true;
					}
				});
				$kit.ev({
					el : $kit.el8cls(me.config.template.closeBtnCls, tagNode),
					ev : 'click',
					fn : function(e) {
						var tag = e.target.parentNode;
						this.removeTag(tag);
					},
					scope : me
				});
				me.tagInput.value = '';
				me.config.el.value = me.config.el.value.length > 0 ? me.config.el.value + ',' + tagStr : tagStr;
			}
		}
		me.tagInput.value == '';
	},
	/**
	 * 删除tag
	 */
	removeTag : function(tag) {
		var me = this;
		var tagValue = $kit.attr(tag, 'alt');
		var existedTagArray = me.config.el.value.split(me.config.splitChar);
		$kit.array.rm(existedTagArray, tagValue);
		me.config.el.value = existedTagArray.join(me.config.splitChar);
		$kit.rmEl(tag);
	},
	/**
	 * 注册自定义事件
	 * @param {Object} config
	 * @param {String} config.ev
	 * @param {Function} config.fn
	 */
	ev : function() {
		if(arguments.length == 1) {
			var evCfg = arguments[0];
			var scope = evCfg.scope || this;
			if($kit.isFn(evCfg.fn) && $kit.isStr(evCfg.ev)) {
				var evCfg = {
					ev : evCfg.ev,
					fn : evCfg.fn,
					scope : this
				};
				this.event = this.event || {};
				this.event[evCfg.ev] = this.event[evCfg.ev] || [];
				this.event[evCfg.ev].push(evCfg);
			}
		}
	},
	/**
	 * 触发自定义事件
	 * @param {Object} config
	 * @param {String} config.ev
	 */
	newEv : function() {
		if(arguments.length == 1) {
			var evAry, evCfg, _evCfg = {};
			if($kit.isStr(arguments[0])) {
				var ev = arguments[0];
				evAry = this.event[ev];
			} else if($kit.isObj(arguments[0])) {
				_evCfg = arguments[0];
				evAry = this.event[_evCfg.ev];
			}
			if(!$kit.isEmpty(evAry)) {
				for(var i = 0; evAry != null && i < evAry.length; i++) {
					evCfg = $kit.merge(evAry[i], _evCfg);
					var e = {
						target : this,
						type : evCfg.ev
					}
					evCfg.fn.call(evCfg.scope, e, evCfg);
				}
			}
		}
	}
});
