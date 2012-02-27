$kit.$(function() {
	$kit.widgetInstance = {};
	var defaultConfig = $kit.ui.Validator.defaultConfig;
	$kit.each($kit.els8cls(defaultConfig.validatorCls), function(currentOne, idx, array) {
		$kit.widgetInstance[defaultConfig.kitWidgetName] = $kit.widgetInstance[defaultConfig.kitWidgetName] || [];
		var rules = eval($kit.attr(currentOne, 'rules')), cfg;
		if ($kit.isEmpty(rules)) {
			cfg = {
				el : currentOne
			};
		} else {
			cfg = {
				el : currentOne,
				rules : rules
			};
		}
		$kit.widgetInstance[defaultConfig.kitWidgetName].push(new $kit.ui.Validator(cfg));
	});
});