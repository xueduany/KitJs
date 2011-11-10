$kit.ui.TabPanel = function(config) {
	var defaultConfig = {
		tabPageCls : "J_tabpage",
		tabContainerCls : "tab_container",
		innerTabContainerCls : "inner_tab_container",
		tabCls : "tab",
		tabTitle : "data-title",
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
	var me = this;
	me.config = $kit.join(config, defaultConfig);
	me.init();
};
$kit.merge($kit.ui.TabPanel.prototype, {
	init : function() {
		var me = this;
		var tabPages = $kit.els8cls(me.config.tabPageCls);
		me.container = me.container || document.createElement("div");
		me.container.className = me.config.tabContainerCls;
		me.innerTabContainer = me.innerTabContainer || document.createElement("div");
		me.innerTabContainer.className = me.config.innerTabContainerCls;
		me.innerTabContainerBox = me.innerTabContainerBox || document.createElement("div");
		me.innerTabContainerBox.style.display = "inline-block";
		if(me.innerTabContainerBox.parentNode == null || me.innerTabContainerBox.parentNode != me.innerTabContainer) {
			me.innerTabContainer.appendChild(me.innerTabContainerBox);
		}
		me.container.appendChild(me.innerTabContainer);
		$kit.insEl({
			what : me.container,
			pos : "before",
			where : tabPages[0]
		});
		for(var i = 0; i < tabPages.length; i++) {
			var _tab = document.createElement("div"), o = tabPages[i];
			me.innerTabContainerBox.appendChild(_tab);
			_tab.className = me.config.tabCls;
			_tab.innerHTML = $kit.attr(o, me.config.tabTitle);
			if($kit.isEmpty(o.id)) {
				o.id = $kit.onlyId();
			}
			$kit.attr(_tab, "data-tabpageid", o.id)
			o.style.display = "none";
		};
		$kit.ev({
			el : me.container,
			ev : "mousedown touchstart",
			fn : me.moveTabBegin,
			tabPanel : me
		});
		$kit.ev({
			el : me.container,
			ev : "mousemove touchmove",
			fn : me.moveTab,
			tabPanel : me
		});
		$kit.ev({
			el : me.container,
			ev : "mouseup mouseout touchend",
			fn : me.moveTabEnd,
			tabPanel : me
		});
	},
	moveTabBegin : function(ev, evConfig) {
		var me = this, tabPanel = evConfig.tabPanel;
		me._tabMove = true;
		tabPanel.lastTimeStamp = ev.timeStamp;
		tabPanel.lastPageX = ev.firstFingerPageX;
		tabPanel.acceleration = 0;
		tabPanel.moveLeft = 0;
		tabPanel.keepTime = 0;
		clearTimeout(tabPanel.clearMovies);
		tabPanel.innerTabContainer.style["-webkit-transition"] = null;
	},
	moveTab : function(ev, evConfig) {
		var me = this, tabPanel = evConfig.tabPanel;
		if(me._tabMove) {
			if(!$kit.isEmpty(tabPanel.lastTimeStamp)) {
				//unit ms
				var keepTime = ev.timeStamp - tabPanel.lastTimeStamp;
				//unit px
				var distance = ev.firstFingerPageX - tabPanel.lastPageX;
				var acceleration = parseFloat(distance / keepTime);
				var moveLeft = 0;
				try {
					moveLeft = parseFloat(tabPanel.innerTabContainer.style["-webkit-transform"].match(/translateX\((-{0,1}\d+)px\)/)[1]);
				} catch(e) {
				}
				tabPanel.moveLeft = moveLeft = moveLeft + distance;
				tabPanel.innerTabContainer.style["-webkit-transform"] = "translateX(" + moveLeft + "px" + ")";
				tabPanel.acceleration = acceleration;
				tabPanel.keepTime = keepTime;
			}
			tabPanel.lastTimeStamp = ev.timeStamp;
			tabPanel.lastPageX = ev.firstFingerPageX;
			ev.stopDefault();
		}
	},
	moveTabEnd : function(ev, evConfig) {
		var me = this;
		if(me._tabMove) {
			me._tabMove = false;
			tabPanel.lastTimeStamp = null;
			tabPanel.lastPageX = null;
			var flagClearTimeout = false;
			var holdTime = 500;
			if(tabPanel.moveLeft > 0) {
				tabPanel.innerTabContainer.style["-webkit-transform"] = "translateX(0)";
				tabPanel.innerTabContainer.style["-webkit-transition"] = "all " + holdTime + "ms ease-out 0";
				flagClearTimeout = true;
			} else if(tabPanel.container.offsetWidth - tabPanel.moveLeft > tabPanel.innerTabContainerBox.offsetWidth) {
				var moveLeft = tabPanel.container.offsetWidth - tabPanel.innerTabContainerBox.offsetWidth;
				tabPanel.innerTabContainer.style["-webkit-transform"] = "translateX(" + moveLeft + "px)";
				tabPanel.innerTabContainer.style["-webkit-transition"] = "all " + holdTime + "ms ease-out 0";
				flagClearTimeout = true;
			} else {
				if(!$kit.isEmpty(tabPanel.config.accelerationValve) && Math.abs(tabPanel.acceleration) > tabPanel.config.accelerationValve[0].acceleration) {
					var ary = tabPanel.config.accelerationValve, a = Math.abs(tabPanel.acceleration), times = 0;
					for(var i = 0; i < ary.length; i++) {
						if(a > ary[i].acceleration) {
							times = ary[i].times;
						}
					}
					var moveLeft = tabPanel.moveLeft + tabPanel.acceleration * times * tabPanel.keepTime;
					if(moveLeft > 0) {
						moveLeft = 0;
					} else if(moveLeft < tabPanel.container.offsetWidth - tabPanel.innerTabContainerBox.offsetWidth) {
						moveLeft = tabPanel.container.offsetWidth - tabPanel.innerTabContainerBox.offsetWidth;
					}
					moveLeft = Math.ceil(moveLeft);
					tabPanel.innerTabContainer.style["-webkit-transform"] = "translateX(" + moveLeft + "px" + ")";
					tabPanel.innerTabContainer.style["-webkit-transition"] = "all " + holdTime + "ms ease-out 0";
					flagClearTimeout = true;
					$kit.log(times);
				}
			}
			if(flagClearTimeout) {
				tabPanel.clearMovies = setTimeout(function() {
					tabPanel.innerTabContainer.style["-webkit-transition"] = null;
				}, holdTime);
			}
		}
	},
	showTabPage : function(ev, evConfig) {
		var me = this, tabPanel = evConfig.tabPanel;
		var el = ev.target;
		var a = $kit.el("." + tabPanel.config.tabPageCls);
		for(var i = 0; i < a.length; i++) {
			a[i].style.display = "none";
		}
		$kit.el("#" + $kit.attr(el, "data-tabpageid")).style.display = "block";
	}
});
