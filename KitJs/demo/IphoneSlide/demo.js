$kit.$(function() {
	$kit.ev({
		el : '#a',
		ev : 'click',
		fn : function(e) {
			if(window.a == 1) {
				window.a = 0;
				$kit.anim.motion({
					el : document.body,
					from : {
						'-webkit-transform' : 'translateY(0px)'
					},
					to : {
						'-webkit-transform' : 'translateY(-40px)'

					},
					timeout : 'asd'
				})
			} else {
				window.a = 1;
				$kit.anim.motion({
					el : document.body,
					from : {
						'-webkit-transform' : 'translateY(-40px)'
					},
					to : {
						'-webkit-transform' : 'translateY(0px)'

					},
					timeout : 'asd'
				})
			}
		}
	})
})