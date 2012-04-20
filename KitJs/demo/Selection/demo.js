$kit.$(function() {
	$kit.ev({
		el : '#J_testcase',
		ev : 'mouseup',
		fn : function(e) {
			console.log('getSelection', $kit.selection.getSelection());
			console.log('getRange', $kit.selection.getRange());
			console.log('getText', $kit.selection.getText());
			console.log('getHTML', $kit.selection.getHTML());
			console.log('getContainer', $kit.selection.getContainer());
			console.log('getClientOffset', $kit.selection.getRect());
		}
	});
});
