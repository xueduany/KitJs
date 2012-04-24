/**
 * 鼠标选取热区
 * @class $Kit.Selection
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/selection.js">Source code</a>
 */
$Kit.Selection = function() {
	//
}
$kit.merge($Kit.Selection.prototype,
/**
 * @lends $Kit.Selection.prototype
 */
{
	/**
	 * 获得selection
	 * @return {Selection}
	 */
	getSelection : function() {
		if(window.getSelection) {
			return window.getSelection();
		} else if(document.getSelection) {
			return document.getSelection();
		}
		return document.selection;
	},
	/**
	 * 获得selection的textRange
	 * @return {TextRange}
	 */
	getRange : function() {
		var selection = this.getSelection();
		if(selection.getRangeAt) {
			return selection.getRangeAt(0);
		}
		return selection.createRange();
	},
	/**
	 * 获得相对于viewport的offset
	 * @return {Object}
	 */
	getRect : function() {
		var range = this.getRange();
		if(range == null) {
			return;
		}
		var offset = range.getBoundingClientRect();
		var re = {
			top : offset.boundingTop || offset.top,
			left : offset.boundingLeft || offset.left,
			width : range.boundingWidth || offset.width,
			height : range.boundingHeight || offset.height,
			bottom : offset.bottom,
			right : offset.right
		}
		return re;
	},
	/**
	 * 取输入框的游标位置
	 * @return {Number}
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
	},
	/**
	 * 获取包含选中内容的node
	 * @return {Element}
	 */
	getContainer : function() {
		var range = this.getRange();
		if(range == null) {
			return;
		}
		return range.commonAncestorContainer || range.parentElement();
	},
	/**
	 * 获得选取文本
	 * @return {String}
	 */
	getText : function() {
		var range = this.getRange();
		if(range == null) {
			return;
		}
		return range.text || range.toString();
	},
	/**
	 * 获得选取HTML
	 * @return {String}
	 */
	getHTML : function() {
		var range = this.getRange();
		if(range == null) {
			return;
		}
		if(window.getSelection) {
			var docFragment = range.cloneContents();
			var tmpDiv = document.createElement('div');
			tmpDiv.appendChild(docFragment);
			return tmpDiv.innerHTML;
		}
		return range.htmlText
	},
	/**
	 * 未完成
	 * @inner
	 */
	getBegin : function() {
		if(window.getSelection) {
			return this.getRange().startContainer;
		}
	}
});
/**
 * $Kit.Selection的实例，直接通过这个实例访问$Kit.Selection所有方法
 * @global
 * @type $Kit.Selection
 */
$kit.selection = new $Kit.Selection();
