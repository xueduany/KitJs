$kit.ui.Form = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
};
$kit.merge($kit.ui.Form, {
	defaultConfig : {
		kitWidgetName : "kitForm"
	}
});
$kit.merge($kit.ui.Form.prototype, {

});
