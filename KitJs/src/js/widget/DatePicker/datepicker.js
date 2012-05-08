/**
 * 功能强大的日历（中文，支持多选，划动多选，多语言支持，API操作，自定义事件，界面定制等等）
 * @class $kit.ui.DatePicker
 * @required kit.js
 * @required ieFix.js
 * @required dom.js
 * @required array.js
 * @see <a href="https://github.com/xueduany/KitJs/blob/master/KitJs/src/js/widget/DatePicker/datepicker.js">Source code</a>
 * @example
 * <a href="http://xueduany.github.com/KitJs/KitJs/demo/DatePicker/demo.html">Demo</a><br/>
 * <img src="http://xueduany.github.com/KitJs/KitJs/demo/DatePicker/demo.png">
 */
$kit.ui.DatePicker = function(config) {
	var me = this;
	me.config = $kit.join(me.constructor.defaultConfig, config);
}
$kit.merge($kit.ui.DatePicker,
/**
 * @lends $kit.ui.DatePicker
 */
{
	/**
	 * @enum
	 */
	defaultConfig : {
		kitWidgetName : 'kitjs-datepicker',
		/**
		 * 接受和输出的日期格式
		 * @type {String}
		 */
		dateFormat : 'yyyy年mm月dd日', //接受和输出的日期格式
		template : {
			pickerHTML : [//
			'<div class="datepicker">', //
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
			'<th class="prev" onselectstart="return false"><i class="icon-arrow-left">&lt;</i></th>', //
			'<th colspan="5" class="switch"></th>', //
			'<th class="next" onselectstart="return false"><i class="icon-arrow-right">&gt;</i></th>', //
			'</tr>', //
			'</thead>'//
			].join(''),
			contHTML : '<tbody><tr><td colspan="7"></td></tr></tbody>',
			dropDownCls : 'dropdown-menu'
		},
		/**
		 * 语言，默认cn
		 * @type {String}
		 */
		language : 'cn',
		/**
		 * 初始显示的view，0为日历,1为月，2为年
		 * @type {Number}
		 */
		startView : 0,
		/**
		 * 初始日期
		 * @type {Date}
		 */
		date : undefined, //$kit.date.dateNow(),
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
		/**
		 * 默认从date对象里面的本地化数据取得一周的开始时间
		 * @type {Number}
		 */
		weekStart : undefined,
		weekViewFormat : 'daysMin',
		monthViewFormat : 'monthsShort',
		/*
		 * 默认是否显示
		 * @type {Boolean}
		 */
		show : false,
		/**
		 * 能否多选
		 * @type {Boolean}
		 */
		canMultipleChoose : true,
		/**
		 * 多选时候输出分隔符
		 * @type {String}
		 */
		dateStringSeparator : ',',
		/**
		 * 多选时候输出类型，full为将选中的日期全部输出，short为输出选中日期的开头和结尾
		 * @type {String}
		 */
		shiftSelectOutType : 'full',
		/**
		 * 当输出类型为short时，比如选中了3月1日到3月10日，则输出"3月1日~3月10日",简短输出，只有开头+分隔符+结尾
		 * @type {String}
		 */
		shiftSelectOutTypeShortSeparator : '~'
	}
});
$kit.merge($kit.ui.DatePicker.prototype,
/**
 * @lends $kit.ui.DatePicker.prototype
 */
{
	/**
	 * main()入口
	 */
	init : function() {
		var me = this, config = me.config;
		me.language = config.language;
		me.format = $kit.date.parseFormat(config.dateFormat);
		me.buildHTML();
		//
		me.initEv();
		if(config.date) {
			if($kit.isDate(config.date)) {
				me.date = config.date;
				me.selectedDateAry = [new Date(config.date)];
			} else if($kit.isAry(config.date)) {
				me.date = config.date[0];
				me.selectedDateAry = config.date;
			} else if($kit.isStr(config.date)) {
				if(config.date.indexOf(config.dateStringSeparator) > -1) {
					var dateStrAry = config.date.split(config.dateStringSeparator);
					me.date = $kit.date.parseDate(dateStrAry[0], me.format, me.language);
					me.selectedDateAry = [];
					$kit.each(dateStrAry, function(o) {
						me.selectedDateAry.push($kit.date.parseDate(o, me.format, me.language));
					});
				} else {
					me.date = $kit.date.parseDate(config.date, me.format, me.language);
					me.selectedDateAry = [me.date];
				}
			}
		} else {
			me.date = $kit.date.dateNow();
		}
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
		me.weekEnd = ((me.weekStart + 6) % 7);
		me.startDate = -Infinity;
		me.endDate = Infinity;
		me.setStartDate(config.startDate);
		me.setEndDate(config.endDate);
		me.fillDow();
		me.update();
		me.showMode();
		if(config.show) {
			//
		} else {
			me.hide();
		}
		return me;
	},
	/**
	 * 创建html
	 */
	buildHTML : function() {
		var me = this;
		me.picker = $kit.newHTML($kit.tpl(me.config.template.pickerHTML, me.config.template)).childNodes[0];
		document.body.appendChild(me.picker);
	},
	/**
	 * 注册事件
	 */
	initEv : function() {
		var me = this;
		$kit.ev({
			el : me.picker,
			ev : 'mousedown',
			fn : me.mousedown,
			scope : me
		});
		$kit.ev({
			el : me.picker,
			ev : 'mousemove',
			fn : me.mousemove,
			scope : me
		});
		$kit.ev({
			el : me.picker,
			ev : 'mouseup',
			fn : me.mouseup,
			scope : me
		});
		$kit.ev({
			el : me.picker,
			ev : 'click',
			fn : me.click,
			scope : me
		});
		$kit.ev({
			el : me.picker,
			ev : 'selectstart',
			fn : function(e) {
				e.stopNow();
			},
			scope : me
		});
	},
	/**
	 * 显示日历
	 */
	show : function(e) {
		var me = this;
		if(me.picker.style.display == 'none') {
			me.picker.style.display = '';
		}
		if(me.adhereEl) {
			me.adhere(me.adhereConfig);
		}
	},
	/**
	 * 吸附
	 */
	adhere : function(config) {
		var me = this;
		if($kit.isNode(config)) {
			config = {
				el : config
			}
		}
		if(config) {
			config.el[me.config.kitWidgetName] = me;
			$kit.adCls(me.picker, me.config.template.dropDownCls);
			me.adhereEl = config.el;
			me.adhereConfig = config;
			me.fixPosition(me.adhereConfig);
		}
	},
	/**
	 * 修正日历位置，随着吸附元素调整位置
	 */
	fixPosition : function(adhereConfig) {
		var me = this;
		var offset = $kit.offset(adhereConfig.el);
		$kit.css(me.picker, {
			position : 'absolute',
			top : offset.bottom + (adhereConfig.offsetTop || 0) + 'px',
			left : offset.left + (adhereConfig.left || 0) + 'px'
		});
	},
	/**
	 * 隐藏
	 */
	hide : function(e) {
		var me = this;
		me.picker.style.display = 'none';
	},
	/**
	 * 设值
	 * @private
	 */
	setValue : function(remove) {
		remove = remove;
		var me = this;
		if(remove == false) {
			me.selectedDateAry = [];
			if(me.adhereEl) {
				me.adhereEl.value = '';
			}
		} else {
			var formated = $kit.date.formatDate(me.date, me.format, me.language);
			if(me.adhereEl) {
				me.adhereEl.value = formated;
			}
			me.selectedDateAry = [new Date(me.date)];
			me.update();
		}
		me.newEv({
			ev : 'change'
		});
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
						me.selectedDateAry.splice(i + 1, 0, new Date(me.date));
						break;
					} else if(i == me.selectedDateAry.length - 1) {
						me.selectedDateAry.splice(i, 0, new Date(me.date));
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
	},
	/**
	 * 获取日历的选中值
	 */
	getValue : function() {
		var me = this;
		if(me.selectedDateAry.length) {
			var dateStrAry = [];
			if(me.config.shiftSelectOutType.toLowerCase() != 'short') {
				$kit.each(me.selectedDateAry, function(o) {
					dateStrAry.push($kit.date.formatDate(o, me.format, me.language))
				});
				return dateStrAry.join(me.config.dateStringSeparator);
			} else {
				dateStrAry.push($kit.date.formatDate(me.selectedDateAry[0], me.format, me.language));
				dateStrAry.push($kit.date.formatDate(me.selectedDateAry[me.selectedDateAry.length - 1], me.format, me.language));
				return dateStrAry.join(me.config.shiftSelectOutTypeShortSeparator);
			}
			return $kit.date.formatDate(me.date, me.format, me.language)
		}
		return '';
	},
	/**
	 * 设置能选择的最早日期
	 */
	setStartDate : function(startDate) {
		var me = this;
		if($kit.isDate(startDate)) {
			me.startDate = startDate;
		} else {
			me.startDate = startDate || -Infinity;
			if(me.startDate !== -Infinity) {
				me.startDate = $kit.date.parseDate(me.startDate, me.format, me.language);
			}
		}
		me.updateNavArrows();
	},
	/**
	 * 设置能选择的最迟日期
	 */
	setEndDate : function(endDate) {
		var me = this;
		if($kit.isDate(endDate)) {
			me.endDate = endDate;
		} else {
			me.endDate = endDate || Infinity;
			if(me.endDate !== Infinity) {
				me.endDate = $kit.date.parseDate(me.endDate, me.format, me.language);
			}
		}
		me.updateNavArrows();
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
			me.viewDate = new Date(me.date);
		}
		me.fill();
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
		var thead = $kit.$el('.datepicker-days thead',me.picker)[0];
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
	/**
	 * 月份选择
	 */
	fillMonths : function() {
		var me = this;
		var html = '';
		var i = 0
		while(i < 12) {
			html += '<span class="month">' + $kit.date.languagePack[me.language][me.config.monthViewFormat][i++] + '</span>';
		}
		$kit.each($kit.$el('.datepicker-months td', me.picker), function(o) {
			o.innerHTML = html;
		});
	},
	/**
	 * 天数面板
	 */
	fill : function() {
		var me = this;
		var d = new Date(me.viewDate), year = d.getFullYear(), month = d.getMonth(), //
		startYear = me.startDate !== -Infinity ? me.startDate.getFullYear() : -Infinity, //
		startMonth = me.startDate !== -Infinity ? me.startDate.getMonth() : -Infinity, //
		endYear = me.endDate !== Infinity ? me.endDate.getFullYear() : Infinity, //
		endMonth = me.endDate !== Infinity ? me.endDate.getMonth() : Infinity;
		//
		if(me.config.language != 'cn') {
			$kit.$el('.datepicker-days th:eq(1)',me.picker)[0].innerHTML = $kit.date.languagePack[me.language].months[month] + ' ' + year;
		} else {
			$kit.$el('.datepicker-days th:eq(1)',me.picker)[0].innerHTML = year + '年' + $kit.date.languagePack[me.language].months[month];
		}
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
			$kit.each(me.selectedDateAry, function(o) {
				if(o.valueOf() == prevMonth.valueOf()) {
					clsName += ' active';
					return false;
				}
			});
			if(prevMonth.valueOf() < me.startDate || prevMonth.valueOf() > me.endDate) {
				clsName += ' disabled';
			}
			html.push('<td class="day' + clsName + '">' + prevMonth.getDate() + '</td>');
			if(prevMonth.getDay() == me.weekEnd) {
				html.push('</tr>');
			}
			prevMonth.setDate(prevMonth.getDate() + 1);
		}
		var tbody = $kit.$el('.datepicker-days tbody', me.picker)[0];
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
		var currentYear = me.viewDate.getFullYear();
		//
		var monthsEl = $kit.$el('.datepicker-months', me.picker)[0];
		$kit.dom.text($kit.$el('th:eq(1)', monthsEl)[0], year);
		$kit.each($kit.$el('span', monthsEl), function(o) {
			$kit.rmCls(o, 'active');
		});
		if(currentYear == year) {
			$kit.each($kit.$el('span', monthsEl), function(o, i) {
				if(i == me.viewDate.getMonth()) {
					$kit.adCls(o, 'active');
					return false;
				}
			});
		}
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
	 * 导航左右翻页
	 */
	updateNavArrows : function() {
		var me = this;
		var d = new Date(me.viewDate), year = d.getFullYear(), month = d.getMonth();
		switch (me.viewMode) {
			case 0:
				if(me.startDate !== -Infinity && year <= me.startDate.getFullYear() && month <= me.startDate.getMonth()) {
					$kit.css($kit.$el('th.prev:first', me.picker)[0], {
						visibility : 'hidden'
					});
				} else {
					$kit.css($kit.$el('th.prev:first', me.picker)[0], {
						visibility : 'visible'
					});
				}
				if(me.endDate !== Infinity && year >= me.endDate.getFullYear() && month >= me.endDate.getMonth()) {
					$kit.css($kit.$el('th.next:last', me.picker)[0], {
						visibility : 'hidden'
					});
				} else {
					$kit.css($kit.$el('th.next:last', me.picker)[0], {
						visibility : 'visible'
					});
				}
				break;
			case 1:
			case 2:
				if(me.startDate !== -Infinity && year <= me.startDate.getFullYear()) {
					$kit.css($kit.$el('th.prev:first', me.picker)[0], {
						visibility : 'hidden'
					});
				} else {
					$kit.css($kit.$el('th.prev:first', me.picker)[0], {
						visibility : 'visible'
					});
				}
				if(me.endDate !== Infinity && year >= me.endDate.getFullYear()) {
					$kit.css($kit.$el('th.next:last', me.picker)[0], {
						visibility : 'hidden'
					});
				} else {
					$kit.css($kit.$el('th.next:last', me.picker)[0], {
						visibility : 'visible'
					});
				}
				break;
		}
	},
	/**
	 * 面板mousedown和mousemove事件，主要用于鼠标滑动选择
	 */
	mousedown : function(e) {
		var me = this, target = e.target;
		if(!me.config.canMultipleChoose) {
			return;
		}
		me.mouseSlideSelect = false;
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
			$kit.adCls(target, 'active');
			me.slideSelectFlag = true;
		}
	},
	/**
	 * 鼠标移动事件
	 * @private
	 */
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
			var year = me.viewDate.getFullYear(), month = me.viewDate.getMonth();
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
							$kit.adCls(o, 'active');
						}

					});
				}
			}
		}
	},
	/**
	 * 选中事件
	 * @private
	 */
	mouseup : function(e) {
		var me = this, target = e.target;
		if(!me.config.canMultipleChoose) {
			return;
		}
		if(me.slideSelectFlag == true) {
			if(me.mouseSlideSelectBeginDate && me.mouseSlideSelectEndDate) {
				me.mouseSlideSelect = true;
				if(me.mouseSlideSelectEndDate.valueOf() > me.mouseSlideSelectBeginDate.valueOf()) {
					beginDate = new Date(me.mouseSlideSelectBeginDate);
					endDate = new Date(me.mouseSlideSelectEndDate);
				} else {
					endDate = new Date(me.mouseSlideSelectBeginDate);
					beginDate = new Date(me.mouseSlideSelectEndDate);
				}
				me.selectedDateAry = [];
				while(endDate.valueOf() >= beginDate.valueOf()) {
					me.selectedDateAry.push(new Date(beginDate));
					$kit.date.addDays(beginDate, 1);
				}
				if(me.adhereEl) {
					me.adhereEl.value = me.getValue();
				}
				//me.update();
				me.newEv({
					ev : 'change'
				});
			}
			me.mouseSlideSelectEndEl = null;
			me.mouseSlideSelectEndDate = null;
			me.mouseSlideSelectBeginEl = null;
			me.mouseSlideSelectBeginDate = null;
		}
		me.slideSelectFlag = false;
	},
	/**
	 * 面板click事件
	 * @private
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
						newDate = new Date(year, month, day, 0, 0, 0, 0);
						if(me.date && me.date.valueOf() == newDate.valueOf()) {
							$kit.rmCls(target, 'active');
							me.setValue(false);
							me.date = null;
						} else {
							me.date = newDate;
							me.viewDate = new Date(year, month, day, 0, 0, 0, 0);
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
	/*
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
	*/
	/**
	 * 显示天数还是月份还是年
	 */
	showMode : function(dir) {
		var me = this;
		if(dir) {
			me.viewMode = Math.max(0, Math.min(2, me.viewMode + dir));
		}
		var a = $kit.$el('>div', me.picker);
		$kit.each(a, function(o) {
			o.style.display = 'none';
		});
		$kit.array.filter(a, function(o) {
			if($kit.hsCls(o, 'datepicker-' + me.config.modes[me.viewMode].clsName)) {
				o.style.display = 'block';
			}
		})
		me.updateNavArrows();
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
	}
});
