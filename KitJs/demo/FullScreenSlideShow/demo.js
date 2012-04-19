$kit.$(function($) {
	$('button.switch-css').each(function(idx) {
		$kit.ev({
			el : this,
			ev : 'click',
			fn : function() {
				$('#J_style').remove();
				$kit.dom.injectCss({
					id : 'J_style',
					url : 'style' + (idx + 1) + '.css'
				});
				$('button.selected').removeClass('selected').pushStack(this).addClass('selected');
			}
		});
	});
});
