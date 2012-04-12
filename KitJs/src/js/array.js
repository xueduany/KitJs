/**
 * 数组扩展
 */
$Kit.Array = function() {
	//
}
$Kit.Array.prototype = {
	SORT_ASC : function(left, right) {
		return left - right;
	},
	SORT_DESC : function(left, right) {
		return right - left;
	},
	/**
	 * check if existed
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
			if(o.toString() == check.toString()//
			|| (setting.ignoreCase && o.toString().toLowerCase() == check.toString().toLowerCase())) {
				return true;
			}
		}
		return false;
	},
	/**
	 * 添加元素
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
			if(setting.ifExisted) {
				for(var i = 0; i < ary.length; i++) {
					var o = ary[i];
					if(o.toString() == add.toString()//
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
	 * 删除元素
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
				if(o.toString() == del.toString()//
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
	 */
	get : function(ary, validateFn, scope) {
		var scope = scope || window;
		for(var i = 0; i < ary.length; i++) {
			if(validateFn.call(scope, ary[i], i, ary) == true) {
				return ary[i];
			}
		}
	},
	getTextBeginWith : function(ary, beginWithText) {
		var me = this;
		return me.get(ary, function(o) {
			if(o.indexOf(beginWithText) == 0) {
				return true;
			}
		});
	},
	/**
	 * 转换
	 */
	parse : function(str, separate) {
		var separate = ',' || separate;
		return (str && str.split(separate)) || [str]
	},
	/**
	 * 过滤满足条件的数组元素
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
	}
};
$kit.ary = $kit.array = new $Kit.Array();
