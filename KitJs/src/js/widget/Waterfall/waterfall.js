$kit.ui.Waterfall = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.Waterfall, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitWaterfall',
		validatorCls : 'kitjs-waterfall'
	}
});
