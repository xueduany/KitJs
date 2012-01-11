/**
 * 文本扩展
 */
$Kit.String = function() {
	//
}
$Kit.String.prototype = {
	breakSentence : function(str) {
		return str.replace(/([,\.\?!;:][\s"'’”)])(\n?)/g, "$1\n");
	}
};
$kit.str = $kit.string = new $Kit.String();