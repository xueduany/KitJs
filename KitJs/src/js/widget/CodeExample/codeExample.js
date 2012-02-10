$kit.ui.CodeExample = function(config) {
	var me = this;
	var defaultConfig = {
		kitWidgetName : "kitCodeExample",
		then : undefined,
		where : undefined,
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
		var me = this, opener = window.open('about:blank');
		$kit.dom.injectJs({
			where : opener.document.body,
			content : me.config.script,
			then : me.config.then
		});
	}
});
