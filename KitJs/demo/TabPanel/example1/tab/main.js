function popViewBtnClick() {
	window.location = 'cmd://nav/popView';
}

function navBackwardClick() {
	window.location = 'cmd://nav/hisBackward';
}

function navForwardClick() {
	window.location = 'cmd://nav/hisForward';
}


function getElementTop(elem) {
	yPos = elem.offsetTop;
	tempEl = elem.offsetParent;

	while(tempEl != null) {
		yPos += tempEl.offsetTop;
		tempEl = tempEl.offsetParent;
	}

	return yPos;
}

function getElementLeft(elem) {
	xPos = elem.offsetLeft;
	tempEl = elem.offsetParent;

	while(tempEl != null) {
		xPos += tempEl.offsetLeft;
		tempEl = tempEl.offsetParent;
	}
	return xPos;
}

function getStudyCatPos() {
	thisEl = document.getElementById('J_BtnCatePicker');
	ObjPos = '{{' + getElementLeft(thisEl) + ',' + getElementTop(thisEl) + '},{' + thisEl.offsetWidth + ',' + thisEl.offsetHeight + '}}';
	return ObjPos;
}

var gHighLightedElements;
var curHighlightId;
function highlight(rootnode, pattern) {
	//init
	removeHighlight();
	curHighlightId = -1;
	gHighLightedElements = new Array;

	//highlight
	var nodelist = new Array();
	var upattern = pattern.toUpperCase();
	nodelist.push(rootnode);
	while(nodelist.length > 0) {
		var pos;
		var node = nodelist.shift();
		if(node.nodeType == 3) {
			pos = node.data.toUpperCase().indexOf(upattern);
			if(pos >= 0) {
				var spannode = document.createElement('span');
				spannode.className = 'highlight';
				m = node.splitText(pos);
				e = m.splitText(upattern.length);
				mclone = m.cloneNode(true);
				spannode.appendChild(mclone);
				m.parentNode.replaceChild(spannode, m);
				gHighLightedElements.push(spannode);
				nodelist.unshift(e);
			};
		} else if(node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
			for(var i = node.childNodes.length - 1; i >= 0; i--) {
				nodelist.unshift(node.childNodes[i]);
			};
		}
	}
	return gHighLightedElements.length;
}

function removeHighlight() {
	var nodelist = document.getElementsByTagName('span');
	for(var i = nodelist.length - 1; i >= 0; i--) {
		var node = nodelist[i];
		if(node.className == 'highlight' || node.className == 'cur-highlight') {
			with(node.parentNode) {
				replaceChild(node.firstChild, node);
				normalize();
			}
		};
	};
}

function scrollToHighlight(step) {
	if(gHighLightedElements.length == 0)
		return;
	index = curHighlightId + step;

	if(index >= gHighLightedElements.length)
		index = 0;
	else if(index < 0)
		index = gHighLightedElements.length + index;

	var e = gHighLightedElements[index];
	e.scrollIntoView(true);
	setCurHighlight(e);
	if(curHighlightId != -1)
		gHighLightedElements[curHighlightId].className = "highlight";
	curHighlightId = index;
}

function setCurHighlight(e) {
	e.className = "cur-highlight";
}

function xreplace(checkMe, toberep, repwith) {
	var temp = checkMe;
	var i = temp.indexOf(toberep);
	while(i > -1) {
		temp = temp.replace(toberep, repwith);
		i = temp.indexOf(toberep, i + 1);
	}
	return temp;
}

function SetInnerHTML(elName, _html) {
	document.getElementById(elName).innerHTML = _html;
}

function SetOuterHTML(elName, _html) {
	document.getElementById(elName).outerHTML = _html;
}

var _eudic_node_count = 0;

function eu_click(word) {
	window.location.href = 'dic://' + word;
}

