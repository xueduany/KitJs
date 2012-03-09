/**
 * 选取
 */
$Kit.Selection = function() {
	//
}
$Kit.Selection.prototype = {
	/**
	 * 取输入框的游标位置
	 */
	getCaretPos : function(el) {
		if(el.selectionStart) {
			return el.selectionStart;
		} else if(document.selection) {
			el.focus();
			var r = document.selection.createRange();
			if(r == null) {
				return 0;
			}
			var re = el.createTextRange(), rc = re.duplicate();
			re.moveToBookmark(r.getBookmark());
			rc.setEndPoint('EndToStart', re);
			return rc.text.length;
		}
		return 0;
	}
};
$kit.selection = new $Kit.Selection();
