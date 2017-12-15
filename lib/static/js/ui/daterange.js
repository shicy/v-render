// ========================================================
// 日期范围选择框
// @author shicy <shicy85@163.com>
// Create on 2016-12-24
// ========================================================

(function () {
	if (VRender.Component.DateRange)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DateRangeRender = Component.Render.daterange;

	var cn_month = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

	///////////////////////////////////////////////////////
	var UIDateRange = window.UIDateRange = Component.DateRange = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		var self = this;
		this.tap(".ipt", iptClickHandler.bind(this));
		this.tap(".ipt > .clear", clearBtnHandler.bind(this));
		this.tap(".tools > .item", quickBtnHandler.bind(this));
		this.tap(".picker header button", pickerMonthHandler.bind(this));
		this.tap(".picker footer .ui-btn", pickerButtonHandler.bind(this));
		this.tap(".picker tbody td", pickerDateHandler.bind(this));
		this.$el.on("mouseenter", pickerMouseHandler.bind(this));
		this.$el.on("mouseleave", pickerMouseHandler.bind(this));
	};
	var _UIDateRange = UIDateRange.prototype = new Component.base();

	UIDateRange.find = function (view) {
		return Component.find(view, ".ui-daterange", UIDateRange);
	};

	UIDateRange.create = function (options) {
		return Component.create(options, UIDateRange, DateRangeRender);
	};

	// ====================================================
	_UIDateRange.getDateRange = function (format) {
		var start = this.getStartDate();
		var end = this.getEndDate();
		var range = {start: null, end: null};
		if (start && end) {
			range.start = Utils.toDate(Utils.toDateString(start, "yyyy-MM-dd 00:00:00"));
			range.end = Utils.toDate(Utils.toDateString(end, "yyyy-MM-dd 13:59:59"));
			if (Utils.isNotBlank(format)) {
				range.start = Utils.toDateString(range.start, format);
				range.end = Utils.toDateString(range.end, format);
			}
		}
		return range;
	};
	_UIDateRange.setDateRange = function (start, end, trigger) {
		start = Utils.toDate(start);
		end = Utils.toDate(end);
		if (start && end) {
			start = Utils.toDateString(start, "yyyy/MM/dd");
			end = Utils.toDateString(end, "yyyy/MM/dd");
			if (start > end)
				start = end = null;
		}

		this.$el.attr("data-start", (start || ""));
		this.$el.attr("data-end", (end || ""));
		this.$el.find(".tools > .selected").removeClass("selected");
		if (this.$el.is(".tools-dropdown"))
			this.$el.find(".tools > .item:first-child").addClass("selected");

		renderDateRangeLabel.call(this);
		renderPickerDate.call(this);

		if (trigger)
			this.trigger("change", this.getDateRange());
	};
	_UIDateRange.setQuickDateRange = function (value, trigger) {
		value = parseInt(value) || 0;
		var item = Utils.find(this.$el.children(".tools").children(), function (temp) {
			return parseInt(temp.attr("data-val")) === value;
		});

		if (item && item.length > 0) {
			item.addClass("selected").siblings().removeClass("selected");

			var start = new Date(), end = new Date();
			if (value > 1)
				start.setDate(start.getDate() - value + 1);

			this.$el.attr("data-start", Utils.toDateString(start, "yyyy/MM/dd"));
			this.$el.attr("data-end", Utils.toDateString(end, "yyyy/MM/dd"));
			renderDateRangeLabel.call(this);
			renderPickerDate.call(this);
		}

		if (trigger)
			this.trigger("change", this.getDateRange());
	};

	_UIDateRange.getStartDate = function () {
		return Utils.toDate(this.$el.attr("data-start"));
	};
	_UIDateRange.setStartDate = function (value, trigger) {
		this.setDateRange(value, this.getEndDate(), trigger);
	};

	_UIDateRange.getEndDate = function () {
		return Utils.toDate(this.$el.attr("data-end"));
	};
	_UIDateRange.setEndDate = function (value, trigger) {
		this.setDateRange(this.getStartDate(), value, trigger);
	};

	_UIDateRange.getMinDate = function () {
		return Utils.toDate(this.$el.attr("data-min"));
	};
	_UIDateRange.setMinDate = function (value) {
		var date = Utils.toDate(value);
		if (date)
			this.$el.attr("data-min", Utils.toDateString(date, "yyyy/MM/dd"));
		else
			this.$el.removeAttr("data-min");
		renderPickerDate.call(this);
	};

	_UIDateRange.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("data-max"));
	};
	_UIDateRange.setMaxDate = function (value) {
		var date = Utils.toDate(value);
		if (date)
			this.$el.attr("data-max", Utils.toDateString(date, "yyyy/MM/dd"));
		else
			this.$el.removeAttr("data-max");
		renderPickerDate.call(this);
	};

	_UIDateRange.getDateFormat = function () {
		if (this.hasOwnProperty("_dateFormat"))
			return this._dateFormat;
		if (this.options.hasOwnProperty("format"))
			return this.options.format;
		if (this.options.hasOwnProperty("dateFormat"))
			return this.options.dateFormat;
		var format = this.$el.children(".format").text();
		if (format && this.$el.children(".format-fn").length > 0) {
			format = (new Function("var Utils=VRender.Utils;return (" + 
				unescape(format) + ");"))();
		}
		this.$el.children(".format").remove();
		return this._dateFormat = format;
	};
	_UIDateRange.setDateFormat = function (value) {
		this._dateFormat = value;
		this.$el.children(".format").remove();
		this.setDateRange(this.getStartDate(), this.getEndDate());
	};

	_UIDateRange.setQuickDates = function (dates, defVal, trigger) {
		this.$el.children(".tools").remove();
		renderQuickDates.call(this, $, this.$el, formatQuickDates(dates), defVal);

		var selectedItem = this.$el.children(".tools").children(".selected");
		if (trigger) {
			if (selectedItem.length > 0)
				selectedItem.tap();
			else 
				this.trigger("change", this.getDateRange());
		}
		else if (selectedItem.length > 0) {
			this.setQuickDateRange(selectedItem.attr("data-val"));
		}
	};

	// ====================================================
	var iptClickHandler = function (e) {
		if (!this.picker) {
			this.picker = createDatePicker(this.$el.children(".ipt"));
			renderPickerDate.call(this, this.getStartDate(), this.getEndDate());
		}

		if (this.$el.is(".show-picker"))
			return ;
		this.$el.addClass("show-picker").removeClass("show-before").removeClass("show-right");

		var pickerOffset = this.picker.offset();
		var pickerRight = pickerOffset.left + this.picker.width();
		var pickerBottom = pickerOffset.top + this.picker.height();
		var documentRight = $(window).width() + $("body").scrollLeft();
		var documentBottom = $(window).height() + $("body").scrollTop();
		if (pickerRight > documentRight)
			this.$el.addClass("show-right");
		if (pickerBottom > documentBottom)
			this.$el.addClass("show-before");
	};

	var quickBtnHandler = function (e) {
		this.setQuickDateRange($(e.currentTarget).attr("data-val"), true);
	};

	var pickerMonthHandler = function (e) {
		var btn = $(e.currentTarget);
		var table = btn.parent().parent();

		var attrName = "data-" + (table.is(".table-s") ? "start" : "end");
		var date = Utils.toDate(this.picker.attr(attrName));
		date.setMonth(date.getMonth() + (btn.is(".prev") ? -1 : 1));
		this.picker.attr(attrName, Utils.toDateString(date, "yyyy/MM/01"));

		var year = date.getFullYear(), month = date.getMonth();
		renderTable.call(this, table, year, month);
	};

	var pickerDateHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;
		var date = Utils.toDate(item.attr("data-dt"));
		if (this.bFirstMark) {
			this.bFirstMark = false;
			if (date.getTime() > this.markStart.getTime())
				this.markEnd = date;
			else 
				this.markStart = date;
			renderPickerDate.call(this);
		}
		else {
			this.bFirstMark = true;
			this.markStart = this.markEnd = date;
			renderPickerDate.call(this);
		}
	};

	var pickerButtonHandler = function (e) {
		this.$el.removeClass("show-picker");
		if ($(e.currentTarget).attr("name") === "submit") {
			var start = this.markStart || this.getStartDate();
			var end = this.markEnd || this.getEndDate();
			this.markStart = this.markEnd = null;
			this.setDateRange(start, end, true);
		}
		else {
			this.markStart = this.markEnd = null;
			renderPickerDate.call(this);
		}
		this.bFirstMark = false;
		return false;
	};

	var clearBtnHandler = function (e) {
		this.setDateRange(null, null, true);
		return false;
	};

	var pickerMouseHandler = function (e) {
		var target = this.$el;
		if (e.type === "mouseenter") {
			var timerId = parseInt(target.attr("timerid"));
			if (timerId) {
				clearTimeout(timerId);
				target.removeAttr("timerid");
			}
		}
		else /*if (e.type === "mouseleave")*/ {
			var timerId = setTimeout(function () {
				target.find(".picker .ui-btn[name='cancel']").click();
			}, 1500);
			target.attr("timerid", timerId);
		}
	};

	// ====================================================
	var renderDateRangeLabel = function () {
		var label = DateRangeRender.getDateRangeLabel(this.getStartDate(), this.getEndDate(), 
			this.getDateFormat());
		this.$el.find(".ipt input").val(label);
		if (Utils.isBlank(label))
			this.$el.removeClass("has-val");
		else
			this.$el.addClass("has-val");
	};

	var createDatePicker = function (target) {
		var picker = $("<div class='picker'></div>").appendTo(target);

		var content = $("<div class='content'></div>").appendTo(picker);
		var tables = $("<div class='table table-s'></div>" +
			"<div class='table table-e'></div>").appendTo(content);
		tables.append("<header><label></label><button class='prev'>" +
			"</button><button class='next'></button></header>");
		var table = $("<table><thead></thead><tbody></tbody></table>").appendTo(tables);
		table.children("thead").append("<tr><th>日</th><th>一</th><th>二</th>" +
			"<th>三</th><th>四</th><th>五</th><th>六</th></tr>"); 

		var footer = $("<footer></footer>").appendTo(picker);
		footer.append("<div class='values'><span class='start'></span> - " +
			"<span class='end'></span></div>");
		var btns = $("<div class='btns'></div>").appendTo(footer);
		VRender.Component.Button.create({target: btns, label: "确定", type: "ok", name: "submit"});
		VRender.Component.Button.create({target: btns, label: "取消", type: "cancel", name: "cancel"});

		return picker;
	};

	var renderPickerDate = function (pickerStart, pickerEnd) {
		var picker = this.picker;
		if (picker) {
			pickerStart = pickerStart || Utils.toDate(picker.attr("data-start")) || this.getStartDate();
			pickerEnd = pickerEnd || Utils.toDate(picker.attr("data-end")) || this.getEndDate() || new Date();
			if (!pickerStart) {
				pickerStart = new Date(pickerEnd.getFullYear(), pickerEnd.getMonth() - 1, 1);
			}

			var pickerStartYear = pickerStart.getFullYear();
			var pickerStartMonth = pickerStart.getMonth();
			var pickerStartTime = pickerStartYear * 100 + pickerStartMonth;

			var pickerEndYear = pickerEnd.getFullYear();
			var pickerEndMonth = pickerEnd.getMonth();
			var pickerEndTime = pickerEndYear * 100 + pickerEndMonth;

			if (pickerStartTime == pickerEndTime) {
				pickerStart.setMonth(pickerStartMonth - 1);
				pickerStartYear = pickerStart.getFullYear();
				pickerStartMonth = pickerStart.getMonth();
			}
			else if (pickerStartTime > pickerEndTime) {
				var date = pickerStart, year = pickerStartYear, month = pickerStartMonth;
				pickerStart = pickerEnd;
				pickerEnd = date;
				pickerStartYear = pickerEndYear;
				pickerEndYear = year;
				pickerStartMonth = pickerEndMonth;
				pickerEndMonth = month;
			}

			picker.attr("data-start", Utils.toDateString(pickerStart, "yyyy/MM/01"));
			picker.attr("data-end", Utils.toDateString(pickerEnd, "yyyy/MM/01"));

			renderTable.call(this, picker.find(".table-s"), pickerStartYear, pickerStartMonth);
			renderTable.call(this, picker.find(".table-e"), pickerEndYear, pickerEndMonth);

			var markStart = this.markStart || this.getStartDate();
			markStart = markStart ? Utils.toDateString(markStart, "yyyy-MM-dd") : "";
			picker.find("footer .start").text(markStart);

			var markEnd = this.markEnd || this.getEndDate();
			markEnd = markEnd ? Utils.toDateString(markEnd, "yyyy-MM-dd") : "";
			picker.find("footer .end").text(markEnd);
		}
	};

	var renderTable = function (target, year, month) {
		target.find("header > label").text(year + "年 " + cn_month[month] + "月");
		target.attr("data-year", year).attr("data-month", month);

		var dt = new Date(year, month, 1);
		dt.setDate(1 - dt.getDay());

		var dt0 = new Date(); // today
		var t0 = dt0.getFullYear() * 10000 + dt0.getMonth() * 100 + dt0.getDate();

		var start = this.markStart || this.getStartDate(), ts = 0;
		if (start)
			ts = start.getFullYear() * 10000 + start.getMonth() * 100 + start.getDate();
		var end = this.markEnd || this.getEndDate(), te = 0;
		if (end)
			te = end.getFullYear() * 10000 + end.getMonth() * 100 + end.getDate();

		var min = this.getMinDate(), tmin = 0;
		if (min)
			tmin = min.getFullYear() * 10000 + min.getMonth() * 100 + min.getDate();
		var max = this.getMaxDate(), tmax = 21001231;
		if (max)
			tmax = max.getFullYear() * 10000 + max.getMonth() * 100 + max.getDate();

		var tbody = target.find("tbody").empty();
		while (true) {
			var tr = $("<tr></tr>").appendTo(tbody);
			for (var i = 0; i < 7; i++) {
				var _y = dt.getFullYear(), _m = dt.getMonth(), _d = dt.getDate();
				var _t = _y * 10000 + _m * 100 + _d;
				var td = $("<td></td>").appendTo(tr);
				td.append("<span>" + _d + "</span>");
				td.attr("data-dt", (_y + "/" + (_m + 1) + "/" + _d));
				if (_m !== month || _t < tmin || _t > tmax)
					td.addClass("disabled");
				else {
					if (_t === t0)
						td.addClass("today");
					if (_t >= ts && _t <= te)
						td.addClass("selected");
					if (_t === ts)
						td.addClass("start");
					if (_t === te)
						td.addClass("end");
				}
				dt.setDate(_d + 1);
			}
			if (dt.getMonth() > month || dt.getFullYear() > year)
				break;
		}

		checkMonthBtnVisible.call(this);
	};

	var checkMonthBtnVisible = function () {
		var start = Utils.toDate(this.picker.attr("data-start"));
		var end = Utils.toDate(this.picker.attr("data-end"));
		start.setMonth(start.getMonth() + 1);
		if (start.getMonth() === end.getMonth()) {
			this.picker.find(".table-s .next").hide();
			this.picker.find(".table-e .prev").hide();
		}
		else {
			this.picker.find(".table-s .next").show();
			this.picker.find(".table-e .prev").show();
		}
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-daterange", UIDateRange);

})();
