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
		highlightColor : "red"
	};
	this.config = $kit.join(defaultConfig, config);
	this.markClsName = "Apple-style-span";
	this.init();
	window.asd = this;
}
$kit.merge($kit.ui.wordhighlight.prototype, {
	init : function() {
		var me = this;
		me._range_history_ = [];
		me.format(document.body, me.config.formattedTagName);
		//
		if ($kit.has(["iPad", "iPhone"], $kit.SYS.device) && parseFloat($kit.SYS.ver) < 5) {
			me.iphone4RangeFix = true;
		}
		$kit.ev({
			el : me.config.textRangeArea,
			ev : "mousedown touchstart",
			fn : function(ev) {
				if (me._range_history_.length) {
					var lastRangeConfig = me._range_history_.pop();
					// var a = document.getElementsByClassName(me.markClsName);
					// var i = 0;
					// while (a.length > 0 && i < 1000) {
					// $kit.insEl({
					// pos : "after",
					// what : a[0].innerHTML,
					// where : a[0],
					// });
					// a[0].parentNode.removeChild(a[0]);
					// i++;
					// }
					// var a1 = $kit.els8tag(me.config.formattedTagName);
					// for ( var i = 0; i < a1.length; i++) {
					// if (a1[i].style.backgroundColor == me.config.highlightColor) {
					// a1[i].style.backgroundColor = null;
					// }
					// }
					me.clearMark({
						left : ev.pageX,
						top : ev.pageY
					});
					ev.stopNow();
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
						me._range_right_el_ = me._range_left_el_ = me._range_start_el_ = $kit.attr(startEl, "id");
						var r = document.createRange();
						r.selectNode(startEl);
						var s = window.getSelection();
						s.removeAllRanges();
						s.addRange(r);
						me._range_history_.push({
							start : me._range_start_el_,
							end : me._range_start_el_
						});
						if (me.iphone4RangeFix) {
							document.body.contentEditable = true;
							document.execCommand("backcolor", false, me.config.highlightColor);
							document.body.contentEditable = false;
							s.removeAllRanges();
						}
						r.detach();
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
						//
						var r1 = document.createRange(), //
						r2 = document.createRange(), //
						r3 = document.createRange(), //
						R1 = null, //
						R2 = null;
						r1.selectNode(startEl);
						r2.selectNode(endEl);
						r3.selectNode(lastEnd);
						var rangeConfig = {};
						if (r1.compareBoundaryPoints(r2.START_TO_START, r2) == -1) {
							// r1 before r2 r1 - r2
							if (r2.compareBoundaryPoints(r3.START_TO_START, r3) == 1) {
								// r2 after r3
								if (r1.compareBoundaryPoints(r3.START_TO_START, r3) == -1) {
									// r1 before r3 r1 - r3 -r2
								} else if (r1.compareBoundaryPoints(r3.START_TO_START, r3) == 0) {
									// r1==r3
								} else {
									// r1 after r3 r3 - r1 -r2
									R2 = document.createRange();
									R2.setStart(lastEnd, 0);
									R2.setEndBefore(startEl, startEl.childNodes.length);
								}
							} else {
								// r2 before r3 r1 - r2 - r3
								R2 = document.createRange();
								R2.setStart(endEl, endEl.childNodes.length);
								R2.setEnd(lastEnd, lastEnd.childNodes.length);
							}
							R1 = {
								start : me._range_start_el_,
								end : me._range_end_el_
							}
							me._range_left_el_ = me._range_start_el_;
							me._range_right_el_ = me._range_end_el_;
							// R1 = document.createRange();
							// R1.setStart(startEl, 0);
							// R1.setEnd(endEl, endEl.childNodes.length);
						} else {
							// r1 after r2 or r2 before r1
							if (r2.compareBoundaryPoints(r3.START_TO_START, r3) == 1) {
								// r2 after r3, r3 before r2
								// then r3 before r1
								R2 = document.createRange();
								R2.setStart(lastEnd, 0);
								R2.setEndBefore(endEl, endEl.childNodes.length);
							} else {
								// r2 before r3
								if (r1.compareBoundaryPoints(r3.START_TO_START, r3) == -1) {
									// r1 before r3
									R2 = document.createRange();
									R2.setStartAfter(startEl, 0);
									R2.setEnd(lastEnd, lastEnd.childNodes.length);
								} else if (r1.compareBoundaryPoints(r3.START_TO_START, r3) == 0) {
									// r1==r3
								} else {
									// r1 after r3
								}
								R2 = document.createRange();
								R2.setStartAfter(endEl, 0);
								R2.setEnd(lastEnd, lastEnd.childNodes.length);
							}
							R1 = {
								start : me._range_end_el_,
								end : me._range_start_el_
							}
							me._range_left_el_ = me._range_end_el_;
							me._range_right_el_ = me._range_start_el_;
							// R1 = document.createRange();
							// R1.setStart(endEl, 0);
							// R1.setEnd(startEl, startEl.childNodes.length);
						}
						me._range_history_[0].end = me._range_end_el_;
						// me._range_history_.pop();
						// me._range_history_.push(rangeConfig);
						// if (lastRangeConfig.direction != "FromRightToLeft" && me._range_end_el_ == me._range_start_el_) {
						// R2 = document.createRange();
						// R2.setStartAfter(startEl, 0);
						// R2.setEnd(lastEnd, lastEnd.childNodes.length);
						// me._range_history_[0].end = me._range_start_el_;
						// } else if (lastRangeConfig.direction != "FromRightToLeft" && r1.compareBoundaryPoints(r2.START_TO_END, r2) < 1) {
						// // compare r1`s end with r2`s start, if r1 before r2, then -1
						// R1 = document.createRange();
						// R1.setStartAfter(startEl, 0);
						// R1.setEnd(endEl, endEl.childNodes.length);
						// var rangeConfig = {
						// start : me._range_start_el_,
						// end : me._range_end_el_,
						// direction : "FromLeftToRight"
						// }
						// if (1 == 1) {
						// rangeConfig.direction = "no";
						// }
						// if (r3.compareBoundaryPoints(r2.END_TO_END, r2) == 1) {
						// R2 = document.createRange();
						// R2.setStartAfter(endEl, 0);
						// R2.setEnd(lastEnd, lastEnd.childNodes.length);
						// }
						// me._range_history_.push(rangeConfig);
						// } else if (lastRangeConfig.direction != "FromLeftToRight" && r1.compareBoundaryPoints(r2.START_TO_END, r2) > -1) {
						// R1 = document.createRange();
						// R1.setStartAfter(endEl, 0);
						// R1.setEnd(startEl, startEl.childNodes.length);
						// var rangeConfig = {
						// start : me._range_start_el_,
						// end : me._range_end_el_,
						// direction : "FromRightToLeft"
						// }
						// if (1 == 1) {
						// rangeConfig.direction = "no";
						// }
						// if (r3.compareBoundaryPoints(r2.END_TO_END, r2) == -1) {
						// R2 = document.createRange();
						// R2.setStart(lastEnd, 0);
						// R2.setEndBefore(endEl, endEl.childNodes.length);
						// }
						// me._range_history_.push(rangeConfig);
						// } else {
						// R1 = null;
						// R2 = null;
						// }
						r1.detach();
						r2.detach();
						r3.detach();
						if (me.iphone4RangeFix) {
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
								var r = document.createRange();
								r.setStart($kit.el8id(R1.start), 0);
								r.setEnd($kit.el8id(R1.end), $kit.el8id(R1.end).childNodes.length);
								var s1 = window.getSelection();
								s1.removeAllRanges();
								s1.addRange(r);
								document.body.contentEditable = true;
								document.execCommand("backcolor", false, me.config.highlightColor);
								document.body.contentEditable = false;
								s1.removeAllRanges();
								r.detach();
								s1 = null;
							}
						} else {
							if (R2 != null) {
								R2.detach();
								R2 = null;
							}
							if (R1 != null) {
								var r = document.createRange();
								r.setStart($kit.el8id(R1.start), 0);
								r.setEnd($kit.el8id(R1.end), $kit.el8id(R1.end).childNodes.length);
								var s1 = window.getSelection();
								s1.removeAllRanges();
								s1.addRange(r);
								r.detach();
								s1 = null;
							}
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
				if (me.iphone4RangeFix != true) {
					document.body.contentEditable = true;
					document.execCommand("backcolor", false, me.config.highlightColor);
					document.body.contentEditable = false;
					var s = window.getSelection();
					s.removeAllRanges();
				}
				var offsetStart = $kit.offset($kit.el8id(me._range_left_el_));
				var offsetEnd = $kit.offset($kit.el8id(me._range_right_el_));
				var markInfo = {
					offsetStart : offsetStart,
					offsetEnd : offsetEnd
				};
				me.registMark(markInfo);
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
					var ary1 = node.nodeValue.split(splitRegExp_nonWord);
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
	},
	registMark : function(markInfo) {
		var me = this;
		me._mark_storage_ = me._mark_storage_ || [];
		me._mark_storage_.push(markInfo);
	},
	clearMark : function(eventPos) {
		var me = this;
		var findMark = null;
		for ( var i = 0; i < me._mark_storage_.length; i++) {
			var startPosTopLeft_left = me._mark_storage_[i].offsetStart.left, //
			startPosTopLeft_top = me._mark_storage_[i].offsetStart.top, //
			startPosBottomLeft_left = me._mark_storage_[i].offsetStart.left, //
			startPosBottomLeft_top = me._mark_storage_[i].offsetStart.top + me._mark_storage_[i].offsetStart.height, //
			endPosTopRight_left = me._mark_storage_[i].offsetEnd.left + me._mark_storage_[i].offsetEnd.width, //
			endPosTopRight_top = me._mark_storage_[i].offsetEnd.top, //
			endPosBottomRight_left = me._mark_storage_[i].offsetEnd.left + me._mark_storage_[i].offsetEnd.width, //
			endPosBottomRight_top = me._mark_storage_[i].offsetEnd.top + me._mark_storage_[i].offsetEnd.height;
			if (endPosTopRight_top == startPosTopLeft_top) {
				// same line
				if (eventPos.left >= startPosTopLeft_left && eventPos.left <= endPosBottomRight_left//
						&& eventPos.top >= startPosTopLeft_top && eventPos.top <= endPosBottomRight_top) {
					findMark = me._mark_storage_[i];
					break;
				}
			} else {
				// cross line
				if ((eventPos.top >= startPosTopLeft_top && eventPos.top <= startPosBottomLeft_top && eventPos.left >= startPosTopLeft_left)//
						|| (eventPos.top >= endPosTopRight_top && eventPos.top <= endPosBottomRight_top && eventPos.left <= endPosBottomRight_left)//
						|| (eventPos.top > startPosBottomLeft_top && eventPos.top < endPosTopRight_top)) {
					findMark = me._mark_storage_[i];
					break;
				}
			}
		}
		//
		if (findMark != null) {
			var r = document.createRange();
			var startEl = document.elementFromPoint(findMark.offsetStart.left + 1 + $kit.scroll().left, findMark.offsetStart.top + 1 + $kit.scroll().top), //
			endEl = document.elementFromPoint(findMark.offsetEnd.left + 1 + $kit.scroll().left, findMark.offsetEnd.top + 1 + $kit.scroll().top);
			$kit.log(1);
			$kit.log(startEl.outerHTML);
			$kit.log(endEl.outerHTML);
			$kit.log(1);
			r.setStart(startEl, 0);
			r.setEnd(endEl, endEl.childNodes.length);
			var s = window.getSelection();
			s.removeAllRanges();
			s.addRange(r);
			document.body.contentEditable = true;
			document.execCommand("backcolor", false, "inherit");
			document.body.contentEditable = false;
			r.detach();
			s = null;
			var a = document.getElementsByClassName(me.markClsName);
			var i = 0;
			while (a.length > 0 && i < 1000) {
				$kit.insEl({
					pos : "after",
					what : a[0].innerHTML,
					where : a[0],
				});
				a[0].parentNode.removeChild(a[0]);
				i++;
			}
			var a1 = $kit.els8tag(me.config.formattedTagName);
			for ( var i = 0; i < a1.length; i++) {
				if (a1[i].style.backgroundColor == me.config.highlightColor) {
					a1[i].style.backgroundColor = null;
				}
			}
		}
	}
});
$kit.$(function() {
	new $kit.ui.wordhighlight({
		textRangeArea : "qqq"
	});
	$kit.ev({
		el : "zzz",
		ev : "click",
		fn : function() {
			$kit.log("uuuu");
		}
	});
	$kit.ev({
		el : "qwe",
		ev : "click",
		fn : function() {
			$kit.clsLog();
			$kit.log(document.body.innerHTML);
		}
	});
});
