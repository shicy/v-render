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

		inputTarget.on("tap", ".clear", onClearBtnHandler.bind(this));
		if (this.isRenderAsApp() && this._isNative()) {
			renderOriginDates.call(this);
		}
		else {
			inputTarget.on("tap", iptClickHandler.bind(this));
			inputTarget.on("tap", ".picker", function (e) { return false; });
			if (this.isRenderAsApp()) {

			}
			else {
				var shortcuts = this.$el.children(".tools");
				shortcuts.on("tap", ".item", shortcutClickHandler.bind(this));
				shortcuts.on("tap", ".label", shortcutLabelHandler.bind(this));
				shortcuts.on("mouseenter, mouseleave", shortcutMouseHandler.bind(this));
			}
		}
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
		return this.$el.attr("opt-native") == 1;
	};

	// ====================================================
	// 点击输入框显示日历
	var iptClickHandler = function (e) {
		showDatePicker.call(this);
	};

	var shortcutClickHandler = function (e) {
		var item = $(e.currentTarget);
		item.addClass("selected").siblings().removeClass("selected");
		item.parent().parent().children(".label").text(item.text());
		this.$el.removeClass("show-dropdown");
		setDaysRecently.call(this, item.attr("data-val"));
	};

	var shortcutLabelHandler = function (e) {
		this.$el.addClass("show-dropdown");
	};

	var shortcutMouseHandler = function (e) {
		if (this.shortcutMouseTimerId) {
			clearTimeout(this.shortcutMouseTimerId);
		}
		if (e.type == "mouseleave") {
			if (this.$el.is(".show-dropdown")) {
				var self = this;
				this.shortcutMouseTimerId = setTimeout(function () {
					self.shortcutMouseTimerId = 0;
					self.$el.removeClass("show-dropdown");
				}, 1000);
			}
		}
	};

	var onPickerSubmitHandler = function (e, range) {
		hideDatePicker.call(this);
		this.setDateRange((range && range[0]), (range && range[1]));
	};

	var onPickerCancelHandler = function (e) {
		hideDatePicker.call(this);
	};

	var onPickerHideClickHandler = function (e) {
		hideDatePicker.call(this);
		if (this.picker)
			this.picker.cancel();
	};

	var onClearBtnHandler = function (e) {
		this.setDateRange(null, null);
		return false;
	};

	var originDateChangeHandler = function (e) {
		var input = $(e.currentTarget);
		var date = Utils.toDate(input.val());
		if (input.is(".start")) {
			this.setDateRange(date, this.getEndDate());
		}
		else {
			this.setDateRange(this.getStartDate(), date);
		}
	};


	// ====================================================
	var refresh = function (snapshoot) {
		if (this.refreshTimerId) {
			clearTimeout(this.refreshTimerId);
		}
		var self = this;
		this.refreshTimerId = setTimeout(function () {
			var range = self.getDateRange();
			var start = range && range[0];
		 	var end = range && range[1];
		 	updateRangeLabel.call(self, start, end);
		 	updateShortcuts.call(self, start, end);
		 	updatePicker.call(self, start, end, self.getMinDate(), self.getMaxDate());
		}, 0);
	};

	var updateRangeLabel = function (start, end) {
		var label = DateRangeRender.getDateRangeLabel(start, end, this.getDateFormat());
		this.inputTag.find("input").val(label || "");
		if (start && end)
			this.$el.addClass("has-val");
		else
			this.$el.removeClass("has-val");
	};

	var updateShortcuts = function (start, end) {
		var shortcuts = this.$el.children(".tools");
		var label = shortcuts.children(".label").text("选择日期");
		var items = shortcuts.find(".item").removeClass("selected");
		if (start && end && Utils.getDays(end, new Date()) == -1) {
			var days = Utils.getDays(end, start) + 1;
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (item.attr("data-val") == days) {
					item.addClass("selected");
					label.text(item.text());
					break;
				}
			}
		}
	};

	var updatePicker = function (start, end, min, max) {
		if (this.isRenderAsApp() && this._isNative()) {
			var startDateInput = this.inputTag.children(".origin-dateipt.start");
			var endDateInput = this.inputTag.children(".origin-dateipt.end");

			startDateInput.val(start ? Utils.toDateString(start, "yyyy-MM-dd") : "");
			endDateInput.val(end ? Utils.toDateString(end, "yyyy-MM-dd") : "");

			min = min ? Utils.toDateString(min, "yyyy-MM-dd") : "";
			max = max ? Utils.toDateString(max, "yyyy-MM-dd") : "";
			startDateInput.attr("min", min).attr("max", max);
			endDateInput.attr("min", min).attr("max", max);
		}
		else if (this.picker) {
			this.picker.setMinDate(min);
			this.picker.setMaxDate(max);
			this.picker.setDate(start, end);
		}
	};

	// 设置N天前日期范围
	var setDaysRecently = function (days) {
		days = parseInt(days) || 0;
		if (days > 0) {
			var start = new Date(), end = new Date();
			start.setDate(start.getDate() - days);
			end.setDate(end.getDate() - 1);
			this.setDateRange(start, end);
		}
	};

	// ====================================================
	var renderOriginDates = function () {
		var startDateInput = $("<input class='origin-dateipt start' type='date'/>").appendTo(this.inputTag);
		var endDateInput = $("<input class='origin-dateipt end' type='date'/>").appendTo(this.inputTag);

		updatePicker.call(this, this.getStartDate(), this.getEndDate(), this.getMinDate(), this.getMaxDate());

		startDateInput.on("change", originDateChangeHandler.bind(this));
		endDateInput.on("change", originDateChangeHandler.bind(this));
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
			this.picker.on("cancel", onPickerCancelHandler.bind(this));
		}

		if (this.$el.is(".show-picker"))
			return ; 
		this.$el.addClass("show-picker").removeClass("show-before").removeClass("show-right");

		if (this.isRenderAsApp()) {
			$("html, body").addClass("ui-noscroll");
			this.inputTag.children(".picker").on("tap", onPickerHideClickHandler.bind(this));
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
		this.$el.removeClass("show-picker");
		if (this.isRenderAsApp()) {
			$("html, body").removeClass("ui-noscroll");
			this.$el.children(".picker").off("tap");
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
