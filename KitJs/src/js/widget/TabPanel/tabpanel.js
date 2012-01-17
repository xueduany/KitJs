$kit.ui.TabPanel = function(config) {
	var defaultConfig = {
		pos : 'last',
		where : document.body,
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
		bodyContainerCls : "tabpanl_body_container",
		tabCls : "tab",
		tabTitle : "标签",
		selectedTabCls : 'selected-tab',
		accelerationValve : [{
			acceleration : 1,
			times : 8
		}, {
			acceleration : 2,
			times : 15
		}, {
			acceleration : 4,
			times : 25
		}],

	}
	var me = this;
	me.config = $kit.join(defaultConfig, config);
	me.init();
};
$kit.merge($kit.ui.TabPanel.prototype, {
	init : function() {
		var me = this;
		me.kitId = $kit.onlyId();
		if(!$kit.isEmpty($kit.el8cls(me.config.tabPanelCls))//
		&& !$kit.isEmpty($kit.el8cls(me.config.tabContainerCls, $kit.el8cls(me.config.tabPanelCls)))//
		&& !$kit.isEmpty($kit.el8cls(me.config.bodyContainerCls, $kit.el8cls(me.config.tabPanelCls)))) {
			//已经有类似的结构
		} else {
			var html = $kit.tpl(me.config.what, me.config);
			$kit.insEl({
				pos : me.config.pos,
				where : me.config.where,
				what : html
			});
		}
		me.tabPanel = $kit.el8cls(me.config.tabPanelCls);
		me.tabPanelTab = $kit.el8cls(me.config.tabContainerCls, me.tabPanel);
		me.tabPanelBody = $kit.el8cls(me.config.bodyContainerCls, me.tabPanel);
		var tabPages = $kit.els8cls(me.config.tabPageCls);
		var innerTabContainerBox = document.createElement('div');
		me.tabPanelTab.appendChild(innerTabContainerBox);
		innerTabContainerBox.className = "tabpanel-tabList";
		var tabTotalWidth = 0, maxMoveLeft = 0;
		var first = true;
		for(var i = 0; i < tabPages.length; ) {
			if($kit.contains(me.tabPanelBody, tabPages[i])) {
				i++;
			} else {
				me.tabPanelBody.appendChild(tabPages[i]);
				if(!first) {
					tabPages[i].style.display = 'none';
				} else {
					//tabPages[i].style.display = 'none';
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
				$kit.attr(_tab, "data-tabpageid", o.id)
				//o.style.display = "none";
				tabTotalWidth = tabTotalWidth < _tab.offsetWidth + _tab.offsetLeft ? _tab.offsetWidth + _tab.offsetLeft : tabTotalWidth;
			}
		}
		me.innerTabContainerBox = innerTabContainerBox;
		maxMoveLeft = me.tabPanelTab.offsetWidth - tabTotalWidth;
		//
		me.flag_move = false;
		me.flag_mouseover = false;
		me.flag_mouseout = false;
		me.flag_mousedown = false;
		me.flag_mouseup = false;
		me.flag_tabHasMove == false
		//
		$kit.ev({
			el : document.body,
			ev : "mouseup",
			fn : function() {
				me.flag_mouseup = true;
				me.flag_mousedown = false;
			},
			scope : me
		})
		$kit.ev({
			el : me.tabPanelTab,
			ev : "mousedown mouseover touchstart mouseup mouseout touchend",
			fn : function(ev, evCfg) {
				var me = this;
				//去掉不必要的mouseover和mouoseout事件
				if(ev.type == 'mouseout' && $kit.contains(me.tabPanelTab, ev.relatedTarget)) {
					return;
				}
				if(ev.type == 'mouseover' && $kit.contains(me.tabPanelTab, ev.relatedTarget) && $kit.contains(me.tabPanelTab, ev.target)) {
					return;
				}
				me['flag_' + ev.type] = true;
				switch (ev.type) {
					case 'mouseover':
						me.flag_mouseout = false;
						me.flag_mousedown = false;
						break;
					case 'mouseout':
						me.flag_mouseover = false;
						me.flag_mousedown = false;
						break;
					case 'mousedown':
						me.flag_mouseup = false;
						break;
					case 'mouseup':
						me.flag_mousedown = false;
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
					clearTimeout(me.clearMovies);
					me.innerTabContainerBox.style["-webkit-transition"] = null;
				} else if(me.flag_mouseup || me.flag_mouseout || me.flag_touchend) {
					if(me.flag_tabMove) {
						me.flag_tabMove = false;
						me.lastTimeStamp = null;
						me.lastPageX = null;
						var holdTime = 500;
						if(me.moveLeft > 0) {
							$kit.anim.motion({
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
						} else if(me.tabPanelTab.offsetWidth - me.moveLeft > tabTotalWidth) {
							//var moveLeft = me.tabPanelTab.offsetWidth - tabTotalWidth;
							//me.innerTabContainerBox.style["-webkit-transform"] = "translateX(" + moveLeft + "px)";
							//me.innerTabContainerBox.style["-webkit-transition"] = "all " + holdTime + "ms ease-out 0";
							$kit.anim.motion({
								duration : holdTime,
								el : me.innerTabContainerBox,
								from : {
									'-webkit-transform' : me.innerTabContainerBox.style["-webkit-transform"]
								},
								to : {
									'-webkit-transform' : 'translateX(' + maxMoveLeft + 'px)'
								},
								fx : $kit.anim.Fx.easeOutQuart,
								then : function() {
									//

								},
								timeout : '_timeout_motion_tabpanel_' + me.kitId
							});
						} else if(me.flag_tabHasMove == true) {
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
								} else if(moveLeft < maxMoveLeft) {
									moveLeft = maxMoveLeft;
								}
								//moveLeft = Math.ceil(moveLeft);
								//me.innerTabContainerBox.style["-webkit-transform"] = "translateX(" + moveLeft + "px" + ")";
								//me.innerTabContainerBox.style["-webkit-transition"] = "all " + holdTime + "ms ease-out 0";
								$kit.anim.motion({
									duration : holdTime,
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
							}
						}
					}
					me.flag_tabMove = false;
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
		$kit.ev({
			el : me.tabPanelTab,
			ev : "click",
			fn : me.tabClick,
			scope : me
		});
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
	tabClick : function(ev, evConfig) {
		var el = ev.target;
		var me = this;
		if($kit.hsCls(el, 'tab') && me.flag_tabHasMove == false) {
			var a = $kit.el("." + tabPanel.config.tabPageCls);
			for(var i = 0; i < a.length; i++) {
				a[i].style.display = "none";
			}
			$kit.el("#" + $kit.attr(el, "data-tabpageid")).style.display = "block";
			var selectedTab = $kit.el8cls(me.config.selectedTabCls, me.tabPanel);
			$kit.rmCls(selectedTab, me.config.selectedTabCls);
			$kit.adCls(el, me.config.selectedTabCls);
		}
	},
	moveTab : function(ev, evConfig) {
		var me = this;
		if(me.flag_tabMove = true && ev.which == 1) {
			if(!$kit.isEmpty(me.lastTimeStamp)) {
				//unit ms
				var keepTime = ev.timeStamp - me.lastTimeStamp;
				//unit px
				var distance = ev.firstFingerPageX - me.lastPageX;
				var acceleration = parseFloat(distance / keepTime);
				var moveLeft = 0;
				try {
					moveLeft = parseFloat(me.innerTabContainerBox.style["-webkit-transform"].match(/translateX\((-{0,1}\d+)px\)/)[1]);
				} catch(e) {

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
});
