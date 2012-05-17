/**
 * 划动星星评级
 * @class $kit.ui.StarLevel
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/StarLevel/starlevel.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/StarLevel/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/StarLevel/demo.png">
 */
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
		starLevelStyleCls : 'starlevel-box',
		starLevelMoveCls : 'starlevel-move',
		starLevelChosenCls : 'starlevel-chosen',
		starLevelChosenContainerCls : 'starlevel-chosen-container',
		starLevelHoverCls : 'starlevel-hover',
		succesTipsFn : undefined
	}
	var me = this;
	me.config = $kit.join(defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.StarLevel.prototype,
/**
 * @lends $kit.ui.StarLevel.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		me.kitId = $kit.onlyId();
		if(!$kit.isEmpty($kit.el8cls(me.config.starLevelContainerCls, me.config.where))) {
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
		me.bindEvent();
	},
	/**
	 * 绑定事件
	 */
	bindEvent : function() {
		var me = this;
		//
		me.flag_slide = false;
		$kit.ev({
			el : me.starLevelContainer,
			ev : 'mousemove touchmove',
			fn : function(ev, evCfg) {
				var currentEl = ev.target, me = this;
				me.flag_slide = true;
				// 鼠标左键ev.which == 1
				if(ev.type == 'mousemove' && ev.which == 1 || ev.type == 'touchmove') {
					$kit.adCls(me.starLevelContainer, me.config.starLevelMoveCls);
					if($kit.hsCls(currentEl, me.config.starLevelStyleCls)) {
						// var starLevelBoxIndexCls = $kit.ary.getTextBeginWith(currentEl.className.split(/\s/ig), me.config.starLevelValueClsPrefix);
						// var level = starLevelBoxIndexCls.substring(starLevelBoxIndexCls.lastIndexOf('-') + 1);
						// level = parseFloat(level);
						while($kit.els8cls(me.config.starLevelHoverCls) && $kit.els8cls(me.config.starLevelHoverCls).length && $kit.el8cls(me.config.starLevelHoverCls) != currentEl) {
							$kit.rmCls($kit.el8cls(me.config.starLevelHoverCls), me.config.starLevelHoverCls);
						}
						$kit.adCls(currentEl, me.config.starLevelHoverCls);
						while($kit.els8cls(me.config.starLevelChosenCls, me.starLevelContainer) && $kit.els8cls(me.config.starLevelChosenCls, me.starLevelContainer).length) {
							$kit.rmCls($kit.el8cls(me.config.starLevelChosenCls, me.starLevelContainer), me.config.starLevelChosenCls);
						}
						$kit.adCls(me.starLevelContainer, me.config.starLevelChosenContainerCls);
						$kit.adCls(currentEl, me.config.starLevelChosenCls);
					}
					ev.stopDefault();
				}
			},
			scope : me
		});
		me.starLevelContainer.onselectstart = me.starLevelContainer.onselect = function() {
		}
		$kit.each(me.starLevelContainer.children, function(o) {
			o.onselect = o.onselectstart = function() {
			}
		});
		$kit.ev({
			el : me.starLevelContainer,
			ev : 'mouseup touchend mouseout',
			fn : function(ev, evCfg) {
				var currentEl = ev.target, me = this;
				if(me.flag_slide) {
					if($kit.hsCls(currentEl, me.config.starLevelStyleCls)) {
						var starLevelBoxIndexCls = $kit.ary.getTextBeginWith(currentEl.className.split(/\s/ig), me.config.starLevelValueClsPrefix);
						var level = starLevelBoxIndexCls.substring(starLevelBoxIndexCls.lastIndexOf('-') + 1);
						if(ev.type == 'mouseup' || ev.type == 'touchend') {
							if($kit.el8cls(me.config.starLevelChosenCls, me.starLevelContainer) != currentEl) {
								$kit.rmCls(me.starLevelContainer, me.config.starLevelMoveCls);
							}
							level = parseFloat(level);
							while($kit.els8cls(me.config.starLevelChosenCls, me.starLevelContainer) && $kit.els8cls(me.config.starLevelChosenCls, me.starLevelContainer).length) {
								$kit.rmCls($kit.el8cls(me.config.starLevelChosenCls, me.starLevelContainer), me.config.starLevelChosenCls);
							}
							$kit.adCls(me.starLevelContainer, me.config.starLevelChosenContainerCls);
							$kit.adCls(currentEl, me.config.starLevelChosenCls);
							// for ( var i = 1; i <= level; i++) {
							// $kit.adCls($kit.el8cls(me.config.starLevelValueClsPrefix + '-' + i, me.starLevelContainer), me.config.starLevelChosenCls);
							// }
							me.config.succesTipsFn.call(me, level);
						}
						if(!$kit.contains(me.starLevelContainer, ev.relatedTarget)) {
							if($kit.els8cls(me.config.starLevelChosenCls, me.starLevelContainer).length) {
								var starLevelBoxIndexCls = $kit.ary.getTextBeginWith($kit.el8cls(me.config.starLevelChosenCls, me.starLevelContainer).className.split(/\s/ig), me.config.starLevelValueClsPrefix);
								var level = starLevelBoxIndexCls.substring(starLevelBoxIndexCls.lastIndexOf('-') + 1);
								if(level == 1) {
									$kit.rmCls($kit.el8cls(me.config.starLevelChosenCls, me.starLevelContainer), me.config.starLevelChosenCls);
									$kit.rmCls(me.starLevelContainer, me.config.starLevelChosenContainerCls);
								}
							}
							$kit.rmCls(me.starLevelContainer, me.config.starLevelMoveCls);
						}
					}
				}
				me.flag_slide = false;
				//
				$kit.rmCls(me.starLevelContainer, me.config.starLevelMoveCls);
			},
			scope : me
		});
	}
});
