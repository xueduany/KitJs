/**
 * 多月日历
 */
$kit.ui.DatePicker.NMonths = function(config) {
	$kit.inherit({
		child : $kit.ui.DatePicker.NMonths,
		father : $kit.ui.DatePicker
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.DatePicker.NMonths, {
	defaultConfig : $kit.merge({

	}, $kit.ui.DatePicker.defaultConfig)
});
$kit.merge($kit.ui.DatePicker.NMonths.prototype, {

});
