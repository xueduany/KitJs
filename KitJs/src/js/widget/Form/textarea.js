/**
 * kitjs form textarea，包含自适应高度
 * @class $kit.ui.Form.TextArea
 * @extends $kit.ui.Form
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Form/textarea.js">Source code</a>
 */
$kit.ui.Form.TextArea = function(config) {
	$kit.inherit({
		child : $kit.ui.Form.TextArea,
		father : $kit.ui.Form
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Form.TextArea,
/**
 * @lends $kit.ui.Form.TextArea
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		el : undefined,
		/**
		 * 最小行数
		 */
		minRows : 1,
		autoFixHeight : true,
		textIsEmptyFn : undefined,
		textNotEmptyFn : undefined,
		blurFn : undefined,
		focusFn : undefined,
		kitWidgetName : "kitFormTextArea",
		textAreaCls : 'kitjs-form-textarea'
	}
});
$kit.merge($kit.ui.Form.TextArea.prototype,
/**
 * @lends $kit.ui.Form.TextArea.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		me.config.el[me.config.kitWidgetName] = me;
		if(me.config.autoFixHeight) {
			me.autoFixHeight();
			me.config.el.style["overflow-y"] = "hidden";
		}
		$kit.ev({
			el : me.config.el,
			ev : "blur",
			fn : me.config.blurFn
		});
		$kit.ev({
			el : me.config.el,
			ev : "focus",
			fn : me.config.focusFn
		});
		//
		me.fixHeight();
		//
	},
	/**
	 * 注册自适应高度事件
	 */
	autoFixHeight : function() {
		var me = this;
		$kit.ev({
			el : me.config.el,
			ev : "input",
			fn : function() {
				me.fixHeight();
			},
			scope : me
		});
		if($kit.isIE()) {
			$kit.ev({
				el : me.config.el,
				ev : "propertychange",
				fn : function(e) {
					if(e.propertyName == 'value') {
						me.fixHeight();
					}
				},
				scope : me
			});
		}
	},
	/**
	 * 自适应高度调整
	 */
	fixHeight : function() {
		var me = this;
		var textarea = me.config.el;
		/*
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
		 */
		textarea.style.height = $kit.css(textarea, "font-size") + 'px';
		textarea.style.height = textarea.scrollHeight + 'px';
		$kit.attr(textarea, 'rows', null);
		if($kit.isEmpty(textarea.value.trim()) && !$kit.isEmpty(me.config.textIsEmptyFn)) {
			me.config.textIsEmptyFn.apply(me, [me]);
		} else if(!$kit.isEmpty(textarea.value.trim()) && !$kit.isEmpty(me.config.textNotEmptyFn)) {
			me.config.textNotEmptyFn.apply(me, [me]);
		}
	},
	/**
	 * 设值
	 */
	setValue : function(str) {
		var me = this;
		me.config.el.value = str;
		if(me.config.autoFixHeight) {
			me.fixHeight();
		}
	}
});
