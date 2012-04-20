/**
 * 图片预览
 */
$kit.ui.LightBox = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.LightBox, {
	defaultConfig : {
		kitWidgetName : "kitLightBox",
		template : {
			html : [//
			'<div class="${showImageContainerCls}">', //
			'<div class="${imageBoxCls}">', //
			'</div>', //
			'<i class="${closeBtnCls}">', //
			'</i>', //
			'</div>'//
			].join(''),
			showImageContainerCls : 'kitLightBox-showImageContainer',
			imageBoxCls : 'kitLightBox-showImage-imageBox',
			completeShowCls : 'kitLightBox-completeShow',
			closeBtnCls : 'kitLightBox-closeButton'
		},
		el : null,
		data : null
	}
});
$kit.merge($kit.ui.LightBox.prototype, {
	init : function() {
		var me = this;
		if(me.config.el == null) {
			return;
		}
		$kit.ev({
			el : me.config.el,
			ev : 'click',
			fn : me.show,
			scope : me
		});
		me.config.el[me.config.kitWidgetName] = me;
		return me;
	},
	show : function(e, evCfg) {
		var me = this;
		var item = $kit.dom.parentEl8cls(me.config.el, 'item');
		$kit.insEl({
			what : item,
			where : item.parentNode,
			pos : 'last'
		});
		e.stopNow();
		if(me.showImage == null) {
			me.initShowImage();
		} else {
			var offset = $kit.offset(me.config.el);
			var viewport = $kit.viewport();
			var ofTop = viewport.scrollTop + viewport.clientHeight / 2 - me.imageHeight / 2;
			var ofLeft = viewport.scrollLeft + viewport.clientWidth / 2 - me.imageWidth / 2;
			ofTop = ofTop < 0 ? 0 : ofTop;
			ofLeft = ofLeft < 0 ? 0 : ofLeft;
			$kit.anim.motion({
				el : me.showImage,
				duration : 300,
				from : {
					display : 'block',
					position : 'absolute',
					top : offset.middleTop + 'px',
					left : offset.middleLeft + 'px',
					width : '1px',
					height : '1px'
				},
				to : {
					position : 'absolute',
					top : ofTop + 'px',
					left : ofLeft + 'px',
					width : me.imageWidth + 'px',
					height : me.imageHeight + 'px'
				},
				then : function() {
					$kit.adCls(me.showImage, me.config.template.completeShowCls);
					me.image.style.visibility = 'visible';
					me.image.style.display = 'block';
				}
			});
		}
	},
	initShowImage : function() {
		var me = this;
		var loading = new $kit.ui.SemitransparentLoading();
		//
		var me = this;
		var el = me.config.el;
		var showImage = $kit.newHTML($kit.tpl(me.config.template.html,me.config.template)).childNodes[0];
		var imageBox = $kit.el8cls(me.config.template.imageBoxCls, showImage);
		var closeBtn = $kit.el8cls(me.config.template.closeBtnCls, showImage);
		me.showImage = showImage;
		me.imageBox = imageBox;
		me.closeBtn = closeBtn;
		document.body.appendChild(showImage);
		showImage.style.display = 'none';
		var offset = $kit.offset(el);
		var imgUrl = $kit.attr(el, 'href');
		var image = new Image();
		var viewport = $kit.viewport();
		image.onload = function() {
			image.onload = null;
			me.imageWidth = image.width;
			me.imageHeight = image.height;
			//
			me.mask = new $kit.ui.Mask();
			//
			imageBox.innerHTML = '';
			var ofTop = viewport.scrollTop + viewport.clientHeight / 2 - image.height / 2;
			var ofLeft = viewport.scrollLeft + viewport.clientWidth / 2 - image.width / 2;
			ofTop = ofTop < 0 ? 0 : ofTop;
			ofLeft = ofLeft < 0 ? 0 : ofLeft;
			$kit.anim.motion({
				el : me.showImage,
				duration : 300,
				from : {
					display : 'block',
					position : 'absolute',
					top : offset.top + 'px',
					left : offset.left + 'px',
					width : 0,
					height : 0,
					zIndex : 99
				},
				to : {
					position : 'absolute',
					top : ofTop + 'px',
					left : ofLeft + 'px',
					width : me.imageWidth + 'px',
					height : me.imageHeight + 'px'
				},
				then : function() {
					imageBox.appendChild(image);
					me.image = image;
					$kit.anim.motion({
						el : image,
						from : {
							opacity : 0
						},
						to : {
							opacity : 1
						}
					});
					$kit.adCls(me.showImage, me.config.template.completeShowCls);
					loading.destory();
				}
			});
			$kit.ev({
				el : closeBtn,
				ev : 'click',
				fn : function() {
					this.hide();
				},
				scope : me
			});
		}
		image.src = imgUrl;
	},
	hide : function() {
		var me = this;
		var offset = $kit.offset(me.config.el);
		var originWidth = me.showImage.offsetWidth;
		var originHeight = me.showImage.offsetHeight;
		me.image.style.visibility = 'hidden';
		me.image.style.display = 'none';
		if(me.mask) {
			me.mask.destory();
		}
		$kit.rmCls(me.showImage, me.config.template.completeShowCls);
		$kit.anim.motion({
			el : me.showImage,
			duration : 300,
			from : {
				opactiy : 1,
				top : $kit.css(me.showImage, 'top') + 'px',
				left : $kit.css(me.showImage, 'left') + 'px',
				width : originWidth + 'px',
				height : originHeight + 'px'
			},
			to : {
				opactiy : 0,
				top : offset.middleTop + 'px',
				left : offset.middleLeft + 'px',
				width : 1 + 'px',
				height : 1 + 'px'
			},
			then : function() {
				me.showImage.style.display = 'none';
			}
		});
	}
});
