$kit.ui.Audio = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
	me.create();
}
$kit.merge($kit.ui.Audio, {
	defaultConfig : {
		el : undefined,
		kitWidgetName : "kitAudio",
		audioCls : 'kitjs_audio',
		autoplay : false,
		loop : false,
		preload : true,
		swfLocation : 'http://localhost/KitJs/KitJs/demo/Audio/audiojs.swf',
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
			markup : ['<div class="play-pause">', //
			'<p class="play"></p>', //
			'<p class="pause"></p>', //
			'<p class="loading"></p>', //
			'<p class="error"></p>', //
			'</div>', '<div class="scrubber">', //
			'<div class="progress"></div>', //
			'<div class="loaded"></div>', //
			'</div>', //
			'<div class="time">', //
			'<em class="played">00:00</em>/<strong class="duration">00:00</strong>', //
			'</div>', //
			'<div class="error-message"></div>'//
			].join(''),
			playPauseClass : 'play-pause',
			scrubberClass : 'scrubber',
			progressClass : 'progress',
			loaderClass : 'loaded',
			timeClass : 'time',
			durationClass : 'duration',
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
			errorMessage = this.getByClass(player.errorMessageClass, this.wrapper), //
			html = 'Missing <a href="http://get.adobe.com/flashplayer/">flash player</a> plugin.';
			if(this.mp3)
				html += ' <a href="' + this.mp3 + '">Download audio file</a>.';
			$kit.rmCls(this.wrapper, player.loadingClass);
			$kit.adCls(this.wrapper, this.config.playerTemplate.errorClass);
			errorMessage.innerHTML = html;
		},
		loadError : function(e) {
			var player = this.config.playerTemplate, //
			errorMessage = this.getByClass(player.errorMessageClass, this.wrapper);
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
			duration = this.getByClass(player.durationClass, this.wrapper), //
			m = Math.floor(this.duration / 60), s = Math.floor(this.duration % 60);
			$kit.rmCls(this.wrapper, player.loadingClass);
			duration.innerHTML = ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
		},
		loadProgress : function(percent) {
			var player = this.config.playerTemplate, //
			scrubber = this.getByClass(player.scrubberClass, this.wrapper), //
			loaded = this.getByClass(player.loaderClass, this.wrapper);
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
			scrubber = this.getByClass(player.scrubberClass, this.wrapper), //
			progress = this.getByClass(player.progressClass, this.wrapper);
			progress.style.width = (scrubber.offsetWidth * percent) + 'px';

			var played = this.getByClass(player.playedClass, this.wrapper), //
			p = this.duration * percent, //
			m = Math.floor(p / 60), s = Math.floor(p % 60);
			played.innerHTML = ((m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s);
		}
	}
});
$kit.merge($kit.ui.Audio.prototype, {
	//
	create : function() {
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
		var id = $kit.onlyId();
		// If `<audio>` or mp3 playback isn't supported, insert the swf & attach the required events for it.
		if(config.useFlash && config.hasFlash) {
			this.injectFlash(this, id);
			this.attachFlashEvents(this.wrapper, this);
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
	// ### Creating and returning a new instance
	// This goes through all the steps required to build out a usable `audiojs` instance.
	// ### Helper methods for constructing a working player
	// Inject a wrapping div and the markup for the html player.
	createPlayer : function(element, player, id) {
		var wrapper = document.createElement('div'), newElement = element.cloneNode(true);
		wrapper.setAttribute('class', 'audiojs');
		wrapper.setAttribute('className', 'audiojs');
		wrapper.setAttribute('id', id);
		// Fix IE's broken implementation of `innerHTML` & `cloneNode` for HTML5 elements.
		if(newElement.outerHTML && !document.createElement('audio').canPlayType) {
			newElement = this.cloneHtml5Node(element);
			wrapper.innerHTML = player.markup;
			wrapper.appendChild(newElement);
			element.outerHTML = wrapper.outerHTML;
			wrapper = document.getElementById(id);
		} else {
			wrapper.appendChild(newElement);
			wrapper.innerHTML = wrapper.innerHTML + player.markup;
			element.parentNode.replaceChild(wrapper, element);
		}
		return wrapper.getElementsByTagName('audio')[0];
	},
	// **Handle all the IE6+7 requirements for cloning `<audio>` nodes**
	// Create a html5-safe document fragment by injecting an `<audio>` element into the document fragment.
	cloneHtml5Node : function(audioTag) {
		var fragment = document.createDocumentFragment(), //
		doc = fragment.createElement ? fragment : document;
		doc.createElement('audio');
		var div = doc.createElement('div');
		fragment.appendChild(div);
		div.innerHTML = audioTag.outerHTML;
		return div.firstChild;
	},
	// Attaches useful event callbacks to an `audiojs` instance.
	attachEvents : function(wrapper, audio) {
		if(!audio.config.playerTemplate)
			return;
		var player = audio.config.playerTemplate, //
		playPause = this.getByClass(player.playPauseClass, wrapper), //
		scrubber = this.getByClass(player.scrubberClass, wrapper), //
		leftPos = function(elem) {
			var curleft = 0;
			if(elem.offsetParent) {
				do {
					curleft += elem.offsetLeft;
				} while (elem = elem.offsetParent);
			}
			return curleft;
		};

		this.events.addListener(playPause, 'click', function(e) {
			audio.playPause.apply(audio);
		});

		this.events.addListener(scrubber, 'click', function(e) {
			var relativeLeft = e.clientX - leftPos(this);
			audio.skipTo(relativeLeft / scrubber.offsetWidth);
		});
		// _If flash is being used, then the following handlers don't need to be registered._
		if(audio.config.useFlash)
			return;

		// Start tracking the load progress of the track.
		this.events.trackLoadProgress(audio);

		this.events.addListener(audio.element, 'timeupdate', function(e) {
			audio.updatePlayhead.apply(audio);
		});

		this.events.addListener(audio.element, 'ended', function(e) {
			audio.trackEnded.apply(audio);
		});

		this.events.addListener(audio.source, 'error', function(e) {
			// on error, cancel any load timers that are running.
			clearInterval(audio.readyTimer);
			clearInterval(audio.loadTimer);
			audio.config.loadError.apply(audio);
		});
	},
	// Flash requires a slightly different API to the `<audio>` element, so this method is used to overwrite the standard event handlers.
	attachFlashEvents : function(element, audio) {
		audio['swfReady'] = false;
		audio['load'] = function(mp3) {
			// If the swf isn't ready yet then just set `audio.mp3`. `init()` will load it in once the swf is ready.
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
			if(audio.config.preload)
				audio.element.loading(audio.mp3);
			if(audio.config.autoplay)
				audio.play.apply(audio);
		}
	},
	// ### Injecting an swf from a string
	// Build up the swf source by replacing the `$keys` and then inject the markup into the page.
	injectFlash : function(audio, id) {
		var flashSource = $kit.tpl(this.config.flashSource, {
			arg1 : id,
			arg2 : this.config.swfLocation,
			arg3 : (+new Date + Math.random()), // `(+new Date)` ensures the swf is not pulled out of cache. The fixes an issue with Firefox running multiple players on the same page.
			arg4 : '$kit.el(\'#' + this.wrapper.id + '\')[\'' + this.config.kitWidgetName + '\']'
		});
		// Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
		var html = audio.wrapper.innerHTML, div = document.createElement('div');
		div.innerHTML = flashSource + html;
		audio.wrapper.innerHTML = div.innerHTML;
		audio.element = this.getSwf(id);
	},
	// **getElementsByClassName**
	// Having to rely on `getElementsByTagName` is pretty inflexible internally, so a modified version of Dustin Diaz's `getElementsByClassName` has been included.
	// This version cleans things up and prefers the native DOM method if it's available.
	getByClass : function(searchClass, node) {
		var matches = [];
		node = node || document;

		if(node.getElementsByClassName) {
			matches = node.getElementsByClassName(searchClass);
		} else {
			var i, l, els = node.getElementsByTagName("*"), pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");

			for( i = 0, l = els.length; i < l; i++) {
				if(pattern.test(els[i].className)) {
					matches.push(els[i]);
				}
			}
		}
		return matches.length > 1 ? matches : matches[0];
	},
	// **Cross-browser `<object>` / `<embed>` element selection**
	getSwf : function(name) {
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
	init : function() {
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
		// On iOS this interaction will trigger loading the mp3, so run `init()`.
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
	// ## Event-handling
	events : {
		memoryLeaking : false,
		listeners : [],
		// **A simple cross-browser event handler abstraction**
		addListener : function(element, eventName, func) {
			// For modern browsers use the standard DOM-compliant `addEventListener`.
			if(element.addEventListener) {
				element.addEventListener(eventName, func, false);
				// For older versions of Internet Explorer, use `attachEvent`.
				// Also provide a fix for scoping `this` to the calling element and register each listener so the containing elements can be purged on page unload.
			} else if(element.attachEvent) {
				this.listeners.push(element);
				if(!this.memoryLeaking) {
					window.attachEvent('onunload', function() {
						if(this.listeners) {
							for(var i = 0, ii = this.listeners.length; i < ii; i++) {
								this.events.purge(this.listeners[i]);
							}
						}
					});
					this.memoryLeaking = true;
				}
				element.attachEvent('on' + eventName, function() {
					func.call(element, window.event);
				});
			}
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
						audio.init.apply(audio);
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
		},
		// **Douglas Crockford's IE6 memory leak fix**
		// <http://javascript.crockford.com/memory/leak.html>
		// This is used to release the memory leak created by the circular references created when fixing `this` scoping for IE. It is called on page unload.
		purge : function(d) {
			var a = d.attributes, i;
			if(a) {
				for( i = 0; i < a.length; i += 1) {
					if( typeof d[a[i].name] === 'function')
						d[a[i].name] = null;
				}
			}
			a = d.childNodes;
			if(a) {
				for( i = 0; i < a.length; i += 1)purge(d.childNodes[i]);
			}
		}
	}
});
