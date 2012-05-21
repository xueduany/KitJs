$kit.$(function() {
	$kit.ev({
		el : document.body,
		ev : 'mouseup',
		fn : function(e) {
			console.log($kit.selection.getStartContainer($kit.selection.getRange()).nodeValue);
			console.log($kit.selection.getStartOffset($kit.selection.getRange()));
			console.log($kit.selection.getEndContainer($kit.selection.getRange()).nodeValue);
			console.log($kit.selection.getEndOffset($kit.selection.getRange()));
		}
	})
});
