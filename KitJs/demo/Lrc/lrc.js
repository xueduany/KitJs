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
		btnInsLrcRow : $kit.el("#J_insrow"),
		//字幕列表容器元素
		lrcList : $kit.el("#lrc-list"),
		//字幕html模板
		htmlLrcRow : ['<li id="${rowDomId}">', //
		'<span class="begin-time">', //
		'<input class="kitjs-form-textbox startTime" type="text" value="${formattedCurrentTimeStr}">', //
		'</span>', //
		'<div class="content">', //
		'<textarea class="kitjs-form-textarea">${lrcText}</textarea>', //
		'</div>', //
		'</li>'//
		].join(""),
		//highlight className
		clsCurrentTimePoint : "currentTimePoint"
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
		//当播放时
		$kit.ev({
			el : resource,
			ev : "timeupdate",
			fn : me.evPlaying,
			scope : me
		});
		$kit.ev({
			el : me.config.lrcList,
			ev : "click",
			fn : me.evLrcListOperation
		})
		me.bindInsLrcRowEv();
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
			if(currentTime >= beginTime) {
				currentKeyInTimeLine = beginTimeStr;
			} else {
				return false;
			}
		}, me);
		/*
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
		 }*/

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
	bindInsLrcRowEv : function() {
		var me = this;
		$kit.ev({
			el : me.config.btnInsLrcRow,
			ev : "click",
			fn : me.evInsLrcRow,
			scope : me
		});
	},
	/**
	 * 插入一行字幕
	 */
	evInsLrcRow : function(ev, evCfg) {
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

$kit.$(function() {
	$kit.ev({
		el : $kit.el("#J_splitLrc_btn"),
		ev : "click",
		fn : function(ev, evCfg) {
			var el = $kit.el("#J_lrcTextInput");
			var endPos = el.selectionEnd;
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

			lrc.evInsLrcRow(null, {
				lrcText : text
			})
			el.value = el.value.substr(endPos);
			ev.stopDefault();
		}
	});
})