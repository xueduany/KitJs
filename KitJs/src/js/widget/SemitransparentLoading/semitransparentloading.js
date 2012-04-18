/**
 * 半透明的loading
 */
$kit.ui.SemitransparentLoading = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	var what = $kit.newHTML(me.config.what).childNodes[0];
	me.what = what;
	var loadingImage = new Image();
	loadingImage.onload = function() {
		me.config.where = me.config.where || document.body;
		if(me.config.where) {
			what.style.backgroundImage = 'url(' + me.config.img + ')';
			$kit.insEl({
				where : me.config.where,
				pos : me.config.pos,
				what : what
			});
		}
		var viewport = $kit.viewport();
		$kit.css(what, {
			position : 'absolute',
			top : (viewport.scrollTop + viewport.clientHeight / 2 - 20) + 'px',
			left : (viewport.scrollLeft + viewport.clientWidth / 2 - 20) + 'px'
		});
		loadingImage.id = $kit.onlyId();
		me.intervalStr = 'loading_interval_' + loadingImage.id;
		me.top = 0;
		window[me.intervalStr] = setInterval(function() {
			me.top = (me.top - 40) % (12 * 40);
			what.style.backgroundPosition = '0px ' + me.top + 'px';
		}, 66);
	}
	loadingImage.src = me.config.img;
}
$kit.ui.SemitransparentLoading.defaultConfig = {
	where : null,
	pos : 'last',
	what : '<div style="width:40px;height:40px;display:inline-block;*display:inline;*zoom:1;z-index:99999;"></div>',
	img : '/KitJs/KitJs/src/img/loading.png'
}
$kit.merge($kit.ui.SemitransparentLoading.prototype, {
	stop : function() {
		clearInterval(window[this.intervalStr]);
		window[this.intervalStr] = null;
	},
	goOn : function() {
		if(window[this.intervalStr] == null) {
			window[me.intervalStr] = setInterval(function() {
				me.top = (me.top - 40) % 12;
				what.style.backgroundImagePosition = '0px ' + me.top + 'px';
			}, 66);
		}
	},
	destory : function() {
		this.stop();
		$kit.rmEl(this.what);
	}
});
