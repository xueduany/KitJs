/**
 * 简单编辑器
 * @class $kit.ui.Editor.SimpleEditor
 * @extends $kit.ui.Editor
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Editor/simpleeditor.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/SimpleEditor/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/SimpleEditor/demo.png">
 */
$kit.ui.Editor.SimpleEditor = function(config) {
	var me = this;
	$kit.inherit({
		child : $kit.ui.Editor.SimpleEditor,
		father : $kit.ui.Editor
	});
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.Editor.SimpleEditor,
/**
 * @lends $kit.ui.Editor.SimpleEditor
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		kitWidgetName : "kitSimpleEditor",
		el : undefined,
		template : {
			editorHTML : [//
			'<div class="${editorCommandCls}">', //
			'<button class="${editorCommandPrefixCls}bold">加粗</button>', //
			'<button class="${editorCommandPrefixCls}highlight">高亮</button>', //
			'<button class="${editorCommandPrefixCls}italic ">斜体</button>', //
			'</div>', //
			'<div class="${editorContentCls}">', //
			'<iframe class="${editorIframeCls}"></iframe>', //
			'</div>' //
			].join(''),
			editorCommandCls : 'kitjs-editor-command',
			editorWrapperCls : 'kitjs-editor-wrapper',
			editorCommandPrefixCls : 'editor-command-',
			editorContentCls : 'kitjs-editor-content',
			editorSourceCls : 'kitjs-editor-source',
			editorIframeCls : 'kitjs-editor-iframe'
		}
	}
});
$kit.merge($kit.ui.Editor.SimpleEditor.prototype,
/**
 * @lends $kit.ui.Editor.SimpleEditor.prototype
 */
{
	/**
	 * 初始化
	 */
	build : function() {
		var me = this;
		var editorHTML = $kit.tpl(me.config.template.editorHTML, me.config.template);
		var wrapper = document.createElement('div');
		wrapper.className = me.config.template.editorWrapperCls;
		me.wrapper = wrapper;
		$kit.rpEl(me.config.el, wrapper);
		wrapper.innerHTML = editorHTML;
		me._intervalIframeReadyCount = 0;
		me._intervalIframeReady = setInterval(function() {
			me._intervalIframeReadyCount++;
			var editorIframe = $kit.el8cls(me.config.template.editorIframeCls, wrapper);
			me.editorIframe = editorIframe;
			if(me._intervalIframeReadyCount > 10000) {
				clearInterval(me._intervalIframeReady);
			}
			if(!$kit.isEmpty(me.editorIframe.contentWindow)) {
				clearInterval(me._intervalIframeReady);
				me.doc = editorIframe.contentWindow.document;
				me.doc.designMode = 'on';
				me.doc.contentEditable = true;
				me.doc.compatMode = 'CSS1Compat';
				$kit.css(me.doc.body, {
					margin : 0,
					padding : 0,
					width : editorIframe.offsetWidth - 20 - $kit.css(editorIframe, 'border-width'),
					'overflowX' : 'hidden',
					'overflowY' : 'auto',
					'word-wrap' : 'break-word',
					'word-break' : 'break-all'
				})
			}
		}, 300);
		me.editorCommand = $kit.el8cls(me.config.template.editorCommandCls, wrapper);
		$kit.ev({
			el : me.editorCommand,
			ev : 'click',
			fn : function(e) {
				var el = e.target;
				if(el.tagName && el.tagName.toLowerCase() == 'button') {
					var command = $kit.dom.getClassNameByPrefix(el, me.config.template.editorCommandPrefixCls).substring(me.config.template.editorCommandPrefixCls.length);
					me.excuteCommand(command);
				}
			},
			scope : me
		})
	},
	/**
	 * 执行命令
	 * @param {String}
	 */
	excuteCommand : function(command) {
		var me = this;
		if(command == 'bold') {
			me.doc.execCommand('bold', false, null);
		} else if(command == 'highlight') {
			me.doc.execCommand('backcolor', false, 'orange');
			me.doc.execCommand('forecolor', false, 'white');
		} else if(command == 'italic') {
			me.doc.execCommand('italic', false, null);
		}
	}
});
