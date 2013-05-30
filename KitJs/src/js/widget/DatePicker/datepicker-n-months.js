/**
 * 多月日历（支持滑动多选,界面仿Twitter风格，多语言支持，Ctrl/Shift多选支持，日期范围限制支持，自定义事件支持）
 * @class $kit.ui.DatePicker.NMonths
 * @extends $kit.ui.DatePicker
 * @requires kit.js
 * @requires ieFix.js
 * @requires dom.js
 * @requires array.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/DatePicker/datepicker-n-months.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/DatePicker/n-months.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/DatePicker/nmonth.png">
 */
$kit.ui.DatePicker.NMonths = function(config) {
	$kit.inherit({
		child : $kit.ui.DatePicker.NMonths,
		father : $kit.ui.DatePicker
	});
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.DatePicker.NMonths,
/**
 * @lends $kit.ui.DatePicker.NMonths
 */
{
	/**
	 * @enum
	 */
	defaultConfig : $kit.join($kit.ui.DatePicker.defaultConfig,
	/**
	 * @lends $kit.ui.DatePicker.NMonths.defaultConfig
	 * @enum
	 */
	{
		template : {
			pickerHTML : [//
			'<div class="datepicker">', //
			'<div class="datepicker-days">', //
			'${pickerDaysHTML}', //
			'</div>', //
			'<div class="datepicker-months">', //
			'<table class="table-condensed">', //
			'${headHTML}', //
			'${contHTML}', //
			'</table>', //
			'</div>', //
			'<div class="datepicker-years">', //
			'<table class="table-condensed">', //
			'${headHTML}', //
			'${contHTML}', //
			'</table>', //
			'</div>', //
			'</div>'//
			].join(''),
			headHTML : [//
			'<thead>', //
			'<tr>', //
			'<th class="prev" onselectstart="return false"><i class="icon-arrow-left">&lt;</i></th>', //
			'<th colspan="5" class="switch"></th>', //
			'<th class="next" onselectstart="return false"><i class="icon-arrow-right">&gt;</i></th>', //
			'</tr>', //
			'</thead>'//
			].join(''),
			contHTML : '<tbody><tr><td colspan="7"></td></tr></tbody>',
			dropDownCls : 'dropdown-menu',
			pickerDaysHTML : [//
			'<table class="table-condensed">', //
			'${headHTML}', //
			'${contHTML}', //
			'</table>' //
			].join('')
		},
		/**
		 * 配置显示多少个月的日历
		 * @type {Number}
		 */
		nMonths : 3 //配置显示多少个月的日历
	})
});
$kit.merge($kit.ui.DatePicker.NMonths.prototype,
/**
 * @lends $kit.ui.DatePicker.NMonths.prototype
 */
{
	buildHTML : function() {
		var me = this;
		var str = $kit.tpl(me.config.template.pickerDaysHTML, me.config.template);
		var pickerDaysHTML = str;
		for(var i = 1; i < me.config.nMonths; i++) {
			pickerDaysHTML += str;
		}
		me.picker = $kit.newHTML($kit.tpl(me.config.template.pickerHTML, $kit.join(me.config.template, {
		pickerDaysHTML : pickerDaysHTML
		}))).childNodes[0];
		document.body.appendChild(me.picker);
	},
	/**
	 * 天数面板
	 */
	fill : function() {
		var me = this;
		me.currentMonthCol = me.currentMonthCol || 0;
		var d = new Date(me.viewDate), year = d.getFullYear(), month = d.getMonth(), //
		startYear = me.startDate !== -Infinity ? me.startDate.getFullYear() : -Infinity, //
		startMonth = me.startDate !== -Infinity ? me.startDate.getMonth() : -Infinity, //
		endYear = me.endDate !== Infinity ? me.endDate.getFullYear() : Infinity, //
		endMonth = me.endDate !== Infinity ? me.endDate.getMonth() : Infinity;
		//month = month + me.currentMonthCol;
		me.updateNavArrows();
		me.fillMonths();
		//
		var _year = year;
		for(var i = 0; i < me.config.nMonths; i++) {
			if(i == 0) {
				$kit.$el('.datepicker-days table:eq('+i+') th.next', me.picker)[0].style.visibility = 'hidden';
			} else if(i == me.config.nMonths - 1) {
				$kit.$el('.datepicker-days table:eq('+i+') th.prev', me.picker)[0].style.visibility = 'hidden';
			} else {
				$kit.$el('.datepicker-days table:eq('+i+') th.next', me.picker)[0].style.visibility = 'hidden';
				$kit.$el('.datepicker-days table:eq('+i+') th.prev', me.picker)[0].style.visibility = 'hidden';
			}
			if(i > 0) {
				month++;
				month = month % 12;
			}
			//
			if(_year == year && me.viewDate.getMonth() + i >= 12) {
				_year += 1;
			}
			var prevMonth = new Date(_year, month - 1, 28, 0, 0, 0, 0);
			var day = $kit.date.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
			prevMonth.setDate(day);
			prevMonth.setDate(day - (prevMonth.getDay() - me.weekStart + 7) % 7);
			//
			var nextMonth = new Date(prevMonth);
			nextMonth = new Date(prevMonth);
			nextMonth.setDate(nextMonth.getDate() + 42);
			//
			if(me.config.language != 'cn') {
				$kit.$el('.datepicker-days table:eq('+i+') th:eq(1)',me.picker)[0].innerHTML = $kit.date.languagePack[me.language].months[month] + ' ' + _year;
			} else {
				$kit.$el('.datepicker-days table:eq('+i+') th:eq(1)',me.picker)[0].innerHTML = _year + '年' + $kit.date.languagePack[me.language].months[month];
			}
			// start
			html = [];
			var clsName;
			while(prevMonth.valueOf() < nextMonth.valueOf()) {
				var notShow = false;
				if(prevMonth.getDay() == me.weekStart) {
					html.push('<tr>');
				}
				clsName = '';
				if(prevMonth.getFullYear() < _year || (prevMonth.getFullYear() == _year && prevMonth.getMonth() < month)) {
					notShow = true;
					clsName += ' old';
				} else if(prevMonth.getFullYear() > _year || (prevMonth.getFullYear() == _year && prevMonth.getMonth() > month)) {
					notShow = true;
					clsName += ' new';
				}
				$kit.each(me.selectedDateAry, function(o) {
					if(o.valueOf() == prevMonth.valueOf()) {
						clsName += ' active';
						return false;
					}
				});
				if(prevMonth.valueOf() < me.startDate || prevMonth.valueOf() > me.endDate) {
					clsName += ' disabled';
				}
				if(!notShow) {
					html.push('<td class="day' + clsName + '">' + prevMonth.getDate() + '</td>');
				} else {
					html.push('<td></td>');
				}
				if(prevMonth.getDay() == me.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setDate(prevMonth.getDate() + 1);
			}
			var tbody = $kit.$el('.datepicker-days tbody:eq('+i+')', me.picker)[0];
			var _htm = html.join('');
			if($kit.isIE()) {
				while(tbody.rows.length) {
					tbody.deleteRow(0);
				}
				tbody.parentNode.replaceChild($kit.newHTML('<table><tbody>' + _htm + '</tbody></table>').firstChild.firstChild, tbody);
			} else {
				tbody.innerHTML = '';
				$kit.insEl({
					where : tbody,
					what : _htm,
					pos : 'last'
				});
			}
		}
		/**
		 * end
		 */
		var currentYear = me.viewDate.getFullYear();
		//
		var monthsEl = $kit.$el('.datepicker-months', me.picker)[0];
		$kit.dom.text($kit.$el('th:eq(1)', monthsEl)[0], year);
		$kit.each($kit.$el('span', monthsEl), function(o) {
			$kit.rmCls(o, 'active');
		});
		//if(currentYear == year) {
		$kit.each($kit.$el('span.month', monthsEl), function(o, i) {
			var _m = me.viewDate.getMonth() + me.currentMonthCol;
			_m = _m % 12;
			if(i == _m) {
				$kit.adCls(o, 'active');
				return false;
			}
		});
		//}
		if(year < startYear || year > endYear) {
			$kit.adCls(monthsEl, 'disabled');
		}
		if(year == startYear) {
			$kit.each($kit.$el('span', monthsEl).slice(0, startMonth), function(o) {
				$kit.adCls(o, 'disabled');
			});
		}
		if(year == endYear) {
			$kit.each($kit.$el('span', monthsEl).slice(endMonth + 1), function(o) {
				$kit.adCls(o, 'disabled');
			});
		}
		html = '';
		year = parseInt(year / 10, 10) * 10;
		//
		var yearEl = $kit.$el('.datepicker-years',me.picker)[0];
		$kit.dom.text($kit.$el('th:eq(1)', yearEl)[0], year + '-' + (year + 9));
		var yearCont = $kit.$el('td', yearEl);
		year -= 1;
		for(var i = -1; i < 11; i++) {
			html += '<span class="year' + (i == -1 || i == 10 ? ' old' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
			year += 1;
		}
		$kit.each(yearCont, function(o) {
			$kit.dom.html(o, html);
		});
	},
	/**
	 * 面板click事件
	 */
	click : function(e) {
		var me = this;
		if(me.mouseSlideSelect == true) {
			me.mouseSlideSelect = false;
			return;
		}
		e.stopNow();
		var target = e.target;
		if(target.tagName && $kit.array.hs(['span', 'td', 'th'], target.tagName.toLowerCase())) {
			//
		} else {
			target = $kit.parentEl(target, function(p) {
				if(p.tagName && $kit.array.hs(['span', 'td', 'th'], p.tagName.toLowerCase())) {
					return true;
				}
				if(p == me.picker) {
					return false;
				}
			});
		}
		if(target != null) {
			switch(target.nodeName.toLowerCase()) {
				case 'th':
					switch(target.className) {
						case 'switch':
							var n = $kit.array.indexOf($kit.$el('.datepicker-days table', me.picker), $kit.dom.parentEl8tag(target, 'table', me.picker));
							if(n >= 0) {
								me.currentMonthCol = n;
							}
							//
							var monthsEl = $kit.$el('.datepicker-months', me.picker)[0];
							$kit.each($kit.$el('span', monthsEl), function(o) {
								$kit.rmCls(o, 'active');
							});
							$kit.each($kit.$el('span.month', monthsEl), function(o, i) {
								if(i == (me.viewDate.getMonth() + me.currentMonthCol) % 12) {
									$kit.adCls(o, 'active');
									return false;
								}
							});
							//
							if(me.viewDate.getMonth() + me.currentMonthCol >= 12) {
								$kit.dom.text($kit.$el('th:eq(1)', monthsEl)[0], me.viewDate.getFullYear() + 1);
								var yearEl = $kit.$el('.datepicker-years',me.picker)[0];
								$kit.each($kit.$el('span.year', me.picker), function(o) {
									if($kit.hsCls(o, 'active') && $kit.dom.text(o) != me.viewDate.getFullYear() + 1) {
										$kit.rmCls(o, 'active');
									}
									if($kit.dom.text(o) == me.viewDate.getFullYear() + 1) {
										$kit.adCls(o, 'active');
										return false;
									}
								});
							}
							//
							me.showMode(1);
							break;
						case 'prev':
						case 'next':
							var dir = me.config.modes[me.viewMode].navStep * (target.className == 'prev' ? -1 : 1);
							switch(me.viewMode) {
								case 0:
									me.viewDate = $kit.date.moveMonth(me.viewDate, dir);
									break;
								case 1:
								case 2:
									me.viewDate = $kit.date.moveYear(me.viewDate, dir);
									break;
							}
							me.fill();
							break;
					}
					break;
				case 'span':
					if(!$kit.hsCls(target, 'disabled')) {
						if($kit.hsCls(target, 'month')) {
							var month = $kit.array.indexOf($kit.$el('span', target.parentNode), target);
							var year = $kit.dom.text($kit.$el('th.switch',$kit.dom.parentEl8tag(target,'table',me.picker))[0]);
							me.viewDate.setFullYear(year);
							if(me.currentMonthCol) {
								month = month - me.currentMonthCol;
							}
							me.viewDate.setMonth(month);
						} else {
							var monthsEl = $kit.$el('.datepicker-months', me.picker)[0];
							$kit.dom.text($kit.$el('th:eq(1)', monthsEl)[0], me.viewDate.getFullYear());
							var year = parseInt($kit.dom.text(target), 10) || 0;
							me.viewDate.setFullYear(year);
						}
						me.showMode(-1);
						me.fill();
					}
					break;
				case 'td':
					if($kit.hsCls(target, 'day') && !$kit.hsCls(target, 'disabled')) {
						var day = parseInt($kit.dom.text(target), 10) || 1;
						var n = $kit.array.indexOf($kit.$el('.datepicker-days table', me.picker), $kit.dom.parentEl8tag(target, 'table', me.picker));
						me.currentMonthCol = n;
						var year = me.viewDate.getFullYear(), month = me.viewDate.getMonth() + n;
						newDate = new Date(year, month, day, 0, 0, 0, 0);
						if(me.date && me.date.valueOf() == newDate.valueOf()) {
							$kit.rmCls(target, 'active');
							me.setValue(false);
							me.date = null;
						} else {
							me.date = newDate;
							//me.viewDate = new Date(year, month, day, 0, 0, 0, 0);
							me.fill();
							if(e.shiftKey && me.config.canMultipleChoose && me.selectedDateAry && me.selectedDateAry.length >= 1) {
								me.addValue(true);
							} else if(e.ctrlKey && me.config.canMultipleChoose && me.selectedDateAry && me.selectedDateAry.length >= 1) {
								me.addValue();
							} else {
								if(me.selectedDateAry && me.selectedDateAry.length > 1) {
									$kit.each($kit.$el('.datepicker-days td.day', me.picker), function(o) {
										$kit.rmCls(o, 'active');
									});
									$kit.rmCls(target, 'active');
									me.setValue(false);
									me.date = null;
								} else {
									me.setValue();
								}
							}
						}
					}
					break;
			}
		}
	},
	/**
	 * 星期几
	 */
	fillDow : function() {
		var me = this;
		var dowCnt = me.weekStart;
		var html = '<tr>';
		while(dowCnt < me.weekStart + 7) {
			html += '<th class="dow">' + $kit.date.languagePack[me.language][me.config.weekViewFormat][(dowCnt++) % 7] + '</th>';
		}
		html += '</tr>';
		$kit.each($kit.$el('.datepicker-days thead', me.picker), function(o) {
			var thead = o;
			if($kit.isIE()) {
				var tr = thead.insertRow(1);
				thead.replaceChild($kit.newHTML('<table><tbody>' + html + '</tbody></table>').firstChild.firstChild.firstChild, tr)
			} else {
				$kit.insEl({
					where : thead,
					what : html,
					pos : 'last'
				});
			}
		});
	},
	mousemove : function(e) {
		var me = this, target = e.target;
		if(!me.config.canMultipleChoose) {
			return;
		}
		if(me.slideSelectFlag != true) {
			return;
		}
		if(target.tagName && $kit.array.hs(['td'], target.tagName.toLowerCase())) {
			//
		} else {
			target = $kit.parentEl(target, function(p) {
				if(p.tagName && $kit.array.hs(['td'], p.tagName.toLowerCase())) {
					return true;
				}
				if(p == me.picker) {
					return false;
				}
			});
		}
		if($kit.hsCls(target, 'day')) {
			var day = parseInt($kit.dom.text(target), 10) || 1;
			var n = $kit.array.indexOf($kit.$el('.datepicker-days table', me.picker), $kit.dom.parentEl8tag(target, 'table', me.picker));
			var year = me.viewDate.getFullYear(), month = me.viewDate.getMonth() + n;
			if($kit.hsCls(target, 'old') && !$kit.hsCls(target, 'disabled')) {
				if(month == 0) {
					month = 11;
					year -= 1;
				} else {
					month -= 1;
				}
			} else if($kit.hsCls(target, 'new') && !$kit.hsCls(target, 'disabled')) {
				if(month == 11) {
					month = 0;
					year += 1;
				} else {
					month += 1;
				}
			}
			date = new Date(year, month, day, 0, 0, 0, 0);
			$kit.adCls(target, 'active');
			if(me.mouseSlideSelectBeginDate == null) {
				me.mouseSlideSelectBeginDate = new Date(date);
				me.mouseSlideSelectBeginEl = target;
			} else if(me.mouseSlideSelectBeginDate.valueOf() != date.valueOf()//
			&& (//
				me.mouseSlideSelectEndDate == null//
				|| (me.mouseSlideSelectEndDate && me.mouseSlideSelectEndDate.valueOf() != date.valueOf()))//
			) {
				me.mouseSlideSelectEndDate = new Date(date);
				me.mouseSlideSelectEndEl = target;
				if(me.mouseSlideSelectBeginDate && me.mouseSlideSelectEndDate) {
					var first = false, last = false, firstDate, lastDate, firstEl, lastEl;
					if(me.mouseSlideSelectEndDate.valueOf() > me.mouseSlideSelectBeginDate.valueOf()) {
						//firstDate = me.mouseSlideSelectBeginDate;
						firstEl = me.mouseSlideSelectBeginEl;
						//lastDate = me.mouseSlideSelectEndDate;
						lastEl = me.mouseSlideSelectEndEl;
					} else {
						//lastDate = me.mouseSlideSelectBeginDate;
						lastEl = me.mouseSlideSelectBeginEl;
						//firstDate = me.mouseSlideSelectEndDate;
						firstEl = me.mouseSlideSelectEndEl;
					}
					$kit.each($kit.$el('.datepicker-days td.day', me.picker), function(o) {
						if(last) {
							$kit.rmCls(o, 'active');
						}
						if(first && o == lastEl) {
							last = true;
						}
						if(!first && o == firstEl) {
							first = true;
						}
						if(!first) {
							$kit.rmCls(o, 'active');
						}
						if(first && !last) {
						    if(n<3){
							$kit.adCls(o, 'active');
						    }
						}
					});
				}
			}
			var n=0;
			$kit.each($kit.$el('.datepicker-days td.active', me.picker), function(o){
			    n++;
			    if(n>3){
				$kit.rmCls(o, 'active');
			    }
			});
		}
	},
	/**
	 * 刷新日期天数显示
	 */
	update : function() {
		var me = this;
		if(me.date < me.startDate) {
			me.viewDate = new Date(me.startDate);
		} else if(me.date > me.endDate) {
			me.viewDate = new Date(me.endDate);
		} else {
			if(me.viewDate == null) {
				me.viewDate = new Date(me.date);
			} else {
				if(me.date && me.viewDate && Math.abs((me.date.getFullYear() - me.viewDate.getFullYear()) * 12 + me.date.getMonth() - me.viewDate.getMonth()) > 3) {
					me.viewDate = new Date(me.date);
				}
			}
		}
		me.fill();
	},
	/**
	 * 按住shift或者ctrl添加
	 */
	addValue : function(continuous) {
		var me = this;
		continuous = continuous || false;
		me.selectedDateAry = me.selectedDateAry || [];
		var beginDate = me.selectedDateAry[0];
		var endDate = me.selectedDateAry[me.selectedDateAry.length - 1];
		if(continuous == true) {
			if(me.date.valueOf() < beginDate.valueOf()) {
				beginDate = new Date(me.date);
			} else {
				endDate = new Date(me.date);
			}
			var newSelectedDateAry = [];
			while(endDate.valueOf() >= beginDate.valueOf()) {
				newSelectedDateAry.push(new Date(beginDate));
				$kit.date.addDays(beginDate, 1);
				if(newSelectedDateAry.length>3){
				    alert(1);
				    break;
			    	}
			}
			me.selectedDateAry = newSelectedDateAry;
		} else {
			if(me.date.valueOf() < beginDate.valueOf()) {
				me.selectedDateAry.splice(0, 0, new Date(me.date));
			} else if(me.date.valueOf() > endDate.valueOf()) {
				me.selectedDateAry.push(new Date(me.date));
			} else if(me.date.valueOf() >= beginDate.valueOf() || me.date.valueOf() <= endDate.valueOf()) {
				var canAdd = true;
				for(var i = 0; i < me.selectedDateAry.length; ) {
					if(me.date.valueOf() == me.selectedDateAry[i].valueOf()) {
						me.selectedDateAry.splice(i, 1);
						canAdd = false;
						break;
					} else if(me.date.valueOf() > me.selectedDateAry[i].valueOf() && i < me.selectedDateAry.length - 1 && me.date.valueOf() < me.selectedDateAry[i + 1].valueOf()) {
					    if(me.selectedDateAry.length<3){
						me.selectedDateAry.splice(i + 1, 0, new Date(me.date));
						break;
					    }else{
						alert(2);
					    }
					} else if(i == me.selectedDateAry.length - 1) {
					    if(me.selectedDateAry.length<3){
						me.selectedDateAry.splice(i, 0, new Date(me.date));
					    }else{
						alert(3)
					    }
					}
					i++;
				}
			}
		}
		if(me.adhereEl) {
			me.adhereEl.value = me.getValue();
		}
		me.update();
		me.newEv({
			ev : 'change'
		});
	}
});
