/**
 * KitJs文件上传组件
 *
 * Modify from:
 *
 * http://github.com/valums/file-uploader
 *
 * Multiple file upload component with progress-bar, drag-and-drop.
 * © 2010 Andrew Valums ( andrew(at)valums.com )
 *
 * Licensed under GNU GPL 2 or later and GNU LGPL 2 or later
 */

//
// Helper functions
//
/**
 * @namespace $kit.ui.Upload
 */
$kit.ui.Upload = {};

$kit.ui.Upload.getUniqueId = (function() {
	var id = 0;
	return function() {
		return id++;
	};
})();

//
// obj2url() takes a json-object as argument and generates
// a querystring. pretty much like jQuery.param()
//
// how to use:
//
//    `$kit.ui.Upload.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
//
// will result in:
//
//    `http://any.url/upload?otherParam=value&a=b&c=d`
//
// @param  Object JSON-Object
// @param  String current querystring-part
// @return String encoded querystring
//
$kit.ui.Upload.obj2url = function(obj, temp, prefixDone) {
	var uristrings = [], prefix = '&', add = function(nextObj, i) {
		var nextTemp = temp ? (/\[\]$/.test(temp))// prevent double-encoding
		? temp : temp + '[' + i + ']' : i;
		if((nextTemp != 'undefined') && (i != 'undefined')) {
			uristrings.push(( typeof nextObj === 'object') ? $kit.ui.Upload.obj2url(nextObj, nextTemp, true) : (Object.prototype.toString.call(nextObj) === '[object Function]') ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj()) : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj));
		}
	};
	if(!prefixDone && temp) {
		prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
		uristrings.push(temp);
		uristrings.push($kit.ui.Upload.obj2url(obj));
	} else if((Object.prototype.toString.call(obj) === '[object Array]') && ( typeof obj != 'undefined')) {
		// we wont use a for-in-loop on an array (performance)
		for(var i = 0, len = obj.length; i < len; ++i) {
			add(obj[i], i);
		}
	} else if(( typeof obj != 'undefined') && (obj !== null) && ( typeof obj === "object")) {
		// for anything else but a scalar, we will use for-in-loop
		for(var i in obj) {
			add(obj[i], i);
		}
	} else {
		uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
	}

	return uristrings.join(prefix).replace(/^&/, '').replace(/%20/g, '+');
};
//
// Creates upload button, validates upload, but doesn't create file list or dd.
//
$kit.ui.Upload.FileUploaderBasic = function(o) {
	this._options = {
		// set to true to see the server response
		debug : false,
		action : '/server/upload',
		params : {},
		button : null,
		multiple : true,
		maxConnections : 3,
		// validation
		allowedExtensions : [],
		sizeLimit : 0,
		minSizeLimit : 0,
		// events
		// return false to cancel submit
		onSubmit : function(id, fileName) {
		},
		onProgress : function(id, fileName, loaded, total) {
		},
		onComplete : function(id, fileName, responseJSON) {
		},
		onCancel : function(id, fileName) {
		},
		// messages
		messages : {
			//typeError : "{file} has invalid extension. Only {extensions} are allowed.",
			typeError : "{file}文件扩展名无效。只有{extensions}允许上传。",
			//sizeError : "{file} is too large, maximum file size is {sizeLimit}.",
			sizeError : "{file}文件过大，最大允许上传文件大小为{sizeLimit}。",
			//minSizeError : "{file} is too small, minimum file size is {minSizeLimit}.",
			minSizeError : "{file}文件过小，上传文件最小必须超过{minSizeLimit}。",
			//emptyError : "{file} is empty, please select files again without it.",
			emptyError : "{file}为空，请重新选择。",
			//onLeave : "The files are being uploaded, if you leave now the upload will be cancelled."
			onLeave : "文件正在被上传，如果你现在离开，上传将终止！"
		},
		showMessage : function(message) {
			alert(message);
		}
	};
	$kit.merge(this._options, o);

	// number of files being uploaded
	this._filesInProgress = 0;
	this._handler = this._createUploadHandler();

	if(this._options.button) {
		this._button = this._createUploadButton(this._options.button);
	}

	this._preventLeaveInProgress();
};

