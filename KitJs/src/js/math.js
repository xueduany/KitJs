/**
 * 数组扩展
 */
$Kit.Math = function() {
	//
}
$Kit.Math.prototype = {
	/**
	 * 补0
	 */
	padZero : function(num, length) {
		var re = num.toString();
		do {
			var l1 = re.indexOf(".") > -1 ? re.indexOf(".") : re.length;
			if (l1 < length) {
				re = "0" + re;
			}
		} while (l1 < length);
		return re;
	}
};
$kit.math = new $Kit.Math();