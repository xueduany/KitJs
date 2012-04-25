$kit.Log = function(config) {
	var me = this;
	var defaultConfig = {
		template : [//
		'<div class="kit-log-view">', //
		'</div>'].join("")
	}
	$kit.mergeIf(config, defaultConfig);
}
$kit.Log.prototype = {
	log : function() {

	},
	init : function() {
		//var div=
	}
}