function eu_isAlpha(c) {
	if((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c == '\'') || (c > 200 && c < 300)) {
		return true;
	} else {
		switch (c) {
			case 'ù':
			case 'ç':
			case 'œ':
			case 'æ':
			case 'à':
			case 'â':
			case 'ï':
			case 'é':
			case 'è':
			case 'ê':
			case 'ë':
			case 'î':
			case 'ô':
			case 'ö':
			case 'ü':
			case 'û':
			case 'ä':
			case 'ß':
			case '\'':
			case '’':
			case 'ñ':
			case 'á':
			case'í':
			case'ú':
			case 'ó':
				return true;
			default:
				return false;
		}
	}
}

function eu_processNode(node) {
	var parentNode = node.parentNode;
	var str = node.nodeValue.toLowerCase();
	if(str && str.length > 0) {
		var headPos = 0;
		while(headPos < str.length) {
			var tailPos = headPos;
			while(tailPos < str.length && !eu_isAlpha(str.charAt(tailPos)))
			tailPos++;

			if(tailPos > headPos) {
				parentNode.insertBefore(document.createTextNode(str.substr(headPos, tailPos - headPos)), node);
				headPos = tailPos;
			}

			while(tailPos < str.length && eu_isAlpha(str.charAt(tailPos)))
			tailPos++;

			if(tailPos > headPos) {
				var word = node.nodeValue.substr(headPos, tailPos - headPos);
				var link = document.createElement("EUDIC");
				link.setAttribute('onclick', 'eu_click("' + word + '")');
				link.appendChild(document.createTextNode(word));
				parentNode.insertBefore(link, node);
				headPos = tailPos;
			}
		}

		parentNode.removeChild(node);
	}
}

function eu_unProcessNode() {

	var thisNode = document.getElementsByTagName("EUDIC")[0];
	while(thisNode != null) {
		thisNode.parentNode.insertBefore(document.createTextNode(thisNode.innerText), thisNode);
		document.body.removeChild(thisNode);
		thisNode = document.getElementsByTagName("EUDIC")[0];
	};

}

function eu_walk(node) {
	if(node.childNodes.length == 0) {
		if(node.nodeType == 3)
			eu_processNode(node);
	} else if(node.onclick) {
	} else {
		node = node.firstChild;
		while(node) {
			if(_eudic_node_count++ >= 1000)
				return;

			var nextSibling = node.nextSibling;
			if(node.nodeName != 'A' && node.nodeName != 'BUTTON')
				eu_walk(node);
			node = nextSibling;
		}
	}
}

//study flag
var levelChooseUtil = {
	hasCls : function(el, cls) {
		var flag = false;
		if(el != null && "className" in el) {
			var clss = el.className.split("\s+");
			for(var i = 0; i < clss.length; i++) {
				if(clss[i] == cls) {
					flag = true;
					break;
				}
			}
		}
		return flag;
	},
	offset : function(el) {
		var parent = el, top, left, width, height;
		top = parent.offsetTop;
		left = parent.offsetLeft;
		width = parent.offsetWidth;
		height = parent.offsetHeight;
		while(parent != parent.offsetParent && parent != document.body) {
			parent = parent.offsetParent;
			top += parent.offsetTop;
			left += parent.offsetLeft;
			width += parent.offsetWidth;
			height += parent.offsetHeight;
		}
		return {
			top : top,
			left : left,
			width : width,
			height : height
		}
	},
	bind : function(el, ev, fn, caller) {
		var caller = caller;
		el.addEventListener(ev, function(ev) {
			var el = ev.target;
			fn.call(caller, ev);
		}, false);
	},
	parentByCls : function(el, cls) {
		var parent = el, flag = false;
		do {
			if(this.hasCls(parent, cls)) {
				flag = true;
			}
			parent = parent.parentNode;
		} while(parent);
		if(flag == false) {
			parent = null;
		}
		return parent;
	}
};

