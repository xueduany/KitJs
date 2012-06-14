/**
 * 文本扩展
 * @class $Kit.String
 * @requires kit.js
 * @requires math.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/string.js">Source code</a>
 */
$Kit.String = function() {
	this.ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';
	this.specialChar = {
		'\b' : '\\b',
		'\t' : '\\t',
		'\n' : '\\n',
		'\f' : '\\f',
		'\r' : '\\r',
		'\\' : '\\\\'
	}
}
$kit.merge($Kit.String.prototype,
/**
 * @lends $Kit.String.prototype
 */
{
	/**
	 * 断句
	 * @param {String}
	 * @return {String}
	 */
	breakSentence : function(str) {
		return str.replace(/([,\.\?!;:][\s"'’”)])(\n?)/g, '$1\n');
	},
	/**
	 * HTML字符串转移，如&转移为&amp;保证可以在页面显示html代码，而不是实际内容
	 * @param {String}
	 * @return {String}
	 */
	HTMLEncode : function(str) {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\'/g, '&#39;').replace(/\"/g, '&quot;');
	},
	/**
	 * 解码转义过的html
	 * @param {String}
	 * @return {String}
	 */
	HTMLDecode : function(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;'/g, '\'').replace(/&quot/g, '"');
	},
	/**
	 * gb2312转换unicode进制
	 * @param {String}
	 * @return {String}
	 */
	ChineseToUnicode : function(str) {
		return escape(str).replace(/%u/g, '\\u').replace(/%([0-9a-f]{2})/ig, '\\u00$1');
	},
	/**
	 * unicode进制转换gb2312
	 * @param {String}
	 * @return {String}
	 */
	UnicodeToChinese : function(str) {
		return unescape(str.replace(/\\u00/g, '%').replace(/\\u/g, '%u'));
	},
	/**
	 * &#xxx;转义中文
	 * @param {String}
	 * @return {String}
	 */
	HTMLEntityToChinese : function(str) {
		var regExp = /&#([0-9]+);/ig;
		while(str.match(regExp) && str.match(regExp).length) {
			var find = str.match(regExp)[0];
			str = str.replace(find, String.fromCharCode(find.substring(2, find.length - 1)));
		}
		return str;
	},
	/**
	 * 中文转html实体
	 * @param {String}
	 * @return {String}
	 */
	ChineseToHTMLEntity : function(str) {
		var re = [];
		for(var i = 0; i < str.length; i++) {
			var charCode = str.charCodeAt(i);
			re.push('&#' + charCode + ';');
		}
		return re.join('');
	},
	/**
	 * html实体字符&#xxx;转换unicode
	 * @param {String}
	 * @return {String}
	 */
	HTMLEntityToUnicode : function(str) {
		var regExp = /&#([0-9]+);/ig;
		while(str.match(regExp) && str.match(regExp).length) {
			var find = str.match(regExp)[0];
			var code = find.substring(2, find.length - 1);
			str = str.replace(find, '\\u' + $kit.math.padZero($kit.math.convert(code, 10, 16), 4));
		}
		return str;
	},
	/**
	 * unicode转html实体
	 * @param {String}
	 * @return {String}
	 */
	UnicodeToHTMLEntity : function(str) {
		var regExp = /\\u([0-9a-f]+)/ig;
		while(str.match(regExp) && str.match(regExp).length) {
			var find = str.match(regExp)[0];
			var code = find.substring(2);
			str = str.replace(find, '&#' + $kit.math.convert(code, 16, 10) + ';');
		}
		return str;
	},
	/**
	 * convert方法 统一接口
	 * @param {String}
	 * @param {String}
	 * @param {String}
	 * @return {String}
	 */
	convert : function(str, oldEncoding, newEncoding) {
		switch (oldEncoding.toLowerCase()) {
			case 'unicode':
			case 'utf':
				switch (newEncoding.toLowerCase()) {
					case 'gbk':
					case 'gb2312':
					case 'gb':
					case 'chinese':
						return this.UnicodeToChinese(str);
						break;
					case 'htmlentity':
					case 'entity':
						return this.UnicodeToHTMLEntity(str);
						break;
				}
				break;
			case 'gbk':
			case 'gb2312':
			case 'gb':
			case 'chinese':
				switch (newEncoding.toLowerCase()) {
					case 'unicode':
					case 'utf':
						return this.ChineseToUnicode(str);
						break;
					case 'htmlentity':
					case 'entity':
						return this.ChineseToHTMLEntity(str);
						break;
				}
				break;
			case 'htmlentity':
			case 'entity':
				switch (newEncoding.toLowerCase()) {
					case 'gbk':
					case 'gb2312':
					case 'gb':
					case 'chinese':
						return this.HTMLEntityToChinese(str);
						break;
					case 'unicode':
					case 'utf':
						return this.HTMLEntityToUnicode(str);
						break;
				}
				break;
		}
	},
	/**
	 * 首尾去空格
	 * @param {String}
	 * @return {String}
	 */
	strip : function(str) {
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	},
	/**
	 * 左去空
	 * @param {String}
	 * @return {String}
	 */
	ltrim : function(str) {
		return str.replace(/^\s+/, '');
	},
	/**
	 * 右去空
	 * @param {String}
	 * @return {String}
	 */
	rtrim : function(str) {
		return str.replace(/\s+$/, '');
	},
	/**
	 * 去掉所有的tag标记
	 * @param {String}
	 * @param {String}
	 */
	stripTags : function(str) {
		return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	},
	/**
	 * 去除脚本代码
	 * @param {String}
	 * @return {String}
	 */
	stripScripts : function(str) {
		return this.replace(new RegExp(this.ScriptFragment, 'img'), '');
	},
	/**
	 * 找出脚本代码，将结果放在一个数组中
	 * @param {String}
	 * @return {Array}
	 */
	extractScripts : function(str) {
		var matchAll = new RegExp(this.ScriptFragment, 'img'), matchOne = new RegExp(this.ScriptFragment, 'im'), re = [];
		$kit.each((str.match(matchAll) || []), function(scriptTag) {
			re.push((scriptTag.match(matchOne) || ['', ''])[1]);
		});
		return re;
	},
	/**
	 * Check if the string contains a substring.
	 * @param {String}
	 * @return {Boolean}
	 */
	include : function(str, pattern) {
		return str.indexOf(pattern) > -1;
	},
	/**
	 * Checks if the string starts with substring.
	 * @param {String}
	 * @return {Boolean}
	 * @example
	 * 'Prototype JavaScript'.startsWith('Pro');//-> true
	 */
	startsWith : function(str, pattern) {
		return str.lastIndexOf(pattern, 0) === 0;
	},
	/**
	 * Checks if the string ends with substring.
	 * @param {String}
	 * @return {Boolean}
	 * @example
	 * 'slaughter'.endsWith('laughter')// -> true
	 */
	endsWith : function(str, pattern) {
		var d = str.length - pattern.length;
		return d >= 0 && str.indexOf(pattern, d) === d;
	},
	/**
	 * Converts a string separated by dashes into a camelCase equivalent. For instance, 'foo-bar' would be converted to 'fooBar'.
	 * @param {String}
	 * @return {String}
	 * @example
	 * 'background-color'.camelize();// -> 'backgroundColor'
	 * '-moz-binding'.camelize();// -> 'MozBinding'
	 */
	camelize : function(str) {
		return str.replace(/-+(.)?/g, function(match, chr) {
			return chr ? chr.toUpperCase() : '';
		});
	},
	/**
	 * Capitalizes the first letter of a string and downcases all the others.
	 * @param {String}
	 * @return {String}
	 * @example
	 * 'hello'.capitalize();// -> 'Hello'
	 * 'HELLO WORLD!'.capitalize();// -> 'Hello world!'
	 */
	capitalize : function(str) {
		return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	},
	/**
	 * Converts a camelized string into a series of words separated by an underscore ("_").
	 * @param {String}
	 * @return {String}
	 */
	underscore : function(str) {
		return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
	},
	/**
	 * Replaces every instance of the underscore character ("_") by a dash ("-").
	 * @param {String}
	 * @return {String}
	 * @example
	 * 'border_bottom_width'.dasherize();// -> 'border-bottom-width'
	 * Note:
	 * Used in conjunction with String#underscore, String#dasherize converts a DOM style into its CSS equivalent.
	 * 'borderBottomWidth'.underscore().dasherize();// -> 'border-bottom-width'
	 */
	dasherize : function(str) {
		return str.replace(/_/g, '-');
	},
	/**
	 * Check if the string is 'blank', meaning either empty or containing only whitespace.
	 * @param {String}
	 * @return {Boolean}
	 * @example
	 * ''.blank();//-> true
	 * '  '.blank();//-> true
	 * ' a '.blank();//-> false
	 */
	blank : function(str) {
		return /^\s*$/.test(str);
	},
	/**
	 * Checks if the string is empty.
	 * @param {String}
	 * @return {Boolean}
	 * @example
	 * ''.empty();//-> true
	 * '  '.empty();//-> false
	 */
	empty : function(str) {
		return str == '';
	},
	/**
	 * Returns a debug-oriented version of the string (i.e. wrapped in single or double quotes, with backslashes and quotes escaped).
	 * @param {String}
	 * @return {Boolean}
	 * @example
	 * 'I\'m so happy.'.inspect();
	 * // -> '\'I\\\'m so happy.\'' (displayed as 'I\'m so happy.' in an alert dialog or the console)
	 * 'I\'m so happy.'.inspect(true);
	 * // -> '"I'm so happy."'  (displayed as "I'm so happy." in an alert dialog or the console)
	 */
	inspect : function(str, useDoubleQuotes) {
		var escapedString = str.replace(/[\x00-\x1f\\]/g, function(character) {
			if( character in this.specialChar) {
				return this.specialChar[character];
			}
			var c = character.charCodeAt();
			return '\\u00' + $kit.math.padZero(c.toString(16), 2);
		});
		if(useDoubleQuotes)
			return '"' + escapedString.replace(/"/g, '\\"') + '"';
		return "'" + escapedString.replace(/'/g, '\\\'') + "'";
	},
	/**
	 * 在字符串中指定位置插入字符串
	 * @param {String}
	 * @param {Number}
	 * @param {String}
	 * @return {String}
	 */
	insert : function(str, pos, insertString) {
		var a = str.split('');
		a.splice(pos, 0, insertString);
		return a.join('');
	}
});
/**
 * $Kit.String的实例，直接通过这个实例访问$Kit.String所有方法
 * @global
 * @alias $kit.str
 * @type $Kit.String
 */
$kit.str = $kit.string = new $Kit.String();
