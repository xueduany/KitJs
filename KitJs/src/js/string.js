/**
 * 文本扩展
 */
$Kit.String = function() {
	//
}
$Kit.String.prototype = {
	/**
	 * 断句
	 */
	breakSentence : function(str) {
		return str.replace(/([,\.\?!;:][\s"'’”)])(\n?)/g, '$1\n');
	},
	HTMLEncode : function(str) {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;').replace(/\'/g, '&#39;').replace(/\"/g, '&quot;');
	},
	HTMLDecode : function(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;'/g, '\'').replace(/&quot/g, '"');
	},
	/**
	 * gb2312转换unicode16进制
	 */
	ChineseToUnicode : function(str) {
		return escape(str).replace(/%u/g, '\\u').replace(/%([0-9a-f]{2})/ig, '\\u00$1');
	},
	UnicodeToChinese : function(str) {
		return unescape(str.replace(/\\u00/g, '%').replace(/\\u/g, '%u'));
	},
	/**
	 * &#xxx;转义中文
	 */
	HTMLEntityToChinese : function(str) {
		var regExp = /&#([0-9]+);/ig;
		while(str.match(regExp) && str.match(regExp).length) {
			var find = str.match(regExp)[0];
			str = str.replace(find, String.fromCharCode(find.substring(2, find.length - 1)));
		}
		return str;
	},
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
	}
};
$kit.str = $kit.string = new $Kit.String();