var levelChoose = function(config) {
	var starWidth = 30;
	if("el" in config && config.el != null) {
		if( typeof config.el == "string") {
			config.el = document.getElementById(config.el);
			if(config.el == null) {
				config.el = document.getElementsByName(config.el);
				if(config.el != null && config.el.length) {
					config.el = config.el[0];
				} else {
					return;
				}
			}

		}
	} else {
		return;
	}

	var cfg = {
		level : 0,
		rank : [0, starWidth * 1, starWidth * 2, starWidth * 3, starWidth * 4, starWidth * 5],
		opacityOnMove : 0.3,
		scaleOnMove : 2,
		minLevel : 1
	}, self = this;
	for(var p in config) {
		cfg[p] = config[p];
	}
	this.config = config = cfg;
	this.backgroundStar = config.el;
	this.selectedStar = this.backgroundStar.children[0];
	//
	config.el.onselect = config.el.onselectstart = function() {
		return false;
	}
	levelChooseUtil.bind(config.el, "touchstart", self.touchDown, self);
	levelChooseUtil.bind(config.el, "touchmove", self.touchMove, self);
	levelChooseUtil.bind(config.el, "touchend", self.touchLeave, self);
	//
	// levelChooseUtil.bind(config.el, "mousedown", self.touchDown, self);
	// levelChooseUtil.bind(config.el, "mousemove", self.touchMove, self);
	// levelChooseUtil.bind(config.el, "mouseup", self.touchLeave, self);
	// levelChooseUtil.bind(config.el, "mouseout", self.mouseout, self);
	//levelChooseUtil.bind(this.backgroundStar, "mouseout", self.touchLeave, self);
	/*
	 * reset
	 */
	if(config.level != null) {
		this.initLevel(config.level);
	}
};
levelChoose.prototype = {
	touchDown : function(ev) {
		this.mouseDownFlag = true;
		this.mouseMoveFlag = false;
		var el, ev1;
		if("targetTouches" in ev) {
			ev1 = ev.targetTouches[0];
			el = document.elementFromPoint(ev1.clientX, ev1.clientY)
		} else {
			ev1 = ev;
			el = ev.target;
		}
		var offset = levelChooseUtil.offset(this.selectedStar);
		var move = this.move = ev1.pageX - offset.left;
		var self = this;
		this.timeoutMove = setTimeout(function() {
			var f1 = true;
			if(self.isStar(el)) {
				f1 = false;
			}
			for(var i = 0; i < self.selectedStar.children.length; i++) {
				var o = self.selectedStar.children[i];
				if(f1) {
					o.style.opacity = 0;
				} else {
					o.style.opacity = self.config.opacityOnMove;
				}
				if(o == el && f1 == false) {
					f1 = true;
				}
			}
		}, 100);
		ev.preventDefault();
	},
	touchMove : function(ev) {
		var el, ev1;
		if("targetTouches" in ev) {
			ev1 = ev.targetTouches[0];
			el = document.elementFromPoint(ev1.clientX, ev1.clientY)
		} else {
			ev1 = ev;
			el = ev.target;
		}
		if(this.mouseDownFlag == true) {
			this.mouseMoveFlag = true;
			var offset = levelChooseUtil.offset(this.selectedStar);
			var move = this.move = ev1.pageX - offset.left;
			if(this.isStar(el)) {
				var f1 = true;
				for(var i = 0; i < this.selectedStar.children.length; i++) {
					var o = this.selectedStar.children[i];
					if(f1) {
						o.style.opacity = this.config.opacityOnMove;
					} else {
						o.style.opacity = 0;
					}
					if(o == el) {
						o.style["-webkit-transform"] = "scale(" + this.config.scaleOnMove + ")";
						f1 = false;
					} else {
						o.style["-webkit-transform"] = "scale(1)";
					}
				}
			}
		}
		ev.preventDefault();
	},
	isStar : function(el) {
		if("className" in el && el.className.indexOf("level") == 0) {
			return true;
		}
		return false;
	},
	touchLeave : function(ev) {
		clearTimeout(this.timeoutMove);
		var rnk = this.config.rank;
		var el = ev.target;
		var move = this.move;
		for(var i = this.config.minLevel; i < rnk.length; i++) {
			if(this.move >= rnk[i - 1] && this.move < rnk[i]) {
				/*if(this.mouseMoveFlag == true) {
				 if(i > 0 && this.move < (rnk[i - 1] + (rnk[i] - rnk[i - 1]) / 2)) {
				 this.setLevel(i - 1);
				 } else {
				 this.setLevel(i);
				 }
				 } else {
				 this.setLevel(i);
				 }*/
				this.setLevel(i);
				break;
			} else {
				if(move < rnk[0]) {
					this.setLevel(this.config.minLevel);
				} else {
					this.setLevel(rnk.length);
				}
			}
		}
		this.mouseDownFlag = false;
		this.mouseMoveFlag = false;
	},
	mouseout : function(ev) {
		if(this.mouseDownFlag == true && this.mouseMoveFlag == true) {
			clearTimeout(this.timeoutMove);
			var rnk = this.config.rank;
			var move = this.move;
			for(var i = 1; i < rnk.length; i++) {
				if(this.move >= rnk[i - 1] && this.move < rnk[i]) {
					this.setLevel(i);
					break;
				}
			}
			this.mouseDownFlag = false;
			this.mouseMoveFlag = false;
		}
	},
	setLevel : function(i) {
		var a = this.selectedStar.children;
		for(var j = 0; j < a.length; j++) {
			a[j].style["-webkit-transform"] = "scale(1)";
			if(j < i) {
				a[j].style.opacity = 1;
			} else {
				a[j].style.opacity = 0;
			}
		}
		//
		var btnGroup = document.getElementById(this.config.group);
		if(i > 0) {
			btnGroup.style.display = "block";
		} else {
			btnGroup.style.display = "none";
		}
		var defaultTips = document.getElementById("J_LevelChooseDefaultTips");
		var successTips = document.getElementById("J_LevelChooseSuccessTips");
		if(i > 0) {
			defaultTips.style.display = "none";
			successTips.style.display = "block";
			successTips.style["-webkit-animation-name"] = "changeLevelSuccessShow";
			setTimeout(function() {
				successTips.style.display = "none";
			}, 2000);
		} else {
			defaultTips.style.display = "block";
		}

		window.location = "cmd://studyflag" + i;
	},
	initLevel : function(i) {
		var a = this.selectedStar.children;
		for(var j = 0; j < a.length; j++) {
			a[j].style["-webkit-transform"] = "scale(1)";
			if(j < i) {
				a[j].style.opacity = 1;
			} else {
				a[j].style.opacity = 0;
			}
		}
		//
		var btnGroup = document.getElementById(this.config.group);
		if(i > 0) {
			btnGroup.style.display = "block";
		} else {
			btnGroup.style.display = "none";
		}
		var defaultTips = document.getElementById("J_LevelChooseDefaultTips");
		var successTips = document.getElementById("J_LevelChooseSuccessTips");
		if(i > 0) {
			defaultTips.style.display = "none";
		}
	}
};

/**
 * 词典标签模式
 */
$kit.$(function() {
	if($kit.hsCls(document.body, 'J_DictPage_TabMode')) {
		window.tabPanel = new $kit.ui.TabPanel({});
		$kit.ev({
			el : '#main-tab',
			ev : 'switchTab',
			fn : function() {
				window.tabPanel.showAll();
			}
		});
		window.tabPanel.switchTab(0);
	}
	/**
	 * 折叠词典
	 */
	$kit.ev({
		el : '.J_collapseDict',
		ev : 'click',
		fn : function(e, cfg) {
			var el = e.target;
			el = $kit.dom.parentEl8cls(el, 'J_collapseDict') || el;
			$kit.toggleCls(el, 'dictCollapse');
			$kit.toggleCls($kit.el8id($kit.attr(el, 'for')), 'collapse');
		}
	});
	new levelChoose({
		el : "J_LevelChoose",
		level : 2,
		group : "J_BtnCatePicker"
	});
});
