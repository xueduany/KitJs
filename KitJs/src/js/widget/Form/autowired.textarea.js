$kit.$(function() {
	$kit.widgetInstance = {};
	$kit.each($kit.el('.kitjs-form-textarea'), function(currentOne, idx, array) {
		$kit.widgetInstance['kitValidator'] = $kit.widgetInstance['kitValidator'] || [];
		$kit.widgetInstance['kitValidator'].push(new $kit.ui.Form.TextArea({
			el : currentOne,
			minRows : 1 || $kit.attr(currentOne, 'minrows'),
			autoFixHeight : true || $kit.attr(currentOne, 'autofixheight')
		}));
	});
});