$kit.ui.Upload.FileUploaderBasic.prototype = {
	setParams : function(params) {
		this._options.params = params;
	},
	getInProgress : function() {
		return this._filesInProgress;
	},
	_createUploadButton : function(element) {
		var self = this;

		return new $kit.ui.Upload.UploadButton({
			element : element,
			multiple : this._options.multiple && $kit.ui.Upload.UploadHandlerXhr.isSupported(),
			onChange : function(input) {
				self._onInputChange(input);
			}
		});
	},
	_createUploadHandler : function() {
		var self = this, handlerClass;

		if($kit.ui.Upload.UploadHandlerXhr.isSupported()) {
			handlerClass = 'UploadHandlerXhr';
		} else {
			handlerClass = 'UploadHandlerForm';
		}

		var handler = new $kit.ui.Upload[handlerClass]({
			debug : this._options.debug,
			action : this._options.action,
			maxConnections : this._options.maxConnections,
			onProgress : function(id, fileName, loaded, total) {
				self._onProgress(id, fileName, loaded, total);
				self._options.onProgress(id, fileName, loaded, total);
			},
			onComplete : function(id, fileName, result) {
				self._onComplete(id, fileName, result);
				self._options.onComplete(id, fileName, result);
			},
			onCancel : function(id, fileName) {
				self._onCancel(id, fileName);
				self._options.onCancel(id, fileName);
			}
		});

		return handler;
	},
	_preventLeaveInProgress : function() {
		var self = this;

		$kit.ev({
			el : window,
			ev : 'beforeunload',
			fn : function(e) {
				if(!self._filesInProgress) {
					return;
				}

				var e = e || window.event;
				// for ie, ff
				e.returnValue = self._options.messages.onLeave;
				// for webkit
				return self._options.messages.onLeave;
			}
		});
	},
	_onSubmit : function(id, fileName) {
		this._filesInProgress++;
	},
	_onProgress : function(id, fileName, loaded, total) {
	},
	_onComplete : function(id, fileName, result) {
		this._filesInProgress--;
		if(result.error) {
			this._options.showMessage(result.error);
		}
	},
	_onCancel : function(id, fileName) {
		this._filesInProgress--;
	},
	_onInputChange : function(input) {
		if(this._handler instanceof $kit.ui.Upload.UploadHandlerXhr) {
			this._uploadFileList(input.files);
		} else {
			if(this._validateFile(input)) {
				this._uploadFile(input);
			}
		}
		this._button.reset();
	},
	_uploadFileList : function(files) {
		for(var i = 0; i < files.length; i++) {
			if(!this._validateFile(files[i])) {
				return;
			}
		}

		for(var i = 0; i < files.length; i++) {
			this._uploadFile(files[i]);
		}
	},
	_uploadFile : function(fileContainer) {
		var id = this._handler.add(fileContainer);
		var fileName = this._handler.getName(id);

		if(this._options.onSubmit(id, fileName) !== false) {
			this._onSubmit(id, fileName);
			this._handler.upload(id, this._options.params);
		}
	},
	_validateFile : function(file) {
		var name, size;

		if(file.value) {
			// it is a file input
			// get input value and remove path to normalize
			name = file.value.replace(/.*(\/|\\)/, "");
		} else {
			// fix missing properties in Safari
			name = file.fileName != null ? file.fileName : file.name;
			size = file.fileSize != null ? file.fileSize : file.size;
		}

		if(!this._isAllowedExtension(name)) {
			this._error('typeError', name);
			return false;

		} else if(size === 0) {
			this._error('emptyError', name);
			return false;

		} else if(size && this._options.sizeLimit && size > this._options.sizeLimit) {
			this._error('sizeError', name);
			return false;

		} else if(size && size < this._options.minSizeLimit) {
			this._error('minSizeError', name);
			return false;
		}

		return true;
	},
	_error : function(code, fileName) {
		var message = this._options.messages[code];
		function r(name, replacement) {
			message = message.replace(name, replacement);
		}

		r('{file}', this._formatFileName(fileName));
		r('{extensions}', this._options.allowedExtensions.join(', '));
		r('{sizeLimit}', this._formatSize(this._options.sizeLimit));
		r('{minSizeLimit}', this._formatSize(this._options.minSizeLimit));

		this._options.showMessage(message);
	},
	_formatFileName : function(name) {
		if(name.length > 33) {
			name = name.slice(0, 19) + '...' + name.slice(-13);
		}
		return name;
	},
	_isAllowedExtension : function(fileName) {
		var ext = (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
		var allowed = this._options.allowedExtensions;

		if(!allowed.length) {
			return true;
		}

		for(var i = 0; i < allowed.length; i++) {
			if(allowed[i].toLowerCase() == ext) {
				return true;
			}
		}

		return false;
	},
	_formatSize : function(bytes) {
		var i = -1;
		do {
			bytes = bytes / 1024;
			i++;
		} while (bytes > 99);

		return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
	}
};

//
// Class that creates upload widget with drag-and-drop and file list
// @inherits $kit.ui.Upload.FileUploaderBasic
//
/**
 * 文件上传组件
 * @class $kit.ui.Upload.FileUploader
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @requires array.js
 * @param {Object} config 组件配置
 * @param {Element} config.element 初始化哪一块div为上传组件
 * @param {String} config.action 接收上传文件的后台API接口地址
 * @param {[String]} [config.allowedExtensions] 允许上传的文件扩展名，如allowedExtensions : ['txt','exe'],
 * @param {Number} [config.sizeLimit] 最大上传文件大小，sizeLimit: 0, // max size
 * @param {Number} [config.minSizeLimit] 最小上传文件大小，minSizeLimit: 0, // min size
 * @param {Function} [config.onSubmit] 提交时事件，传入两个参数function(id, fileName)
 * @param {Function} [config.onComplete] 上传完毕事件，传入三个参数function(id, fileName, responseJSON)
 * @param {Function} [config.onProgress] 上传过程事件，传入三个参数function(id, fileName, loaded, total){}
 * @param {Function} [config.onCancel] 取消事件，function(id, fileName){}
 * @param {Accept} [config.accept] input file接受上传的文件类型筛选，可能部分浏览器支持不好
 * @param {Map} [config.message] 自定义错误信息，see $kit.ui.Upload.FileUploaderBasic for content
 * @param {Function} [config.showMessage] 报错方法，showMessage: function(message){ alert(message); }
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Upload/upload.js">Source code</a>
 */
$kit.ui.Upload.FileUploader = function(o) {
	// call parent constructor
	$kit.ui.Upload.FileUploaderBasic.apply(this, arguments);

	// additional options
	$kit.merge(this._options, {
		element : null,
		// if set, will be used instead of kitjs-upload-list in template
		listElement : null,

		template : ['<div class="kitjs-uploader">', //
		'<div class="kitjs-upload-drop-area"><span>把文件拖到这里开始上传!</span></div>', //
		'<div class="kitjs-upload-button"><div class="tips">上传文件</div></div>', //
		'<ul class="kitjs-upload-list"></ul>', //
		'</div>'].join(''),

		// template for one item in file list
		fileTemplate : ['<li>', //
		'<span class="kitjs-upload-file"></span>', //
		'<span class="kitjs-upload-spinner"></span>', //
		'<span class="kitjs-upload-size"></span>', //
		'<a class="kitjs-upload-cancel" href="#">取消</a>', //
		'<span class="kitjs-upload-failed-text">上传失败</span>', //
		'</li>'].join(''),

		classes : {
			// used to get elements from templates
			button : 'kitjs-upload-button',
			drop : 'kitjs-upload-drop-area',
			dropActive : 'kitjs-upload-drop-area-active',
			list : 'kitjs-upload-list',

			file : 'kitjs-upload-file',
			spinner : 'kitjs-upload-spinner',
			size : 'kitjs-upload-size',
			cancel : 'kitjs-upload-cancel',

			// added to list item when upload completes
			// used in css to hide progress spinner
			success : 'kitjs-upload-success',
			fail : 'kitjs-upload-fail'
		}
	});
	// overwrite options with user supplied
	$kit.merge(this._options, o);

	this._element = this._options.element;
	this._element.innerHTML = this._options.template;
	this._listElement = this._options.listElement || this._find(this._element, 'list');

	this._classes = this._options.classes;

	this._button = this._createUploadButton(this._find(this._element, 'button'));
	if(this._options.accept) {
		$kit.attr(this._button._input, 'accept', this._options.accept);
	}

	this._bindCancelEvent();
	this._setupDragDrop();
};
// inherit from Basic Uploader
$kit.merge($kit.ui.Upload.FileUploader.prototype, $kit.ui.Upload.FileUploaderBasic.prototype);

$kit.merge($kit.ui.Upload.FileUploader.prototype, {
	//
	// Gets one of the elements listed in this._options.classes
	//
	_find : function(parent, type) {
		var element = $kit.els8cls(this._options.classes[type], parent)[0];
		if(!element) {
			throw new Error('element not found ' + type);
		}

		return element;
	},
	_setupDragDrop : function() {
		var self = this, dropArea = this._find(this._element, 'drop');
		var _intervalClearDropArea;
		var dz = new $kit.ui.Upload.UploadDropZone({
			element : dropArea,
			onEnter : function(e) {
				$kit.adCls(dropArea, self._classes.dropActive);
				e.stopPropagation();
			},
			onLeave : function(e) {
				e.stopPropagation();
			},
			onLeaveNotDescendants : function(e) {
				clearInterval(_intervalClearDropArea);
				_intervalClearDropArea = setInterval(function() {
					$kit.each($kit.els8cls(self._options.classes['drop']), function(o) {
						o.style.display = 'none';
					});
					//dropArea.style.display = 'none';
				}, 300);
				$kit.rmCls(dropArea, self._classes.dropActive);
			},
			onDrop : function(e) {
				clearInterval(_intervalClearDropArea);
				_intervalClearDropArea = setInterval(function() {
					//dropArea.style.display = 'none';
					$kit.each($kit.els8cls(self._options.classes['drop']), function(o) {
						o.style.display = 'none';
					});
				}, 300);
				$kit.rmCls(dropArea, self._classes.dropActive);
				self._uploadFileList(e.dataTransfer.files);
			}
		});

		dropArea.style.display = 'none';

		$kit.ev({
			el : document,
			ev : 'dragover',
			fn : function(e) {
				if(!dz._isValidFileDrag(e))
					return;
				clearInterval(_intervalClearDropArea);
				dropArea.style.display = 'block';
			}
		});
		$kit.ev({
			el : document,
			ev : 'dragleave',
			fn : function(e) {
				if(!dz._isValidFileDrag(e))
					return;

				var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
				// only fire when leaving document out
				if(!relatedTarget || relatedTarget.nodeName == "HTML") {
					dropArea.style.display = 'none';
				}
			}
		});
	},
	_onSubmit : function(id, fileName) {
		$kit.ui.Upload.FileUploaderBasic.prototype._onSubmit.apply(this, arguments);
		this._addToList(id, fileName);
	},
	_onProgress : function(id, fileName, loaded, total) {
		$kit.ui.Upload.FileUploaderBasic.prototype._onProgress.apply(this, arguments);

		var item = this._getItemByFileId(id);
		var size = this._find(item, 'size');
		size.style.display = 'inline';

		var text;
		if(loaded != total) {
			text = Math.round(loaded / total * 100) + '% from ' + this._formatSize(total);
		} else {
			text = this._formatSize(total);
		}

		$kit.dom.text(size, text);
	},
	_onComplete : function(id, fileName, result) {
		$kit.ui.Upload.FileUploaderBasic.prototype._onComplete.apply(this, arguments);

		// mark completed
		var item = this._getItemByFileId(id);
		$kit.rmEl(this._find(item, 'cancel'));
		$kit.rmEl(this._find(item, 'spinner'));

		if(result.success) {
			$kit.adCls(item, this._classes.success);
		} else {
			$kit.adCls(item, this._classes.fail);
		}
	},
	_addToList : function(id, fileName) {
		var item = $kit.newHTML(this._options.fileTemplate).childNodes[0];
		item.qqFileId = id;

		var fileElement = this._find(item, 'file');
		$kit.dom.text(fileElement, this._formatFileName(fileName));
		this._find(item, 'size').style.display = 'none';

		this._listElement.appendChild(item);
	},
	_getItemByFileId : function(id) {
		var item = this._listElement.firstChild;

		// there can't be txt nodes in dynamically created list
		// and we can  use nextSibling
		while(item) {
			if(item.qqFileId == id)
				return item;
			item = item.nextSibling;
		}
	},
	//
	// delegate click event for cancel link
	//
	_bindCancelEvent : function() {
		var self = this, list = this._listElement;

		$kit.ev({
			el : list,
			ev : 'click',
			fn : function(e) {
				e = e || window.event;
				var target = e.target || e.srcElement;

				if($kit.hsCls(target, self._classes.cancel)) {
					e.stopDefault();

					var item = target.parentNode;
					self._handler.cancel(item.qqFileId);
					$kit.rmEl(item);
				}
			}
		});
	}
});

$kit.ui.Upload.UploadDropZone = function(o) {
	this._options = {
		element : null,
		onEnter : function(e) {
		},
		onLeave : function(e) {
		},
		// is not fired when leaving element by hovering descendants
		onLeaveNotDescendants : function(e) {
		},
		onDrop : function(e) {
		}
	};
	$kit.merge(this._options, o);

	this._element = this._options.element;

	this._disableDropOutside();
	this._attachEvents();
};

$kit.ui.Upload.UploadDropZone.prototype = {
	_disableDropOutside : function(e) {
		// run only once for all instances
		if(!$kit.ui.Upload.UploadDropZone.dropOutsideDisabled) {

			$kit.ev({
				el : document,
				ev : 'dragover',
				fn : function(e) {
					if(e.dataTransfer) {
						e.dataTransfer.dropEffect = 'none';
						e.preventDefault();
					}
				}
			});

			$kit.ui.Upload.UploadDropZone.dropOutsideDisabled = true;
		}
	},
	_attachEvents : function() {
		var self = this;

		$kit.ev({
			el : self._element,
			ev : 'dragover',
			fn : function(e) {
				if(!self._isValidFileDrag(e))
					return;

				var effect = e.dataTransfer.effectAllowed;
				if(effect == 'move' || effect == 'linkMove') {
					e.dataTransfer.dropEffect = 'move';
					// for FF (only move allowed)
				} else {
					e.dataTransfer.dropEffect = 'copy';
					// for Chrome
				}

				e.stopPropagation();
				e.preventDefault();
			}
		});

		$kit.ev({
			el : self._element,
			ev : 'dragenter',
			fn : function(e) {
				if(!self._isValidFileDrag(e))
					return;

				self._options.onEnter(e);
			}
		});

		$kit.ev({
			el : self._element,
			ev : 'dragleave',
			fn : function(e) {
				if(!self._isValidFileDrag(e))
					return;

				self._options.onLeave(e);

				var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
				// do not fire when moving a mouse over a descendant
				if($kit.contains(this, relatedTarget))
					return;

				self._options.onLeaveNotDescendants(e);
			}
		});

		$kit.ev({
			el : self._element,
			ev : 'drop',
			fn : function(e) {
				if(!self._isValidFileDrag(e))
					return;

				e.preventDefault();
				self._options.onDrop(e);
			}
		});
	},
	_isValidFileDrag : function(e) {
		var dt = e.dataTransfer,
		// do not check dt.types.contains in webkit, because it crashes safari 4
		isWebkit = navigator.userAgent.indexOf("AppleWebKit") > -1;

		// dt.effectAllowed is none in Safari 5
		// dt.types.contains check is for firefox
		return dt && dt.effectAllowed != 'none' && (dt.files || (!isWebkit && dt.types.contains && dt.types.contains('Files')));

	}
};

$kit.ui.Upload.UploadButton = function(o) {
	this._options = {
		element : null,
		// if set to true adds multiple attribute to file input
		multiple : false,
		// name attribute of file input
		name : 'file',
		onChange : function(input) {
		},
		hoverClass : 'kitjs-upload-button-hover',
		focusClass : 'kitjs-upload-button-focus'
	};

	$kit.merge(this._options, o);

	this._element = this._options.element;

	// make button suitable container for input
	$kit.css(this._element, {
		position : 'relative',
		overflow : 'hidden',
		// Make sure browse button is in the right side
		// in Internet Explorer
		direction : 'ltr'
	});

	this._input = this._createInput();
};

$kit.ui.Upload.UploadButton.prototype = {
	// returns file input element
	getInput : function() {
		return this._input;
	},
	// cleans/recreates the file input
	reset : function() {
		var accept = $kit.attr(this._input, 'accept');
		if(this._input.parentNode) {
			$kit.rmEl(this._input);
		}

		$kit.rmCls(this._element, this._options.focusClass);
		this._input = this._createInput();
		$kit.attr(this._input, 'accept', accept);
	},
	_createInput : function() {
		var input = document.createElement("input");

		if(this._options.multiple) {
			input.setAttribute("multiple", "multiple");
		}

		input.setAttribute("type", "file");
		input.setAttribute("name", this._options.name);

		$kit.css(input, {
			position : 'absolute',
			// in Opera only 'browse' button
			// is clickable and it is located at
			// the right side of the input
			right : 0,
			top : 0,
			fontFamily : 'Arial',
			// 4 persons reported this, the max values that worked for them were 243, 236, 236, 118
			fontSize : '118px',
			margin : 0,
			padding : 0,
			cursor : 'pointer',
			opacity : 0
		});

		this._element.appendChild(input);

		var self = this;
		$kit.ev({
			el : input,
			ev : 'change',
			fn : function() {
				self._options.onChange(input);
			}
		});

		$kit.ev({
			el : input,
			ev : 'mouseover',
			fn : function() {
				$kit.adCls(self._element, self._options.hoverClass);
			}
		});
		$kit.ev({
			el : input,
			ev : 'mouseout',
			fn : function() {
				$kit.rmCls(self._element, self._options.hoverClass);
			}
		});
		$kit.ev({
			el : input,
			ev : 'focus',
			fn : function() {
				$kit.adCls(self._element, self._options.focusClass);
			}
		});
		$kit.ev({
			el : input,
			ev : 'blur',
			fn : function() {
				$kit.rmCls(self._element, self._options.focusClass);
			}
		});
		// IE and Opera, unfortunately have 2 tab stops on file input
		// which is unacceptable in our case, disable keyboard access
		if(window.attachEvent) {
			// it is IE or Opera
			input.setAttribute('tabIndex', "-1");
		}

		return input;
	}
};

//
// Class for uploading files, uploading itself is handled by child classes
//
$kit.ui.Upload.UploadHandlerAbstract = function(o) {
	this._options = {
		debug : false,
		action : '/upload.php',
		// maximum number of concurrent uploads
		maxConnections : 999,
		onProgress : function(id, fileName, loaded, total) {
		},
		onComplete : function(id, fileName, response) {
		},
		onCancel : function(id, fileName) {
		}
	};
	$kit.merge(this._options, o);

	this._queue = [];
	// params for files in queue
	this._params = [];
};
$kit.ui.Upload.UploadHandlerAbstract.prototype = {
	log : function(str) {
		if(this._options.debug && window.console)
			console.log('[uploader] ' + str);
	},
	//
	// Adds file or file input to the queue
	// @returns id
	//
	add : function(file) {
	},
	//
	// Sends the file identified by id and additional query params to the server
	//
	upload : function(id, params) {
		var len = this._queue.push(id);

		var copy = {};
		$kit.merge(copy, params);
		this._params[id] = copy;

		// if too many active uploads, wait...
		if(len <= this._options.maxConnections) {
			this._upload(id, this._params[id]);
		}
	},
	//
	// Cancels file upload by id
	//
	cancel : function(id) {
		this._cancel(id);
		this._dequeue(id);
	},
	//
	// Cancells all uploads
	//
	cancelAll : function() {
		for(var i = 0; i < this._queue.length; i++) {
			this._cancel(this._queue[i]);
		}
		this._queue = [];
	},
	//
	// Returns name of the file identified by id
	//
	getName : function(id) {
	},
	//
	// Returns size of the file identified by id
	//
	getSize : function(id) {
	},
	//
	// Returns id of files being uploaded or
	// waiting for their turn
	//
	getQueue : function() {
		return this._queue;
	},
	//
	// Actual upload method
	//
	_upload : function(id) {
	},
	//
	// Actual cancel method
	//
	_cancel : function(id) {
	},
	//
	// Removes element from queue, starts upload of next
	//
	_dequeue : function(id) {
		var i = $kit.array.indexOf(this._queue, id);
		this._queue.splice(i, 1);

		var max = this._options.maxConnections;

		if(this._queue.length >= max && i < max) {
			var nextId = this._queue[max - 1];
			this._upload(nextId, this._params[nextId]);
		}
	}
};

//
// Class for uploading files using form and iframe
// @inherits $kit.ui.Upload.UploadHandlerAbstract
//
$kit.ui.Upload.UploadHandlerForm = function(o) {
	$kit.ui.Upload.UploadHandlerAbstract.apply(this, arguments);

	this._inputs = {};
};
// @inherits $kit.ui.Upload.UploadHandlerAbstract
$kit.merge($kit.ui.Upload.UploadHandlerForm.prototype, $kit.ui.Upload.UploadHandlerAbstract.prototype);

$kit.merge($kit.ui.Upload.UploadHandlerForm.prototype, {
	add : function(fileInput) {
		fileInput.setAttribute('name', 'file');
		var id = 'kitjs-upload-handler-iframe' + $kit.ui.Upload.getUniqueId();

		this._inputs[id] = fileInput;

		// remove file input from DOM
		if(fileInput.parentNode) {
			$kit.rmEl(fileInput);
		}

		return id;
	},
	getName : function(id) {
		// get input value and remove path to normalize
		return this._inputs[id].value.replace(/.*(\/|\\)/, "");
	},
	_cancel : function(id) {
		this._options.onCancel(id, this.getName(id));
		delete this._inputs[id];

		var iframe = document.getElementById(id);
		if(iframe) {
			// to cancel request set src to something else
			// we use src="javascript:false;" because it doesn't
			// trigger ie6 prompt on https
			iframe.setAttribute('src', 'javascript:false;');

			$kit.rmEl(iframe);
		}
	},
	_upload : function(id, params) {
		var input = this._inputs[id];

		if(!input) {
			throw new Error('file with passed id was not added, or already uploaded or cancelled');
		}

		var fileName = this.getName(id);

		var iframe = this._createIframe(id);
		var form = this._createForm(iframe, params);
		form.appendChild(input);

		var self = this;
		this._attachLoadEvent(iframe, function() {
			self.log('iframe loaded');

			var response = self._getIframeContentJSON(iframe);

			self._options.onComplete(id, fileName, response);
			self._dequeue(id);
			delete self._inputs[id];
			// timeout added to fix busy state in FF3.6
			setTimeout(function() {
				$kit.rmEl(iframe);
			}, 1);
		});

		form.submit();
		$kit.rmEl(form);

		return id;
	},
	_attachLoadEvent : function(iframe, callback) {
		$kit.ev({
			el : iframe,
			ev : 'load',
			fn : function() {
				// when we remove iframe from dom
				// the request stops, but in IE load
				// event fires
				if(!iframe.parentNode) {
					return;
				}

				// fixing Opera 10.53
				if(iframe.contentDocument && iframe.contentDocument.body && iframe.contentDocument.body.innerHTML == "false") {
					// In Opera event is fired second time
					// when body.innerHTML changed from false
					// to server response approx. after 1 sec
					// when we upload file with iframe
					return;
				}

				callback();
			}
		});
	},
	//
	// Returns json object received by iframe from server.
	//
	_getIframeContentJSON : function(iframe) {
		// iframe.contentWindow.document - for IE<7
		var doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document, response;

		this.log("converting iframe's innerHTML to JSON");
		this.log("innerHTML = " + doc.body.innerHTML);

		try {
			response = eval("(" + doc.body.innerHTML + ")");
		} catch(err) {
			response = {};
		}

		return response;
	},
	//
	// Creates iframe with unique name
	//
	_createIframe : function(id) {
		// We can't use following code as the name attribute
		// won't be properly registered in IE6, and new window
		// on form submit will open
		// var iframe = document.createElement('iframe');
		// iframe.setAttribute('name', id);

		var iframe = $kit.newHTML('<iframe src="javascript:false;" name="' + id + '" />').childNodes[0];
		// src="javascript:false;" removes ie6 prompt on https

		iframe.setAttribute('id', id);

		iframe.style.display = 'none';
		document.body.appendChild(iframe);

		return iframe;
	},
	//
	// Creates form, that will be submitted to iframe
	//
	_createForm : function(iframe, params) {
		// We can't use the following code in IE6
		// var form = document.createElement('form');
		// form.setAttribute('method', 'post');
		// form.setAttribute('enctype', 'multipart/form-data');
		// Because in this case file won't be attached to request
		var form = $kit.newHTML('<form method="post" enctype="multipart/form-data"></form>').childNodes[0];

		var queryString = $kit.ui.Upload.obj2url(params, this._options.action);

		form.setAttribute('action', queryString);
		form.setAttribute('target', iframe.name);
		form.style.display = 'none';
		document.body.appendChild(form);

		return form;
	}
});

//
// Class for uploading files using xhr
// @inherits $kit.ui.Upload.UploadHandlerAbstract
//
$kit.ui.Upload.UploadHandlerXhr = function(o) {
	$kit.ui.Upload.UploadHandlerAbstract.apply(this, arguments);

	this._files = [];
	this._xhrs = [];

	// current loaded size in bytes for each file
	this._loaded = [];
};
// static method
$kit.ui.Upload.UploadHandlerXhr.isSupported = function() {
	var input = document.createElement('input');
	input.type = 'file';

	return ('multiple' in input && typeof File != "undefined" && typeof (new XMLHttpRequest()).upload != "undefined" );
};
// @inherits $kit.ui.Upload.UploadHandlerAbstract
$kit.merge($kit.ui.Upload.UploadHandlerXhr.prototype, $kit.ui.Upload.UploadHandlerAbstract.prototype)

$kit.merge($kit.ui.Upload.UploadHandlerXhr.prototype, {
	//
	// Adds file to the queue
	// Returns id to use with upload, cancel
	//
	add : function(file) {
		if(!( file instanceof File)) {
			throw new Error('Passed obj in not a File (in $kit.ui.Upload.UploadHandlerXhr)');
		}

		return this._files.push(file) - 1;
	},
	getName : function(id) {
		var file = this._files[id];
		// fix missing name in Safari 4
		return file.fileName != null ? file.fileName : file.name;
	},
	getSize : function(id) {
		var file = this._files[id];
		return file.fileSize != null ? file.fileSize : file.size;
	},
	//
	// Returns uploaded bytes for file identified by id
	//
	getLoaded : function(id) {
		return this._loaded[id] || 0;
	},
	//
	// Sends the file identified by id and additional query params to the server
	// @param {Object} params name-value string pairs
	//
	_upload : function(id, params) {
		var file = this._files[id], name = this.getName(id), size = this.getSize(id);

		this._loaded[id] = 0;

		var xhr = this._xhrs[id] = new XMLHttpRequest();
		var self = this;

		xhr.upload.onprogress = function(e) {
			if(e.lengthComputable) {
				self._loaded[id] = e.loaded;
				self._options.onProgress(id, name, e.loaded, e.total);
			}
		};

		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				self._onComplete(id, xhr);
			}
		};
		// build query string
		params = params || {};
		params['file'] = name;
		var queryString = $kit.ui.Upload.obj2url(params, this._options.action);

		xhr.open("POST", queryString, true);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		xhr.setRequestHeader("X-File-Name", encodeURIComponent(name));
		xhr.setRequestHeader("Content-Type", "application/octet-stream");
		xhr.send(file);
	},
	_onComplete : function(id, xhr) {
		// the request was aborted/cancelled
		if(!this._files[id])
			return;

		var name = this.getName(id);
		var size = this.getSize(id);

		this._options.onProgress(id, name, size, size);

		if(xhr.status == 200) {
			this.log("xhr - server response received");
			this.log("responseText = " + xhr.responseText);

			var response;

			try {
				response = eval("(" + xhr.responseText + ")");
			} catch(err) {
				response = {};
			}

			this._options.onComplete(id, name, response);

		} else {
			this._options.onComplete(id, name, {});
		}

		this._files[id] = null;
		this._xhrs[id] = null;
		this._dequeue(id);
	},
	_cancel : function(id) {
		this._options.onCancel(id, this.getName(id));

		this._files[id] = null;

		if(this._xhrs[id]) {
			this._xhrs[id].abort();
			this._xhrs[id] = null;
		}
	}
});
/**
 * 图片预览上传组件
 * @class $kit.ui.Upload.ImageUploader
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @requires array.js
 * @param {Object} config 组件配置
 * @param {Element} config.element 初始化哪一块div为上传组件
 * @param {String} config.action 接收上传文件的后台API接口地址
 * @param {[String]} [config.allowedExtensions] 允许上传的文件扩展名，如allowedExtensions : ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
 * @param {Number} [config.sizeLimit] 最大上传文件大小，sizeLimit: 0, // max size
 * @param {Number} [config.minSizeLimit] 最小上传文件大小，minSizeLimit: 0, // min size
 * @param {Function} [config.onSubmit] 提交时事件，传入两个参数function(id, fileName)
 * @param {Function} [config.onComplete] 上传完毕事件，传入三个参数function(id, fileName, responseJSON)
 * @param {Function} [config.onProgress] 上传过程事件，传入三个参数function(id, fileName, loaded, total){}
 * @param {Function} [config.onCancel] 取消事件，function(id, fileName){}
 * @param {Accept} [config.accept] input file接受上传的文件类型筛选，可能部分浏览器支持不好
 * @param {Map} [config.message] 自定义错误信息，see $kit.ui.Upload.FileUploaderBasic for content
 * @param {Function} [config.showMessage] 报错方法，showMessage: function(message){ alert(message); }
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Upload/upload.js">Source code</a>
 */
