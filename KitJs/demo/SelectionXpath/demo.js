$kit.$(function() {
	$kit.ev({
		el : document.body,
		ev : 'mouseup',
		fn : function(e) {
			if($kit.selection.getText().length) {
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
