$kit.ui.CodeExample = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.CodeExample, {
	defaultConfig : {
		kitWidgetName : "kitCodeExample",
		codeExampleCls : 'kitjs_codeExample',
		then : undefined,
		where : undefined,
		opener : 'about:blank',
		pos : 'last',
		what : '<button class="codeExampleViewBtn">Run Test</button>'
	}
});
$kit.merge($kit.ui.CodeExample.prototype, {
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
	runTest : function() {
		var me = this;
		var opener = window.open(me.config.opener);
		if(me.config.opener.toString().toLowerCase() == 'about:blank') {
			$kit.dom.injectJs({
				where : opener.document.body,
				content : me.config.script || me.config.scriptContainer ? $kit.val(me.config.scriptContainer) : '',
				then : me.config.then
			});
		} else if('onload' in opener) {
			$kit.ev({
				el : opener,
				ev : 'load',
				fn : function() {
					$kit.dom.injectJs({
						where : opener.document.body,
						content : me.config.script || me.config.scriptContainer ? $kit.val(me.config.scriptContainer) : '',
						then : me.config.then
					});
				}
			});
		}
	}
});
