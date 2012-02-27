/**
 * 日期时间扩展
 */
$Kit.Date = function() {
	//
}
$Kit.Date.prototype = {
	/**
	 * 返回时间，单位秒 dd:dd:dd 时:分:秒
	 */
	parseTime : function(timeStr) {
		var me = this;
		var a = timeStr.split(":");
		var hours, minutes, seconds;
		if (a.length == 3) {
			hours = parseFloat(a[0]);
			minutes = parseFloat(a[1]);
			seconds = parseFloat(a[2]);
		} else if (a.length == 2) {
			hours = 0;
			minutes = parseFloat(a[0]);
			seconds = parseFloat(a[1]);
		} else {
			hours = 0;
			minutes = 0;
			seconds = parseFloat(a[0]);
		}
		var time = hours * 60 * 60 + minutes * 60 + seconds;
		time = Math.round(time);
		return time;
	},
	/**
	 * 返回时间字符串 dd:dd:dd，参数time，单位秒
	 */
	formatTime : function(time) {
		time = parseFloat(time);
		var me = this;
		var minutes = Math.floor(time / 60);
		var hours = Math.floor(minutes / 60);
		minutes = minutes % 60;
		var seconds = (time % 60).toFixed(0);
		return $kit.math.padZero(hours, 2) + ":" + $kit.math.padZero(minutes, 2) + ":" + $kit.math.padZero(seconds, 2);
	}
};
$kit.date = new $Kit.Date();