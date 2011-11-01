$kit.ui.Form.TextArea = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.TextArea,
		father : $kit.ui.Form
	});
	var me = this;
	var defaultConfig = {
		minRows : 1,
		textIsEmptyFn : undefined,
		textNotEmptyFn : undefined
	}
	me.config = $kit.join(defaultConfig, config);
	var me = this;
	me.init();
}
$kit.merge($kit.ui.Form.TextArea.prototype, {
	init : function() {
		var me = this;
		me.autoFixHeight();
	},
	autoFixHeight : function() {
		var me = this;
		$kit.ev({
			el : me.config.el,
			ev : "input",
			fn : function() {
				var textarea = me.config.el;
				var fontSize = parseInt($kit.css(textarea, "fontSize"));
				var width = parseInt($kit.css(textarea, "width"));
				var height = parseInt($kit.css(textarea, "height"));
				var text = textarea.value;
				var rows = 0;
				var newLine = text.match(/\n/g);
				var rowsNewLine = newLine != null && newLine.length ? newLine.length : 0;
				text = text.substring(text.lastIndexOf("\n"));
				var DBCcase = text.match(/[\u0000-\u00FF]/g);
				if(DBCcase != null && DBCcase.length) {
					rows = Math.ceil((DBCcase.length / 2 * fontSize + (text.length - DBCcase.length) * fontSize) / width) + rowsNewLine;
				} else {
					rows = Math.ceil(text.length * fontSize / width) + rowsNewLine;
				}
				text = text.substring(text.lastIndexOf("\n"));
				if(me.config.minRows) {
					if(rows < me.config.minRows) {
						rows = me.config.minRows;
					}
				}
				textarea.rows = rows == 0 ? 1 : rows;
				while(textarea.clientHeight < textarea.scrollHeight && textarea.value.length > 0) {
					textarea.rows += 1;
				}
				if($kit.isEmpty($kit.trim(textarea.value)) && !$kit.isEmpty(me.config.textIsEmptyFn)) {
					alert(2);
					me.config.textIsEmptyFn.apply(me, [me]);
				} else if(!$kit.isEmpty($kit.trim(textarea.value)) && !$kit.isEmpty(me.config.textNotEmptyFn)) {
					me.config.textNotEmptyFn.apply(me, [me]);
				}
			}
		});
	}
});
