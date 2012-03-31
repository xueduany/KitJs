/**
 * 树状字典
 */
var TreeDict = function(config) {
	var me = this;
	me.config = $kit.join(arguments.callee.defaultConfig, config);
	me.size = 0;
	me.deep = me.config.deep;
	me.data = {};
}
TreeDict.defaultConfig = {
	deep : 10, //嵌套深度，此参数影响词典内存对象大小，也影响search索引性能
	data : undefined
}
TreeDict.prototype = {
	/**
	 * 判断是否存在
	 */
	hs : function(key) {
		var key = key || null, me = this;
		if(key == null) {
			var beginIndex = 0, recurDeep = 0, //
			lookfor = me.data, index, lastLookfor, find;
			while(beginIndex < key.length) {
				if(recurDeep < me.deep - 1) {
					index = key.substring(beginIndex, beginIndex + 1);
					find = lookfor[index];
				} else {
					index = key.substring(beginIndex);
					find = lookfor[index];
				}
				if($kit.isEmpty(find)) {
					return false;
				} else {
					if(beginIndex == key.length - 1 || recurDeep == me.deep - 1) {
						return true;
					}
				}
				lookfor = find;
				beginIndex++;
				recurDeep++;
			}
			return false;
		}
	},
	/**
	 * 添加
	 */
	ad : function(key, value) {
		var value = value || null;
		var key = key || null;
		var me = this;
		if(key == null || value == null) {
			return;
		}
		var beginIndex = 0, recurDeep = 0, //
		lookfor = me.data, index, lastLookfor, find;
		while(beginIndex < key.length) {
			if(recurDeep < me.deep - 1) {
				index = key.substring(beginIndex, beginIndex + 1);
				find = lookfor[index];
			} else {
				index = key.substring(beginIndex);
				find = lookfor[index];
			}
			if($kit.isEmpty(find)) {//如果找不到key了
				if(beginIndex == key.length - 1 || recurDeep == me.deep - 1) {
					find = lookfor[index] = value;
				} else {
					find = lookfor[index] = {};
				}
			} else {
				if(beginIndex == key.length - 1 || recurDeep == me.deep - 1) {
					find = value;
				}
			}
			lookfor = find;
			beginIndex++;
			recurDeep++;
		}
	},
	/**
	 * 删除
	 */
	rm : function(key) {
		var key = key || null;
		var me = this;
		if(key == null) {
			return;
		}
		var beginIndex = 0, recurDeep = 0, //
		lookfor = me.data, index, lastLookfor, find;
		while(beginIndex < key.length) {
			if(recurDeep < me.deep - 1) {
				index = key.substring(beginIndex, beginIndex + 1);
				find = lookfor[index];
			} else {
				index = key.substring(beginIndex);
				find = lookfor[index];
			}
			if($kit.isEmpty(find)) {
				return false;
			} else {
				if(beginIndex == key.length - 1 || recurDeep == me.deep - 1) {
					delete lookfor[index];
				}
			}
			lookfor = find;
			beginIndex++;
			recurDeep++;
		}
	},
	/**
	 * 存放数据总数
	 */
	size : function() {
		this.size = this.count(0, this.data);
		return this.size;
	},
	count : function(size, o) {
		size = size || 0;
		for(var p in o) {
			if($kit.isStr(o[p])) {
				size++;
			} else {
				size += this.count(size, o[p]);
			}
		}
		return size;
	},
	/**
	 * 从字典中取出符合key的value值
	 */
	get : function(key) {
		var value = value || null;
		var key = key || null;
		var me = this;
		if(key == null) {
			return;
		}
		var beginIndex = 0, recurDeep = 0, //
		lookfor = me.data, index, lastLookfor, find;
		while(beginIndex < key.length) {
			if(recurDeep < me.deep - 1) {
				index = key.substring(beginIndex, beginIndex + 1);
				find = lookfor[index];
			} else {
				index = key.substring(beginIndex);
				find = lookfor[index];
			}
			if($kit.isEmpty(find)) {//如果找不到key了
				return null;
			} else {
				if(beginIndex == key.length - 1 || recurDeep == me.deep - 1) {
					return find;
				}
			}
			lookfor = find;
			beginIndex++;
			recurDeep++;
		}
		return null;
	},
	/**
	 * 按首字符匹配原则查询，返回
	 * [{key: 'key', value: 'value'}, {key: 'key', value: 'value'}]格式数组
	 */
	search : function(key) {
		var value = value || null;
		var key = key || null;
		var me = this;
		if(key == null || key == '') {
			var re = [];
			me.travel(me.data, re);
			return re;
		}
		var beginIndex = 0, recurDeep = 0, //
		lookfor = me.data, index, lastLookfor, find;
		var keyArray = [];
		while(beginIndex < key.length) {
			if(recurDeep < me.deep - 1) {
				index = key.substring(beginIndex, beginIndex + 1);
				find = lookfor[index];
			} else {
				index = key.substring(beginIndex);
				find = lookfor[index];
			}
			if($kit.isEmpty(find)) {//如果找不到key了
				return null;
			} else {
				keyArray.push(index);
				if(beginIndex == key.length - 1 || recurDeep == me.deep - 1) {
					break;
				}
			}
			lookfor = find;
			beginIndex++;
			recurDeep++;
		}
		var re = [];
		var beginData;
		beginData = me.data[keyArray[0]];
		for(var i = 1; i < keyArray.length; i++) {
			beginData = beginData[keyArray[i]];
		}
		me.travel(beginData, re, keyArray.join(''));
		return re;
	},
	travel : function(tree, array, key) {
		if(tree == null) {
			return;
		}
		key = key || '';
		array = array || [];
		if($kit.isStr(tree)) {
			array.push({
				key : key,
				value : tree
			});
		} else {
			for(var k in tree) {
				this.travel(tree[k], array, key + k);
			}
		}
	}
};
$kit.TreeDict = TreeDict;
