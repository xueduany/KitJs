/**
 * event enhance
 */
$kit.merge($Kit.prototype.CONSTANTS, {
	KIT_EVENT_EXTRA : "KIT_EVENT_EXTRA",
	CLOCKWISE_ROTATION : 1,
	COUNTERCLOCKWISE_ROTATION : -1
});
$kit.merge($Kit.prototype, {
	evExtra : function(ev) {
		var me = this;
		return me.merge({}, me.evPos(ev), me.evExtraTouchStart(ev), me.evExtraTouchMove(ev), me.evExtraTouchEnd(ev));
	},
	evExtraTouchStart : function(ev) {
		var me = this;
		if (ev.type == "mousedown" || ev.type == "touchstart") {
			window[me.CONSTANTS.KIT_EVENT_EXTRA] = window[me.CONSTANTS.KIT_EVENT_EXTRA] || {}
			window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"] = {};
			window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"].trigger = true;
			window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"].pos = me.evPos(ev);
			delete window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"];
		}
	},
	evExtraTouchMove : function(ev) {
		var me = this;
		$kit.clsLog();
		if ((ev.type == "mousemove" || ev.type == "touchmove") && me.isTapping()) {
			window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"] = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"] || {};
			var pos = me.evPos(ev), startPos = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"].pos, lastPos = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].pos;
			// 画圈
			var tanValue = (startPos.firstFingerPageY - pos.firstFingerPageY) / (pos.firstFingerPageX - startPos.firstFingerPageX);
			var angle = Math.atan(tanValue) * 180 / Math.PI;
			var lastAngle = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].lastAngle;
			var angleOfRotation = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].angleOfRotation || 0;
			var circleIsComplete = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].circleIsComplete || 0;
			var halfCircleIsComplete = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].halfCircleIsComplete || 0;
			var directionOfRotation = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].directionOfRotation || 0;
			if (!$kit.isEmpty(angle) && !isNaN(angle)) {
				if (Math.abs(angle) == 90 || $kit.isEmpty(lastAngle) || isNaN(lastAngle)) {
				} else {
					// draw a circle
					if (angle * lastAngle < 0) {
						angleOfRotation = angleOfRotation + 90 - Math.abs(angle);
					} else if (angle * lastAngle > 0) {
						if (directionOfRotation == me.CONSTANTS.CLOCKWISE_ROTATION && angle < lastAngle) {
							angleOfRotation += Math.abs(Math.abs(angle) - Math.abs(lastAngle));
						} else if (directionOfRotation == me.CONSTANTS.COUNTERCLOCKWISE_ROTATION && angle > lastAngle) {
							angleOfRotation += Math.abs(Math.abs(angle) - Math.abs(lastAngle));
						}
					}
					if (directionOfRotation == 0) {
						if (angle > lastAngle) {
							directionOfRotation = me.CONSTANTS.COUNTERCLOCKWISE_ROTATION;
						} else {
							directionOfRotation = me.CONSTANTS.CLOCKWISE_ROTATION;
						}
					}
				}
				if (directionOfRotation == me.CONSTANTS.CLOCKWISE_ROTATION && halfCircleIsComplete == 0//
						&& (lastPos.firstFingerPageX + pos.firstFingerPageX > startPos.firstFingerPageX)//
						&& (lastPos.firstFingerPageX + pos.firstFingerPageX < 2 * startPos.firstFingerPageX) //
				) {
					halfCircleIsComplete = 1;
				} else if (halfCircleIsComplete == 1 && circleIsComplete == 0//
						&& (lastPos.firstFingerPageX + pos.firstFingerPageX > startPos.firstFingerPageX)//
						&& (lastPos.firstFingerPageX + pos.firstFingerPageX < 2 * startPos.firstFingerPageX) //
				) {
					circleIsComplete = 1;
				}
				me.merge(window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"], {
					lastAngle : angle,
					angleOfRotation : angleOfRotation,
					circleIsComplete : circleIsComplete,
					halfCircleIsComplete : halfCircleIsComplete,
					directionOfRotation : directionOfRotation
				});
				$kit.log(circleIsComplete);
				$kit.log(halfCircleIsComplete);
				$kit.log(angleOfRotation);
			}
			// 打钩
			if (!me.isEmpty(lastPos)) {
				var intervalTanValue = (lastPos.firstFingerPageY - pos.firstFingerPageY) / (pos.firstFingerPageX - lastPos.firstFingerPageX);
				var intervalAngle = Math.atan(intervalTanValue) * 180 / Math.PI;
				var lastIntervalAngle = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].intervalAngle || 0;
				//
				var anchorStep = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorStep || [0, 0, 0];
				var anchorFlag = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorFlag || 0;
				var anchorLeftSize = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorLeftSize || 0;
				var anchorMilestone = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorMilestone;
				var anchorRightSize = window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorRightSize || 0;
				if (intervalAngle == 0) {
					//
				} else if (intervalAngle < 0 && intervalAngle > -90 && anchorStep[1] == 0) {
					anchorStep[0] = 1;
					if (anchorStep[1] == 0) {
						anchorLeftSize = Math.sqrt(Math.pow(startPos.firstFingerPageY - pos.firstFingerPageY, 2) + Math.pow(pos.firstFingerPageX - startPos.firstFingerPageX, 2));
					}
				} else if (intervalAngle > 0 && intervalAngle < 90 && anchorStep[0] == 1) {
					anchorStep[1] = 1;
					if (me.isEmpty(anchorMilestone)) {
						anchorMilestone = pos;
					}
					if (anchorStep[2] == 0) {
						anchorRightSize = Math.sqrt(Math.pow(anchorMilestone.firstFingerPageY - pos.firstFingerPageY, 2) + Math.pow(pos.firstFingerPageX - anchorMilestone.firstFingerPageX, 2));
					}
					if (anchorStep[2] == 0 && anchorRightSize > anchorLeftSize * 1.5) {
						anchorStep[2] = 1;
					}
				}
				if (anchorStep[2] == 1 && intervalAngle < 0) {
					anchorStep = [0, 0, 0];
				}
				var flag = 1;
				for ( var i = 0; i < anchorStep.length; i++) {
					flag *= anchorStep[i];
				}
				window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorFlag = flag;
				window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorStep = anchorStep;
				window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorLeftSize = anchorLeftSize;
				window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorMilestone = anchorMilestone;
				window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorRightSize = anchorRightSize;
				//
				me.merge(window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"], {
					intervalTanValue : intervalTanValue,
					intervalAngle : intervalAngle,
					lastIntervalAngle : lastIntervalAngle
				});
			}
			me.merge(window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"], {
				pos : pos
			});
		}
	},
	evExtraTouchEnd : function(ev) {
		var me = this;
		if ((ev.type == "mouseup" || ev.type == "touchend") && me.isTapping()) {
			window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"].trigger = false;
			me.merge(window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"], me.evPos(ev));
			if (window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].angleOfRotation > 180 && window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].circleIsComplete == 1) {
				alert("你画了一个圆");
			}
			if (window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchmove"].anchorFlag) {
				// alert("你打了一个勾");
			}
		}
	},
	isTapping : function(ev) {
		var me = this;
		var flag = false;
		if (window[me.CONSTANTS.KIT_EVENT_EXTRA] && window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"] && window[me.CONSTANTS.KIT_EVENT_EXTRA]["touchstart"].trigger) {
			flag = true;
		}
		return flag;
	}
});
$_kit = $kit;
$kit = new $Kit();
$kit.mergeIf($kit, $_kit);
$_kit = null;