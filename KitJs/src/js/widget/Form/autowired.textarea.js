$kit.$(function() {
	$kit.widgetInstance = {};
	var defaultConfig = $kit.ui.Form.TextArea.defaultConfig;
	$kit.each($kit.els8cls(defaultConfig.textAreaCls), function(currentOne, idx, array) {
		$kit.widgetInstance[defaultConfig.kitWidgetName] = $kit.widgetInstance[defaultConfig.kitWidgetName] || [];
		$kit.widgetInstance[defaultConfig.kitWidgetName].push(new $kit.ui.Form.TextArea({
			el : currentOne,
			minRows : 1 || $kit.attr(currentOne, 'minrows'),
			autoFixHeight : true || $kit.attr(currentOne, 'autofixheight')
		}));
	});
});
