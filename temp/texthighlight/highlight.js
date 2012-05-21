function restoreHighLight(selectionDetailsList) {
	if(selectionDetailsList != null) {
		selectionDetailsList = selectionDetailsList.split('$');
		var i = 0;
		document.designMode = 'on';
		for( i = 0; i < selectionDetailsList.length; i++) {
			var selectionDetails = selectionDetailsList[i].split('|');
			if(/MSIE/.test(navigator.userAgent)) {
				var beginEl = ie_selectNodeByXpath(selectionDetails[0]);
				var beginRange = document.body.createTextRange();
				beginRange.moveToElementText(beginEl);
				beginRange.moveStart("character", selectionDetails[1]);
				beginRange.collapse(true);
				//beginRange.moveEnd("character", 1);
				//
				var endEl = ie_selectNodeByXpath(selectionDetails[2]);
				if(endEl != beginEl) {
					var endRange = document.body.createTextRange();
					endRange.moveElementText(endEl);
					endRange.moveStart("character", selectionDetails[3]);
					endRange.collapse(true);
					beginRange.setEndPoint("StartToEnd", endRange);
				} else {
					beginRange.moveEnd("character", selectionDetails[3] - selectionDetails[1]);
				}
				beginRange.execCommand('BackColor', false, selectionDetails[4]);
			} else {
				if( typeof window.getSelection != 'undefined' && selectionDetails.length > 3) {
					var selection = window.getSelection();
					selection.removeAllRanges();
					try {
						var range = document.createRange();
						range.setStart(document.evaluate(selectionDetails[0], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails[1]));
						range.setEnd(document.evaluate(selectionDetails[2], document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue, Number(selectionDetails[3]));
						selection.addRange(range);
						document.execCommand('backcolor', false, selectionDetails[4]);
						selection.removeAllRanges();
					} catch(e) {;
					}
				}
			}
		}
	}
	document.designMode = 'off';
}

function getXpathStringFromBookMark(bookmark) {
	var range = document.body.createTextRange();
	range.moveToBookmark(bookmark);
	if(range.text.length) {
		var startEl = ie_getStartRangeEl();
		var endEl = ie_getEndRangeEl();
		var selTxt = hpath(startEl) + '|' + (ie_getStartPos(startEl) + 1) + '|' + hpath(endEl) + '|' + (ie_getEndPos(endEl) + 1) + '|' + color;
		// document.designMode = 'on';
		// document.execCommand('backcolor', false, color);
		// document.designMode = 'off';
		//selection.removeAllRanges();
		return selTxt;
	}
}

function highLightSelection(color) {
	if( typeof window.getSelection != 'undefined') {
		var selection = window.getSelection();
		var range = selection.getRangeAt(0);
		if(range != null) {
			var selTxt = hpath(range.startContainer) + '|' + range.startOffset + '|' + hpath(range.endContainer) + '|' + range.endOffset + '|' + color;
			document.designMode = 'on';
			document.execCommand('backcolor', false, color);
			document.designMode = 'off';
			selection.removeAllRanges();
			return selTxt;
		}
	} else {
		var selection = document.selection;
		var range = selection.createRange();
		if(range.text.length) {
			var startEl = ie_getStartRangeEl();
			var endEl = ie_getEndRangeEl();
			var selTxt = hpath(startEl) + '|' + (ie_getStartPos(startEl) + 1) + '|' + hpath(endEl) + '|' + (ie_getEndPos(endEl) + 1) + '|' + color;
			document.designMode = 'on';
			document.execCommand('backcolor', false, color);
			document.designMode = 'off';
			//selection.removeAllRanges();
			return selTxt;
		}
	}
}

function ie_getStartRangeEl() {
	var range = document.selection.createRange().duplicate();
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
}

function ie_getEndRangeEl() {
	var range = document.selection.createRange().duplicate();
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
}

function ie_getStartPos(node) {
	var range = document.selection.createRange().duplicate();
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

function ie_getEndPos(node) {
	var range = document.selection.createRange().duplicate();
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

function hpath(node, currentPath) {
	currentPath = currentPath || '';
	if(node.className == 'explain_wrap')
		return '//DIV[@id=\"' + node.id + '\"]/' + currentPath;
	switch (node.nodeType) {
		case 3:
		case 4:
			if(/MSIE/.test(navigator.userAgent)) {
				return hpath(node.parentNode, 'text()[' + (_indexOfNodeList(node, _filterNodeList(node.parentNode.childNodes, //
				function(p) {
					if(p.nodeType && (p.nodeType == 4 || p.nodeType == 3)) {
						return true;
					}
				}//
				)//
				) + 1) + ']');
			} else {
				return hpath(node.parentNode, 'text()[' + (document.evaluate('preceding-sibling::text()', node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']');
			}
		case 1:
			if(/MSIE/.test(navigator.userAgent)) {
				return hpath(node.parentNode, node.nodeName + '[' + (_indexOfNodeList(node, _filterNodeList(node.parentNode.childNodes, //
				function(p) {
					if(p.nodeType && p.nodeType == 1 && p.nodeName && p.nodeName == node.nodeName) {
						return true;
					}
				}//
				)//
				) + 1) + ']' + ( currentPath ? '/' + currentPath : ''));
			} else {
				return hpath(node.parentNode, node.nodeName + '[' + (document.evaluate('preceding-sibling::' + node.nodeName, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + ( currentPath ? '/' + currentPath : ''));
			}
		case 9:
			return '/' + currentPath;
		default:
			return '';
	}
}

function _indexOfNodeList(node, nodeList) {
	for(var i = 0; i < nodeList.length; i++) {
		if(node == nodeList[i]) {
			return i;
		}
	}
	return -1;
}

function _filterNodeList(nodeList, fn) {
	var a = [];
	for(var i = 0; i < nodeList.length; i++) {
		if(fn(nodeList[i], nodeList, i) == true) {
			a.push(nodeList[i]);
		}
	}
	return a;
}

function ie_selectNodeByXpath(path) {
	var deep = path.split(/\/{1,2}/g);
	var root;
	for(var i = 0; i < deep.length; i++) {
		if(/\w+\[\d+\]/.test(deep[i])) {
			var a = deep[i].match(/(\w+)\[(\d+)\]/);
			root = (root || document).getElementsByTagName(a[1])[a[2] - 1];
		} else if(/(\w+)\[@(\w+)="?(\w+)"?\]/.test(deep[i])) {
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
		}
	}
	return root;
}