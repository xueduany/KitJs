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
		var settting = $kit.merge(defaultSetting, settting);
		for(var i = 0; i < ary.length; i++) {
			var o = ary[i];
			if(o.toString() == check.toString()//
			|| (settting.ignoreCase && o.toString.toLowerCase() == check.toString().toLowerCase())) {
				return true;
			}
		}
		return false;
	},
	/**
	 * 添加元素
	 */
	ad : function(ary, add, settting) {
		var me = this;
		if(!$kit.isAry(ary)) {
			return;
		}
		var defaultSetting = {
			ifExisted : false,
			ignoreCase : false
		}
		var settting = $kit.merge(defaultSetting, settting);
		if($kit.isAry(add)) {
			for(var i = 0; i < add.length; i++) {
				me.ad(ary, add[i], settting);
			}
		} else {
			if(settting.ifExisted && ary.length > 0) {
				for(var i = 0; i < ary.length; i++) {
					var o = ary[i];
					if(o.toString() == add.toString()//
					|| (settting.ignoreCase && o.toString.toLowerCase() == add.toString().toLowerCase())) {
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
	rm : function(ary, del, settting) {
		var me = this;
		if(!$kit.isAry(ary)) {
			return;
		}
		var defaultSetting = {
			ignoreCase : false,
			isGlobal : true
		}
		var settting = $kit.merge(defaultSetting, settting);
		if($kit.isAry(add)) {
			for(var i = 0; i < add.length; i++) {
				me.rm(ary, add[i], settting);
			}
		} else {
			for(var i = 0; i < ary.length; i++) {
				var o = ary[i];
				if(o.toString() == add.toString()//
				|| (settting.ignoreCase && o.toString.toLowerCase() == add.toString().toLowerCase())) {
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
	}
};
$kit.ary = $kit.array = new $Kit.Array();
