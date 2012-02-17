$kit.ui.CodeExample = function(config) {
	var me = this;
	var defaultConfig = {
		kitWidgetName : "kitCodeExample",
		then : undefined,
		where : undefined,
		opener : 'about:blank',
		pos : 'last',
		what : '<button class="codeExampleViewBtn">Run Test</button>'
	}
	me.config = $kit.join(defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.CodeExample.prototype, {
	init : function() {
		var me = this;
		if(!$kit.isEmpty(me.config.where)) {
			$kit.insEl({
				where : me.config.where,
				pos : me.config.pos,
				what : me.config.what
			});
			var btn = $kit.el('.codeExampleViewBtn',me.config.where)[0];
			$kit.ev({
				el : btn,
				ev : 'click',
				fn : function(e, cfg) {
					var me = this;
					me.runTest();
				},
				scope : me
			})
		}
	},
	runTest : function() {
		var me = this;
		var opener = window.open(me.config.opener);
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
});
