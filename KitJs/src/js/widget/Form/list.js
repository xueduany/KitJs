/**
 * 鼠标键盘操作的列表，常用于input的下拉
 */
$kit.ui.Form.List = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.List,
		father : $kit.ui.Form
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Form.List, {
	defaultConfig : {
		where : undefined,
		pos : 'last',
		what : [//
		'<ul class="${listCls}">', //
		'</ul>'//
		].join(''),
		kitWidgetName : 'kitFormList',
		listCls : 'kitjs-form-list',
		listItemCls : 'kitjs-form-listItem',
		oddListItemCls : 'kitjs-form-listItem-odd',
		evenListItemCls : 'kitjs-form-listItem-even',
		listItemHTML : [//
		'<li class="${listItemCls} ${oddOrEven}" value="${value}">', //
		'${key}', //
		'</li>'//
		].join(''),
		list : undefined,
		selectedCls : 'selected',
		triggleEl : undefined//事件触发元素
	}
});
$kit.merge($kit.ui.Form.List.prototype, {
	/*
	 * 初始化
	 */
	init : function() {
		$kit.insEl({
			where : this.config.where,
			pos : this.config.pos,
			what : $kit.tpl(this.config.what, this.config)
		});
		this.listItemCount = 0;
		this.listEl = $kit.el8cls(this.config.listCls, this.config.where);
		this.buildList();
		this.bindEv();
	},
	/**
	 * 创建列表
	 */
	buildList : function() {
		var me = this;
		this.listEl.innerHTML = '';
		this.listItemCount = 0;
		$kit.each(this.config.list, function(o, idx) {
			me.listEl.appendChild($kit.newHTML($kit.tpl(me.config.listItemHTML, $kit.join(me.config, o, {
				oddOrEven : idx % 2 == 0 ? me.config.evenListItemCls : me.config.oddListItemCls
			}))));
			me.listItemCount++;
		});
	},
	bindEv : function() {
		var me = this;
		$kit.ev({
			el : me.config.triggleEl,
			ev : 'blur',
			fn : function() {
				var me = this;
				//me.listEl.style.display = 'none';
			},
			scope : me
		});
		$kit.ev({
			el : me.config.triggleEl,
			ev : 'focus',
			fn : function() {
				var me = this;
				if(me.listItemCount > 0) {
					me.listEl.style.display = '';
				}
			},
			scope : me
		});
		$kit.ev({
			el : me.listEl,
			ev : 'mouseover',
			fn : function(e) {
				var me = this;
				var li;
				if($kit.hsCls(e.target, me.config.listItemCls)) {
					li = e.target;
				} else {
					li = $kit.dom.parentEl8cls(e.target, me.config.listItemCls, me.listEl);
				}
				if(li) {
					$kit.dom.rmClsAll(me.config.selectedCls, me.listEl);
					$kit.adCls(li, me.config.selectedCls);
				}
			},
			scope : me
		});
		$kit.ev({
			el : me.listEl,
			ev : 'mousedown',
			fn : function(e) {
				var me = this;
				if(e.button < 2) {
					var li;
					if($kit.hsCls(e.target, me.config.listItemCls)) {
						li = e.target;
					} else {
						li = $kit.dom.parentEl8cls(e.target, me.config.listItemCls, me.listEl);
					}
					if(li) {
						me.config.triggleEl.value = $kit.attr(li, 'value');
						me.listEl.style.display = 'none';
					}
				}
			},
			scope : me
		});
		$kit.ev({
			el : me.config.triggleEl,
			ev : 'keydown',
			fn : function(e) {
				var me = this;
				if($kit.event.KEYCODE_DOWN == e.keyCode || $kit.event.KEYCODE_UP == e.keyCode || $kit.event.KEYCODE_ENTER == e.keyCode) {
					var selectedLi = $kit.el8cls('selected', me.listEl);
					var firstLi = $kit.el8cls(me.config.listItemCls, me.listEl);
					if($kit.event.KEYCODE_DOWN == e.keyCode && me.listEl.childNodes.length) {
						me.listEl.style.display = 'block';
						if($kit.isEmpty(selectedLi)) {
							$kit.adCls(firstLi, 'selected');
						} else {
							$kit.rmCls(selectedLi, 'selected');
							var nextLi = $kit.nextEl(selectedLi, function(el) {
								if($kit.hsCls(el, me.config.listItemCls)) {
									return true;
								}
							});
							if(nextLi) {
								$kit.adCls(nextLi, 'selected');
							} else {
								$kit.adCls(firstLi, 'selected');
							}
						}
					} else if($kit.event.KEYCODE_UP == e.keyCode && me.listEl.childNodes.length) {
						me.listEl.style.display = 'block';
						if($kit.isEmpty(selectedLi)) {
							$kit.adCls(firstLi, 'selected');
						} else {
							$kit.rmCls(selectedLi, 'selected');
							var prevLi = $kit.prevEl(selectedLi, function(el) {
								if($kit.hsCls(el, me.config.listItemCls)) {
									return true;
								}
							});
							if(prevLi) {
								$kit.adCls(prevLi, 'selected');
							} else {
								$kit.adCls(firstLi, 'selected');
							}
						}
					} else if($kit.event.KEYCODE_ENTER == e.keyCode && me.listEl.style.display == 'block' && me.listEl.childNodes.length) {
						me.listEl.style.display = 'none';
						me.config.triggleEl.value = $kit.attr(selectedLi, 'value');
					}
					me.adjustScrollTop(me.listEl);
					e.stopDefault();
				}
			},
			scope : me
		});
	},
	adjustScrollTop : function(listEl) {
		selectedLi = $kit.el8cls(this.config.selectedCls, listEl);
		if($kit.isEmpty(selectedLi)) {
			return;
		}
		if(selectedLi.offsetTop < listEl.scrollTop || selectedLi.offsetTop + selectedLi.offsetHeight > listEl.scrollTop + $kit.css(listEl, 'height')) {
			selectedLi.scrollIntoView();
		}
	}
});
