$kit.ui.Form = function(config) {
	var me = this;
	var defaultConfig = {
		kitWidgetName : "kitForm"
	}
	me.config = $kit.join(defaultConfig, config);
};
$kit.merge($kit.ui.Form.prototype, {

});