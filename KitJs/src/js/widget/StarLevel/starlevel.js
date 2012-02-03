$kit.ui.StarLevel = function(config) {
	var defaultConfig = {
		pos : 'last',
		where : document.body,
		what : [//
		'<ul class="${starLevelContainerCls}">', //
		'<li class="${starLevelValueClsPrefix}-1 ${starLevelStyleCls}">', //
		'</li>', //
		'<li class="${starLevelValueClsPrefix}-2 ${starLevelStyleCls}">', //
		'</li>', //
		'<li class="${starLevelValueClsPrefix}-3 ${starLevelStyleCls}">', //
		'</li>', //
		'<li class="${starLevelValueClsPrefix}-4 ${starLevelStyleCls}">', //
		'</li>', //
		'<li class="${starLevelValueClsPrefix}-5 ${starLevelStyleCls}">', //
		'</li>', //
		'</ul>'//
		].join(''),
		starLevelContainerCls : 'starlevel-container',
		starLevelValueClsPrefix : 'starlevel-value',
		starLevelStyleCls : 'starlevel-box'
	}
	var me = this;
	me.config = $kit.join(defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.StarLevel.prototype, {
	init : function() {
		var me = this;
		me.kitId = $kit.onlyId();
		if (!$kit.isEmpty($kit.el8cls(me.config.starLevelContainerCls, me.config.where))) {
			// 已经有类似的结构
		} else {
			var html = $kit.tpl(me.config.what, me.config);
			$kit.insEl({
				pos : me.config.pos,
				where : me.config.where,
				what : html
			});
		}
		me.starLevelContainer = $kit.el8cls(me.config.starLevelContainerCls, me.config.where);
		$kit.ev({
			el : me.starLevelContainer,
			ev : 'mouseover',
			fn : function(ev, evCfg) {
				var currentEl = ev.target;
				if ($kit.hsCls(currentEl, me.config.starLevelStyleCls)) {
					var starLevelBoxIndexCls = $kit.ary.getTextBeginWith(currentEl.className.split(/\s/ig), me.config.starLevelValueClsPrefix);
				}
			},
			scope : me
		});
	}
});
