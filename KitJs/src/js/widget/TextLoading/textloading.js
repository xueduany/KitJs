/**
 * 文字的loading
 * @class $kit.ui.TextLoading
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/TextLoading/textloading.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/TextLoading/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/TextLoading/demo.png">
 */
$kit.ui.TextLoading = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	var what = $kit.newHTML($kit.tpl(me.config.what,me.config)).childNodes[0];
	me.what = what;
	//
	me.config.where = me.config.where || document.body;
	if(me.config.where) {
		$kit.insEl({
			where : me.config.where,
			pos : me.config.pos,
			what : what
		});
	}
	if(/MSIE 6/.test(navigator.userAgent)) {
		var viewport = $kit.viewport();
		$kit.css(what, {
			position : 'absolute',
			top : (viewport.scrollTop + viewport.clientHeight / 2 - 20) + 'px',
			left : (viewport.scrollLeft + viewport.clientWidth / 2 - 20) + 'px'
		});
	}
}
/**
 * @enum
 */
$kit.ui.TextLoading.defaultConfig = {
	where : null,
	pos : 'last',
	what : '<div id="kitjs-float-tips"><s></s><span>${text}</span></div>',
	text : '正在处理数据，请耐心等待...'
}
$kit.merge($kit.ui.TextLoading.prototype,
/**
 * @lends $kit.ui.SemitransparentLoading.prototype
 */
{
	/**
	 * 销毁
	 */
	destory : function() {
		$kit.rmEl(this.what);
	}
});
