$kit.$(function() {
	if($kit.url.getParam('config')) {

		$kit.selection.highlight($kit.url.getParam('config'));
	}
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
				var mark = '';
				var config = $kit.selection.getXpath($kit.selection.getRange());
				if(console) {
					mark = $kit.selection.getXpath($kit.selection.getRange()).full;
					console.log(mark);
				}
				alert($kit.selection.highlight(config));
				window.open('?config=' + mark);
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
