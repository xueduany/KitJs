/**
 * 鼠标选取热区
 * @class $Kit.Selection
 * @requires kit.js
 * @requires array.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/selection.js">Source code</a>
 */
$Kit.Selection = function() {
	this.markBlockCls = 'kitjs-highlightBlock-mark';
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
			if(selection.rangeCount > 0) {
				return selection.getRangeAt(0);
			}
			return null;
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
		if('text' in range) {
			return range.text;
		}
		return range.toString();
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
		range = range || this.getRange();
		if(range.startContainer) {
			return range.startContainer;
		} else {
			var re = this._determineRangeNode(range, true);
			range.startContainer = re;
			return re;
		}
	},
	_determineRangeNode : function(range, isStart) {
		var range1 = range.duplicate();
		range1.collapse(isStart);
		var parent = range1.parentElement();
		var nodes = parent.childNodes;
		var re;
		var range2 = document.body.createTextRange();
		range2.moveToElementText(parent);
		range2.collapse(true);
		for(var i = 0; i < nodes.length; i++) {
			var o = nodes[i];
			if(o.nodeType == 1) {
				range2.moveToElementText(o);
				if(range1.compareEndPoints('StartToStart', range2) >= 0 && range1.compareEndPoints('EndToEnd', range2) <= 0) {
					re = o;
					break;
				}
			} else {
				range2.moveToElementText(parent);
				var startOffset = 0;
				var previousSibling = o;
				while(previousSibling.previousSibling) {
					previousSibling = previousSibling.previousSibling;
					if(previousSibling.nodeType == 1) {
						range2.moveToElementText(previousSibling);
						range2.collapse(false);
						break;
					} else {
						startOffset += previousSibling.nodeValue.length;
					}
				}
				range2.moveStart('character', startOffset);
				range2.collapse(true);
				range2.moveEnd('character', o.nodeValue.length);
				if(range1.compareEndPoints('StartToStart', range2) >= 0 && range1.compareEndPoints('EndToEnd', range2) <= 0) {
					re = o;
					break;
				}
			}
			if(re == null) {
				range2.moveToElementText(parent);
				if(range1.compareEndPoints('EndToEnd', range2) == 0) {
					re = parent;
				}
			}
		}
		range1 = null;
		range2 = null;
		return re;
	},
	/**
	 * 获取range初始容器的偏移量
	 * @param {Range}
	 * @param {Node}
	 * @return {Number}
	 */
	getStartOffset : function(range, node) {
		if('startOffset' in range) {
			return range.startOffset;
		} else {
			var re = this._determineRangeOffset(range, node, true);
			return re;
		}
	},
	/**
	 * 获取range的结束元素
	 * @param {Range}
	 * @return {Node}
	 */
	getEndContainer : function(range) {
		range = range || this.getRange();
		if(range.endContainer) {
			return range.endContainer;
		} else {
			var re = this._determineRangeNode(range, false);
			range.endContainer = re;
			return re;
		}
	},
	_determineRangeOffset : function(range, node, isStart) {
		var range1 = range.duplicate();
		range1.collapse(isStart);
		var re = -1;
		var range2;
		if(node == null) {
			if(isStart) {
				node = this.getStartContainer(range);
			} else {
				node = this.getEndContainer(range);
			}
		}
		if(node.previousSibling) {
			range2 = document.body.createTextRange();
			if(node.nodeType == 1) {
				range2.moveToElementText(node);
				while(range2.compareEndPoints('StartToStart', range1) <= 0) {
					re++;
					if(range1.moveStart('character', -1) == 0) {
						break;
					}
				}
			} else {
				var previousSibling = node;
				var startOffset = 0;
				while(previousSibling.previousSibling) {
					previousSibling = previousSibling.previousSibling;
					if(previousSibling.nodeType == 1) {
						range2.moveToElementText(previousSibling);
						while(range2.compareEndPoints('EndToStart', range1) <= 0) {
							re++;
							if(range1.moveStart('character', -1) == 0) {
								break;
							}
						}
						re -= startOffset;
						break;
					} else {
						startOffset += previousSibling.nodeValue.length;
					}
				}
				if(re == -1 && startOffset > 0) {
					range2.moveToElementText(range1.parentElement());
					range2.moveStart('character', startOffset);
					var index = 0;
					re++;
					while(range1.compareEndPoints('StartToStart', range2) != 0 && index < node.nodeValue.length) {
						range2.moveStart('character', 1);
						index++;
						re++;
					}
				}
				/*
				 if(node.previousSibling.nodeType == 1) {
				 range2.moveToElementText(node.previousSibling);
				 while(range2.compareEndPoints('EndToStart', range1) < 0) {
				 re++;
				 if(range1.moveStart('character', -1) == 0) {
				 break;
				 }
				 }
				 }
				 */
			}
		} else {
			range2 = range1.duplicate();
			while(range2.parentElement() == range1.parentElement()) {
				re++;
				if(range2.moveStart('character', -1) == 0) {
					break;
				}
			}
		}
		range1 = null;
		range2 = null;
		return re;
	},
	/**
	 * 获取range结束容器的偏移量
	 * @param {Range}
	 * @param {Node}
	 * @return {Number}
	 */
	getEndOffset : function(range, node) {
		if('endOffset' in range) {
			return range.endOffset;
		} else {
			var re = this._determineRangeOffset(range, node, false);
			return re;
		}
	},
	/**
	 * 生成range对象的xpath
	 * @param {Range}
	 * @return {String}
	 */
	getXpath : function(range) {
		var re = {
			startContainerXpath : this.hpath(this.getStartContainer(range)),
			startOffset : this.getStartOffset(range),
			endContainerXpath : this.hpath(this.getEndContainer(range)),
			endOffset : this.getEndOffset(range)
		}
		re.full = re.startContainerXpath + '|' + re.startOffset + '|' + re.endContainerXpath + '|' + re.endOffset;
		return re;
	},
	hpath : function(node, currentPath) {
		currentPath = currentPath || '';
		if(node == document.body) {
			return '//BODY/' + currentPath;
		} else if(node['getAttribute'] && node.getAttribute('id') != null) {
			var a = document.getElementsByTagName(node.nodeValue);
			var count = 0;
			var id = node.getAttribute('id');
			for(var i = 0; i < a.length; i++) {
				if(a[i].getAttribute('id') == id) {
					count++;
				}
				if(count > 1) {
					break;
				}
			}
			if(count == 1) {
				return '//' + node.nodeName + '[@id="' + node.id + '"]/' + currentPath;
			}
		}
		switch (node.nodeType) {
			case 3:
			case 4:
				if(/MSIE/.test(navigator.userAgent)) {
					return this.hpath(node.parentNode, 'text()[' + (//
						$kit.array.indexOf($kit.array.filter(node.parentNode.childNodes, //
						function(p) {
							if(p.nodeType && (p.nodeType == 4 || p.nodeType == 3)) {
								return true;
							}
						}//
						), node//
						) + 1) + ']');
				} else {
					return this.hpath(node.parentNode, 'text()[' + (document.evaluate('preceding-sibling::text()', node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']');
				}
			case 1:
				if(/MSIE/.test(navigator.userAgent)) {
					return this.hpath(node.parentNode, node.nodeName + '[' + (//
						$kit.array.indexOf($kit.array.filter(node.parentNode.childNodes, //
						function(p) {
							if(p.nodeType && p.nodeType == 1 && p.nodeName && p.nodeName == node.nodeName) {
								return true;
							}
						}//
						), node//
						) + 1) + ']' + ( currentPath ? '/' + currentPath : ''));
				} else {
					return this.hpath(node.parentNode, node.nodeName + '[' + (document.evaluate('preceding-sibling::' + node.nodeName, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + ( currentPath ? '/' + currentPath : ''));
				}
			case 9:
				return '/' + currentPath;
			default:
				return '';
		}
	},
	/**
	 * 通过xpath选择节点
	 * @param {String}
	 * @return {Node}
	 */
	selectNodeByXpath : function(xpath) {
		if(document.evaluate) {
			return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		} else {
			var deep = xpath.split(/\/{1,2}/g);
			deep = $kit.array.delEmpty(deep);
			var root;
			for(var i = 0; i < deep.length; i++) {
				if(/\w+\[\d+\]/.test(deep[i])) {
					var a = deep[i].match(/(\w+)\[(\d+)\]/);
					if(root == null) {
						root = document.getElementsByTagName(a[1])[a[2] - 1];
					} else {
						var nodes = [];
						var tmp = root.childNodes;
						for(var j = 0; j < tmp.length; j++) {
							if(tmp[j].nodeName == a[1]) {
								nodes.push(tmp[j]);
							}
							if(nodes.length >= a[2]) {
								break;
							}
						}
						root = nodes[a[2] - 1];
					}

				} else if(/(\w+)\[@(\w+)=['"]?(\w+)['"]?\]/.test(deep[i])) {
					var a = deep[i].match(/(\w+)\[@(\w+)="?(\w+)"?\]/);
					if(a[2].toLowerCase() == 'id') {
						root = document.getElementById(a[3]);
					} else {
						var b = (root || document).getElementsByTagName(a[1]);
						for(var j = 0; j < b.length; j++) {
							if(b[j].getAttribute(a[2]) == a[3]) {
								root = b[j];
							}
						}
					}
				} else if(/text\(\)\[(\d+)\]/.test(deep[i])) {
					var a = deep[i].match(/text\(\)\[(\d+)\]/);
					var textNodes = [];
					for(var j = 0; j < root.childNodes.length; j++) {
						var tmp = root.childNodes[j];
						if(tmp.nodeType == 3 || tmp.nodeType == 4) {
							textNodes.push(tmp);
						}
						if(textNodes.length >= a[1]) {
							break;
						}
					}
					return textNodes[a[1] - 1];
				} else if(deep[i].toLowerCase() == 'body') {
					root = document.body;
				}
			}
			return root;
		}
	},
	/**
	 * 指定选区高亮，全浏览器兼容
	 * @param {Map|String} config config为一个map对象，也可以接受"startContainerXpath|startOffset|endContainerXpath|endOffset"的字符串格式
	 * @param {String} config.startContainerXpath
	 * @param {String} config.startOffset
	 * @param {String} config.endContainerXpath
	 * @param {String} config.endOffset
	 * @param {String} color
	 */
	highlight : function(config, color) {
		var reText = '';
		if($kit.isStr(config)) {
			var a = config.split('|');
			config = {
				startContainerXpath : a[0],
				startOffset : a[1],
				endContainerXpath : a[2],
				endOffset : a[3]
			}
			if(a.length > 4) {
				color = a[4];
			}
		}
		color = color || 'orange';
		if(document.evaluate) {
			document.designMode = 'on';
			var selection = window.getSelection();
			selection.removeAllRanges();
			var range = document.createRange();
			range.setStart(this.selectNodeByXpath(config.startContainerXpath), config.startOffset);
			range.setEnd(this.selectNodeByXpath(config.endContainerXpath), config.endOffset);
			selection.addRange(range);
			reText = selection.toString();
			//
			this.highlightDomInsertEventRegisteFlag = this.highlightDomInsertEventRegisteFlag || false;
			if(!this.highlightDomInsertEventRegisteFlag) {
				this.highlightDomInsertEventRegisteFlag = true;
				this.highlightColor = color;
				var self = this;
				document.addEventListener('DOMNodeInserted', this._DOMNodeInserted, false);
			}

			//
			if(!document.execCommand("HiliteColor", false, color)) {
				document.execCommand('backcolor', false, color);
			}
			document.designMode = 'off';
			//
			if(this.highlightDomInsertEventRegisteFlag) {
				document.removeEventListener('DOMNodeInserted', this._DOMNodeInserted, false);
				this.highlightDomInsertEventRegisteFlag = false;
				this.highlightColor = null;
			}
			//fix 一个奇怪的bug，有时遇到*元素会不触发attrchange事件
			var father = range.commonAncestorContainer;
			if(father.nodeType == 1) {
				var a = father.getElementsByTagName('*');
				var o;
				for(var i = 0; i < a.length; i++) {
					o = a[i];
					if(o.nodeType == 1 && o.getAttribute('style') && o.getAttribute('style').indexOf('background-color: ' + color + ';') > -1 && !$kit.hsCls(o, this.markBlockCls)) {
						$kit.adCls(o, this.markBlockCls);
					}
				}
				o = father;
				if(o.nodeType == 1 && o.getAttribute('style') && o.getAttribute('style').indexOf('background-color: ' + color + ';') > -1 && !$kit.hsCls(o, this.markBlockCls)) {
					$kit.adCls(o, this.markBlockCls);
				}
			}
			//
			range.detach();
			selection.removeAllRanges();
		} else {
			var beginEl = this.selectNodeByXpath(config.startContainerXpath);
			var beginRange = document.body.createTextRange();
			if(beginEl.nodeType == 1) {
				beginRange.moveToElementText(beginEl);
			} else {
				var offset1 = 0;
				var prevEl = beginEl;
				var isBegin = true;
				while(prevEl.previousSibling) {
					prevEl = prevEl.previousSibling;
					if(prevEl.nodeType == 1) {
						beginRange.moveToElementText(prevEl);
						beginRange.collapse(false);
						beginRange.moveStart('character', offset1);
						isBegin = false;
						break;
					} else {
						offset1 += prevEl.nodeValue.length;
					}
				}
				if(isBegin) {
					beginRange.moveToElementText(beginEl.parentNode);
					beginRange.moveStart('character', offset1);
				}

				/*
				 if(beginEl.previousSibling && beginEl.previousSibling.nodeType == 1) {
				 beginRange.moveToElementText(beginEl.previousSibling);
				 beginRange.collapse(false);
				 beginRange.moveStart('character', 1);
				 } else if(beginEl.nextSibling && beginEl.nextSibling.nodeType == 1) {
				 beginRange.moveToElementText(beginEl.nextSibling);
				 beginRange.collapse(true);
				 beginRange.moveStart('character', -beginEl.nodeValue.length);
				 } else if(beginEl.parentNode.childNodes.length == 1) {
				 beginRange.moveToElementText(beginEl.parentNode);
				 }
				 */
			}
			beginRange.moveStart('character', config.startOffset);
			beginRange.collapse(true);
			var endEl = this.selectNodeByXpath(config.endContainerXpath);
			if(endEl != beginEl) {
				var endRange = document.body.createTextRange();
				//
				if(endEl.nodeType == 1) {
					endRange.moveToElementText(endEl);
				} else {
					var offset1 = 0;
					var nextEl = endEl;
					var isBegin = true;
					while(nextEl.previousSibling) {
						nextEl = nextEl.previousSibling;
						if(nextEl.nodeType == 1) {
							endRange.moveToElementText(nextEl);
							endRange.collapse(false);
							endRange.moveStart('character', offset1);
							isBegin = false;
							break;
						} else {
							offset1 += nextEl.nodeValue.length;
						}
					}
					if(isBegin) {
						endRange.moveToElementText(endEl.parentNode);
						endRange.moveStart('character', offset1);
					}
					/*
					 if(endEl.previousSibling && endEl.previousSibling.nodeType == 1) {
					 endRange.moveToElementText(endEl.previousSibling);
					 endRange.collapse(false);
					 endRange.moveStart('character', 1);
					 } else if(endEl.nextSibling && endEl.nextSibling.nodeType == 1) {
					 endRange.moveToElementText(endEl.nextSibling);
					 endRange.collapse(true);
					 endRange.moveStart('character', -endEl.nodeValue.length);
					 } else if(endEl.parentNode.childNodes.length == 1) {
					 endRange.moveToElementText(endEl.parentNode);
					 }
					 */
				}
				//
				endRange.moveStart('character', config.endOffset);
				endRange.collapse(true);
				beginRange.setEndPoint('StartToEnd', endRange);
			} else {
				beginRange.moveEnd('character', config.endOffset - config.startOffset);
			}
			beginRange.execCommand('BackColor', false, color);
			reText = beginRange.text;
			beginRange = null;
			endRange = null;
			document.selection.empty();
		}
		return reText;
	},
	/**
	 * 根据ie的bookmark字符串获取range对象
	 * @param {String} bookmark
	 * @return {Range}
	 */
	rangeFromIEBookmark : function(bookmark) {
		return document.body.createTextRange().moveToBookmark(bookmark);
	},
	/**
	 * 清除选区高亮，全浏览器兼容
	 * @param {Map|String} config config为一个map对象，也可以接受"startContainerXpath|startOffset|endContainerXpath|endOffset"的字符串格式
	 * @param {String} config.startContainerXpath
	 * @param {String} config.startOffset
	 * @param {String} config.endContainerXpath
	 * @param {String} config.endOffset
	 * @param {String} color
	 */
	removeHighlight : function() {
		var range;
		if(document.createRange) {
			range = document.createRange();
			range.selectNode(document.body);
			var s = window.getSelection();
			s.removeAllRanges();
			s.addRange(range);
			var a = document.getElementsByClassName(this.markBlockCls);
			var a1 = [];
			for(var i = 0; i < a.length; i++) {
				a1.push(a[i]);
			}
			for(var i = 0; i < a1.length; i++) {
				if(range.compareNode) {
					if(range.compareNode(a1[i]) == 3) {
						//inside
						var o = a1[i];
						var childs = [];
						for(var j = 0; j < o.childNodes.length; j++) {
							childs.push(o.childNodes[j]);
						}
						for(var j = childs.length - 1; j > 0; j--) {
							$kit.insertNode(o, 'afterEnd', childs[j]);
						}
						o.parentNode.replaceChild(childs[0], o);

					}
				} else {
					var range1 = document.createRange();
					range1.selectNode(a1[i]);
					if(range.compareBoundaryPoints(range.START_TO_START, range1) <= 0 && range.compareBoundaryPoints(range.END_TO_END, range1) >= 0) {
						//inside
						var o = a1[i];
						var childs = [];
						for(var j = 0; j < o.childNodes.length; j++) {
							childs.push(o.childNodes[j]);
						}
						for(var j = childs.length - 1; j > 0; j--) {
							$kit.insertNode(o, 'afterEnd', childs[j]);
						}
						o.parentNode.replaceChild(childs[0], o);

					}
					range1.detach();
				}
			}
			s.removeAllRanges();
			range.detach();
		} else {
			range = document.body.createTextRange();
			range.execCommand('removeFormat', false);
		}
	},
	_DOMNodeInserted : function() {
		var e = arguments[0];
		if($kit.selection.highlightDomInsertEventRegisteFlag) {
			var target = e.target;
			if(target.nodeType == 1 && target.nodeName.toLowerCase() == 'span' && (target.getAttribute('style') && target.getAttribute('style').indexOf('background-color: ' + $kit.selection.highlightColor + ';') > -1)) {
				target.className = $kit.selection.markBlockCls;
			}
		}
	}
});
/**
 * $Kit.Selection的实例，直接通过这个实例访问$Kit.Selection所有方法
 * @global
 * @type $Kit.Selection
 */
$kit.selection = new $Kit.Selection();
