/**
 * Tag系统
 * 模仿stackOverFlow的表单提交tag系统
 */
$kit.ui.Tag = function() {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Tag, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : 'kitTag',
		splitSign : ',',
		tagValueMaxLength : 100,
		tagClass: ''
	}
});
