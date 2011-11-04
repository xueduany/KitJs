/*
 *  select word or sentence by touch move on iphone/andriod
 *  highlight the text range
 */
$kit.ui.wordhighlight = function(config) {
	var defaultConfig = {
		wordPattern : /([\u0200-\u0300a-zA-Z]+)/ig,
		idPrefix : "J_WordHighlight_",
		formattedTagName : "w",
		textRangeArea : document.body,
		limitSelectDirection : "none"
	};
	this.config = $kit.join(defaultConfig, config);
	this.init();
}
$kit.merge($kit.ui.wordhighlight.prototype, {
	init : function() {
		var me = this;
		me._range_history_ = [];
		me.format(document.body, me.config.formattedTagName);
		$kit.ev({
			el : me.config.textRangeArea,
			ev : "mousedown touchstart",
			fn : function(ev) {
				if (me._range_history_.length) {
					var lastRangeConfig = me._range_history_.pop();
					var a = document.getElementsByClassName("Apple-style-span");
					var i = 0;
					while (a.length > 0 && i < 1000) {
						a[0].parentNode.replaceChild(a[0].childNodes[0], a[0]);
						i++;
					}
					ev.stopNow();
					$kit.clsLog();
				} else {
					var clientX, clientY;
					if (ev.type.indexOf("touch") == 0) {
						clientX = ev.targetTouches[0].clientX;
						clientY = ev.targetTouches[0].clientY;
					} else {
						clientX = ev.clientX;
						clientY = ev.clientY;
					}
					var startEl = document.elementFromPoint(clientX, clientY);
					if (me.isHighlightEl(startEl)) {
						me._flag_range_start_ = true;
						me._range_start_el_ = $kit.attr(startEl, "id");
						var r = document.createRange();
						r.selectNode(startEl);
						var s = window.getSelection();
						s.removeAllRanges();
						s.addRange(r);
						me._range_history_.push({
							start : me._range_start_el_,
							end : me._range_start_el_
						});
						document.body.contentEditable = true;
						document.execCommand("backcolor", false, "red");
						document.body.contentEditable = false;
						r.detach();
						s.removeAllRanges();
						s = null;
					}
				}
				ev.stopDefault();
			}
		});
		$kit.ev({
			el : me.config.textRangeArea,
			ev : "mousemove touchmove",
			fn : function(ev) {
				if (me._flag_range_start_) {
					me._flag_range_move_ = true;
					// me._timeout_touchselect_ =
					// setTimeout(function() {
					var clientX, clientY;
					if (ev.type.indexOf("touch") == 0) {
						clientX = ev.targetTouches[0].clientX;
						clientY = ev.targetTouches[0].clientY;
					} else {
						clientX = ev.clientX;
						clientY = ev.clientY;
					}
					var endEl = me.findWord(document.elementFromPoint(clientX, clientY));
					var lastRangeConfig = me._range_history_[0], //
					startEl = $kit.el8id(me._range_start_el_), //
					lastEnd = $kit.el8id(lastRangeConfig.end);
					if (me.isHighlightEl(endEl) && endEl != lastEnd) {
						me._range_end_el_ = $kit.attr(endEl, "id");
						var lastRangeConfig = me._range_history_[0];
						var r1 = document.createRange(), //
						r2 = document.createRange(), //
						r3 = document.createRange(), //
						R1 = null, //
						R2 = null;
						// r1.setStart(startEl, 0);
						// r1.setEnd(startEl,
						// startEl.childNodes.length);
						r1.selectNode(startEl);
						// r2.setStart(endEl, 0);
						// r2.setStart(endEl,
						// endEl.childNodes.length);
						r2.selectNode(endEl);
						// r3.setStart(lastEnd, 0);
						// r3.setEnd(lastEnd,
						// lastEnd.childNodes.length);
						r3.selectNode(lastEnd);
						//
						if (lastRangeConfig.direction != "FromRightToLeft" && me._range_end_el_ == me._range_start_el_) {
							R2 = document.createRange();
							R2.setStartAfter(startEl, 0);
							R2.setEnd(lastEnd, lastEnd.childNodes.length);
							me._range_history_[0].end = me._range_start_el_;
						} else if (lastRangeConfig.direction != "FromRightToLeft" && r1.compareBoundaryPoints(r2.START_TO_END, r2) < 1) {
							// compare the beginning of r2 with the end of r1, if r1 before r2, then result is -1
							R1 = document.createRange();
							R1.setStartAfter(startEl, 0);
							R1.setEnd(endEl, endEl.childNodes.length);
							var rangeConfig = {
								start : me._range_start_el_,
								end : me._range_end_el_,
								direction : "FromLeftToRight"
							}
//							if (me.config.limitSelectDirection == "none") {
//								rangeConfig.direction = "nolimit";
//							}
							if (r3.compareBoundaryPoints(r2.END_TO_END, r2) == 1) {
								R2 = document.createRange();
								R2.setStartAfter(endEl, 0);
								R2.setEnd(lastEnd, lastEnd.childNodes.length);
							}
							me._range_history_.push(rangeConfig);
						} else if (lastRangeConfig.direction != "FromLeftToRight" && r1.compareBoundaryPoints(r2.START_TO_END, r2) > -1) {
							R1 = document.createRange();
							R1.setStartAfter(endEl, 0);
							R1.setEnd(startEl, startEl.childNodes.length);
							var rangeConfig = {
								start : me._range_start_el_,
								end : me._range_end_el_,
								direction : "FromRightToLeft"
							}
//							if (me.config.limitSelectDirection == "none") {
//								rangeConfig.direction = "nolimit";
//							}
							if (r3.compareBoundaryPoints(r2.END_TO_END, r2) == -1) {
								R2 = document.createRange();
								R2.setStart(lastEnd, 0);
								R2.setEndBefore(endEl, endEl.childNodes.length);
							}
							me._range_history_.push(rangeConfig);
						} else {
							R1 = null;
							R2 = null;
						}
						r1.detach();
						r2.detach();
						r3.detach();
						if (R2 != null) {
							var s1 = window.getSelection();
							s1.removeAllRanges();
							s1.addRange(R2);
							document.body.contentEditable = true;
							document.execCommand("backcolor", false, "inherit");
							document.body.contentEditable = false;
							s1.removeAllRanges();
							R2.detach();
							s1 = null;
						}
						if (R1 != null) {
							me._range_history_.shift();
							var s1 = window.getSelection();
							s1.removeAllRanges();
							s1.addRange(R1);
							document.body.contentEditable = true;
							document.execCommand("backcolor", false, "red");
							document.body.contentEditable = false;
							s1.removeAllRanges();
							R1.detach();
							s1 = null;
						}
					}
				}
				ev.stopDefault();
			}
		});
		$kit.ev({
			el : me.config.textRangeArea,
			ev : "mouseup touchend",
			fn : function(ev) {
				me._flag_range_start_ = me._flag_range_move_ = false;
				ev.stopDefault();
			}
		});
	},
	/**
	 * format dom struct, add special mark on element which include words
	 */
	format : function(root, tagName) {
		var me = this;
		var splitRegExp_nonWord = /([^\u0200-\u0300a-z]+)/ig, //
		splitRegExp_word = /([\u0200-\u0300a-z]+)/ig, //
		regExp_nonWord = /^[^\u0200-\u0300a-z]+$/ig, //
		regExp_word = /^[\u0200-\u0300a-z]+$/ig;
		$kit.traversal({
			root : root,
			fn : function(node, top) {
				if (node.nodeType == 3 && node.nodeValue.length) {
					if (regExp_nonWord.test(node.nodeValue) || regExp_word.test(node.nodeValue)) {
						return;
					}
					var ary1 = node.nodeValue.split(regExp_nonWord);
					if (ary1.length > 1) {
						for ( var i = 0; i < ary1.length; i++) {
							if (ary1[i].length > 0 && splitRegExp_word.test(ary1[i])) {
								// if(ary1[i].length > 0) {
								ary1[i] = "<" + tagName + " id=\"" + me.markDomId() + "\">" + ary1[i] + "</" + tagName + ">";
							}
						}
						var html = ary1.join("");
						$kit.rpEl(node, html);
					}
				} else if (node.nodeType == 1) {
					var ary1 = node.innerHTML.split(splitRegExp_nonWord);
					if (ary1.length > 1) {
						for ( var i = 0; i < ary1.length; i++) {
							if (ary[i].length > 0 && splitRegExp_word.test(ary[i])) {
								// if(ary[i].length > 0) {
								ary1[i] = "<" + tagName + " id=\"" + me.markDomId() + "\">" + ary1[i] + "</" + tagName + ">";
							}
						}
						var html = ary1.join("");
						node.innerHTML = html;
					}
				}
			}
		})
	},
	/**
	 * judge element is allowed highlight
	 */
	isHighlightEl : function(el) {
		var me = this;
		if (el != null) {
			if ("tagName" in el && el.tagName.toLowerCase() == me.config.formattedTagName) {
				return true;
			} else {
				if (el.parentNode) {
					return me.isHighlightEl(el.parentNode);
				}
			}
		}
		return false;
	},
	/**
	 * mark dom with special id
	 */
	markDomId : function() {
		var me = this;
		var id = me.config.idPrefix + $kit.only();
		if (document.getElementById(id)) {
			id = me.markDomId();
		}
		return id;
	},
	/**
	 * locate word element
	 */
	findWord : function(el) {
		var me = this;
		if (el != null) {
			if ("tagName" in el && el.tagName.toLowerCase() == me.config.formattedTagName) {
				return el;
			} else {
				if (el.parentNode) {
					return me.findWord(el.parentNode);
				}
			}
		}
		return null;
	}
});
$kit.$(function() {
	new $kit.ui.wordhighlight({
		textRangeArea : "qqq"
	});
});
