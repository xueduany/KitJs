$kit.$(function() {
	$kit.ev({
		el : document.body,
		ev : 'mouseup',
		fn : function(e) {
			if($kit.selection.getText() && $kit.selection.getText().length) {
				// var r = $kit.selection.getRange();
				// console.log($kit.selection.getStartContainer(r));
				// console.log($kit.selection.getStartOffset(r));
				// console.log($kit.selection.getEndContainer(r));
				// console.log($kit.selection.getEndOffset(r));
				// return;
				var config = $kit.selection.getXpath($kit.selection.getRange());
				console && console.log($kit.selection.getXpath($kit.selection.getRange()).full);
				alert($kit.selection.highlight(config));
			}
		}
	})
	$kit.ev({
		el : '#a',
		ev : 'click',
		fn : function(e) {
			$kit.selection.removeHighlight();
		}
	})
});
