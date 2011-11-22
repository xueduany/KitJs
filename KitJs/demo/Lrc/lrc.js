Lrc = function(config) {
	var defaultConfig = {
		//视频，音频
		resource : undefined,
		//时间线linkedHashMap对象，key为xx:xx.xx,value为对应字母li元素的id
		timeLine : new LinkedHashMap(),
		//当前播放的段落
		currentKeyInTimeLine : 0,
		//当前播放时间的xx:xx.xx格式字符串
		formattedCurrentTimeStr : 0,
		//当前播放时间xx秒
		currentTime : 0,
		btnInsLrcRow : null, //$kit.el("#J_insrow"),
		//字幕列表容器元素
		lrcList : $kit.el("#lrc-list"),
		//字幕html模板
		htmlLrcRow : ['<li id="${rowDomId}">', //
		'<input class="begin-time" size="4" type="text" value="${formattedCurrentTimeStr}">', //
		'<textarea cols="59" class="subtitle">${lrcText}</textarea>', //
		'<a onclick="lrc.delLrcRowFrom(\'${formattedCurrentTimeStr}\')">删除</a>', //
		'</li>'//
		].join(""),
		//highlight className
		clsCurrentTimePoint : "currentTimePoint",
		//字幕来源
		lrcTextResource : $kit.el8id("J_lrcTextResourceInput"),
		//控制字幕来源是否可以编辑
		btnEditLrcTextResource : $kit.el8id("J_editLrc_btn"),
		//格式化字幕来源
		btnFormatLrcTextResource : $kit.el8id("J_formatLrc_btn"),
		//选中行的样式
		clsSelected : "selected",
		clsOperate : "operate"
	}
	var me = this;
	me.config = $kit.join(defaultConfig, config);
	me.init();
}
Lrc.prototype = {
	/**
	 * 时间字符串转换成xx秒
	 */
	parseTime : function(timeStr) {
		var me = this;
		var _a = timeStr.match(/(\d+:)?(\d+\.?\d*)/);
		var hours = $kit.isEmpty(_a[1]) ? 0 : parseFloat(_a[1]);
		var minutes = parseFloat(_a[2]);
		var time = hours * 60 + minutes;
		return time;
	},
	/**
	 * xx秒转换成xx:xx.xx
	 */
	formatTimeStr : function(time) {
		var me = this;
		var hours = Math.floor(time / 60);
		var minutes = (time % 60).toFixed(2);
		return $kit.math.padZero(hours, 2) + ":" + $kit.math.padZero(minutes, 2);
	},
	/**
	 * 初始化
	 */
	init : function() {
		var me = this;
		var resource = me.config.resource;
		/**
		 * 分割字幕文本，每次点击，根据视频的当前时间，生成一个字幕
		 */
		$kit.ev({
			el : me.config.lrcTextResource,
			ev : "click",
			fn : function(ev, evCfg) {
				var el = ev.target;
				if($kit.hasCls(el, "textarea_lrcTextResourceEditAble")) {
					return;
				}
				var endPos = el.selectionEnd;
				if(el.value.length == 0 || endPos == 0) {
					el.blur();
					return;
				}
				el.setSelectionRange(0, endPos);
				var selection = window.getSelection();
				var text = selection.toString();
				if($kit.isEmpty(text)) {
					return;
				}
				selection.removeAllRanges();
				/*
				 $kit.insEl({
				 pos : "before",
				 where : el,
				 what : '<div class="cutted_lrc">' + text + '</div>'
				 })*/

				lrc.evInsertLrcRow(null, {
					lrcText : text
				})
				el.value = el.value.substr(endPos);
				el.blur();
				ev.stopDefault();
			}
		});
		/**
		 * 只有当字幕来源处于可编辑状态时候，才能被编辑
		 */
		$kit.ev({
			el : me.config.lrcTextResource,
			ev : "keydown",
			fn : function(ev, evCfg) {
				var el = ev.target;
				if(!$kit.hasCls(el, "textarea_lrcTextResourceEditAble")) {
					ev.stopDefault();
					el.blur();
				}
			}
		});
		/**
		 * 控制字幕来源是否可以编辑
		 */
		$kit.ev({
			el : me.config.btnEditLrcTextResource,
			ev : "click",
			fn : function(ev, evCfg) {
				var el = me.config.lrcTextResource;
				if($kit.el8id("J_editLrc_btn").innerHTML.trim() == "编辑") {
					$kit.adCls(el, "textarea_lrcTextResourceEditAble");
					$kit.el8id("J_editLrc_btn").innerHTML = "完成";
					el.focus();
				} else {
					$kit.rmCls(el, "textarea_lrcTextResourceEditAble");
					$kit.el8id("J_editLrc_btn").innerHTML = "编辑";
				}
			},
			scope : me
		});
		/**
		 * 格式化字幕来源
		 */
		$kit.ev({
			el : me.config.btnFormatLrcTextResource,
			ev : "click",
			fn : function(ev, evCfg) {
				var el = me.config.lrcTextResource;
				el.value = $kit.str.breakSentence(el.value);
			},
			scope : me
		})
		//当播放时
		$kit.ev({
			el : resource,
			ev : "timeupdate",
			fn : me.evPlaying,
			scope : me
		});
		//字幕列表点击
		$kit.ev({
			el : me.config.lrcList,
			ev : "click",
			fn : me.evLrcListClick,
			scope : me
		});
	},
	/**
	 * 播放时，或者改变当前播放时间时触发事件
	 */
	evPlaying : function(ev, evCfg) {
		var me = this;
		//视频or声音
		var resource = me.config.resource;
		//当前时间
		var currentTime = resource.currentTime.toFixed(2);
		me.config.currentTime = currentTime;
		me.config.formattedCurrentTimeStr = me.formatTimeStr(currentTime);
		var timeLine = me.config.timeLine;
		var currentKeyInTimeLine = 0, flagHighLight = false;
		timeLine.each(function(key, value, i, array, map) {
			var key = key, value = value;
			var beginTime = value.beginTime, beginTimeStr = value.beginTimeStr;
			if(parseFloat(currentTime) >= parseFloat(beginTime)) {
				currentKeyInTimeLine = beginTimeStr;
			} else {
				return false;
			}
		}, me);
		me.config.currentKeyInTimeLine = currentKeyInTimeLine;
		if($kit.array.hs(me.config.timeLine, currentKeyInTimeLine)) {
			if($kit.el("." + me.config.clsCurrentTimePoint).length && $kit.el("." + me.config.clsCurrentTimePoint)[0] != $kit.el("#" + me.config.mapTimeLine[currentKeyInTimeLine])) {
				$kit.rmCls($kit.el("." + me.config.clsCurrentTimePoint)[0], me.config.clsCurrentTimePoint);
			}
			if(!$kit.isEmpty(me.config.mapTimeLine[currentKeyInTimeLine])) {
				$kit.adCls($kit.el("#" + me.config.mapTimeLine[currentKeyInTimeLine]), me.config.clsCurrentTimePoint);
			}
		} else {
			$kit.rmCls($kit.el("." + me.config.clsCurrentTimePoint)[0], me.config.clsCurrentTimePoint);
		}
	},
	/**
	 * lrc列表操作
	 */
	evLrcListOperation : function(ev, evCfg) {
		return;
		var target = ev.target;
		var me = this;
		if($kit.hasCls(target, "J_cancel")) {
			//撤销当前的lrc
			var timeLine = me.config.timeLine;
			var flagBegin = false;
			for(var i = 0; i < timeLine.length; i++) {
				//if(timeLine[i]==)
			}
		}
	},
	/**
	 * 插入一行字幕
	 */
	evInsertLrcRow : function(ev, evCfg) {
		var me = this;
		if(me.config.formattedCurrentTimeStr == 0 || me.config.formattedCurrentTimeStr == "0") {
			me.config.formattedCurrentTimeStr = me.formatTimeStr(me.config.formattedCurrentTimeStr);
		}
		if(!me.config.timeLine.hs(me.config.formattedCurrentTimeStr)) {
			var idLi = $kit.onlyId();
			var newTimeObject = {
				beginTime : me.config.currentTime,
				beginTimeStr : me.config.formattedCurrentTimeStr,
				lrcText : evCfg.lrcText,
				rowDomId : idLi
			};
			$kit.insEl({
				pos : me.config.timeLine.size() && me.config.currentKeyInTimeLine != 0 ? "after" : "first",
				what : $kit.tpl(me.config.htmlLrcRow, $kit.join(me.config, newTimeObject)),
				where : me.config.timeLine.size() && me.config.currentKeyInTimeLine != 0 ? $kit.el8id(me.config.timeLine.get(me.config.currentKeyInTimeLine).rowDomId) : me.config.lrcList
			});
			new $kit.ui.Form.TextArea({
				el : $kit.el("textarea",$kit.el8id(idLi))[0]
			});
			me.config.timeLine.ad(newTimeObject.beginTimeStr, newTimeObject);
			me.config.timeLine.sort(function(left, right) {
				return me.parseTime(left) - me.parseTime(right);
			});
			me.config.currentKeyInTimeLine = me.config.formattedCurrentTimeStr;
		} else {
			var lrcTextarea = $kit.el8tag("textarea", $kit.el8id(me.config.timeLine.get(me.config.currentKeyInTimeLine).rowDomId));
			lrcTextarea.value = lrcTextarea.value + evCfg.lrcText;
		}
	},
	/**
	 * 取消已编辑好的lrcrow
	 */
	evCancelLrcRow : function(ev, evCfg) {
		var me = this;
		delLrcRowFrom(evCfg.currentKeyInTimeLine);
	},
	delLrcRowFrom : function(currentKeyInTimeLine) {
		var me = this;
		var currentRowDomId = me.config.timeLine.get(currentKeyInTimeLine).rowDomId;
		var rowList = $kit.el("li", me.config.lrcList);
		var cancelTextAry = [];
		for(var i = 0; i < rowList.length; i++) {
			if(rowList[i].id == currentRowDomId) {
				var currentLi = $kit.prevEl(li, function(li) {
					if(li.tagName && li.tagName == "li") {
						return true;
					}
				});
				if(!$kit.isEmpty(currentLi)) {
					me.config.currentKeyInTimeLine = me.getLrcTimeFromLi(currentLi);
				} else {
					me.config.currentKeyInTimeLine = 0;
				}
				while(rowList.length > i) {
					var li = rowList[i];
					var text = me.getLrcTextFromLi(li);
					cancelTextAry.push(text);
					$kit.rmEl(li);
					me.config.timeLine.rmFrom(currentKeyInTimeLine);
				}
			}
		}
		if(cancelTextAry.length) {
			me.setLrcSourceText(cancelTextAry.join("") + me.getLrcSourceText());
		}
	},
	/**
	 * 字幕列表点击
	 */
	evLrcListClick : function(ev, evCfg) {
		var me = this;
		var li = ev.target;
		if(li.tagName && li.tagName.toLowerCase() == "li") {
			//
		} else {
			li = $kit.parentEl(ev.target, function(li) {
				if(li == me.config.lrcList) {
					return false;
				} else if(li.tagName && li.tagName.toLowerCase() == "li") {
					return true;
				}
			});
		}
		if(li != null) {
			if($kit.hasCls(li, me.config.clsSelected)) {
				$kit.rmCls(li, me.config.clsSelected);
				while($kit.els8cls(me.config.clsSelected, me.config.lrcList).length > 0) {
					$kit.rmCls($kit.els8cls(me.config.clsSelected, me.config.lrcList)[0], me.config.clsSelected);
				}
			} else {
				var selectedLiAry = $kit.els8cls(me.config.clsSelected, me.config.lrcList);
				if(selectedLiAry.length > 0) {
					var liAry = $kit.el("li", me.config.lrcList);
					if(selectedLiAry[selectedLiAry.length - 1].compareDocumentPosition(li) == $kit.CONSTANTS.DOCUMENT_POSITION_FOLLOWING) {
						var flagStart = false;
						for(var i = 0; i < liAry.length; i++) {
							if(liAry[i] == selectedLiAry[selectedLiAry.length - 1]) {
								flagStart = true;
							}
							if(flagStart) {
								$kit.adCls(liAry[i], me.config.clsSelected);
							}
							if(liAry[i] == li) {
								flagStart = false;
								break;
							}
						}
					} else if(selectedLiAry[selectedLiAry.length - 1].compareDocumentPosition(li) == $kit.CONSTANTS.DOCUMENT_POSITION_PRECEDING) {
						var flagStart = false;
						for(var i = 0; i < liAry.length; i++) {
							if(liAry[i] == li) {
								flagStart = true;
							}
							if(flagStart) {
								$kit.adCls(liAry[i], me.config.clsSelected);
							}
							if(liAry[i] == selectedLiAry[selectedLiAry.length - 1]) {
								flagStart = false;
								break;
							}
						}
					}
				} else {
					$kit.adCls(li, me.config.clsSelected);
				}
			}
			var operateAry = $kit.el("." + me.config.clsOperate, me.config.lrcList);
			for(var i = 0; i < operateAry.length; i++) {
				var el = operateAry[i];
				el.style.display = "none";
			}
			var selectedLiAry = $kit.el("." + me.config.clsSelected, me.config.lrcList);
			if(selectedLiAry.length > 0) {
				var lastSelectedLi = selectedLiAry[selectedLiAry.length - 1];
				var operate = $kit.el("." + me.config.clsOperate, lastSelectedLi)[0];
				operate.style.display = "block";
			}
		}
	},
	getLrcTextFromLi : function(li) {
		var me = this;
		var textarea = $kit.el8tag("textarea", li);
		return textarea.value;
	},
	getLrcTimeFromLi : function(li) {
		var me = this;
		var input = $kit.el8tag("input", li);
		return input.value;
	},
	setLrcSourceText : function(text) {
		var me = this;
		me.config.lrcTextResource.value = text;
	},
	getLrcSourceText : function() {
		var me = this;
		return me.config.lrcTextResource.value;
	},
	onPause : function(ev, evCfg) {

	},
	onPaly : function(ev, evCfg) {
		// $kit.log(evCfg.el.currentTime);
	},
	onSeeking : function(ev, evCfg) {
		// $kit.log("1a1" + evCfg.el.currentTime);
	},
	onSeeked : function(ev, evCfg) {
		// $kit.log("2a2" + evCfg.el.currentTime);
	}
}