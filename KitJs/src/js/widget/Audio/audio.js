$kit.ui.Audio = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.init();
}
$kit.merge($kit.ui.Audio, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : "kitAudio",
		audioCls : 'kitjs_audio',
		autoplay : false,
		loop : false,
		preload : true,
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
		// The default markup and classes for creating the player:
		playerTemplate : {
			markup : ['<div class="${playPauseClass}">', //
			'<p class="${playButtonClass}"></p>', //
			'<p class="${pauseButtonClass}"></p>', //
			'<p class="${loadingStatusClass}"></p>', //
			'<p class="${errorStatusClass}"></p>', //
			'</div>', //
			'<div class="${scrubberClass}">', //
			'<div class="${progressClass}">', //
			'<i class="${progressIcon}"></i>', //
			'<div class="${timeClass}">', //
			'<em class="${playedClass}">00:00</em>/<strong class="${durationClass}">00:00</strong>', //
			'</div>', //
			'</div>', //
			'<div class="${loaderClass}"></div>', //
			'</div>', //
			'<div class="${errorMessageClass}"></div>'//
			].join(''),
			playPauseClass : 'play-pause',
			playButtonClass : 'play',
			pauseButtonClass : 'pause',
			loadingStatusClass : 'loading',
			errorStatusClass : 'error',
			scrubberClass : 'scrubber',
			progressClass : 'progress',
			progressIcon : 'time-icon',
			timeClass : 'time',
			durationClass : 'duration',
			loaderClass : 'loaded',
			playedClass : 'played',
			errorMessageClass : 'error-message',
			playingClass : 'playing',
			loadingClass : 'loading',
			errorClass : 'error'
		},
		flashSource : [//
		'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="${arg1}" width="1" height="1" name="${arg1}" style="position: absolute; left: -1px;">', //
		'<param name="movie" value="${arg2}?playerInstance=${arg4}&datetime=${arg3}">', //
		'<param name="allowscriptaccess" value="always">', //
		'<embed name="${arg1}" src="${arg2}?playerInstance=${arg4}&datetime=${arg3}" width="1" height="1" allowscriptaccess="always">', //
		'</object>'//
		].join(''),
		// The default event callbacks:
		trackEnded : function(e) {
		},
		flashError : function() {
			var player = this.config.playerTemplate, //
			errorMessage = $kit.el8cls(player.errorMessageClass, this.wrapper), //
			html = 'Missing <a href="http://get.adobe.com/flashplayer/">flash player</a> plugin.';
			if(this.mp3)
				html += ' <a href="' + this.mp3 + '">Download audio file</a>.';
			$kit.rmCls(this.wrapper, player.loadingClass);
			$kit.adCls(this.wrapper, this.config.playerTemplate.errorClass);
			errorMessage.innerHTML = html;
		},
		loadError : function(e) {
			var player = this.config.playerTemplate, //
			errorMessage = $kit.el8cls(player.errorMessageClass, this.wrapper);
			$kit.rmCls(this.wrapper, this.config.playerTemplate.loadingClass);
			$kit.adCls(this.wrapper, this.config.playerTemplate.errorClass);
			errorMessage.innerHTML = 'Error loading: "' + this.mp3 + '"';
		},
		loading : function() {
			var player = this.config.playerTemplate;
			$kit.adCls(this.wrapper, this.config.playerTemplate.loadingClass);
		},
		loadStarted : function() {
			var player = this.config.playerTemplate, //
			duration = $kit.el8cls(player.durationClass, this.wrapper), //
			m = Math.floor(this.duration / 60), s = Math.floor(this.duration % 60);
			$kit.rmCls(this.wrapper, player.loadingClass);
			duration.innerHTML = ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
		},
		loadProgress : function(percent) {
			var player = this.config.playerTemplate, //
			scrubber = $kit.el8cls(player.scrubberClass, this.wrapper), //
			loaded = $kit.el8cls(player.loaderClass, this.wrapper);
			loaded.style.width = (scrubber.offsetWidth * percent) + 'px';
		},
		playPause : function() {
			if(this.playing)
				this.config.play();
			else
				this.config.pause();
		},
		play : function() {
			var player = this.config.playerTemplate;
			$kit.adCls(this.wrapper, this.config.playerTemplate.playingClass);
		},
		pause : function() {
			var player = this.config.playerTemplate;
			$kit.rmCls(this.wrapper, player.playingClass);
		},
		updatePlayhead : function(percent) {
			var player = this.config.playerTemplate, //
			scrubber = $kit.el8cls(player.scrubberClass, this.wrapper), //
			progress = $kit.el8cls(player.progressClass, this.wrapper);
			progress.style.width = (scrubber.offsetWidth * percent) + 'px';

			var played = $kit.el8cls(player.playedClass, this.wrapper), //
			p = this.duration * percent, //
			m = Math.floor(p / 60), s = Math.floor(p % 60);
			played.innerHTML = ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
		}
	}
});
$kit.merge($kit.ui.Audio.prototype, {
	/**
	 * initilize
	 */
	init : function() {
		var me = this, config = me.config;
		if($kit.isEmpty(config.el)) {
			return;
		}
		var element = config.el;
		//
		var wrapperId = $kit.onlyId();
		if(config.playerTemplate) {
			element = this.createPlayer(config.el, config.playerTemplate, wrapperId);
		} else {
			element.parentNode.setAttribute('id', wrapperId);
		}
		// Constructor
		this.element = element;
		this.wrapper = element.parentNode;
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
			this.injectFlash(flashId);
			this.attachFlashEvents();
		} else if(config.useFlash && !config.hasFlash) {
			config.flashError.apply(this);
		}
		// Attach event callbacks to the new audiojs instance.
		if(!config.useFlash || (config.useFlash && config.hasFlash)) {
			this.attachEvents(this.wrapper, this);
		}
		// bind instance
		this.element[config.kitWidgetName] = this;
		this.wrapper[config.kitWidgetName] = this;
	},
	/**
	 * 生成自定义的播放器模板HTML
	 */
	createPlayer : function(element, template, wrapperId) {
		var wrapper = document.createElement('div'), //
		newElement = element.cloneNode(true);
		wrapper.setAttribute('class', 'audiojs');
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
		playPause = $kit.el8cls(player.playPauseClass, wrapper), //
		scrubber = $kit.el8cls(player.scrubberClass, wrapper), //
		progress = $kit.el8cls(player.progressClass, wrapper), //
		progressIcon = $kit.el8cls(player.progressIcon, wrapper);
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
				this._flag_dragStart = true;
				e.stopDefault();
			},
			scope : audio
		});
		$kit.ev({
			el : scrubber,
			ev : 'mousemove',
			fn : function(e, cfg) {
				if(this._flag_dragStart == true) {
					if(this.playing) {
						this.pause();
						this._flag_palying_when_drag = true;
					}
					var distance = e.clientX - $kit.offset(scrubber).left;
					progress.style.width = distance + 'px';
					var p = this.duration * $kit.css(progress, 'width') / $kit.css(scrubber, 'width'), //
					m = Math.floor(p / 60), //
					s = Math.floor(p % 60);
					this.innerHTML = ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
				}
				e.stopDefault();
			},
			scope : audio
		});
		$kit.ev({
			el : progressIcon,
			ev : 'mouseup mouseout',
			fn : function(e, cfg) {
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
				}
				e.stopDefault();
			},
			scope : audio
		});
		// _If flash is being used, then the following handlers don't need to be registered._
		if(audio.config.useFlash)
			return;

		// Start tracking the load progress of the track.
		this.trackLoadProgress(audio);

		$kit.ev({
			el : audio.element,
			ev : 'timeupdate',
			fn : function(e) {
				audio.updatePlayhead.apply(audio);
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
			if(audio.swfReady)
				audio.element.load(mp3);
		}
		audio['loadProgress'] = function(percent, duration) {
			audio.loadedPercent = percent;
			audio.duration = duration;
			audio.config.loadStarted.apply(audio);
			audio.config.loadProgress.apply(audio, [percent]);
		}
		audio['skipTo'] = function(percent) {
			if(percent > audio.loadedPercent)
				return;
			audio.updatePlayhead.call(audio, [percent])
			audio.element.skipTo(percent);
		}
		audio['skipTimeTo'] = function(time) {
			if(time > audio.duration)
				return;
			audio.updatePlayhead.call(audio, [time])
			audio.element.skipTimeTo(time);
		}
		audio['updatePlayhead'] = function(percent) {
			audio.config.updatePlayhead.apply(audio, [percent]);
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
		}
		audio['pause'] = function() {
			audio.playing = false;
			// Use `ppause()` for consistency with `pplay()`, even though it isn't really required.
			audio.element.ppause();
			audio.config.pause.apply(audio);
		}
		audio['setVolume'] = function(v) {
			audio.element.setVolume(v);
		}
		audio['loadStarted'] = function() {
			// Load the mp3 specified by the audio element into the swf.
			audio.swfReady = true;
			if(audio.config.preload) {
				audio.element.load(audio.mp3);
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
			arg4 : "$kit.el('#" + id + "')['" + this.config.kitWidgetName + "']"//'$kit.el(\'#' + this.wrapper.id + '\')[\'' + this.config.kitWidgetName + '\']'
		});
		// Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
		var html = this.wrapper.innerHTML, div = document.createElement('div');
		div.innerHTML = flashSource + html;
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
	updatePlayhead : function() {
		var percent = this.element.currentTime / this.duration;
		this.config.updatePlayhead.apply(this, [percent]);
	},
	skipTo : function(percent) {
		if(percent > this.loadedPercent)
			return;
		this.element.currentTime = this.duration * percent;
		this.updatePlayhead();
	},
	skipTimeTo : function(time) {
		if(time > this.duration)
			return;
		this.element.currentTime = time;
		this.updatePlayhead();
	},
	load : function(mp3) {
		this.loadStartedCalled = false;
		this.source.setAttribute('src', mp3);
		// The now outdated `load()` method is required for Safari 4
		this.element.load();
		this.mp3 = mp3;
		this.events.trackLoadProgress(this);
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
		}
	},
	playPause : function() {
		if(this.playing)
			this.pause();
		else
			this.play();
	},
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
			this.events.trackLoadProgress(this);
		}
		this.playing = true;
		this.element.play();
		this.config.play.apply(this);
	},
	pause : function() {
		this.playing = false;
		this.element.pause();
		this.config.pause.apply(this);
	},
	setVolume : function(v) {
		this.element.volume = v;
	},
	trackEnded : function(e) {
		this.skipTo.apply(this, [0]);
		if(!this.config.loop)
			this.pause.apply(this);
		this.config.trackEnded.apply(this);
	},
	trackLoadProgress : function(audio) {
		// If `preload` has been set to `none`, then we don't want to start loading the track yet.
		if(!audio.config.preload)
			return;

		var readyTimer, loadTimer, audio = audio, ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);

		// Use timers here rather than the official `progress` event, as Chrome has issues calling `progress` when loading mp3 files from cache.
		readyTimer = setInterval(function() {
			if(audio.element.readyState > -1) {
				// iOS doesn't start preloading the mp3 until the user interacts manually, so this stops the loader being displayed prematurely.
				if(!ios)
					audio.loading.apply(audio);
			}
			if(audio.element.readyState > 1) {
				if(audio.config.autoplay)
					audio.play.apply(audio);
				clearInterval(readyTimer);
				// Once we have data, start tracking the load progress.
				loadTimer = setInterval(function() {
					audio.loadProgress.apply(audio);
					if(audio.loadedPercent >= 1)
						clearInterval(loadTimer);
				});
			}
		}, 10);
		audio.readyTimer = readyTimer;
		audio.loadTimer = loadTimer;
	}
});
