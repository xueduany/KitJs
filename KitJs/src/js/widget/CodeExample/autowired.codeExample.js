$kit.$(function() {
	$kit.widgetInstance = {};
	$kit.each($kit.el('.kitjs_codeExample'), function(currentOne, idx, array) {
		$kit.widgetInstance['kitCodeExample'] = $kit.widgetInstance['kitCodeExample'] || [];
		var config = {
			where : currentOne,
			opener : $kit.attr(currentOne, 'opener')
		};
		if ($kit.isEmpty($kit.el8tag('textarea', currentOne))) {
			config.script = currentOne.innerText;
		} else {
			config.scriptContainer = $kit.el8tag('textarea', currentOne);
		}
		$kit.widgetInstance['kitCodeExample'].push(new $kit.ui.CodeExample(config));
	});
});