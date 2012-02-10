$kit.$(function() {
	$kit.widgetInstance = {};
	$kit.each($kit.el('.kitjs_codeExample'), function(currentOne, idx, array) {
		$kit.widgetInstance['kitCodeExample'] = $kit.widgetInstance['kitCodeExample'] || [];
		$kit.widgetInstance['kitCodeExample'].push(new $kit.ui.CodeExample({
			script : currentOne.innerText,
			where : currentOne
		}));
	});
});