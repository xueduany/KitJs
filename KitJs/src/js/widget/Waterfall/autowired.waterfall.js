$kit.$(function() {
	var html = '<div class="J_Waterfall"></div>';
	for(var i = 0; i < 100; i++) {
		var p = $kit.el('.J_WaterfallContainer')[0];
		$kit.insEl({
			pos : 'last',
			what : html,
			where : p
		});
		var h = 0;
		while(h == 0) {
			h = Math.floor(Math.abs(Math.random() * 100));
			console.log(h);
		};
		$kit.css(p.childNodes[p.childNodes.length - 1], {
			height : h + 'px'
		});
	}
});
