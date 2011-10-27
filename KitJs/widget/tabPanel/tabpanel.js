$kit.ui.TabPanel = function(config) {
	var defaultConfig = {
		tabPageCls : "J_tabpage",
		tabContainerCls : "tab_container",
		innerTabContainerCls : "inner_tab_container",
		tabCls : "tab",
		tabTitle : "data-title"
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
		me.container.appendChild(me.innerTabContainer);
		$kit.insEl({
			what : me.container,
			pos : "before",
			where : tabPages[0]
		});
		for(var i = 0; i < tabPages.length; i++) {
			var _tab = document.createElement("div"), o = tabPages[i];
			me.innerTabContainer.appendChild(_tab);
			_tab.className = me.config.tabCls;
			_tab.innerHTML = $kit.attr(o, me.config.tabTitle);
		};
		$kit.ev({
			el : me.container,
			ev : "mousedown touchstart",
			fn : me.moveTabBegin
		});
		$kit.ev({
			el : me.container,
			ev : "mousemove touchmove",
			fn : me.moveTab
		});
	},
	moveTabBegin : function() {
		var me = this;
		me._tabMove = true;
	},
	moveTab : function() {
		var me = this;
		if(me._tabMove) {
			
		}
	},
	moveTabEnd : function() {
		var me = this;
		me._tabMove = false;
	}
});
