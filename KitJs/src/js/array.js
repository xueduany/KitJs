/**
 * 数组扩展
 * @class $Kit.Array
 * @requires kit.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/array.js">Source code</a>
 */
$Kit.Array = function(config) {
	//
}
$Kit.Array.prototype =
/**
 * lends $Kit.Array.prototype
 */
{
	/**
	 * 从小到大排序
	 * @param {Number}
	 * @param {Number}
	 * @return {Array}
	 * @private
	 */
	SORT_ASC : function(left, right) {
		return left - right;
	},
	/**
	 * 从大到小排序
	 * @param {Number}
	 * @param {Number}
	 * @return {Array}
	 * @private
	 */
	SORT_DESC : function(left, right) {
		return right - left;
	},
	/**
	 * 判断是否存在
	 * @param {Array}
	 * @param {Object}
	 * @param {Object} config
	 * @param {Boolean} config.ignoreCase 判断是否相等时候，是否忽略大小写
	 * @return {Boolean}
	 */
	hs : function(ary, check, setting) {
		var me = this;
		if(!$kit.isAry(ary)) {
			return;
		}
		var defaultSetting = {
			ignoreCase : false
		}
		var setting = $kit.merge(defaultSetting, setting);
		for(var i = 0; i < ary.length; i++) {
			var o = ary[i];
			if(o == check//
			|| (setting.ignoreCase && o.toString().toLowerCase() == check.toString().toLowerCase())) {
				return true;
			}
		}
		return false;
	},
	/**
	 * 向数组中添加元素
	 * @param {Array}
	 * @param {Object|Array}
	 * @param {Object} config
	 * @param {Boolean} config.ifExisted 为true时候，则进行存在判断，存在则不加，为false，直接第一个数组冗余相加
	 * @param {Boolean} config.ignoreCase 判断是否相等时候，是否忽略大小写
	 */
	ad : function(ary, add, setting) {
		var me = this;
		if(!$kit.isAry(ary)) {
			return;
		}
		var defaultSetting = {
			ifExisted : false,
			ignoreCase : false
		}
		var setting = $kit.merge(defaultSetting, setting);
		if($kit.isAry(add)) {
			for(var i = 0; i < add.length; i++) {
				me.ad(ary, add[i], setting);
			}
		} else {
			if(setting.ifExisted && ary.length > 0) {
				for(var i = 0; i < ary.length; i++) {
					var o = ary[i];
					if(o == add//
					|| (setting.ignoreCase && o.toString().toLowerCase() == add.toString().toLowerCase())) {
						break;
					} else if(i == ary.length - 1) {
						ary.push(add);
					}
				}
			} else {
				ary.push(add);
			}
		}
	},
	/**
	 * 数组删除元素
	 * @param {Array}
	 * @param {Object|Array}
	 * @param {Object} config
	 * @param {Boolean} config.ignoreCase 判断是否相等时候，是否忽略大小写
	 * @param {Boolean} config.isGlobal 是否全局检查，不仅仅删除第一个发现的
	 */
	rm : function(ary, del, setting) {
		var me = this;
		if(!$kit.isAry(ary)) {
			return;
		}
		var defaultSetting = {
			ignoreCase : false,
			isGlobal : true
		}
		var setting = $kit.merge(defaultSetting, setting);
		if($kit.isAry(del)) {
			for(var i = 0; i < del.length; i++) {
				me.rm(ary, del[i], setting);
			}
		} else {
			for(var i = 0; i < ary.length; i++) {
				var o = ary[i];
				if(o == del//
				|| (setting.ignoreCase && o.toString().toLowerCase() == del.toString().toLowerCase())) {
					ary.splice(i, 1);
					if(setting.isGlobal) {
						continue;
					} else {
						break;
					}
				}
			}
		}
	},
	/**
	 * 排序
	 * @param {Array}
	 * @param {String} param 排序类型，目前支持ASC从小到大,DESC从大到小两种类型
	 * @rettun {Array} 返回被排序的数组
	 */
	sort : function(ary, param) {
		var me = this;
		if($kit.isEmpty(ary) || $kit.isEmpty(param)) {
			return;
		}
		if($kit.isFn(param)) {
			return ary.sort(param);
		} else {
			switch (param) {
				case "ASC" :
					return ary.sort(me.SORT_ASC);
				case "DESC" :
					return ary.sort(me.SORT_DESC);
			}
		}
	},
	/**
	 * 通过比较方法取得值
	 * @param {Array}
	 * @param {Function} validateFn 遍历数组，执行该方法，等方法返回true时候，获得数组中对应值。方法传入三个参数，当前元素，当前元素索引，数组
	 * @param {Object} [scope] 执行方法时候的this指针
	 * @return {Object}
	 */
	get : function(ary, validateFn, scope) {
		var scope = scope || window;
		for(var i = 0; i < ary.length; i++) {
			if(validateFn.call(scope, ary[i], i, ary) == true) {
				return ary[i];
			}
		}
	},
	/**
	 * 遍历数组，获得数组中元素以xxx文字开头的
	 * @param {Array}
	 * @param {String}
	 * @return {Object}
	 */
	getTextBeginWith : function(ary, beginWithText) {
		var me = this;
		return me.get(ary, function(o) {
			if(o.indexOf(beginWithText) == 0) {
				return true;
			}
		});
	},
	/**
	 * 把字符串按照分隔符转换成数组
	 * @param {String}
	 * @param {String} [separate] 默认值为','
	 * @return {Array}
	 */
	parse : function(str, separate) {
		var separate = ',' || separate;
		return (str && str.split(separate)) || [str]
	},
	/**
	 * 过滤满足条件的数组元素
	 * @param {Array}
	 * @param {Function} 方法传入三个参数，当前元素，当前元素索引，数组
	 * @return {Array}
	 */
	filter : function(ary, compare) {
		var re = [];
		$kit.each(ary, function(o, i, ary) {
			if(compare(o, i, ary)) {
				re.push(o);
			}
		});
		return re;
	},
	/**
	 * 返回指定元素在数组的第几个，从0开始
	 * @param {Array}
	 * @param {Object}
	 * @return {Number}
	 */
	indexOf : function(ary, obj) {
		var index = -1;
		if(obj != null) {
			$kit.each(ary, function(o, idx) {
				if(obj == o) {
					index = idx;
					return false;
				}
			});
		}
		return index;
	},
	/**
	 * 克隆一个新的数组
	 * @param {Array}
	 * @param {Array}
	 */
	clone : function(ary) {
		var re = [];
		$kit.each(ary, function(o) {
			re.push(o);
		});
		return re;
	},
	/**
	 * 删除数组中空的元素
	 * @param {Array}
	 * @return {Array}
	 */
	delEmpty : function(ary) {
		for(var i = 0; i < ary.length; ) {
			if(ary[i] == '' || ary[i] == null) {
				ary.splice(i, 1);
			} else {
				i++;
			}
		}
		return ary;
	},
	/**
	 * 删除重复元素，不保证顺序
	 * @param {Array}
	 * @return {Array}
	 */
	rmRepeat : function(ary) {
		var tmp = {}, re = [];
		$kit.each(ary, function(o) {
			tmp[o] = 1;
		});
		for(var o in tmp) {
			re.push(o);
		}
		return re;
	}
};
/**
 * $Kit.Array实例，直接通过这个实例访问$Kit.Array所有方法
 * @global
 * @type $Kit.Array
 * @name $kit.array
 * @alias $kit.ary
 */
$kit.ary = $kit.array = new $Kit.Array();
