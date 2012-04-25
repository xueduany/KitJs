/**
 * 菜单
 * @ignore
 * @class $kit.ui.Menu
 */
$kit.ui.Menu = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.Menu, {
	defaultConfig : {

	}
});
$kit.merge($kit.ui.Menu.prototype, {
	build : function() {

	}
});
