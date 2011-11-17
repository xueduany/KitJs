Lrc = function(config) {
	var defaultConfig = {
		//视频，音频
		resource : undefined,
		//时间线
		timeLine : [],
		//时间线map对象，key为xx:xx.xx,value为对应字母li元素的id
		mapTimeLine : {},
		//当前播放时间在timeLine数组的索引
		currentTimeRangeIdx : -1,
		//当前位于哪个timeLine区间
		currentTimeRangeStart : 0,
		//当前播放时间的xx:xx.xx格式字符串
		formattedCurrentTimeStr : 0,
		//当前播放时间xx秒
		currentTime : 0,
		btnInsLrcRow : $kit.el("#J_insrow"),
		//字幕列表容器元素
		lrcList : $kit.el("#lrc-list"),
		//字幕html模板
		htmlLrcRow : ['<li id="${idLi}">', //
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
	init : function() {
		var me = this;
		var resource = me.config.resource;
		$kit.ev({
			el : resource,
			ev : "timeupdate",
			fn : me.evPlaying,
			scope : me
		});
		me.bindInsLrcRowEv();
	},
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
	 * 播放时，或者改变当前播放时间时触发事件
	 */
	evPlaying : function(ev, evCfg) {
		var me = this;
		var resource = me.config.resource;
		var currentTime = resource.currentTime.toFixed(2);
		me.config.currentTime = currentTime;
		me.config.formattedCurrentTimeStr = me.formatTimeStr(currentTime);
		var timeLine = me.config.timeLine;
		var currentTimeRangeStart = 0, flagHighLight = false;
		for(var i = 0; i < timeLine.length; i++) {
			var _t = me.parseTime(timeLine[i]);
			if(currentTime >= _t) {
				currentTimeRangeStart = timeLine[i];
				continue;
			} else {
				break;
			}
		}
		me.config.currentTimeRangeStart = currentTimeRangeStart;
		if($kit.array.hs(me.config.timeLine, currentTimeRangeStart)) {
			if($kit.el("." + me.config.clsCurrentTimePoint).length && $kit.el("." + me.config.clsCurrentTimePoint)[0] != $kit.el("#" + me.config.mapTimeLine[currentTimeRangeStart])) {
				$kit.rmCls($kit.el("." + me.config.clsCurrentTimePoint)[0], me.config.clsCurrentTimePoint);
			}
			if(!$kit.isEmpty(me.config.mapTimeLine[currentTimeRangeStart])) {
				$kit.adCls($kit.el("#" + me.config.mapTimeLine[currentTimeRangeStart]), me.config.clsCurrentTimePoint);
			}
		} else {
			$kit.rmCls($kit.el("." + me.config.clsCurrentTimePoint)[0], me.config.clsCurrentTimePoint);
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
		if(!$kit.array.hs(me.config.timeLine, me.config.formattedCurrentTimeStr)) {
			var idLi = $kit.onlyId();
			$kit.array.ad(me.config.timeLine, me.config.formattedCurrentTimeStr);
			$kit.array.sort(me.config.timeLine, function(left, right) {
				return me.parseTime(left) - me.parseTime(right);
			});
			me.config.mapTimeLine[me.config.formattedCurrentTimeStr] = idLi;
			$kit.insEl({
				pos : me.config.timeLine.length && me.config.currentTimeRangeStart != 0 ? "after" : "first",
				what : $kit.tpl(me.config.htmlLrcRow, $kit.join(me.config, {
					idLi : idLi
				}, evCfg)),
				where : me.config.timeLine.length && me.config.currentTimeRangeStart != 0 ? $kit.el("#" + me.config.mapTimeLine[me.config.currentTimeRangeStart]) : me.config.lrcList
			});
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