/**
 * 数组扩展
 * @class $Kit.Math
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/math.js">Source code</a>
 */
$Kit.Math = function() {
	//
}
$kit.merge($Kit.Math.prototype,
/**
 * @lends $Kit.Math.prototype
 */
{
	/**
	 * 前面补0
	 * @param {Number|String}
	 * @param {Number}
	 * @return {String}
	 */
	padZero : function(num, length) {
		var re = num.toString();
		do {
			var l1 = re.indexOf(".") > -1 ? re.indexOf(".") : re.length;
			if(l1 < length) {
				re = "0" + re;
			}
		} while (l1 < length);
		return re;
	},
	/**
	 * 返回min与max之间的随机数，没有max，则返回0~min之间
	 * @param {Number}
	 * @param {Number} [max]
	 * @return {Number}
	 */
	rand : function(min, max) {
		max = max || min || 100;
		min = min || 0;
		var rnd = Math.round(Math.random() * max);
		if(min != 0 && max != min) {
			if(min > max) {
				max = min;
			}
			if(min < 0) {
				rnd = this.positiveOrNegative() * rnd;
			}
			while(rnd < min) {
				rnd = this.positiveOrNegative() * Math.round(Math.random() * max)
			}
		}
		return rnd;
	},
	/**
	 * 随机返回0或者1
	 * @return {Number}
	 */
	oneOrZero : function() {
		return Math.round(Math.random());
	},
	/**
	 * 随机返回正或者负，return -1 || +1
	 * @return {Number}
	 */
	positiveOrNegative : function() {
		var flag = this.oneOrZero();
		if(flag) {
			return 1;
		}
		return -1;
	},
	/**
	 * 取多少位的随机数，返回string
	 * @param {Number}
	 * @return {String}
	 */
	randUnit : function(length) {
		length = length || 3;
		return this.padZero(Math.round(Math.random() * Math.pow(10, length)), length);
	},
	/**
	 * 取多少位的随机数，开头非0，返回数字
	 * @param {Number}
	 * @return {String}
	 */
	randUnitNotZeroBefore : function(length) {
		length = length || 3;
		var re = Math.round(Math.random() * Math.pow(10, length));
		while(re < Math.pow(10, length - 1)) {
			re = Math.round(Math.random() * Math.pow(10, length));
		}
		return re;
	},
	/**
	 * 进制转换
	 * @param {Number|String}
	 * @param {Number|String}
	 * @param {Number|String}
	 * @return {String}
	 */
	convert : function(str, oldHex, newHex) {
		var num = new String(str);
		num = parseInt(num, parseInt(oldHex));
		return num.toString(parseInt(newHex));
	},
	/**
	 * 给数字添加逗号分割
	 * @param {Number}
	 * @param {String} [sign] 分隔符号，默认是,
	 * @param {Number} [n] 默认以千位分割，默人是3，10的3次方
	 * @return {String}
	 */
	splitNumberWithComma : function(num, sign, n) {
		if(sign == null && n == null) {
			sign = ',';
			n = 3;
		} else {
			if(n == null) {
				if( typeof sign != 'number') {
					//
					n = 3;
				} else {
					sign = ',';
					n = parseInt(sign);
				}
			}
		}
		var s = num.toString().split('');
		var a = [], b = [];
		for(var i = 0; i < s.length; i++) {
			if((s.length - i - 1) % n > 0) {
				b.push(s[i]);
			} else {
				b.push(s[i]);
				a.push(b.join(''));
				b = [];
			}
		}
		return a.join(sign);
	}
});
/**
 * $Kit.Math的实例，直接通过这个实例访问$Kit.Math所有方法
 * @global
 * @type $Kit.Math
 */
$kit.math = new $Kit.Math();
