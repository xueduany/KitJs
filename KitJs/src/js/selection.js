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
	 * 获取range的开始元素
	 * @param {Range}
	 * @return {Node}
	 */
	getStartContainer : function(range) {
		if(range.startContainer) {
			return range.startContainer;
		} else {
			var range1 = range.duplicate();
			range1.collapse(true);
			var parentNodeList = range1.parentElement().childNodes;
			var re;
			var range2 = document.body.createTextRange();
			for(var i = 0; i < parentNodeList.length; i++) {
				var o = parentNodeList[i];
				if(o.nodeType == 1) {
					range2.moveToElementText(o);
					if(range1.compareEndPoints('StartToStart', range2) >= 0 && range1.compareEndPoints('EndToEnd', range2) <= 0) {
						re = o;
						break;
					} else if(range1.compareEndPoints('StartToStart', range2) < 0 && (o.previousSibling.nodeType == 3 || o.previousSibling.nodeType == 4)) {
						re = o.previousSibling;
						break;
					}
				}
				if(i == parentNodeList.length - 1) {
					re = o;
				}
			}
			range1 = null;
			range2 = null;
			range.startContainer = re;
			return re;
		}
	},
	/**
	 * 获取range初始容器的偏移量
	 * @param {Range}
	 * @param {Node}
	 * @return {Number}
	 */
	getStartOffset : function(range, node) {
		if(range.startOffset) {
			return range.startOffset;
		} else {
			var range1 = range.duplicate();
			range1.collapse(true);
			var re = -1;
			var range2;
			if(node == null) {
				node = this.getStartContainer(range);
			}
			if(node.previousSibling) {
				range2 = document.body.createTextRange();
				if(node.previousSibling.nodeType == 1) {
					range2.moveToElementText(node.previousSibling);
					while(range2.compareEndPoints('EndToStart', range1) < 0) {
						re++;
						if(range1.moveStart("character", -1) == 0) {
							break;
						}
					}
				} else {
					range2.moveToElementText(node);
					while(range2.compareEndPoints('StartToStart', range1) <= 0) {
						re++;
						if(range1.moveStart("character", -1) == 0) {
							break;
						}
					}
				}
			} else {
				range2 = range1.duplicate();
				while(range2.parentElement() == range1.parentElement()) {
					re++;
					if(range2.moveStart("character", -1) == 0) {
						break;
					}
				}
			}
			range1 = null;
			range2 = null;
			return re;
		}
	},
	/**
	 * 获取range的结束元素
	 * @param {Range}
	 * @return {Node}
	 */
	getEndContainer : function(range) {
		if(range.endContainer) {
			return range.endContainer;
		} else {
			var range1 = range.duplicate();
			range1.collapse(false);
			var parentNodeList = range1.parentElement().childNodes;
			var re;
			var range2 = document.body.createTextRange();
			for(var i = 0; i < parentNodeList.length; i++) {
				var o = parentNodeList[i];
				if(o.nodeType == 1) {
					range2.moveToElementText(o);
					if(range1.compareEndPoints('StartToStart', range2) >= 0 && range1.compareEndPoints('EndToEnd', range2) <= 0) {
						re = o;
						break;
					} else if(range1.compareEndPoints('EndToEnd', range2) < 0 && (o.previousSibling.nodeType == 3 || o.previousSibling.nodeType == 4)) {
						re = o.previousSibling;
						break;
					}
				}
				if(i == parentNodeList.length - 1) {
					re = o;
				}
			}
			range1 = null;
			range2 = null;
			range.endContainer = re;
			return re;
		}
	},
	/**
	 * 获取range结束容器的偏移量
	 * @param {Range}
	 * @param {Node}
	 * @return {Number}
	 */
	getEndOffset : function(range, node) {
		if(range.endOffset) {
			return range.endOffset;
		} else {
			var range1 = range.duplicate();
			range1.collapse(false);
			var re = -1;
			var range2;
			if(node == null) {
				node = this.getEndContainer(range);
			}
			if(node.previousSibling) {
				range2 = document.body.createTextRange();
				if(node.previousSibling.nodeType == 1) {
					range2.moveToElementText(node.previousSibling);
					while(range2.compareEndPoints('EndToStart', range1) < 0) {
						re++;
						if(range1.moveStart("character", -1) == 0) {
							break;
						}
					}
				} else {
					range2.moveToElementText(node);
					while(range2.compareEndPoints('StartToStart', range1) <= 0) {
						re++;
						if(range1.moveStart("character", -1) == 0) {
							break;
						}
					}
				}
			} else {
				range2 = range1.duplicate();
				while(range2.parentElement() == range1.parentElement()) {
					re++;
					if(range2.moveStart("character", -1) == 0) {
						break;
					}
				}
			}
			range1 = null;
			range2 = null;
			return re;
		}
	}
});
/**
 * $Kit.Selection的实例，直接通过这个实例访问$Kit.Selection所有方法
 * @global
 * @type $Kit.Selection
 */
$kit.selection = new $Kit.Selection();
