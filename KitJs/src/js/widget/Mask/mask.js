/**
 * 半透明的遮罩
 * @class $kit.ui.Mask
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Mask/mask.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/Mask/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/Mask/demo.png" width="300">
 */
$kit.ui.Mask = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	var what = $kit.newHTML($kit.tpl(me.config.what, me.config)).childNodes[0];
	document.body.appendChild(what);
	me.what = what;
	me.animTimeout = 'kitMask_' + $kit.onlyId();
	if(me.config.anim) {
		$kit.anim.motion({
			el : me.what,
			duration : me.config.duration,
			from : {
				opacity : 0,
				zIndex : me.config.zIndex
			},
			to : {
				opacity : me.config.opacity
			},
			timeout : me.animTimeout
		});
		me.what = what;
	}
}
/**
 * @enum
 */
$kit.ui.Mask.defaultConfig = {
	where : null,
	pos : 'last',
	what : [//
	'<div style="', //
	'display:block;', //
	'position:fixed;', //
	'_position:absolute;', //
	'top:0;', //
	'left:0;', //
	'width:100%;', //
	'height:100%;', //
	'_width:expression(eval(document.compatMode &&', //
	'document.compatMode == \'CSS1Compat\' ?', //
	'document.documentElement.scrollLeft + document.documentElement.clientWidth', //
	': document.body.scrollTop + document.body.clientWidth));', //
	'_height:expression(eval(document.compatMode &&', //
	'document.compatMode == \'CSS1Compat\' ?', //
	'document.documentElement.scrollTop + document.documentElement.clientHeight', //
	': document.body.scrollTop + document.body.clientHeight));', //
	'zoom:1;', //
	'background:${color};', //
	'">', //
	'<!--[if lte IE 6.5]><iframe src="javascript:false" style="', //
	'position:absolute;', //
	'top:0;', //
	'left:0;', //
	'width:100%;', //
	'height:100%;', //
	'z-index:-1;', //
	'border:none;', //
	'filter: mask();', //
	'"></iframe><![endif]-->', //
	'</div>'//
	].join(''),
	duration : 300, //动画时间
	zIndex : 9, //层数，避免被遮住
	color : '#000', //遮罩颜色
	opacity : 0.75, //透明度
	anim : true//是否使用动画
}
$kit.merge($kit.ui.Mask.prototype,
/**
 * @lends $kit.ui.Mask.prototype
 */
{
	/**
	 * 销毁
	 */
	destory : function() {
		clearInterval(window[this.animTimeout]);
		$kit.rmEl(this.what);
	},
	/**
	 * 隐藏
	 */
	hide : function() {
		var me = this;
		if(me.config.anim) {
			$kit.anim.motion({
				el : me.what,
				duration : me.config.duration,
				from : {
					opacity : $kit.css(me.what, 'opacity')
				},
				to : {
					opacity : 0,
					display : 'none'
				},
				timeout : me.animTimeout
			});
		} else {
			me.what.style.display = 'none';
		}
	},
	/**
	 * 显示
	 */
	show : function() {
		var me = this;
		if(me.config.anim) {
			$kit.anim.motion({
				el : me.what,
				duration : me.config.duration,
				from : {
					opacity : $kit.css(me.what, 'opacity'),
					display : ''
				},
				to : {
					opacity : me.config.opacity
				},
				timeout : me.animTimeout
			});
		} else {
			me.what.style.display = '';
		}
	}
});
