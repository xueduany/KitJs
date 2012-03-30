$kit.$(function() {
	$kit.widgetInstance = {};
	var defaultConfig = $kit.ui.CodeExample.defaultConfig;
	$kit.each($kit.el8cls(defaultConfig.codeExampleCls), function(currentOne, idx, array) {
		$kit.widgetInstance[defaultConfig.kitWidgetName] = $kit.widgetInstance[defaultConfig.kitWidgetName] || [];
		var config = {
			where : currentOne,
			opener : $kit.attr(currentOne, 'opener')
		};
		if($kit.isEmpty($kit.el8tag('textarea', currentOne))) {
			config.script = currentOne.innerText;
		} else {
			config.scriptContainer = $kit.el8tag('textarea', currentOne);
		}
		$kit.widgetInstance[defaultConfig.codeExampleCls].push(new $kit.ui.CodeExample(config));
	});
});