$kit.ui.Upload.ImageUploader = function(o) {
	// call parent constructor
	$kit.ui.Upload.FileUploaderBasic.apply(this, arguments);

	// additional options
	$kit.merge(this._options, {
		element : null,
		// if set, will be used instead of kitjs-upload-list in template
		listElement : null,

		template : ['<div class="kitjs-image-uploader">', //
		'<div class="kitjs-upload-drop-area"><span>把文件拖到这里开始上传!</span></div>', //
		'<div class="kitjs-upload-image-button"></div>', //
		'<div class="kitjs-upload-image-preview"><div class="box">上传图片</div></div>', //
		'<ul class="kitjs-upload-list"></ul>', //
		'</div>'].join(''),

		// template for one item in file list
		fileTemplate : ['<li>', //
		'<span class="kitjs-upload-file"></span>', //
		'<span class="kitjs-upload-spinner"></span>', //
		'<span class="kitjs-upload-size"></span>', //
		'<a class="kitjs-upload-cancel" href="#">取消</a>', //
		'<span class="kitjs-upload-failed-text">上传失败</span>', //
		'</li>'].join(''),

		classes : {
			// used to get elements from templates
			button : 'kitjs-upload-image-button',
			drop : 'kitjs-upload-drop-area',
			dropActive : 'kitjs-upload-drop-area-active',
			list : 'kitjs-upload-list',

			file : 'kitjs-upload-file',
			spinner : 'kitjs-upload-spinner',
			size : 'kitjs-upload-size',
			cancel : 'kitjs-upload-cancel',

			// added to list item when upload completes
			// used in css to hide progress spinner
			success : 'kitjs-upload-success',
			fail : 'kitjs-upload-fail'
		}
	});
	// overwrite options with user supplied
	$kit.merge(this._options, o);

	this._element = this._options.element;
	this._element.innerHTML = this._options.template;
	this._listElement = this._options.listElement || this._find(this._element, 'list');

	this._classes = this._options.classes;

	this._button = this._createUploadButton(this._find(this._element, 'button'));
	if(this._options.accept) {
		$kit.attr(this._button._input, 'accept', this._options.accept);
	}

	this._bindCancelEvent();
	this._setupDragDrop();
};
$kit.ui.Upload.ImageUploader.prototype = {
	_onComplete : function(id, fileName, result) {
		var imgPreview = $kit.el8cls('box', $kit.el8cls('kitjs-upload-image-preview', this._element));
		var maxWidth = imgPreview.offsetWidth;
		var maxHeight = imgPreview.offsetHeight;
		var img = new Image();
		var width = 0;
		var height = 0;
		img.onload = function() {
			width = img.width;
			height = img.height;
			if(width > maxWidth) {
				width = maxWidth;
				height = img.height / img.width * maxWidth;
			}
			if(height > maxHeight) {
				width = img.width / img.height * maxHeight;
				height = maxHeight;
			}
			imgPreview.style.fontSize = 0;
			imgPreview.innerHTML = '';
			imgPreview.innerHTML = '<img src="' + result.url + '" style="width:0;height:100%"><img width="' + width + '" height="' + height + '" src="' + result.url + '">';
			img = null;
		}
		img.src = result.url;

		$kit.ui.Upload.FileUploaderBasic.prototype._onComplete.apply(this, arguments);

		// mark completed
		var item = this._getItemByFileId(id);
		$kit.rmEl(this._find(item, 'cancel'));
		$kit.rmEl(this._find(item, 'spinner'));

		if(result.success) {
			$kit.adCls(item, this._classes.success);
		} else {
			$kit.adCls(item, this._classes.fail);
		}
	}
}
$kit.mergeIf($kit.ui.Upload.ImageUploader.prototype, $kit.ui.Upload.FileUploader.prototype);
