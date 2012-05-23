/**
 * 兼容各浏览器(包括IE)的HTML Audio控件，支持自定义事件，以及API操作
 * @class $kit.ui.Audio
 * @param {Object} config 组件配置
 * @requires kit.js
 * @requires ieFix.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/Audio/kit.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/Audio/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/Audio/demo.png">
 *
 * @update
 * 修改自github.com/kolber/audiojs/
 * 代码做了重构
 * 添加自定义事件支持，以及换肤支持
 * 部分代码做了性能优化

 * 2012/03/22
 * 优化播放器load性能
 *
 * @update
 * 2012/03/23
 * 加入loading过程时候，不能移动进度条
 * 去掉loading次数限制，避免因为网路原因，导致出错
 *
 * @author:xueduanyang1985@163.com
 * @date 2012/03/19
 */
$kit.ui.Audio = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Audio,
/**
 * @lends $kit.ui.Audio
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		/**
		 * 替换HTML中的哪个元素
		 * @type {Element}
		 */
		el : undefined,
		/**
		 * kit组件name，绑定在element上，可以通过element['kitAudio']找到$kit.ui.Audio对象
		 * @type {String}
		 */
		kitWidgetName : "kitAudio",
		/**
		 * audio样式
		 * @type {String}
		 */
		audioCls : 'kitjs_audio',
		/**
		 * 是否自动播放
		 * @type {Boolean}
		 */
		autoplay : false,
		/**
		 * 是否循环播放
		 * @type {Boolean}
		 */
		loop : false,
		/**
		 * 是否预读取
		 * @type {Boolean}
		 */
		preload : true,
		/**
		 * 播放音乐的flash文件地址,IE下需要使用
		 * @type {String}
		 */
		swfLocation : 'audiojs.swf',
		useFlash : (function() {
			var a = document.createElement('audio');
			return !(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
		})(),
		hasFlash : (function() {
			if(navigator.plugins && navigator.plugins.length && navigator.plugins['Shockwave Flash']) {
				return true;
			} else if(navigator.mimeTypes && navigator.mimeTypes.length) {
				var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
				return mimeType && mimeType.enabledPlugin;
			} else {
				try {
					var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
					return true;
				} catch (e) {
				}
			}
			return false;
		})(),
		/**
		 * The default markup and classes for creating the player
		 * @type {Object}
		 */
		playerTemplate : {
			markup : ['<div class="${playPauseCls}">', //
			'<p class="${playButtonCls}"></p>', //
			'<p class="${pauseButtonCls}"></p>', //
			'<p class="${loadingStatusCls}"></p>', //
			'<p class="${errorStatusCls}"></p>', //
			'</div>', //
			'<div class="${scrubberCls}">', //
			'<div class="${progressCls}">', //
			'<i class="${progressIconCls}"></i>', //
			'<div class="${timeCls}">', //
			'<em class="${playedCls}">00:00</em>/<strong class="${durationCls}">00:00</strong>', //
			'</div>', //
			'</div>', //
			'<div class="${loaderCls}"></div>', //
			'</div>', //
			'<div class="${errorMessageCls}"></div>'//
			].join(''),
			playPauseCls : 'play-pause',
			playButtonCls : 'play',
			pauseButtonCls : 'pause',
			loadingStatusCls : 'loading',
			errorStatusCls : 'error',
			scrubberCls : 'scrubber',
			progressCls : 'progress',
			progressIconCls : 'time-icon',
			timeCls : 'time',
			durationCls : 'duration',
			loaderCls : 'loaded',
			playedCls : 'played',
			errorMessageCls : 'error-message',
			playingCls : 'playing',
			loadingCls : 'loading',
			errorCls : 'error',
			timeHoverCls : 'time-hover'
		},
		/**
		 * flash HTML
		 * @type {HTML}
		 */
		flashSource : [//
		'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="${arg1}" width="1" height="1" name="${arg1}" style="position: absolute; left: -1px;">', //
		'<param name="movie" value="${arg2}?playerInstance=${arg4}&datetime=${arg3}">', //
		'<param name="allowscriptaccess" value="always">', //
		'<embed name="${arg1}" src="${arg2}?playerInstance=${arg4}&datetime=${arg3}" width="1" height="1" allowscriptaccess="always">', //
		'</object>'//
		].join(''),
		/**
		 * 播放结束默认回调方法
		 */
		trackEnded : function(e) {
			this.newEv('ended');
		},
		/**
		 * flash错误默认回调方法
		 */
		flashError : function() {
			var player = this.config.playerTemplate, //
			errorMessage = $kit.el8cls(player.errorMessageCls, this.wrapper), //
			html = 'Missing <a href="http://get.adobe.com/flashplayer/">flash player</a> plugin.';
			if(this.mp3)
				html += ' <a href="' + this.mp3 + '">Download audio file</a>.';
			$kit.rmCls(this.wrapper, player.loadingCls);
			$kit.adCls(this.wrapper, this.config.playerTemplate.errorCls);
			errorMessage.innerHTML = html;
		},
		/**
		 * 读取错误默认回调方法
		 */
		loadError : function(e) {
			var player = this.config.playerTemplate, //
			errorMessage = $kit.el8cls(player.errorMessageCls, this.wrapper);
			$kit.rmCls(this.wrapper, this.config.playerTemplate.loadingCls);
			$kit.adCls(this.wrapper, this.config.playerTemplate.errorCls);
			errorMessage.innerHTML = 'Error loading: "' + this.mp3 + '"';
		},
		/**
		 * 正在读取默认回调方法
		 */
		loading : function() {
			var player = this.config.playerTemplate;
			$kit.adCls(this.wrapper, this.config.playerTemplate.loadingCls);
		},
		/**
		 * 读取开始默认回调方法
		 */
		loadStarted : function() {
			var player = this.config.playerTemplate, //
			duration = $kit.el8cls(player.durationCls, this.wrapper), //
			m = Math.floor(this.duration / 60), s = Math.floor(this.duration % 60);
			$kit.rmCls(this.wrapper, player.loadingCls);
			duration.innerHTML = ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
		},
		/**
		 * 读取过程中默认回调方法
		 */
		loadProgress : function(percent) {
			if(isNaN(percent)) {
				return;
			}
			var player = this.config.playerTemplate, //
			scrubber = $kit.el8cls(player.scrubberCls, this.wrapper), //
			loaded = $kit.el8cls(player.loaderCls, this.wrapper);
			loaded.style.width = (scrubber.offsetWidth * percent) + 'px';
		},
		/**
		 * 播放或者暂停方法
		 */
		playPause : function() {
			if(this.playing)
				this.config.play();
			else
				this.config.pause();
		},
		/**
		 * 播放方法
		 */
		play : function() {
			var player = this.config.playerTemplate;
			$kit.adCls(this.wrapper, this.config.playerTemplate.playingCls);
		},
		/**
		 * 暂停
		 */
		pause : function() {
			var player = this.config.playerTemplate;
			$kit.rmCls(this.wrapper, player.playingCls);
		},
		/**
		 * 更新播放时间
		 */
		updatePlayhead : function(percent) {
			if(this._flag_dragStart) {
				return;
			}
			var player = this.config.playerTemplate, //
			scrubber = $kit.el8cls(player.scrubberCls, this.wrapper)
			progress = $kit.el8cls(player.progressCls, this.wrapper);
			if(this.playing) {
				var progressWidth = progress.style.width ? parseFloat(progress.style.width) : 0;
				if(progressWidth <= scrubber.offsetWidth * percent || (progressWidth - scrubber.offsetWidth * percent) > 5) {
					progress.style.width = (scrubber.offsetWidth * percent) + 'px';
				}
			}
			var played = $kit.el8cls(player.playedCls, this.wrapper), //
			p = this.duration * percent, //
			m = Math.floor(p / 60), s = Math.floor(p % 60);
			var currentTime = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
			if(played.innerHTML != currentTime) {
				played.innerHTML = currentTime;
			}
			this.trackLoadProgress();
		}
	}
});
$kit.merge($kit.ui.Audio.prototype,
/**
 * @lends $kit.ui.Audio.prototype
 */
{
	/**
	 * 初始化
	 */
	init : function() {
		var me = this, config = me.config;
		if($kit.isEmpty(config.el)) {
			return;
		}
		var element = config.el;
		//
		var wrapperId = $kit.onlyId();
		this.wrapperId = wrapperId;
		if(config.playerTemplate) {
			element = this.createPlayer(config.el, config.playerTemplate, wrapperId);
		} else {
			element.parentNode.setAttribute('id', wrapperId);
		}
		// Constructor
		this.element = element;
		this.wrapper = element.parentNode;
		this.currentTime = 0;
		// bind instance
		this.wrapper[config.kitWidgetName] = this;
		this.source = element.getElementsByTagName('source')[0] || element;
		// First check the `<audio>` element directly for a src and if one is not found, look for a `<source>` element.
		this.mp3 = (function(element) {
			var source = element.getElementsByTagName('source')[0];
			return element.getAttribute('src') || ( source ? source.getAttribute('src') : null);
		})(element);
		this.loadStartedCalled = false;
		this.loadedPercent = 0;
		this.duration = 1;
		this.playing = false;
		//
		// If `<audio>` or mp3 playback isn't supported, insert the swf & attach the required events for it.
		if(config.useFlash && config.hasFlash) {
			var flashId = $kit.onlyId();
			this.flashId = flashId;
			this.attachFlashEvents();
			this.injectFlash(flashId);
		} else if(config.useFlash && !config.hasFlash) {
			config.flashError.apply(this);
		}
		// Attach event callbacks to the new audiojs instance.
		if(!config.useFlash || (config.useFlash && config.hasFlash)) {
			this.attachEvents(this.wrapper, this);
		}
	},
	/**
	 * 生成自定义的播放器模板HTML
	 */
	createPlayer : function(element, template, wrapperId) {
		var wrapper = document.createElement('div'), //
		newElement = element.cloneNode(true);
		wrapper.setAttribute('class', this.config.audioCls);
		wrapper.setAttribute('id', wrapperId);
		var markup = $kit.tpl(template.markup, template);
		// Fix IE's broken implementation of `innerHTML` & `cloneNode` for HTML5 elements.
		if(newElement.outerHTML && !document.createElement('audio').canPlayType) {
			newElement = this._ieCloneHtml5Node(element);
			wrapper.innerHTML = markup;
			wrapper.appendChild(newElement);
			element.outerHTML = wrapper.outerHTML;
			wrapper = document.getElementById(wrapperId);
		} else {
			wrapper.appendChild(newElement);
			wrapper.innerHTML = wrapper.innerHTML + markup;
			element.parentNode.replaceChild(wrapper, element);
		}
		return wrapper.getElementsByTagName('audio')[0];
	},
	// **Handle all the IE6+7 requirements for cloning `<audio>` nodes**
	// Create a html5-safe document fragment by injecting an `<audio>` element into the document fragment.
	_ieCloneHtml5Node : function(audioTag) {
		var fragment = document.createDocumentFragment(), //
		doc = fragment.createElement ? fragment : document;
		doc.createElement('audio');
		var div = doc.createElement('div');
		fragment.appendChild(div);
		div.innerHTML = audioTag.outerHTML;
		return div.firstChild;
	},
	// Attaches useful event callbacks to an `audiojs` instance.
	attachEvents : function() {
		var wrapper = this.wrapper, audio = this;
		if(!audio.config.playerTemplate)
			return;
		var player = audio.config.playerTemplate, //
		playPause = $kit.el8cls(player.playPauseCls, wrapper), //
		scrubber = $kit.el8cls(player.scrubberCls, wrapper), //
		progress = $kit.el8cls(player.progressCls, wrapper), //
		progressIcon = $kit.el8cls(player.progressIconCls, wrapper), //
		timeBox = $kit.el8cls(player.timeCls, wrapper), //
		playedBox = $kit.el8cls(player.playedCls, timeBox);
		$kit.ev({
			el : playPause,
			ev : 'click',
			fn : function(e) {
				this.playPause.apply(audio);
			},
			scope : audio
		});
		$kit.ev({
			el : scrubber,
			ev : 'click',
			fn : function(e) {
				if(!this.readyState) {
					return;
				}
				this._flag_dragStart = false;
				var relativeLeft = e.clientX - $kit.offset(scrubber).left;
				this.skipTo(relativeLeft / scrubber.offsetWidth);
			},
			scope : audio
		});
		//move timeIcon
		$kit.ev({
			el : progressIcon,
			ev : 'mousedown',
			fn : function(e, cfg) {
				if(!this.readyState) {
					return;
				}
				this._flag_dragStart = true;
				e.stopDefault();
			},
			scope : audio
		});
		$kit.ev({
			el : scrubber,
			ev : 'mousemove',
			fn : function(e, cfg) {
				if(!this.readyState) {
					return;
				}
				if(this._flag_dragStart == true) {
					if(this.playing) {
						this.pause();
						this._flag_palying_when_drag = true;
					}
					var distance = e.clientX - $kit.offset(scrubber).left;
					if(distance > $kit.offset(scrubber).width) {
						distance = $kit.offset(scrubber).width;
					}
					$kit.css(progress, {
						width : distance + 'px'
					});
					//progress.style.width = distance + 'px';
					var p = this.duration * distance / $kit.css(scrubber, 'width');
					//
					var m = Math.floor(p / 60), //
					s = Math.floor(p % 60);
					var currentTime = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
					playedBox.innerText = currentTime;
					//e.stopDefault();
				}
			},
			scope : audio
		});
		$kit.ev({
			el : progressIcon,
			ev : 'mouseup mouseout',
			fn : function(e, cfg) {
				if(!this.readyState) {
					return;
				}
				if(this._flag_dragStart == true) {
					if(e.type == 'mouseup' || //
					(e.type == 'mouseout' && e.relatedTarget && !$kit.contains(scrubber, e.relatedTarget))) {
						this._flag_dragStart = false;
						this.skipTo(parseFloat($kit.css(progress, 'width') / $kit.css(scrubber, 'width')));
					}
					if(this._flag_palying_when_drag == true) {
						this.play();
						this._flag_palying_when_drag = false;
					}
					e.stopDefault();
				}
			},
			scope : audio
		});
		/**
		 * timebox hover
		 */
		$kit.ev({
			el : [progressIcon, timeBox],
			ev : 'mouseover',
			fn : function(e, cfg) {
				if(!this.readyState) {
					return;
				}
				var me = this;
				clearTimeout(this._timeout_timeBox_hover);
				this._timeout_timeBox_hover = null;
				timeBox.style.display = 'block';
				setTimeout(function() {
					$kit.adCls(timeBox, me.config.playerTemplate.timeHoverCls);
				}, 0);
			},
			scope : audio
		});
		$kit.ev({
			el : timeBox,
			ev : 'mouseout',
			fn : function(e, cfg) {
				if(!this.readyState) {
					return;
				}
				var me = this;
				if(e.relatedTarget && !$kit.contains(timeBox, e.relatedTarget)) {
					if(this._timeout_timeBox_hover == null && timeBox.style.display == 'block') {
						this._timeout_timeBox_hover = setTimeout(function() {
							timeBox.style.display = 'block';
							$kit.rmCls(timeBox, me.config.playerTemplate.timeHoverCls);
							setTimeout(function() {
								timeBox.style.display = '';
							}, 500);
							this._timeout_timeBox_hover = null;
						}, 500);
					}
				}
			},
			scope : audio
		});
		$kit.ev({
			el : progressIcon,
			ev : 'mouseout',
			fn : function(e, cfg) {
				if(!this.readyState) {
					return;
				}
				var me = this;
				if(e.relatedTarget && !$kit.contains(progressIcon, e.relatedTarget)) {
					if(this._timeout_timeBox_hover == null && timeBox.style.display == 'block') {
						this._timeout_timeBox_hover = setTimeout(function() {
							timeBox.style.display = 'block';
							$kit.rmCls(timeBox, me.config.playerTemplate.timeHoverCls);
							setTimeout(function() {
								timeBox.style.display = '';
							}, 500);
							this._timeout_timeBox_hover = null;
						}, 500);
					}
				}
			},
			scope : audio
		});
		// _If flash is being used, then the following handlers don't need to be registered._
		if(audio.config.useFlash)
			return;

		// Start tracking the load progress of the track.
		audio.trackLoadProgress();

		$kit.ev({
			el : audio.element,
			ev : 'timeupdate',
			fn : function(e) {
				if(!this.readyState) {
					return;
				}
				audio.currentTime = audio.element.currentTime;
				audio.updatePlayhead.apply(audio);
				audio.newEv('timeupdate');
			},
			scope : audio
		});
		$kit.ev({
			el : audio.element,
			ev : 'ended',
			fn : function(e) {
				audio.trackEnded.apply(audio);
			},
			scope : audio
		});
		$kit.ev({
			el : audio.source,
			ev : 'error',
			fn : function(e) {
				// on error, cancel any load timers that are running.
				clearInterval(audio.readyTimer);
				clearInterval(audio.loadTimer);
				audio.config.loadError.apply(audio);
				audio.newEv('error');
			},
			scope : audio
		});
	},
	// Flash requires a slightly different API to the `<audio>` element, so this method is used to overwrite the standard event handlers.
	attachFlashEvents : function() {
		var audio = this;
		audio.swfReady = false;
		audio['load'] = function(mp3) {
			// If the swf isn't ready yet then just set `audio.mp3`. `loading()` will load it in once the swf is ready.
			audio.mp3 = mp3;
			if(audio.swfReady) {
				audio.element.load(mp3);
			}
			this.newEv('load');
		}
		audio['loadProgress'] = function(percent, duration) {
			audio.loadedPercent = percent;
			audio.duration = duration;
			audio.config.loadStarted.apply(audio);
			audio.config.loadProgress.apply(audio, [percent]);
			this.newEv('loadProgress');
		}
		audio['skipTo'] = function(percent) {
			/*if(percent > audio.loadedPercent)
			 return;
			 */
			percent = percent > 1 ? 1 : percent;
			audio['updatePlayhead'].call(audio, [percent])
			audio.element.skipTo(percent);
			audio.adjustProgressIconPos(audio.duration * percent);
			audio.currentTime = audio.duration * percent;
			audio.newEv('skipTo');
		}
		audio['skipTimeTo'] = function(time) {
			if(time > audio.duration) {
				return;
			}
			audio['updatePlayhead'].call(audio, [time / audio.duration])
			audio.element.skipTimeTo(time);
			audio.adjustProgressIconPos(time);
			audio.currentTime = time;
			audio.newEv('skipTo');
		}
		audio['updatePlayhead'] = function(percent) {
			this.currentTime = percent * this.duration;
			audio.config.updatePlayhead.apply(audio, [percent]);
			audio.newEv('timeupdate');
		}
		audio['play'] = function() {
			// If the audio hasn't started preloading, then start it now.
			// Then set `preload` to `true`, so that any tracks loaded in subsequently are loaded straight away.
			if(!audio.config.preload) {
				audio.config.preload = true;
				audio.element.loading(audio.mp3);
			}
			audio.playing = true;
			// IE doesn't allow a method named `play()` to be exposed through `ExternalInterface`, so lets go with `pplay()`.
			// <http://dev.nuclearrooster.com/2008/07/27/externalinterfaceaddcallback-can-cause-ie-js-errors-with-certain-keyworkds/>
			audio.element.pplay();
			audio.config.play.apply(audio);
			audio.newEv('play');
		}
		audio['pause'] = function() {
			audio.playing = false;
			// Use `ppause()` for consistency with `pplay()`, even though it isn't really required.
			audio.element.ppause();
			audio.config.pause.apply(audio);
			audio.newEv('pause');
		}
		audio['setVolume'] = function(v) {
			audio.element.setVolume(v);
			audio.newEv('setVolume');
		}
		audio['initialized'] = function() {
			// Load the mp3 specified by the audio element into the swf.
			audio.swfReady = true;
			audio.readyState = true;
			if(audio.config.preload) {
				this._getSwf(this.flashId).load(audio.mp3);
			}
			if(audio.config.autoplay) {
				audio.play.apply(audio);
			}
		}
	},
	// ### Injecting an swf from a string
	// Build up the swf source by replacing the `$keys` and then inject the markup into the page.
	injectFlash : function(id) {
		var flashSource = $kit.tpl(this.config.flashSource, {
			arg1 : id,
			arg2 : this.config.swfLocation,
			arg3 : (+new Date + Math.random()), // `(+new Date)` ensures the swf is not pulled out of cache. The fixes an issue with Firefox running multiple players on the same page.
			arg4 : "$kit.el('#" + this.wrapperId + "')['" + this.config.kitWidgetName + "']"//'$kit.el(\'#' + this.wrapper.id + '\')[\'' + this.config.kitWidgetName + '\']'
		});
		// Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
		var html = this.wrapper.innerHTML, //
		div = document.createElement('div');
		div.innerHTML = flashSource + html;
		this.element = null;
		this.wrapper.innerHTML = div.innerHTML;
		this.element = this._getSwf(id);
	},
	// **Cross-browser `<object>` / `<embed>` element selection**
	_getSwf : function(name) {
		var swf = document[name] || window[name];
		return swf.length > 1 ? swf[swf.length - 1] : swf;
	},
	// API access events:
	// Each of these do what they need do and then call the matching methods defined in the settings object.
	/**
	 * 更新播放进度
	 */
	updatePlayhead : function() {
		var percent = this.element.currentTime / this.duration;
		this.config.updatePlayhead.apply(this, [percent]);
	},
	/**
	 * 跳到百分比
	 * @param {Percent}
	 */
	skipTo : function(percent) {
		/*if(percent > this.loadedPercent)
		 return;
		 */
		percent = percent > 1 ? 1 : percent;
		var time = this.duration * percent;
		this.element.currentTime = time;
		this.currentTime = time;
		this.adjustProgressIconPos(time);
		this.updatePlayhead();
		this.newEv('skipTo');
	},
	/**
	 * 跳到那个时间，单位秒
	 * @param {Second}
	 */
	skipTimeTo : function(time) {
		if(time > this.duration)
			return;
		this.element.currentTime = time;
		this.currentTime = time;
		this.adjustProgressIconPos(time);
		this.updatePlayhead();
		this.newEv('skipTo');
	},
	/**
	 * 读取mp3
	 * @param {URL}
	 */
	load : function(mp3) {
		this.loadStartedCalled = false;
		this.source.setAttribute('src', mp3);
		// The now outdated `load()` method is required for Safari 4
		this.element.load();
		this.mp3 = mp3;
		this.trackLoadProgress();
		this.newEv('load');
	},
	loadError : function() {
		this.config.loadError.apply(this);
	},
	loading : function() {
		this.config.loading.apply(this);
	},
	loadStarted : function() {
		// Wait until `element.duration` exists before setting up the audio player.
		if(!this.element.duration)
			return false;

		this.duration = this.element.duration;
		this.updatePlayhead();
		this.config.loadStarted.apply(this);
		return true;
	},
	loadProgress : function() {
		if(this.element.buffered != null && this.element.buffered.length) {
			// Ensure `loadStarted()` is only called once.
			if(!this.loadStartedCalled) {
				this.loadStartedCalled = this.loadStarted();
			}
			var durationLoaded = this.element.buffered.end(this.element.buffered.length - 1);
			this.loadedPercent = durationLoaded / this.duration;

			this.config.loadProgress.apply(this, [this.loadedPercent]);
			this.newEv('loadProgress');
		}
	},
	/**
	 * 播放或者暂停
	 */
	playPause : function() {
		if(this.playing)
			this.pause();
		else
			this.play();
	},
	/**
	 * 播放
	 */
	play : function() {
		var ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);
		// On iOS this interaction will trigger loading the mp3, so run `loading()`.
		if(ios && this.element.readyState == 0)
			this.loading.apply(this);
		// If the audio hasn't started preloading, then start it now.
		// Then set `preload` to `true`, so that any tracks loaded in subsequently are loaded straight away.
		if(!this.config.preload) {
			this.config.preload = true;
			this.element.setAttribute('preload', 'auto');
			this.trackLoadProgress();
		}
		this.playing = true;
		this.element.play();
		this.config.play.apply(this);
		this.newEv('play');
	},
	/**
	 * 暂停
	 */
	pause : function() {
		this.playing = false;
		this.element.pause();
		this.config.pause.apply(this);
		this.newEv('pause');
	},
	/**
	 * 设置音量
	 * @param {Number}
	 */
	setVolume : function(v) {
		this.element.volume = v;
		this.newEv('setVolume');
	},
	trackEnded : function(e) {
		if(!this.config.loop) {
			this.pause.apply(this);
		}
		this.skipTo.apply(this, [0]);
		this.config.trackEnded.apply(this);
	},
	trackLoadProgress : function() {
		var audio = this;
		// If `preload` has been set to `none`, then we don't want to start loading the track yet.
		if(!audio.config.preload) {
			return;
		}

		if(audio.loadedPercent >= 1) {
			return;
		}
		var readyTimer, loadTimer, ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);

		// Use timers here rather than the official `progress` event, as Chrome has issues calling `progress` when loading mp3 files from cache.
		//audio.loadCount = 0;
		clearInterval(audio.readyTimer);
		audio.readyTimer = setInterval(function() {
			if(audio.element.readyState > -1 && audio.element.readyState < 1) {
				// iOS doesn't start preloading the mp3 until the user interacts manually, so this stops the loader being displayed prematurely.
				if(!ios) {
					audio.loading.apply(audio);
				}
				//if(audio.loadCount > 100) {
				// audio.load(audio.mp3);
				// audio.loadCount = 0;
				//}
			}
			if(audio.element.readyState > 1) {
				audio.readyState = true;
				if(audio.config.autoplay) {
					audio.play.apply(audio);
				}
				clearInterval(audio.readyTimer);
				// Once we have data, start tracking the load progress.
				var loaderPercent = 0;
				clearInterval(audio.loadTimer);
				if($kit.isEmpty(audio.loadedPercent) || audio.loadedPercent < 1) {
					audio.loadTimer = setInterval(function() {
						audio.loadProgress.apply(audio);
						if(audio.loadedPercent < audio.currentTime / audio.duration) {
							audio.loading.apply(audio);
						} else {
							$kit.rmCls(audio.wrapper, audio.config.playerTemplate.loadingCls);
						}
						if(audio.loadedPercent >= 1) {
							clearInterval(audio.loadTimer);
						} else {
							loaderPercent = audio.loadedPercent;
						}
					}, 300);
				}
			}
			//audio.loadCount++;
		}, 300);
	},
	adjustProgressIconPos : function(time) {
		var player = this.config.playerTemplate, //
		scrubber = $kit.el8cls(player.scrubberCls, this.wrapper), //
		progress = $kit.el8cls(player.progressCls, this.wrapper);
		progress.style.width = (scrubber.offsetWidth * (time / this.duration)) + 'px';
	},
	/**
	 * 注册自定义事件
	 * @param {Object} config
	 * @param {String} config.ev
	 * @param {Function} config.fn
	 */
	ev : function() {
		if(arguments.length == 1) {
			var evCfg = arguments[0];
			var scope = evCfg.scope || this;
			if($kit.isFn(evCfg.fn) && $kit.isStr(evCfg.ev)) {
				var evCfg = {
					ev : evCfg.ev,
					fn : evCfg.fn,
					scope : this
				};
				this.event = this.event || {};
				this.event[evCfg.ev] = this.event[evCfg.ev] || [];
				this.event[evCfg.ev].push(evCfg);
			}
		}
	},
	/**
	 * 触发自定义事件
	 * @param {Object} config
	 * @param {String} config.ev
	 */
	newEv : function() {
		if(arguments.length == 1 && !$kit.isEmpty(this.event)) {
			var evAry, evCfg, _evCfg = {};
			if($kit.isStr(arguments[0])) {
				var ev = arguments[0];
				evAry = this.event[ev];
			} else if($kit.isObj(arguments[0])) {
				_evCfg = arguments[0];
				evAry = this.event[_evCfg.ev];
			}
			if(!$kit.isEmpty(evAry)) {
				for(var i = 0; evAry != null && i < evAry.length; i++) {
					evCfg = $kit.merge(evAry[i], _evCfg);
					var e = {
						target : this,
						type : evCfg.ev
					}
					evCfg.fn.call(evCfg.scope, e, evCfg);
				}
			}
		}
	},
	/**
	 * bind ready event
	 * @param {Function}
	 */
	ready : function(fn) {
		/*
		 var count = 0, audio = this;
		 var intervalReady = setInterval(function() {
		 if(audio.swfReady == true || (audio.element != null && audio.element.readyState != null && audio.element.readyState > 1)) {
		 clearInterval(intervalReady);
		 fn.call(audio);
		 }
		 if(count > 100) {
		 clearInterval(intervalReady);
		 throw new Exception('error', 'iterate too many times!')
		 }
		 count++;
		 }, 300);
		 */
		var audio = this;
		clearInterval(audio.intervalReady);
		if(audio.readyState) {
			fn.call(audio);
		} else {
			audio.intervalReady = setInterval(function() {
				if(audio.readyState) {
					clearInterval(audio.intervalReady);
					fn.call(audio);
				}
			}, 300);
		}
	}
});
