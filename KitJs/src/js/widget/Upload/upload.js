/**
 * @namespace $kit.ui.Upload
 */
$kit.ui.Upload = {};
/**
 * Upload
 * @class $kit.ui.Upload
 * @required kit.js
 * @required ieFix.js
 */
$kit.ui.Upload.FileUploaderBasic = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	//
	// number of files being uploaded
	me._filesInProgress = 0;
	me._handler = me._createUploadHandler();
	if(me.config.button) {
		me._button = me._createUploadButton(me.config.button);
	}
	me._preventLeaveInProgress();
}
$kit.merge($kit.ui.Upload.FileUploaderBasic,
/**
 * @lends $kit.ui.Upload.FileUploaderBasic
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
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
			typeError : "{file} has invalid extension. Only {extensions} are allowed.",
			sizeError : "{file} is too large, maximum file size is {sizeLimit}.",
			minSizeError : "{file} is too small, minimum file size is {minSizeLimit}.",
			emptyError : "{file} is empty, please select files again without it.",
			onLeave : "The files are being uploaded, if you leave now the upload will be cancelled."
		},
		showMessage : function(message) {
			alert(message);
		}
	}
});
$kit.merge($kit.ui.Upload.FileUploaderBasic.prototype,
/**
 * @lends $kit.ui.Upload.FileUploaderBasic.prototype
 */
{
	setParams : function(params) {
		this.config.params = params;
	},
	getInProgress : function() {
		return this._filesInProgress;
	},
	_createUploadButton : function(element) {
		var me = this;

		return new $kit.ui.Upload.UploadButton({
			element : element,
			multiple : me.config.multiple && $kit.ui.Upload.UploadHandlerXhr.isSupported(),
			onChange : function(input) {
				me._onInputChange(input);
			}
		});
	},
	_createUploadHandler : function() {
		var me = this, handlerClass;

		if($kit.ui.Upload.UploadHandlerXhr.isSupported()) {
			handlerClass = 'UploadHandlerXhr';
		} else {
			handlerClass = 'UploadHandlerForm';
		}

		var handler = new $kit.ui.Upload[handlerClass]({
			debug : me.config.debug,
			action : me.config.action,
			maxConnections : me.config.maxConnections,
			onProgress : function(id, fileName, loaded, total) {
				me._onProgress(id, fileName, loaded, total);
				me._options.onProgress(id, fileName, loaded, total);
			},
			onComplete : function(id, fileName, result) {
				me._onComplete(id, fileName, result);
				me._options.onComplete(id, fileName, result);
			},
			onCancel : function(id, fileName) {
				me._onCancel(id, fileName);
				me._options.onCancel(id, fileName);
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
		if(this._handler instanceof qq.UploadHandlerXhr) {
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
});

$kit.ui.FileUploader = function(config) {

}