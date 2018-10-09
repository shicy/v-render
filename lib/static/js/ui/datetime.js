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

		this.$el.on("change", ".picker", function (e) { return false; });
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
		return Utils.toDate(parseInt(this.$el.attr("opt-min")));
	};
	_UIDateTime.setMinDate = function (value) {
		var min = Utils.toDate(value);
		min = min && min.getTime() || "";
		if (min != this.$el.attr("opt-min")) {
			this.$el.attr("opt-min", min);
			rerenderPicker.call(this);
		}
	};

	_UIDateTime.getMaxDate = function () {
		return Utils.toDate(parseInt(this.$el.attr("opt-max")));
	};
	_UIDateTime.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		max = max && max.getTime() || "";
		if (max != this.$el.attr("opt-max")) {
			this.$el.attr("opt-max", max);
			rerenderPicker.call(this);
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
			rerender.call(this);
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
		rerenderPicker.call(this);
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
		rerenderPicker.call(this);
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
		rerenderPicker.call(this);
	};

	// ====================================================
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
			setPickerDate.call(this, this.picker, null);
			checkPickerEnabled.call(this);
		}
		return false;
	};

	var mouseHoverHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideDatePicker.bind(this));
	};

	var pickerChangeHandler = function (e) {
		var date = getPickerDate.call(this, this.picker);
		setDateInner.call(this, getLimitDate.call(this, date));
		checkPickerEnabled.call(this, this.picker);
		return false;
	};

	var pickerTapHandler = function (e) {
		if ($(e.target).is(".picker"))
			hideDatePicker.call(this);
	};

	var pickerScrollHandler = function (e) {
		this.beScrolled = true;
		var target = $(e.currentTarget);
		var items = target.children();
		var height = items.eq(0).height();
		var scrollTop = target.scrollTop();
		var index = parseInt(scrollTop / height);
		if (index > 0 && (scrollTop % height) < (height / 2)) {
			index -= 1;
		}

		var item = items.eq(index);
		if (item.is(".selected"))
			return ;
		items.filter(".selected").removeClass("selected");
		item.addClass("selected");

		if (target.is(".year, .month")) {
			var year = parseInt(this.picker.find(".col.year .selected").text());
			var month = parseInt(this.picker.find(".col.month .selected").text());
			updatePickerDays.call(this, this.picker, year, month);
		}
		checkPickerEnabled.call(this, this.picker);

		var date = getPickerDate.call(this, this.picker);
		setDateInner.call(this, getLimitDate.call(this, date));
	};

	var pickerTouchHandler = function (e) {
		if (e.type == "touchstart") {
			if (this.t_touchend) {
				clearTimeout(this.t_touchend);
			}
			this.t_touchend = null;
		}
		else if (e.type == "touchend") {
			if (this.beScrolled) {
				this.beScrolled = false;
				var self = this;
				var date = getPickerDate.call(this, this.picker);
				var time = date && date.getTime() || 0;
				var waitToStop = function () {
					self.t_touchend = setTimeout(function () {
						self.t_touchend = null;
						var _date = getPickerDate.call(self, self.picker);
						var _time = _date && _date.getTime() || 0;
						if (time == _time) {
							scrollToDate.call(self, self.picker, _date);
						}
						else {
							time = _time;
							waitToStop();
						}
					}, 200);
				};
				waitToStop();
			}
		}
	};

	// ====================================================
	var rerender = function () {
		var self = this;
		Utils.debounce("datetime_render-" + this.getViewId(), function () {
			setDateInner.call(self, self.getDate());
			if (self.picker) {
				renderPicker.call(self, self.picker.empty());
			}
		});
	};

	var rerenderPicker = function () {
		if (this.picker) {
			var self = this;
			Utils.debounce("datetime_render-" + this.getViewId(), function () {
				renderPicker.call(self, self.picker.empty());
			});
		}
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
			picker.on("tap", pickerTapHandler.bind(this));
			picker.on("touchstart", pickerTouchHandler.bind(this));
			picker.on("touchend", pickerTouchHandler.bind(this));
			picker.find(".col").on("scroll", pickerScrollHandler.bind(this));
		}
		else {
			target.on("mouseenter", mouseHoverHandler.bind(this));
			target.on("mouseleave", mouseHoverHandler.bind(this));
			picker.on("change", pickerChangeHandler.bind(this));

			var offset = Utils.offset(picker, this._getScrollContainer(), 0, picker[0].scrollHeight);
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		scrollToDate.call(this, picker, this.getDate());

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideDatePicker = function () {
		var target = this.$el.addClass("animate-out");

		if (this.isRenderAsApp()) {
			$("html,body").removeClass("ui-scrollless");
			this.picker.off("tap").off("touchstart").off("touchend");
			this.picker.find(".col").off("scroll");
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
			var cols = $("<div class='cols'></div>").appendTo(picker);
			var addCol = function (name, values) {
				var col = $("<div class='col'></div>").appendTo(cols);
				col.addClass(name);
				Utils.each(values, function (temp) {
					$("<div class='item'></div>").appendTo(col).text(temp);
				});
			};
			addCol("year", getYears.call(this));
			addCol("month", getMonths.call(this));
			addCol("day", []); // getDays.call(this)
			addCol("hour", this.getHours());
			addCol("minute", this.getMinutes());
			if (this.isSecondVisible())
				addCol("second", this.getSeconds());
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

		var date = this.getDate();
		updatePickerDays.call(this, picker, (date ? date.getFullYear() : null), 
			(date ? (date.getMonth() + 1) : null));
		setPickerDate.call(this, picker, date);
		checkPickerEnabled.call(this, picker);
	};

	var getPickerDate = function (picker) {
		if (this.isRenderAsApp()) {
			var target = picker.children(".cols");
			var year = parseInt(target.children(".year").find(".selected").text()) || 0;
			var month = parseInt(target.children(".month").find(".selected").text()) || 1;
			var day = parseInt(target.children(".day").find(".selected").text()) || 1;
			var hour = parseInt(target.children(".hour").find(".selected").text()) || 0;
			var minute = parseInt(target.children(".minute").find(".selected").text()) || 0;
			var second = parseInt(target.children(".second").find(".selected").text()) || 0;
			return new Date(year, month - 1, day, hour, minute, second);
		}
		else {
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
		}
	};

	var setPickerDate = function (picker, date) {
		if (this.isRenderAsApp()) {
			var target = picker.children(".cols");
			target.find(".selected").removeClass("selected");
			var select = function (name, value) {
				var col = target.children("." + name);
				var item = Utils.find(col.children(), function (temp) {
					return temp.text() == value;
				});
				if (item && item.length > 0)
					item.addClass("selected");
			};
			if (date) {
				select("year", date.getFullYear());
				select("month", date.getMonth() + 1);
				select("day", date.getDate());
				select("hour", date.getHours());
				select("minute", date.getMinutes());
				select("second", date.getSeconds());
			}
			else {
				select("year", (new Date()).getFullYear());
			}
		}
		else {
			var datePicker = UIDatePicker.find(picker)[0];
			datePicker && datePicker.setDate(date);

			var hourCombo = Component.get(picker.find("[name=hour]"));
			hourCombo && hourCombo.setSelectedKey(date ? date.getHours() : "");

			var minuteCombo = Component.get(picker.find("[name=minute]"));
			minuteCombo && minuteCombo.setSelectedKey(date ? date.getMinutes() : "");

			var secondCombo = Component.get(picker.find("[name=second]"));
			secondCombo && secondCombo.setSelectedKey(date ? date.getSeconds() : "");
		}
	};

	var scrollToDate = function (picker, date) {
		var target = picker.children(".cols");
		var scroll = function (name, value) {
			var col = target.children("." + name);
			var item = Utils.find(col.children(), function (temp) {
				return temp.text() == value;
			});
			if (item && item.length > 0) {
				var scrollTop = (item.index() + 1) * item.height();
				col.scrollTop(scrollTop);
			}
		};
		if (date) {
			scroll("year", date.getFullYear());
			scroll("month", date.getMonth() + 1);
			scroll("day", date.getDate());
			scroll("hour", date.getHours());
			scroll("minute", date.getMinutes());
			scroll("second", date.getSeconds());
		}
		else {
			target.children().scrollTop(0);
			scroll("year", (new Date()).getFullYear());
		}
	};

	var updatePickerDays = function (picker, year, month) {
		if (!year) {
			var date = new Date();
			year = date.getFullYear();
		}
		var days = getDays.call(this, year, month);
		var target = picker.find(".col.day");
		var current = target.find(".selected").text();
		target.empty();
		Utils.each(days, function (temp) {
			var item = $("<div class='item'></div>").appendTo(target).text(temp);
			if (temp == current)
				item.addClass("selected");
		});
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

	var getLimitDate = function (date) {
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
		return date || null;
	};

	var getYears = function () {
		var date = new Date();
		var year = date.getFullYear() + 100;
		var years = [];
		for (var i = 0; i < 200; i++) {
			years.push(year--);
		}
		return years;
	};

	var getMonths = function () {
		return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	};

	var getDays = function (year, month) {
		var days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
			21, 22, 23, 24, 25, 26, 27, 28];
		if (month == 2) {
			if ((year % 400 == 0) || ((year % 4 == 0) && (year % 100 != 0)))
				days.push(29);
		}
		else {
			days.push(29);
			days.push(30);
			if ([1, 3, 5, 7, 10, 12].indexOf(month) >= 0)
				days.push(31);
		}
		return days;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-datetime", UIDateTime);

})();