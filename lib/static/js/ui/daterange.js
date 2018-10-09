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
		if (!Component.base.isElement(view))
			return UIDateRange.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		var inputTarget = this.inputTag = this.$el.children(".ipt");

		inputTarget.on("tap", ".clear", onClearBtnHandler.bind(this));
		this.$el.on("change", ".ui-datepicker", onPickerChangeHandler.bind(this));
		if (this.isRenderAsApp() && this._isNative()) {
			renderOriginDates.call(this);
		}
		else {
			inputTarget.on("tap", iptClickHandler.bind(this));
			inputTarget.on("tap", ".picker", function (e) { return false; });
			if (!this.isRenderAsApp()) {
				var shortcuts = this.$el.children(".tools");
				shortcuts.on("tap", ".item", shortcutClickHandler.bind(this));
				shortcuts.on("tap", ".label", shortcutLabelHandler.bind(this));
				shortcuts.on("mouseenter", shortcutMouseHandler.bind(this));
				shortcuts.on("mouseleave", shortcutMouseHandler.bind(this));
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
	_UIDateRange.val = function (value, options) {
		if (Utils.isNull(value)) {
			return this.getDateRange(options && options.format);
		}
		value = Utils.toArray(value);
		this.setDateRange(value[0], value[1]);
		return this;
	};

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
		start = Utils.toDate(start);
		end = (start ? Utils.toDate(end) : null) || start;
		if (setDateInner.call(this, start, end)) {
			updateShortcuts.call(this, start, end);
			updatePicker.call(this, start, end, this.getMinDate(), this.getMaxDate());
		}
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
			this.$el.attr("opt-min", (min ? Utils.toDateString(min, "yyyy-MM-dd") : ""));
			updatePicker.call(this, this.getStartDate(), this.getEndDate(), min, this.getMaxDate());
		}
	};

	_UIDateRange.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDateRange.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		if (getTime(max) != getTime(this.getMaxDate())) {
			this.$el.attr("opt-max", (max ? Utils.toDateString(max, "yyyy-MM-dd") : ""));
			updatePicker.call(this, this.getStartDate(), this.getEndDate(), this.getMinDate(), max);
		}
	};

	_UIDateRange.getDateFormat = function () {
		var options = this.options;
		if (options.hasOwnProperty("dateFormat"))
			return options.dateFormat;
		if (options.hasOwnProperty("format"))
			return options.format;
		var format = this.$el.children(".format");
		if (format && format.length > 0) {
			options.dateFormat = format.text() || null;
			if (options.dateFormat && format.is(".format-fn")) {
				options.dateFormat = unescape(options.dateFormat);
				options.dateFormat = "var Utils=VRender.Utils;return (" + options.dateFormat + ");";
				options.dateFormat = (new Function(options.dateFormat))();
			}
			format.remove();
		}
		return options.dateFormat;
	};
	_UIDateRange.setDateFormat = function (value) {
		this.options.dateFormat = value;
		this.$el.children(".format").remove();
		setDateInner.call(this, this.getStartDate(), this.getEndDate());
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
		if (this.t_shortcut) {
			clearTimeout(this.t_shortcut);
		}
		if (e.type == "mouseleave") {
			if (this.$el.is(".show-dropdown")) {
				var self = this;
				this.t_shortcut = setTimeout(function () {
					self.t_shortcut = 0;
					self.$el.removeClass("show-dropdown");
				}, 1000);
			}
		}
	};

	var onPickerSubmitHandler = function (e, range) {
		hideDatePicker.call(this);
		var start = range && range[0] || null;
		var end = range && range[1] || null;
		if (setDateInner.call(this, start, end))
			updateShortcuts.call(this, start, end);
	};

	var onPickerCancelHandler = function (e) {
		hideDatePicker.call(this);
	};

	// 移动端点击 picker 隐藏
	var onPickerHideClickHandler = function (e) {
		hideDatePicker.call(this);
		if (this.picker)
			this.picker.cancel();
	};

	// 禁止 UIDatePicker 原生 jquery change 事件传播
	var onPickerChangeHandler = function (e) {
		// e.stopPropagation();
		return false;
	};

	var onClearBtnHandler = function (e) {
		if (setDateInner.call(this, null, null)) {
			updateShortcuts.call(this, null, null);
			updatePicker.call(this, null, null, this.getMinDate(), this.getMaxDate());
		}
		return false;
	};

	var originDateChangeHandler = function (e) {
		var input = $(e.currentTarget);
		var date = Utils.toDate(input.val());
		var start = input.is(".start") ? date : this.getStartDate();
		var end = input.is(".end") ? date : this.getEndDate();
		setDateInner.call(this, start, end);
		updateShortcuts.call(this, start, end);
	};


	// ====================================================
	var updateShortcuts = function (start, end) {
		var shortcuts = this.$el.children(".tools");
		if (shortcuts && shortcuts.length > 0) {
			var label = shortcuts.children(".label").text("选择日期");
			var items = shortcuts.find(".item").removeClass("selected");
			if (start && end && Utils.getDays(end, new Date()) == 0) {
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
		}
	};

	var updatePicker = function (start, end, min, max) {
		var self = this;
		Utils.debounce("daterange_renderpicker-" + this.getViewId(), function () {
			if (self.isRenderAsApp() && self._isNative()) {
				var startDateInput = self.inputTag.children(".origin-dateipt.start");
				var endDateInput = self.inputTag.children(".origin-dateipt.end");

				startDateInput.val(start ? Utils.toDateString(start, "yyyy-MM-dd") : "");
				endDateInput.val(end ? Utils.toDateString(end, "yyyy-MM-dd") : "");

				min = min ? Utils.toDateString(min, "yyyy-MM-dd") : "";
				max = max ? Utils.toDateString(max, "yyyy-MM-dd") : "";
				startDateInput.attr("min", min).attr("max", max);
				endDateInput.attr("min", min).attr("max", max);
			}
			else if (self.picker) {
				self.picker.setMinDate(min);
				self.picker.setMaxDate(max);
				self.picker.setDate(start, end);
			}
		});
	};

	var setDateInner = function (start, end) {
		var snapshoot = this._snapshoot();
		var input = this.inputTag.find("input");
		if (start && end) {
			this.$el.addClass("has-val");
			this.$el.attr("data-start", Utils.toDateString(start, "yyyy-MM-dd"));
			this.$el.attr("data-end", Utils.toDateString(end, "yyyy-MM-dd"));
			input.val(DateRangeRender.getDateRangeLabel(start, end, this.getDateFormat()) || "");
		}
		else {
			this.$el.removeClass("has-val");
			this.$el.attr("data-start", "").attr("data-end", "");
			input.val("");
		}
		return snapshoot.done();
	};

	// 设置N天前日期范围
	var setDaysRecently = function (days) {
		days = parseInt(days) || 0;
		if (days > 0) {
			var start = new Date(), end = new Date();
			start.setDate(start.getDate() - days + 1);
			// end.setDate(end.getDate() - 1);
			if (setDateInner.call(this, start, end)) {
				updatePicker.call(this, start, end, this.getMinDate(), this.getMaxDate());
			}
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
		var target = this.$el.addClass("show-picker");

		if (this.isRenderAsApp()) {
			$("html, body").addClass("ui-scrollless");
			this.inputTag.children(".picker").on("tap", onPickerHideClickHandler.bind(this));
		}
		else {
			var picker = this.inputTag.children(".picker");
			var offset = Utils.offset(picker, this._getScrollContainer(), 0, picker[0].scrollHeight);
			if (offset.isOverflowX)
				target.addClass("show-right");
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideDatePicker = function () {
		var target = this.$el.addClass("animate-out");

		if (this.isRenderAsApp()) {
			$("html, body").removeClass("ui-scrollless");
			this.$el.children(".picker").off("tap");
		}

		setTimeout(function () {
			target.removeClass("show-picker").removeClass("show-before").removeClass("show-right");
			target.removeClass("animate-in").removeClass("animate-out");
		}, 300);
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