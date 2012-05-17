function restoreHighLight(selectionDetailsList) {
	if(selectionDetailsList != null) {
		selectionDetailsList = selectionDetailsList.split('$');
		var i = 0;
		document.designMode = 'on';
		for( i = 0; i < selectionDetailsList.length; i++) {
			var selectionDetails = selectionDetailsList[i].split('|');
			if(/MSIE/.test(navigator.userAgent)) {
				alert(selectionDetails[0]);
				ie_selectNodeByXpath(selectionDetails[0]);
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
	}
}

function hpath(node, currentPath) {
	currentPath = currentPath || '';
	if(node.className == 'explain_wrap')
		return '//DIV[@id=\"' + node.id + '\"]/' + currentPath;
	switch (node.nodeType) {
		case 3:
		case 4:
			return hpath(node.parentNode, 'text()[' + (document.evaluate('preceding-sibling::text()', node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']');
		case 1:
			return hpath(node.parentNode, node.nodeName + '[' + (document.evaluate('preceding-sibling::' + node.nodeName, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength + 1) + ']' + ( currentPath ? '/' + currentPath : ''));
		case 9:
			return '/' + currentPath;
		default:
			return '';
	}
}

function ie_selectNodeByXpath(path) {
	var deep = path.split(/\/{1,2}/g);
	for(var i = 0; i < deep.length; i++) {
		alert(deep[i]);
	}
}