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

		var inputTarget = this.inputTag = this.$el.children(".ipt");

		var renderAsNative = this.isRenderAsApp() && this._isNative();

		if (renderAsNative) {

		}
		else {
			inputTarget.on("tap", iptClickHandler.bind(this));
			inputTarget.on("tap", ".picker", function (e) { return false; });
		}

		// this.tap(".ipt", iptClickHandler.bind(this));
		// this.tap(".ipt .clear", clearBtnHandler.bind(this));
		// this.tap(".tools .item", quickBtnHandler.bind(this));
		// this.tap(".picker header button", pickerMonthHandler.bind(this));
		// this.tap(".picker footer .ui-btn", pickerButtonHandler.bind(this));
		// this.tap(".picker tbody td", pickerDateHandler.bind(this));
		// this.$el.on("mouseenter", pickerMouseHandler.bind(this));
		// this.$el.on("mouseleave", pickerMouseHandler.bind(this));
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
		var start = this.getStartDate(), end = this.getEndDate();
		if (start && end) {
			if (Utils.isNotBlank(format)) {
				start = Utils.toDateString(start, format);
				end = Utils.toDateString(end, format);
			}
			return [start, end];
		}
		return null;
	};

	_UIDateRange.setDateRange = function (start, end) {
		var snapshoot = this._snapshoot();

		start = Utils.toDate(start);
		end = (start ? Utils.toDate(end) : null) || start;
		if (start && end) {
			var min = this.getMinDate(), max = this.getMaxDate();
			if (min && getTime(min) > getTime(start))
				start = min;
			if (max && getTime(max) < getTime(end))
				end = max;
			if (getTime(start) > getTime(end))
				start = end = null;
		}

		this.$el.attr("data-start", (start ? Utils.toDateString(start, "yyyy-MM-dd") : ""));
		this.$el.attr("data-end", (end ? Utils.toDateString(end, "yyyy-MM-dd") : ""));

		refresh.call(this, snapshoot);
		snapshoot.done();
	};

	_UIDateRange.getStartDate = function () {
		return Utils.toDate(this.$el.attr("data-start"));
	};

	_UIDateRange.setStartDate = function (value) {
		this.setDateRange(value, this.getEndDate());
	};

	_UIDateRange.getEndDate = function () {
		return Utils.toDate(this.$el.attr("data-end"));
	};
	_UIDateRange.setEndDate = function (value) {
		this.setDateRange(this.getStartDate(), value);
	};

	_UIDateRange.getMinDate = function () {
		return Utils.toDate(this.$el.attr("opt-min"));
	};
	_UIDateRange.setMinDate = function (value) {
		var min = Utils.toDate(value);
		if (getTime(min) != getTime(this.getMinDate())) {
			var snapshoot = this._snapshoot();
			this.$el.attr("opt-min", (min ? Utils.toDateString(min, "yyyy-MM-dd") : ""));
			if (min) {
				var end = this.getEndDate();
				if (end && getTime(end) < getTime(min)) {
					this.$el.attr("data-start", "").attr("data-end", "");
				}
				else {
					var start = this.getStartDate();
					if (start && getTime(start) < getTime(min))
						this.$el.attr("data-start", this.$el.attr("opt-min"));
				}
			}
			refresh.call(this, snapshoot);
			snapshoot.done();
		}
	};

	_UIDateRange.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDateRange.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		if (getTime(max) != getTime(this.getMaxDate())) {
			var snapshoot = this._snapshoot();
			this.$el.attr("data-max", (max ? Utils.toDateString(max, "yyyy-MM-dd") : ""));
			if (max) {
				var start = this.getStartDate();
				if (start && getTime(start) > getTime(max)) {
					this.$el.attr("data-start", "").attr("data-end", "");
				}
				else {
					var end = this.getEndDate();
					if (end && getTime(end) > getTime(max))
						this.$el.attr("data-end", this.$el.attr("opt-max"));
				}
			}
			refresh.call(this, snapshoot);
			snapshoot.done();
		}
	};

	_UIDateRange.getDateFormat = function () {
		if (this.hasOwnProperty("_dateFormat"))
			return this._dateFormat;
		if (this.options.hasOwnProperty("dateFormat"))
			return this.options.dateFormat;
		if (this.options.hasOwnProperty("format"))
			return this.options.format;
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
		if (this.$el.is("has-val")) {
			var start = this.getStartDate(), end = this.getEndDate(), label = "";
			if (start && end)
				label = DateRangeRender.getDateRangeLabel.call(this, start, end, value);
			this.inputTag.find("input").val(label || "");
		}
	};

	_UIDateRange.setShortcuts = function (dates) {
		DateRangeRender.renderShortcuts.call(this, this.$el, dates);
	};

	// ====================================================
	_UIDateRange._snapshoot_shoot = function (state) {
		state.data = this.getDateRange();
		state.min = this.getMinDate();
		state.max = this.getMaxDate();
	};

	_UIDateRange._snapshoot_compare = function (state) {
		var range = this.getDateRange();
		if (state.data && range) {
			return getTime(state.data[0]) == getTime(range[0]) 
				&& getTime(state.data[1]) == getTime(range[1]);
		}
		return !(state.data || range);
	};

	_UIDateRange._isNative = function () {
		return this.$el.attr("data-native") == 1;
	};

	// ====================================================
	// 点击输入框显示日历
	var iptClickHandler = function (e) { console.log(e);
		showDatePicker.call(this);
	};

	var onPickerSubmitHandler = function (e, range) { console.log(range);
		this.$el.removeClass("show-picker");
		this.setDateRange((range && range[0]), (range && range[1]));
	};

	// var quickBtnHandler = function (e) {
	// 	this.setQuickDateRange($(e.currentTarget).attr("data-val"), true);
	// };



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
	var refresh = function () {

	};

	var updateShortcuts = function () {

	};

	var showDatePicker = function () {
		if (!this.picker) {
			var params = {range: true};
			params.target = $("<div class='picker'></div>").appendTo(this.inputTag);
			params.min = this.getMinDate();
			params.max = this.getMaxDate();
			params.start = this.getStartDate();
			params.end = this.getEndDate();
			this.picker = Component.DatePicker.create(params);
			this.picker.on("submit", onPickerSubmitHandler.bind(this));
		}

		if (this.$el.is(".show-picker"))
			return ; 
		this.$el.addClass("show-picker").removeClass("show-before").removeClass("show-right");

		if (this.isRenderAsApp()) {
			$("html, body").addClass("ui-noscroll");
			// this.$el.children(".picker").on("tap", function (e) { hideDatePicker.call(self); });
		}
		else {
			var picker = this.inputTag.children(".picker");
			var pickerOffset = picker.offset();
			var pickerRight = pickerOffset.left + picker.width();
			var pickerBottom = pickerOffset.top + picker.height();
			var documentRight = $(window).width() + $("body").scrollLeft() + $("html").scrollLeft();
			var documentBottom = $(window).height() + $("body").scrollTop() + $("html").scrollTop();

			if (pickerRight > documentRight)
				this.$el.addClass("show-right");
			if (pickerBottom > documentBottom)
				this.$el.addClass("show-before");
		}
	};

	var hideDatePicker = function () {

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

	var getTime = function (date) {
		if (date instanceof Date) {
			return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
		}
		return 0;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-daterange", UIDateRange);

})();
