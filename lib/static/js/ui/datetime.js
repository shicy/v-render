// ========================================================
// 日期时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-10-07
// ========================================================

(function () {
	if (VRender.Component.DateTime)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var DateTimeRender = Renderer.datetime;

	///////////////////////////////////////////////////////
	var UIDateTime = window.UIDateTime = Component.DateTime = function (view, options) {
		if (!Component.base.isElement(view))
			return UIDateTime.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		var inputTarget = this.inputTag = this.$el.children(".ipt");
		inputTarget.on("tap", iptClickHandler.bind(this));
		inputTarget.on("tap", ".clear", clearBtnHandler.bind(this));
	};
	var _UIDateTime = UIDateTime.prototype = new Component.base();

	UIDateTime.find = function (view) {
		return Component.find(view, ".ui-datetime", UIDateTime);
	};

	UIDateTime.create = function (options) {
		return Component.create(options, UIDateTime, DateTimeRender);
	};

	// ====================================================
	_UIDateTime.val = function (value, options) {
		if (Utils.isNull(value)) {
			return this.getDate(options && options.format);
		}
		this.setDate(value);
		return this;
	};

	_UIDateTime.getDate = function (format) {
		var date = Utils.toDate(parseInt(this.$el.attr("data-dt")));
		// date.setMilliseconds(0);
		// if (!this.isSecondVisible())
		// 	date.setSeconds(0);
		if (date && Utils.isNotBlank(format))
			return Utils.toDateString(date, format);
		return date;
	};
	_UIDateTime.setDate = function (value) {
		var date = value ? Utils.toDate(value) : null;
		setDateInner.call(this, date);
		if (this.picker)
			setPickerDate.call(this, this.picker, date);
	};

	_UIDateTime.getMinDate = function () {
		return Utils.toDate(parseInt(this.$el.attr("opt-min"))) || null;
	};
	_UIDateTime.setMinDate = function (value) {
		var min = Utils.toDate(value);
		min = min && min.getTime() || "";
		if (min != this.$el.attr("opt-min")) {
			this.$el.attr("opt-min", min);
			this._rerenderPicker();
		}
	};

	_UIDateTime.getMaxDate = function () {
		return Utils.toDate(parseInt(this.$el.attr("opt-max"))) || null;
	};
	_UIDateTime.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		max = max && max.getTime() || "";
		if (max != this.$el.attr("opt-max")) {
			this.$el.attr("opt-max", max);
			this._rerenderPicker();
		}
	};

	_UIDateTime.getDateFormat = function () {
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
	_UIDateTime.setDateFormat = function (value) {
		this.options.dateFormat = value;
		this.$el.children(".format").remove();
		setDateInner.call(this, this.getDate());
	};

	_UIDateTime.getPrompt = function () {
		return this.inputTag.children(".prompt").text();
	};
	_UIDateTime.setPrompt = function (value) {
		this.inputTag.children(".prompt").remove();
		if (Utils.isNotNull(value)) {
			value = Utils.trimToEmpty(value);
			$("<span class='prompt'></span>").appendTo(this.inputTag).text(value);
		}
	};

	_UIDateTime.isSecondVisible = function () {
		if (!this.options.hasOwnProperty("showSecond")) {
			this.options.showSecond = !!this.$el.attr("opt-sec");
		}
		return Utils.isTrue(this.options.showSecond);
	};
	_UIDateTime.setSecondVisible = function (value) {
		value = Utils.isNull(value) ? true : Utils.isTrue(value);
		if (value != this.isSecondVisible()) {
			this.options.showSecond = value;
			this._rerender();
		}
	};

	_UIDateTime.getHours = function () {
		if (!this.options.hasOwnProperty("hours")) {
			this.options.hours = this.$el.attr("opt-hours");
		}
		var hours = Renderer.fn.getIntValues(this.options.hours, 0, 23);
		if (hours && hours.length > 0)
			return hours;
		return Utils.map(new Array(24), function (tmp, i) { return i; });
	};
	_UIDateTime.setHours = function (value) {
		this.options.hours = value;
		this._rerenderPicker();
	};

	_UIDateTime.getMinutes = function () {
		if (!this.options.hasOwnProperty("minutes")) {
			this.options.minutes = this.$el.attr("opt-minutes");
		}
		var minutes = Renderer.fn.getIntValues(this.options.minutes, 0, 59);
		if (minutes && minutes.length > 0)
			return minutes;
		return Utils.map(new Array(60), function (tmp, i) { return i; });
	};
	_UIDateTime.setMinutes = function (value) {
		this.options.minutes = value;
		this._rerenderPicker();
	};

	_UIDateTime.getSeconds = function () {
		if (!this.options.hasOwnProperty("seconds")) {
			this.options.seconds = this.$el.attr("opt-seconds");
		}
		var seconds = Renderer.fn.getIntValues(this.options.seconds, 0, 59);
		if (seconds && seconds.length > 0)
			return seconds;
		return Utils.map(new Array(60), function (tmp, i) { return i; });
	};
	_UIDateTime.setSeconds = function (value) {
		this.options.seconds = value;
		this._rerenderPicker();
	};

	// ====================================================
	_UIDateTime._rerender = function () {
		var self = this;
		Utils.debounce("datetime_render-" + this.getViewId(), function () {
			setDateInner.call(self, self.getDate());
			if (self.picker) {
				renderPicker.call(self, self.picker.empty());
			}
		});
	};

	_UIDateTime._rerenderPicker = function () {
		if (this.picker) {
			var self = this;
			Utils.debounce("datetime_render-" + this.getViewId(), function () {
				renderPicker.call(self, self.picker.empty());
			});
		}
	};

	_UIDateTime._snapshoot_shoot = function (state, date) {
		state.data = date || this.getDate();
	};

	_UIDateTime._snapshoot_compare = function (state, date) {
		date = date || this.getDate();
		if (date && state.data)
			return date.getTime() == state.data.getTime();
		return date == state.data;
	};

	// ====================================================
	var iptClickHandler = function (e) {
		showDatePicker.call(this);
	};

	var clearBtnHandler = function (e) {
		setDateInner.call(this, null);
		if (this.picker) {
			setPickerDate.call(this, null);
			checkPickerEnabled.call(this);
		}
	};

	var mouseHoverHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideDatePicker.bind(this));
	};

	var pickerChangeHandler = function (e) {
		var date = getPickerDate.call(this, this.picker);
		if (date) {
			var _date = date.getTime();
			var min = this.getMinDate();
			if (min && min.getTime() > _date) {
				_date = min.getTime();
				date = new Date(_date);
			}
			var max = this.getMaxDate();
			if (max && max.getTime() < _date) {
				_date = max.getTime();
				date = new Date(_date);
			}
		}
		setDateInner.call(this, date);
		checkPickerEnabled.call(this);
		return false;
	};

	// ====================================================
	var showDatePicker = function () {
		if (!this.picker) {
			this.picker = $("<div class='picker'></div>").appendTo(this.$el);
			renderPicker.call(this, this.picker);
		}

		if (this.$el.is(".show-picker"))
			return ;
		var target = this.$el.addClass("show-picker");

		var picker = this.picker;
		if (this.isRenderAsApp()) {
			$("html,body").addClass("ui-scrollless");
			// target.children(".picker").on("tap", hideDatePicker.bind(this));
		}
		else {
			target.on("mouseenter", mouseHoverHandler.bind(this));
			target.on("mouseleave", mouseHoverHandler.bind(this));
			picker.on("change", pickerChangeHandler.bind(this));

			var offset = Utils.offset(picker, this._getScrollContainer(), 0, picker[0].scrollHeight);
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
			$("html,body").removeClass("ui-scrollless");
			// target.children(".picker").off("tap").off("touchend");
		}
		else {
			target.off("mouseenter").off("mouseleave");
			this.picker.off("change");
		}

		setTimeout(function () {
			target.removeClass("show-picker").removeClass("show-before");
			target.removeClass("animate-in").removeClass("animate-out");
		}, 300);
	};

	var renderPicker = function (picker) {
		if (this.isRenderAsApp()) {

		}
		else {
			UIDatePicker.create({target: picker, min: this.getMinDate(), max: this.getMaxDate()});

			var timeBar = $("<div class='timebar'></div>").appendTo(picker);
			var hourCombo = UICombobox.create({target: timeBar, name: "hour", data: this.getHours()});
			timeBar.append("<span class='tip'>时</span>");
			var minuteCombo = UICombobox.create({target: timeBar, name: "minute", data: this.getMinutes()});
			timeBar.append("<span class='tip'>分</span>");
			if (this.isSecondVisible()) {
				var secondCombo = Component.Combobox.create({target: timeBar, name: "second", data: this.getSeconds()});
				timeBar.append("<span class='tip'>秒</span>");
			}
		}

		setPickerDate.call(this, picker, this.getDate());
		checkPickerEnabled.call(this, picker);
	};

	var getPickerDate = function (picker) {
		var datePicker = UIDatePicker.find(picker)[0];
		if (!datePicker)
			return null;
		var date = datePicker.getDate();
		if (date) {
			var hourCombo = Component.get(picker.find("[name=hour]"));
			date.setHours(parseInt(hourCombo.getSelectedKey()) || 0);
			var minuteCombo = Component.get(picker.find("[name=minute]"));
			date.setMinutes(parseInt(minuteCombo.getSelectedKey()) || 0);
			if (this.isSecondVisible()) {
				var secondCombo = Component.get(picker.find("[name=second]"));
				date.setSeconds(parseInt(secondCombo.getSelectedKey()) || 0);
			}
		}
		return date;
	};

	var setPickerDate = function (picker, date) {
		var datePicker = UIDatePicker.find(picker)[0];
		datePicker && datePicker.setDate(date);

		var hourCombo = Component.get(picker.find("[name=hour]"));
		hourCombo && hourCombo.setSelectedKey(date ? date.getHours() : "");

		var minuteCombo = Component.get(picker.find("[name=minute]"));
		minuteCombo && minuteCombo.setSelectedKey(date ? date.getMinutes() : "");

		var secondCombo = Component.get(picker.find("[name=second]"));
		secondCombo && secondCombo.setSelectedKey(date ? date.getSeconds() : "");
	};

	var checkPickerEnabled = function (picker) {
		// 暂不实现
	};

	// ====================================================
	var setDateInner = function (date) {
		var snapshoot = this._snapshoot();
		if (date) {
			this.$el.addClass("has-val").attr("data-dt", date.getTime());
			var showSecond = this.isSecondVisible();
			var formatDate = DateTimeRender.getFormatDate(date, this.getDateFormat(), showSecond);
			this.inputTag.find("input").val(formatDate);
		}
		else {
			this.$el.removeClass("has-val").attr("data-dt", "");
			this.inputTag.find("input").val("");
		}
		snapshoot.done();
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datetime", UIDateTime);

})();