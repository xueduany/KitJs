/**
 * 日历
 */
$kit.ui.DatePicker = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.DatePicker, {
	defaultConfig : {
		dateFormat : 'mm/dd/yyyy',
		template : {
			pickerHTML : [//
			'<div class="datepicker dropdown-menu">', //
			'<div class="datepicker-days">', //
			'<table class=" table-condensed">', //
			'${headHTML}', //
			'<tbody></tbody>', //
			'</table>', //
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
			'<th class="prev"><i class="icon-arrow-left"/></th>', //
			'<th colspan="5" class="switch"></th>', //
			'<th class="next"><i class="icon-arrow-right"/></th>', //
			'</tr>', //
			'</thead>'//
			].join(''),
			contHTML : '<tbody><tr><td colspan="7"></td></tr></tbody>'
		},
		language : 'en',
		el : undefined,
		startView : 0,
		date : $kit.date.dateNow(),
		modes : [{
			clsName : 'days',
			navFnc : 'Month',
			navStep : 1
		}, {
			clsName : 'months',
			navFnc : 'FullYear',
			navStep : 1
		}, {
			clsName : 'years',
			navFnc : 'FullYear',
			navStep : 10
		}],
	}
});
$kit.merge($kit.ui.DatePicker.prototype, {
	init : function() {
		var me = this, config = me.config;
		if(!config.el) {
			return;
		}
		me.language = config.language;
		me.format = $kit.date.parseFormat(config.dateFormat);
		me.picker = $kit.newHTML($kit.tpl(config.template.pickerHTML, config.template)).childNodes[0];
		$kit.ev({
			el : me.picker,
			ev : 'click',
			fn : me.click,
			scope : me
		});
		me.date = config.date;
		document.body.appendChild(me.picker);
		//
		switch(config.startView) {
			case 2:
			case 'decade':
				me.viewMode = me.startViewMode = 2;
				break;
			case 1:
			case 'year':
				me.viewMode = me.startViewMode = 1;
				break;
			case 0:
			case 'month':
			default:
				me.viewMode = me.startViewMode = 0;
				break;
		}
		me.weekStart = config.weekStart || $kit.date.languagePack[me.language].weekStart || 0;
		me.weekEnd = me.weekStart == 0 ? 6 : me.weekStart - 1;
		me.startDate = -Infinity;
		me.endDate = Infinity;
		me.setStartDate(config.startDate);
		me.setEndDate(config.endDate);
		me.fillDow();
		me.fillMonths();
		me.update();
		me.showMode();
	},
	show : function(e) {
		var me = this;
		//me.height = me.component ? me.component.offsetHeight : me.config.el.offsetHeight;
		//me.place();
	},
	hide : function(e) {
		var me = this;
		me.picker.style.display = 'none';
		me.viewMode = me.startViewMode;
		me.showMode();
	},
	setValue : function() {
		var me = this;
		var formated = $kit.date.formatDate(me.date, me.format, me.language);
	},
	setStartDate : function(startDate) {
		var me = this;
		me.startDate = startDate || -Infinity;
		if(me.startDate !== -Infinity) {
			me.startDate = $kit.date.parseDate(me.startDate, me.format, me.language);
		}
		me.updateNavArrows();
	},
	setEndDate : function(endDate) {
		var me = this;
		me.endDate = endDate || Infinity;
		if(me.endDate !== Infinity) {
			me.endDate = $kit.date.parseDate(me.endDate, me.format, me.language);
		}
		me.updateNavArrows();
	},
	place : function() {
		var me = this;
		var offset = me.component ? $kit.offset(me.component) : $kit.offset(me.config.el);
		$kit.css(me.picker, {
			top : offset.top + me.height,
			left : offset.left
		});
	},
	update : function() {
		var me = this;
		if(me.date < me.startDate) {
			me.viewDate = new Date(me.startDate);
		} else if(me.date > me.endDate) {
			me.viewDate = new Date(me.endDate);
		} else {
			me.viewDate = new Date(me.date);
		}
		me.fill();
	},
	fillDow : function() {
		var me = this;
		var dowCnt = me.weekStart;
		var html = '<tr>';
		while(dowCnt < me.weekStart + 7) {
			html += '<th class="dow">' + $kit.date.languagePack[me.language].daysMin[(dowCnt++) % 7] + '</th>';
		}
		html += '</tr>';
		var thead = $kit.el('.datepicker-days thead',me.picker)[0];
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
	},
	fillMonths : function() {
		var me = this;
		var html = '';
		var i = 0
		while(i < 12) {
			html += '<span class="month">' + $kit.date.languagePack[me.language].monthsShort[i++] + '</span>';
		}
		$kit.each($kit.el('.datepicker-months td', me.picker), function(o) {
			o.innerHTML = html;
		});
	},
	fill : function() {
		var me = this;
		var d = new Date(me.viewDate), year = d.getFullYear(), month = d.getMonth(), //
		startYear = me.startDate !== -Infinity ? me.startDate.getFullYear() : -Infinity, //
		startMonth = me.startDate !== -Infinity ? me.startDate.getMonth() : -Infinity, //
		endYear = me.endDate !== Infinity ? me.endDate.getFullYear() : Infinity, //
		endMonth = me.endDate !== Infinity ? me.endDate.getMonth() : Infinity, //
		currentDate = me.date.valueOf();
		//
		$kit.el('.datepicker-days th:eq(1)',me.picker)[0].innerHTML = $kit.date.languagePack[me.language].months[month] + ' ' + year;
		//
		me.updateNavArrows();
		me.fillMonths();
		var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0), day = $kit.date.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
		prevMonth.setDate(day);
		prevMonth.setDate(day - (prevMonth.getDay() - me.weekStart + 7) % 7);
		var nextMonth = new Date(prevMonth);
		nextMonth.setDate(nextMonth.getDate() + 42);
		nextMonth = nextMonth.valueOf();
		html = [];
		var clsName;
		while(prevMonth.valueOf() < nextMonth) {
			if(prevMonth.getDay() == me.weekStart) {
				html.push('<tr>');
			}
			clsName = '';
			if(prevMonth.getFullYear() < year || (prevMonth.getFullYear() == year && prevMonth.getMonth() < month)) {
				clsName += ' old';
			} else if(prevMonth.getFullYear() > year || (prevMonth.getFullYear() == year && prevMonth.getMonth() > month)) {
				clsName += ' new';
			}
			if(prevMonth.valueOf() == currentDate) {
				clsName += ' active';
			}
			if(prevMonth.valueOf() < me.startDate || prevMonth.valueOf() > me.endDate) {
				clsName += ' disabled';
			}
			html.push('<td class="day' + clsName + '">' + prevMonth.getDate() + '</td>');
			if(prevMonth.getDay() == me.weekEnd) {
				html.push('</tr>');
			}
			prevMonth.setDate(prevMonth.getDate() + 1);
		}
		var tbody = $kit.el('.datepicker-days tbody', me.picker)[0];
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
		var currentYear = me.date.getFullYear();
		//
		var monthsEl = $kit.el('.datepicker-months', me.picker)[0];
		$kit.dom.text($kit.el('th:eq(1)', monthsEl)[0], year);
		$kit.each($kit.el('span', monthsEl), function(o) {
			$kit.rmCls(o, 'active');
		});
		if(currentYear == year) {
			$kit.each($kit.el('span', monthsEl), function(o, i) {
				if(i == me.date.getMonth()) {
					$kit.adCls(o, 'active');
					return false;
				}
			});
		}
		if(year < startYear || year > endYear) {
			$kit.adCls(monthsEl, 'disabled');
		}
		if(year == startYear) {
			$kit.each($kit.el('span', monthsEl).slice(0, startMonth), function(o) {
				$kit.adCls(o, 'disabled');
			});
		}
		if(year == endYear) {
			$kit.each($kit.el('span', monthsEl).slice(endMonth + 1), function(o) {
				$kit.adCls(o, 'disabled');
			});
		}
		html = '';
		year = parseInt(year / 10, 10) * 10;
		//
		var yearEl = $kit.el('.datepicker-years',me.picker)[0];
		$kit.dom.text($kit.el('th:eq(1)', yearEl)[0], year + '-' + (year + 9));
		var yearCont = $kit.el('td', yearEl);
		year -= 1;
		for(var i = -1; i < 11; i++) {
			html += '<span class="year' + (i == -1 || i == 10 ? ' old' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
			year += 1;
		}
		$kit.each(yearCont, function(o) {
			$kit.dom.html(o, html);
		});
	},
	updateNavArrows : function() {
		var me = this;
		var d = new Date(me.viewDate), year = d.getFullYear(), month = d.getMonth();
		switch (me.viewMode) {
			case 0:
				if(me.startDate !== -Infinity && year <= me.startDate.getFullYear() && month <= me.startDate.getMonth()) {
					$kit.each($kit.el('.prev', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'hidden'
						});
					});
				} else {
					$kit.each($kit.el('.prev', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'visible'
						});
					});
				}
				if(me.endDate !== Infinity && year >= me.endDate.getFullYear() && month >= me.endDate.getMonth()) {
					$kit.each($kit.el('.next', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'hidden'
						});
					});
				} else {
					$kit.each($kit.el('.next', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'visible'
						});
					});
				}
				break;
			case 1:
			case 2:
				if(me.startDate !== -Infinity && year <= me.startDate.getFullYear()) {
					$kit.each($kit.el('.prev', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'hidden'
						});
					});
				} else {
					$kit.each($kit.el('.prev', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'visible'
						});
					});
				}
				if(me.endDate !== Infinity && year >= me.endDate.getFullYear()) {
					$kit.each($kit.el('.next', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'hidden'
						});
					});
				} else {
					$kit.each($kit.el('.next', me.picker), function(o) {
						$kit.css(o, {
							visibility : 'visible'
						});
					});
				}
				break;
		}
	},
	click : function(e) {
		var me = this;
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
							var month = $kit.array.indexOf($kit.el('span', target.parentNode), target);
							me.viewDate.setMonth(month);
						} else {
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
						var year = me.viewDate.getFullYear(), month = me.viewDate.getMonth();
						if($kit.hsCls(target, 'old')) {
							if(month == 0) {
								month = 11;
								year -= 1;
							} else {
								month -= 1;
							}
						} else if($kit.hsCls(target, 'new')) {
							if(month == 11) {
								month = 0;
								year += 1;
							} else {
								month += 1;
							}
						}
						me.date = new Date(year, month, day, 0, 0, 0, 0);
						me.viewDate = new Date(year, month, day, 0, 0, 0, 0);
						me.fill();
						me.setValue();
					}
					break;
			}
		}
	},
	mousedown : function(e) {
		var me = this;
		e.stopPropagation();
		e.preventDefault();
	},
	keydown : function(e) {
		if(me.picker.is(':not(:visible)')) {
			if(e.keyCode == 27)// allow escape to hide and re-show picker
				me.show();
			return;
		}
		var dir, day, month;
		switch(e.keyCode) {
			case 27:
				// escape
				me.hide();
				e.preventDefault();
				break;
			case 37:
			// left
			case 39:
				// right
				dir = e.keyCode == 37 ? -1 : 1;
				if(e.ctrlKey) {
					me.date = me.moveYear(me.date, dir);
					me.viewDate = me.moveYear(me.viewDate, dir);
				} else if(e.shiftKey) {
					me.date = me.moveMonth(me.date, dir);
					me.viewDate = me.moveMonth(me.viewDate, dir);
				} else {
					me.date.setDate(me.date.getDate() + dir);
					me.viewDate.setDate(me.viewDate.getDate() + dir);
				}
				me.setValue();
				me.update();
				e.preventDefault();
				break;
			case 38:
			// up
			case 40:
				// down
				dir = e.keyCode == 38 ? -1 : 1;
				if(e.ctrlKey) {
					me.date = me.moveYear(me.date, dir);
					me.viewDate = me.moveYear(me.viewDate, dir);
				} else if(e.shiftKey) {
					me.date = me.moveMonth(me.date, dir);
					me.viewDate = me.moveMonth(me.viewDate, dir);
				} else {
					me.date.setDate(me.date.getDate() + dir * 7);
					me.viewDate.setDate(me.viewDate.getDate() + dir * 7);
				}
				me.setValue();
				me.update();
				e.preventDefault();
				break;
			case 13:
				// enter
				me.hide();
				e.preventDefault();
				break;
		}
	},
	showMode : function(dir) {
		var me = this;
		if(dir) {
			me.viewMode = Math.max(0, Math.min(2, me.viewMode + dir));
		}
		var a = $kit.el('>div', me.picker);
		$kit.each(a, function(o) {
			o.style.display = 'none';
		});
		$kit.array.filter(a, function(o) {
			if($kit.hsCls(o, 'datepicker-' + me.config.modes[me.viewMode].clsName)) {
				o.style.display = 'block';
			}
		})
		me.updateNavArrows();
	}
});
