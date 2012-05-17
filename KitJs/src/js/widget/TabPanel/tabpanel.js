/*
 * tabPanel
 * @class $kit.ui.TabPanel
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/TabPanel/tabpanel.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/TabPanel/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/TabPanel/demo.png">
 */
$kit.ui.TabPanel = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.TabPanel,
/**
 * @lends $kit.ui.TabPanel
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		pos : 'last',
		what : [//
		'<div class="${tabPanelCls}">', //
		'<div class="${tabContainerCls}">', //
		'</div>', //
		'<div class="${bodyContainerCls}">', //
		'</div>', //
		'</div>'//
		].join(''),
		tabPanelCls : 'kitjs-tabpanel',
		tabPageCls : "J_tabpage",
		tabContainerCls : "tabpanel_tab_container",
		bodyContainerCls : "tabpanel_body_container",
		innerTabContainerBoxCls : "tabpanel-tabList",
		attr_tabpageid : 'data-tabpageid',
		tabCls : "tab",
		tabTitle : "标签",
		selectedTabCls : 'selected-tab',
		selectedTabPageCls : 'selected-tabPage',
		hiddenCls : 'hidden',
		accelerationValve : [{
			acceleration : 1,
			times : 8
		}, {
			acceleration : 2,
			times : 15
		}, {
			acceleration : 4,
			times : 25
		}]
	}
});
$kit.merge($kit.ui.TabPanel.prototype,
/**
 * @lends $kit.ui.TabPanel.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		me.kitId = $kit.onlyId();
		if(!$kit.isEmpty($kit.el8cls(me.config.tabPanelCls))//
		&& !$kit.isEmpty($kit.el8cls(me.config.tabContainerCls, $kit.el8cls(me.config.tabPanelCls)))//
		&& !$kit.isEmpty($kit.el8cls(me.config.bodyContainerCls, $kit.el8cls(me.config.tabPanelCls)))) {
			// 已经有类似的结构
		} else {
			var html = $kit.tpl(me.config.what, me.config);
			$kit.insEl({
				pos : me.config.pos,
				where : me.config.where || document.body,
				what : html
			});
		}
		me.tabPanel = $kit.el8cls(me.config.tabPanelCls);
		me.tabPanelTab = $kit.el8cls(me.config.tabContainerCls, me.tabPanel);
		me.tabPanelBody = $kit.el8cls(me.config.bodyContainerCls, me.tabPanel);
		me.createTab();
		//
		me.flag_move = false;
		me.flag_mouseover = false;
		me.flag_mouseout = false;
		me.flag_mousedown = false;
		me.flag_mouseup = false;
		me.flag_tabHasMove == false
		//
		me.triggleEvent();
	},
	triggleEvent : function() {
		var me = this;
		me.timeSeg = 25;
		$kit.ev({
			el : document.body,
			ev : "mouseup",
			fn : function() {
				me.flag_mouseup = true;
				me.flag_mousedown = false;
			},
			scope : me
		});
		// $kit.ev({
		// el : me.innerTabContainerBox,
		// ev : 'webkitTransitionEnd',
		// fn : function() {
		// this.style.removeProperty('-webkit-transition');
		// }
		// });
		$kit.ev({
			el : me.tabPanelTab,
			ev : "mousedown mouseover touchstart mouseup mouseout touchend",
			fn : function(ev, evCfg) {
				var me = this;
				// 去掉不必要的mouseover和mouoseout事件
				if((ev.type == 'mouseout' || ev.type == 'touchstart') && $kit.contains(me.tabPanelTab, ev.relatedTarget)) {
					return;
				}
				if((ev.type == 'mouseover' || ev.type == 'touchstart') && $kit.contains(me.tabPanelTab, ev.relatedTarget) && $kit.contains(me.tabPanelTab, ev.target)) {
					return;
				}
				if(ev.type == 'touchstart' || ev.type == 'touchend') {
					ev.stopDefault();
				}
				me['flag_' + ev.type] = true;
				switch (ev.type) {
					case 'mouseover' :
						me.flag_mouseout = false;
						me.flag_mousedown = false;
						break;
					case 'mouseout' :
						me.flag_mouseover = false;
						me.flag_mousedown = false;
						break;
					case 'mousedown' :
						me.flag_mouseup = false;
						break;
					case 'mouseup' :
						me.flag_mousedown = false;
						break;
					case 'touchend' :
						me.flag_touchstart = false;
						break;
				}
				if((me.flag_mousedown && me.flag_mouseover) || me.flag_touchstart) {
					me.flag_tabMove = true;
					me.flag_tabHasMove = false;
					me.lastTimeStamp = ev.timeStamp;
					me.lastPageX = ev.firstFingerPageX;
					me.acceleration = 0;
					me.moveLeft = 0;
					me.keepTime = 0;
				} else if(me.flag_mouseup || me.flag_mouseout || me.flag_touchend) {
					if(me.flag_tabMove && me.flag_tabHasMove == true) {
						me.flag_tabMove = false;
						me.lastTimeStamp = null;
						me.lastPageX = null;
						var holdTime = 500;
						if(me.moveLeft > 0) {
							$kit.anim.motion({
								timeSeg : me.timeSeg,
								duration : holdTime,
								el : me.innerTabContainerBox,
								from : {
									'-webkit-transform' : 'translateX(' + me.moveLeft + 'px)'
								},
								to : {
									'-webkit-transform' : 'translateX(0px)'
								},
								fx : $kit.anim.Fx.easeOutQuart,
								then : function() {
									//
								},
								timeout : '_timeout_motion_tabpanel_' + me.kitId
							});
							// me.innerTabContainerBox.style['-webkit-transition'] = '-webkit-transform 500ms ease-in 0ms';
							// me.innerTabContainerBox.style['-webkit-transform'] = 'translateX(0px)';
						} else if(me.tabPanelTab.offsetWidth - me.moveLeft > me.tabTotalWidth) {
							var moveLeft = 0;
							if(me.tabTotalWidth > me.tabPanelTab.offsetWidth) {
								moveLeft = me.tabPanelTab.offsetWidth - me.tabTotalWidth;
							} else {
								moveLeft = 0;
							}
							$kit.anim.motion({
								duration : holdTime,
								timeSeg : me.timeSeg,
								el : me.innerTabContainerBox,
								from : {
									'-webkit-transform' : me.innerTabContainerBox.style["-webkit-transform"]
								},
								to : {
									'-webkit-transform' : 'translateX(' + moveLeft + 'px)'
								},
								fx : $kit.anim.Fx.easeOutQuart,
								then : function() {
									//

								},
								timeout : '_timeout_motion_tabpanel_' + me.kitId
							});
							// me.innerTabContainerBox.style['-webkit-transition'] = '-webkit-transform 500ms ease-in 0ms';
							// me.innerTabContainerBox.style['-webkit-transform'] = 'translateX(' + moveLeft + 'px)';
						} else {
							if(!$kit.isEmpty(me.config.accelerationValve) && Math.abs(me.acceleration) > me.config.accelerationValve[0].acceleration) {
								var ary = me.config.accelerationValve, a = Math.abs(me.acceleration), times = 0;
								for(var i = 0; i < ary.length; i++) {
									if(a > ary[i].acceleration) {
										times = ary[i].times;
									}
								}
								var moveLeft = me.moveLeft + me.acceleration * times * me.keepTime;
								if(moveLeft > 0) {
									moveLeft = 0;
								} else if(moveLeft < me.tabPanelTab.offsetWidth - me.tabTotalWidth) {
									moveLeft = me.tabPanelTab.offsetWidth - me.tabTotalWidth;
								}
								$kit.anim.motion({
									duration : holdTime,
									timeSeg : me.timeSeg,
									el : me.innerTabContainerBox,
									from : {
										'-webkit-transform' : me.innerTabContainerBox.style["-webkit-transform"]
									},
									to : {
										'-webkit-transform' : 'translateX(' + moveLeft + 'px)'
									},
									fx : $kit.anim.Fx.easeOutQuart,
									then : function() {
										//

									},
									timeout : '_timeout_motion_tabpanel_' + me.kitId
								});

								// me.innerTabContainerBox.style['-webkit-transition'] = '-webkit-transform 500ms ease-in 0ms';
								// me.innerTabContainerBox.style['-webkit-transform'] = 'translateX(' + moveLeft + 'px)';

							}
						}
					}
					if(me.flag_tabHasMove == false && (ev.type == "mouseup" || ev.type == "touchend")) {
						var el = ev.target;
						var me = this;
						if(!$kit.hsCls(el, me.config.tabCls) && el.parentNode && $kit.hsCls(el.parentNode, me.config.tabCls)) {
							el = el.parentNode;
						}
						if($kit.hsCls(el, me.config.tabCls) && me.flag_tabHasMove == false) {
							me.switchTab(el);
						}
					}
					me.flag_tabMove = false;
					me.flag_tabHasMove = false
				}
			},
			scope : me
		});
		$kit.ev({
			el : me.tabPanelTab,
			ev : "mousemove touchmove",
			fn : me.moveTab,
			scope : me
		});
		// $kit.ev({
		// el : me.tabPanelTab,
		// ev : "click",
		// fn : me.tabClick,
		// scope : me
		// });

		$kit.ev({
			el : me.tabPanelTab,
			ev : "select selectstart",
			fn : function(ev) {
				ev.stopDefault();
				return false;
			},
			scope : me
		});
	},
	/**
	 * 创建标签
	 */
	createTab : function() {
		var me = this;
		var tabTotalWidth = 0;
		var tabPages = $kit.els8cls(me.config.tabPageCls);
		if($kit.isEmpty(tabPages) && !$kit.isEmpty($kit.el8cls(me.config.innerTabContainerBoxCls, me.tabPanelTab))) {
			$kit.each($kit.el8cls(me.config.innerTabContainerBoxCls, me.tabPanelTab).children, function(o) {
				var id = $kit.attr(o, me.config.attr_tabpageid);
				$kit.adCls($kit.el8id(id), me.config.tabPageCls);
			});
			me.innerTabContainerBox = $kit.el8cls(me.config.innerTabContainerBoxCls, me.tabPanelTab);
			var lastChild = me.innerTabContainerBox.children[me.innerTabContainerBox.children.length - 1];
			tabTotalWidth = lastChild.offsetLeft + lastChild.offsetWidth;
		} else {
			if($kit.isEmpty($kit.el8cls(me.config.innerTabContainerBoxCls, me.tabPanelTab))) {
				var innerTabContainerBox = document.createElement('div');
				me.tabPanelTab.appendChild(innerTabContainerBox);
				innerTabContainerBox.className = me.config.innerTabContainerBoxCls;
				var first = true;
				// var flag_leftArrow = false, flag_rightArrow = false, lastOne;
				for(var i = 0; i < tabPages.length; ) {
					if($kit.contains(me.tabPanelBody, tabPages[i])) {
						i++;
					} else {
						if(!first) {
							$kit.adCls(tabPages[i], me.config.hiddenCls);
						} else {
							first = false;
						}
						//
						var _tab = document.createElement("div"), o = tabPages[i];
						innerTabContainerBox.appendChild(_tab);
						if(first) {
							$kit.adCls(_tab, me.config.selectedTabCls);
						} else {
							first = false;
						}
						_tab.className = me.config.tabCls;
						_tab.innerHTML = me.config.tabTitle;
						// lastOne = _tab;
						//
						var tabConfig = $kit.attr(o, "config");
						if(tabConfig != undefined) {
							eval("tabConfig=" + tabConfig);
							$kit.css(_tab, tabConfig.css);
							if(tabConfig.selected == true) {
								$kit.adCls(_tab, me.config.selectedTabCls);
							}
							if(tabConfig.title) {
								_tab.innerHTML = tabConfig.title;
							}
						}
						//
						if($kit.isEmpty(o.id)) {
							o.id = $kit.onlyId();
						}
						$kit.attr(_tab, me.config.attr_tabpageid, o.id);
						tabTotalWidth = tabTotalWidth > _tab.offsetLeft + _tab.offsetWidth ? tabTotalWidth : _tab.offsetLeft + _tab.offsetWidth;
						//
						me.tabPanelBody.appendChild(tabPages[i]);
					}
					/*
					 if(!flag_leftArrow) {//&& tabTotalWidth > me.tabPanelTab.offsetWidth) {
					 $kit.insEl({
					 pos : 'first',
					 where : innerTabContainerBox,
					 what : '<div class="left-arrow"></div>'
					 })
					 flag_leftArrow = true;
					 }
					 if(!flag_rightArrow && i == tabPages.length - 1 && !$kit.isEmpty(lastOne)) {//&& tabTotalWidth > me.tabPanelTab.offsetWidth  ) {
					 $kit.insEl({
					 pos : 'last',
					 where : innerTabContainerBox,
					 what : '<div class="right-arrow"></div>'
					 })
					 flag_rightArrow = true;
					 var lastChild = innerTabContainerBox.children[innerTabContainerBox.children.length - 1];
					 tabTotalWidth += lastChild.offsetWidth;
					 }*/

				}
				me.innerTabContainerBox = innerTabContainerBox;
			}
		}
		me.tabTotalWidth = tabTotalWidth;
		me.tabTotalWidth += parseFloat($kit.css(me.innerTabContainerBox, 'marginLeft')) + parseFloat($kit.css(me.innerTabContainerBox, 'marginRight'));
	},
	/*tabClick : function(ev, evConfig) {
	 var el = ev.target;
	 var me = this;
	 if($kit.hsCls(el, me.config.tabCls) && me.flag_tabHasMove == false) {
	 var a = $kit.el("." + tabPanel.config.tabPageCls);
	 for(var i = 0; i < a.length; i++) {
	 a[i].style.display = "none";
	 }
	 $kit.el("#" + $kit.attr(el, me.config.attr_tabpageid)).style.display = "block";
	 var selectedTab = $kit.el8cls(me.config.selectedTabCls, me.tabPanel);
	 $kit.rmCls(selectedTab, me.config.selectedTabCls);
	 $kit.adCls(el, me.config.selectedTabCls);
	 }
	 },*/
	moveTab : function(ev, evConfig) {
		var me = this;
		//鼠标左键ev.which == 1
		if(me.flag_tabMove = true && (me.flag_mousedown || me.flag_touchstart) && ((ev.which == 1 && ev.type == "mousemove") || ev.type == "touchmove")) {
			clearInterval('_timeout_motion_tabpanel_' + me.kitId);
			if(!$kit.isEmpty(me.lastTimeStamp)) {
				// unit ms
				var keepTime = ev.timeStamp - me.lastTimeStamp;
				// unit px
				var distance = ev.firstFingerPageX - me.lastPageX;
				var acceleration = parseFloat(distance / keepTime);
				var moveLeft = 0;
				try {
					moveLeft = parseFloat(me.innerTabContainerBox.style["-webkit-transform"].match(/translateX\((-{0,1}\d+)px\)/)[1]);
				} catch (e) {

				}
				me.moveLeft = moveLeft = moveLeft + distance;
				me.innerTabContainerBox.style["-webkit-transform"] = "translateX(" + moveLeft + "px" + ")";
				me.acceleration = acceleration;
				me.keepTime = keepTime;
			}
			me.lastTimeStamp = ev.timeStamp;
			me.lastPageX = ev.firstFingerPageX;
			me.flag_tabHasMove = true;
			ev.stopDefault();
		}
	},
	setTabPanelStyle : function(css) {
		var me = this;
		$kit.css(me.tabPanel, css);
	},
	/**
	 * 切换tab
	 */
	switchTab : function(id) {
		var me = this, el;
		if($kit.isNum(id)) {
			el = $kit.els8cls(me.config.tabCls, me.innerTabContainerBox)[id];
		} else if($kit.isStr(id)) {
			$kit.each(me.innerTabContainerBox.children, function(o) {
				if($kit.attr(o, me.config.attr_tabpageid) == id) {
					el = o;
					return true;
				}
			});
		} else if($kit.isNode(id) && $kit.hsCls(id, me.config.tabCls)) {
			el = id;
		}
		if(!$kit.isEmpty(el)) {
			var a = $kit.el("." + me.config.tabPageCls);
			for(var i = 0; i < a.length; i++) {
				$kit.adCls(a[i], me.config.hiddenCls);
			}
			var targetEl = $kit.el("#" + $kit.attr(el, me.config.attr_tabpageid));
			$kit.newEv({
				ev : 'beforeSwitchTab',
				el : targetEl
			});
			$kit.each($kit.els8cls(me.config.selectedTabPageCls, me.tabPanelBody), function(o) {
				$kit.rmCls(o, me.config.selectedTabPageCls);
			});
			$kit.rmCls(targetEl, me.config.hiddenCls);
			$kit.adCls(targetEl, me.config.selectedTabPageCls);
			$kit.newEv({
				ev : 'switchTab',
				el : targetEl
			});
			var selectedTab = $kit.el8cls(me.config.selectedTabCls, me.tabPanel);
			$kit.rmCls(selectedTab, me.config.selectedTabCls);
			$kit.adCls(el, me.config.selectedTabCls);
			//
			var moveLeft = 0;
			var d = me.innerTabContainerBox.style['-webkit-transform'].match(/translateX\((-{0,1}\d+)px\)/);
			if(d != null && d.length > 1) {
				moveLeft = parseFloat(d[1]);
			}
			var marginLeft = parseFloat($kit.css(me.innerTabContainerBox, 'marginLeft'));
			var marginRight = parseFloat($kit.css(me.innerTabContainerBox, 'marginRight'));
			if(el.offsetLeft + moveLeft + marginLeft < 0) {
				me.innerTabContainerBox.style['-webkit-transform'] = 'translateX(-' + el.offsetLeft + 'px)';
			} else if(el.offsetLeft + el.offsetWidth + moveLeft + marginLeft + marginRight > me.tabPanelTab.offsetWidth) {
				var d = me.tabPanelTab.offsetWidth - el.offsetLeft - el.offsetWidth - marginLeft - marginRight;
				me.innerTabContainerBox.style['-webkit-transform'] = 'translateX(' + d + 'px)';
			}
			$kit.newEv({
				ev : 'afterSwitchTab',
				el : targetEl
			});
		}
	},
	/**
	 * 显示和不显示所有
	 */
	showAll : function(bool) {
		var me = this;
		var bool = true || bool;
		$kit.each($kit.els8cls(me.config.tabPageCls, me.tabPanel.body), function(o, idx, ary) {
			if(bool) {
				$kit.rmCls(o, me.config.hiddenCls);
			} else {
				$kit.adCls(o, me.config.hiddenCls);
			}
		});
	},
	/**
	 * 隐藏所有
	 */
	hideAll : function() {
		this.showAll(false);
	}
});
