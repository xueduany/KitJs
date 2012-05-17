/**
 * 用window.open测试script效果
 * @class $kit.ui.CodeExample
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/CodeExample/codeExample.js">Source code</a>
 * @example <a href="http://xueduany.github.com/KitJs/KitJs/demo/CodeExample/demo.html">Demo</a>
 */
$kit.ui.CodeExample = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.CodeExample,
/**
 * @lends $kit.ui.CodeExample
 */
{
	/**
	 * 默认配置
	 * @enum
	 */
	defaultConfig : {
		kitWidgetName : "kitCodeExample",
		codeExampleCls : 'kitjs_codeExample',
		/**
		 * 打开window执行script之后干嘛
		 * @type {Function}
		 */
		then : undefined,
		/**
		 * 点击跑script那个按钮插哪儿，默认插到document.body屁股上
		 * @type {Element}
		 */
		where : undefined,
		/**
		 * window.opener
		 * @type {URL}
		 */
		opener : 'about:blank',
		/**
		 * 插的位置，默认last
		 * @type {String}
		 */
		pos : 'last',
		/**
		 * 点击跑脚本的HTML
		 * @type {HTML}
		 */
		what : '<button class="codeExampleViewBtn">Run Test</button>'
	}
});
$kit.merge($kit.ui.CodeExample.prototype,
/**
 * @lends $kit.ui.CodeExample.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		if(!$kit.isEmpty(me.config.where)) {
			$kit.insEl({
				where : me.config.where,
				pos : me.config.pos,
				what : me.config.what
			});
			var btn = $kit.el('.codeExampleViewBtn', me.config.where)[0];
			$kit.ev({
				el : btn,
				ev : 'click',
				fn : function(e, cfg) {
					var me = this;
					me.runTest();
				},
				scope : me
			});
		}
	},
	/**
	 * 跑测试
	 */
	runTest : function() {
		var me = this;
		var opener = window.open(me.config.opener);
		if(me.config.opener.toString().toLowerCase() == 'about:blank') {
			$kit.dom.injectJs({
				where : opener.document.body,
				text : me.config.script || me.config.scriptContainer ? $kit.val(me.config.scriptContainer) : '',
				then : me.config.then
			});
		} else if('onload' in opener) {
			$kit.ev({
				el : opener,
				ev : 'load',
				fn : function() {
					$kit.dom.injectJs({
						where : opener.document.body,
						text : me.config.script || me.config.scriptContainer ? $kit.val(me.config.scriptContainer) : '',
						then : me.config.then
					});
				}
			});
		}
	}
});
