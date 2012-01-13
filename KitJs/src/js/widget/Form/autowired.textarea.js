$kit.$(function() {
	$kit.widgetInstance = {};
	$kit.each($kit.el('.kitjs-form-textarea'), function(currentOne, idx, array) {
		if ($kit.attr(currentOne, 'autowired') != undefined) {
			$kit.widgetInstance['kitTextArea'] = $kit.widgetInstance['kitTextArea'] || [];
			$kit.widgetInstance['kitTextArea'].push(new $kit.ui.Form.TextArea({
				el : currentOne,
				minRows : 1 || $kit.attr(currentOne, 'minrows'),
				autoFixHeight : false || $kit.attr(currentOne, 'autofixheight')
			}));
		}
	});
});