/**
 * 文本扩展
 */
$Kit.String = function() {
	//
}
$Kit.String.prototype = {
	/**
	 * 断句
	 */
	breakSentence : function(str) {
		return str.replace(/([,\.\?!;:][\s"'’”)])(\n?)/g, '$1\n');
	},
	HTMLEncode : function(str) {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\'/g, '&#39;').replace(/\"/g, '&quot;');
	},
	HTMLDecode : function(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;'/g, '\'').replace(/&quot/g, '"');
	}
};
$kit.str = $kit.string = new $Kit.String();
