/**
 * 侧边栏滑块
 * @class $kit.ui.SlideBar
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/SlideBar/slidebar.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/SlideBar/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/SlideBar/demo.png">
 */
$kit.ui.SlideBar = function(config) {
	var me = this;
	me.currentMoveTarget = null;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.SlideBar,
/**
 * @lends $kit.ui.SlideBar
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		slideBar : undefined,
		slideContainer : undefined,
		slideAnimDuration : 500,
		slideAnimDelay : 1000,
		slideAnimDelayTimeout : '_timeout_slideBar',
		slideAnimTimeSeg : 27,
		slideAnimFx : $kit.anim.Fx.easeOutQuart,
		slideAnimTimeout : '_timeout_motion_slideBarForPlay',
		locateElement : function(event, eventConfig) {
			return event.target;
		},
		slideThen : undefined,
		hideThen : undefined
	}
});
$kit.merge($kit.ui.SlideBar.prototype,
/**
 * @lends $kit.ui.SlideBar.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		if(!me.config.slideBar || !me.config.slideContainer) {
			return;
		}
		if(!$kit.contains(me.config.slideContainer, me.config.slideBar)) {
			$kit.insEl({
				pos : 'last',
				what : me.config.slideBar,
				where : me.config.slideContainer
			});
		}
		$kit.ev({
			el : me.config.slideContainer,
			ev : 'mousemove',
			fn : function(e, cfg) {
				var me = this;
				var currentMoveTarget = me.config.locateElement(e, cfg);
				if(!currentMoveTarget) {
					return;
				}
				if(currentMoveTarget && currentMoveTarget != null && currentMoveTarget != me.currentMoveTarget) {
					me.currentMoveTarget = currentMoveTarget;
					clearTimeout(window[me.config.slideAnimDelayTimeout]);
					window[me.config.slideAnimDelayTimeout] = setTimeout(function() {
						$kit.anim.motion({
							timeSeg : me.config.slideAnimTimeSeg,
							duration : me.config.slideAnimDuration,
							el : me.config.slideBar,
							from : {
								top : $kit.css(me.config.slideBar, 'top') + 'px',
								height : $kit.css(me.config.slideBar, 'height') + 'px',
								opacity : $kit.css(me.config.slideBar, 'opacity'),
								display : 'block'
							},
							to : {
								top : currentMoveTarget.offsetTop + 'px',
								height : currentMoveTarget.offsetHeight + 'px',
								opacity : 1
							},
							fx : me.config.slideAnimFx,
							then : function() {
								me.config.slideThen && me.config.slideThen.apply(me);
							},
							timeout : me.config.slideAnimTimeout
						})
					}, me.config.slideAnimDelay);
				}
			},
			scope : me
		});
		$kit.ev({
			el : me.config.slideContainer,
			ev : 'mouseout',
			fn : function(e, cfg) {
				var target = e.target, relatedTarget = e.relatedTarget;
				if(relatedTarget != null && me.config.slideContainer != relatedTarget && !$kit.contains(me.config.slideContainer, relatedTarget)) {
					clearTimeout(window[me.config.slideAnimDelayTimeout]);
					window[me.config.slideAnimDelayTimeout] = setTimeout(function() {
						$kit.anim.motion({
							timeSeg : me.config.slideAnimTimeSeg,
							duration : me.config.slideAnimDuration,
							el : me.config.slideBar,
							from : {
								opacity : $kit.css(me.config.slideBar, 'opacity')
							},
							to : {
								opacity : 0,
								display : 'none'
							},
							fx : me.config.slideAnimFx,
							then : function() {
								me.currentMoveTarget = null;
								me.config.hideThen && me.config.hideThen.apply(me);
							},
							timeout : me.config.slideAnimTimeout
						})
					}, me.config.slideAnimDelay);
				}
			}
		});
		$kit.ev({
			el : me.config.slideBar,
			ev : 'mouseover',
			fn : function(e, cfg) {
				clearTimeout(window[me.config.slideAnimDelayTimeout]);
				clearInterval(window[me.config.slideAnimTimeout]);
				$kit.css(me.config.slideBar, {
					display : 'block',
					opacity : 1
				});
			}
		});
	}
});
