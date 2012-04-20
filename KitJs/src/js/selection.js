/**
 * 选取
 */
$Kit.Selection = function() {
	//
}
$kit.merge($Kit.Selection.prototype, {
	getSelection : function() {
		if(window.getSelection) {
			return window.getSelection();
		} else if(document.getSelection) {
			return document.getSelection();
		}
		return document.selection;
	},
	getRange : function() {
		var selection = this.getSelection();
		if(selection.getRangeAt) {
			return selection.getRangeAt(0);
		}
		return selection.createRange();
	},
	/**
	 * 获得相对于viewport的offset
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
	 */
	getContainer : function() {
		var range = this.getRange();
		if(range == null) {
			return;
		}
		return range.commonAncestorContainer || range.parentElement();
	},
	getText : function() {
		var range = this.getRange();
		if(range == null) {
			return;
		}
		return range.text || range.toString();
	},
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
	 */
	getBegin : function() {
		if(window.getSelection) {
			return this.getRange().startContainer;
		}
	}
});
$kit.selection = new $Kit.Selection();
