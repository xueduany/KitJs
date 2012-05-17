/**
 * 时间输入框
 * @class $kit.ui.Form.TimeInput
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Form/timeinput.js">Source code</a>
 */
$kit.ui.Form.TimeInput = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.TimeInput,
		father : $kit.ui.Form
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Form.TimeInput,
/**
 * @lends $kit.ui.Form.TimeInput
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		el : undefined,
		kitWidgetName : "kitTimeInput",
		timeFormatRegExp : /^((\d{2}:){1,2})((\d){2})$/,
		then : undefined,
		thenScope : undefined
	}
});
$kit.merge($kit.ui.Form.TimeInput.prototype,
/**
 * @lends $kit.ui.Form.TimeInput.ptototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		$kit.ev({
			el : me.config.el,
			ev : "keydown paste cut",
			fn : me.evKeyDown,
			scope : me
		});
		$kit.ev({
			el : me.config.el,
			ev : "blur",
			fn : me.evInputComplete,
			scope : me
		});
	},
	/**
	 * keyDown事件
	 */
	evKeyDown : function(ev, evCfg) {
		var me = this;
		//时间修改
		var timeInput = ev.target;
		timeInput.oldValue = timeInput.oldValue || timeInput.value;
		if(ev.keyCode == $kit.event.KEYCODE_UP || ev.keyCode == $kit.event.KEYCODE_ADD) {
			var _t = $kit.date.parseTime(timeInput.value);
			if(ev.ctrlKey) {
				_t += 60;
			} else if(ev.shiftKey) {
				_t += 3600;
			} else {
				_t += 1;
			}
			timeInput.value = $kit.date.formatTime(_t);
			ev.stopDefault();
		} else if(ev.keyCode == $kit.event.KEYCODE_DOWN || ev.keyCode == $kit.event.KEYCODE_SUB) {
			var _t = $kit.date.parseTime(timeInput.value);
			if(ev.ctrlKey) {
				_t -= 60;
			} else if(ev.shiftKey) {
				_t -= 3600;
			} else {
				_t -= 1;
			}
			if(_t < 0) {
				_t = 0;
			}
			timeInput.value = $kit.date.formatTime(_t);
			ev.stopDefault();
		} else {
			if(ev.keyCode == $kit.event.KEYCODE_ENTER) {
				evCfg.el.blur();
			}
			ev.stopDefault();
		}
	},
	/*
	 * 输入完成事件
	 */
	evInputComplete : function(ev, evCfg) {
		var me = this;
		//时间修改
		var timeInput = ev.target;
		timeInput.oldValue = timeInput.oldValue || timeInput.value;
		if(!me.config.timeFormatRegExp.test(timeInput.value)) {
			timeInput.value = timeInput.oldValue;
		} else {
			if($kit.isFn(me.config.then)) {
				me.config.then.call(me.config.thenScope || me, me.config.el);
			}
		}
		delete timeInput.oldValue;
	}
});
