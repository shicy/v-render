// ========================================================
// 时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-09-29
// ========================================================

(function () {
	if (VRender.Component.TimeInput)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var TimeInputRender = Renderer.timeinput;

	///////////////////////////////////////////////////////
	var UITimeInput = window.UITimeInput = Component.TimeInput = function (view, options) {
		if (!Component.base.isElement(view))
			return UITimeInput.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		var inputTarget = this.inputTag = this.$el.children(".ipt");
		inputTarget.on("tap", iptClickHandler.bind(this));
		inputTarget.on("tap", ".clear", clearBtnHandler.bind(this));

		if (this.isRenderAsApp()) {
			// this.$el.on("tap", ".picker", pickerTapHandler.bind(this));
			// this.$el.on("touchstart", ".picker", pickerTouchHandler.bind(this));
			// this.$el.on("touchend", ".picker", pickerTouchHandler.bind(this));
		}
		else {
			this.$el.on("tap", ".picker .item", pickerItemClickHandler.bind(this));
		}

	};
	var _UITimeInput = UITimeInput.prototype = new Component.base();

	UITimeInput.find = function (view) {
		return Component.find(view, ".ui-timeipt", UITimeInput);
	};

	UITimeInput.create = function (options) {
		return Component.create(options, UITimeInput, TimeInputRender);
	};

	UITimeInput.instance = function (target) {
		return Component.instance(target, ".ui-timeipt");
	};

	// ====================================================
	_UITimeInput.getTime = function () {
		return this.$el.attr("data-t") || "";
	};
	_UITimeInput.setTime = function (value) {
		var time = TimeInputRender.getTime(value, this.isSecondVisible());
		setTimeInner.call(this, time);
		if (this.picker)
			rerenderPicker.call(this, this.picker.empty());
	};

	_UITimeInput.getMinTime = function () {
		return this.$el.attr("opt-min") || "";
	};
	_UITimeInput.setMinTime = function (value) {
		var time = TimeInputRender.getTime(value, true);
		this.$el.attr("opt-min", time);
		if (this.picker)
			checkPickerEnabled.call(this, this.picker);
	};

	_UITimeInput.getMaxTime = function () {
		return this.$el.attr("opt-max") || "";
	};
	_UITimeInput.setMaxTime = function (value) {
		var time = TimeInputRender.getTime(value, true);
		this.$el.attr("opt-max", time);
		if (this.picker)
			checkPickerEnabled.call(this, this.picker);
	};

	_UITimeInput.isSecondVisible = function () {
		if (!this.options.hasOwnProperty("showSecond")) {
			this.options.showSecond = !!this.$el.attr("opt-sec");
		}
		return Utils.isTrue(this.options.showSecond);
	};
	_UITimeInput.setSecondVisible = function (value) {
		value = Utils.isNull(value) ? true : Utils.isTrue(value);
		if (value == this.isSecondVisible())
			return ;
		this.options.showSecond = value;
		rerender.call(this);
	};

	_UITimeInput.isUse12Hour = function () {
		if (!this.options.hasOwnProperty("use12Hour")) {
			this.options.use12Hour = !!this.$el.attr("opt-h12");
		}
		return Utils.isTrue(this.options.use12Hour);
	};
	_UITimeInput.setUse12Hour = function (value) {
		value = Utils.isNull(value) ? true : Utils.isTrue(value);
		if (value == this.isUse12Hour())
			return ;
		this.options.use12Hour = value;
		rerender.call(this);
	};

	_UITimeInput.getHours = function () {
		if (!this.options.hasOwnProperty("hours")) {
			this.options.hours = this.$el.attr("opt-hours");
		}
		var use12Hour = this.isUse12Hour();
		var hours = Renderer.fn.getIntValues(this.options.hours, 0, (use12Hour ? 11 : 23));
		if (hours && hours.length > 0)
			return hours;
		return Utils.map(new Array(use12Hour ? 12 : 24), function (tmp, i) { return i; });
	};
	_UITimeInput.setHours = function (value) {
		this.options.hours = value;
		rerenderPicker.call(this);
	};

	_UITimeInput.getMinutes = function () {
		if (!this.options.hasOwnProperty("minutes")) {
			this.options.minutes = this.$el.attr("opt-minutes");
		}
		var minutes = Renderer.fn.getIntValues(this.options.minutes, 0, 59);
		if (minutes && minutes.length > 0)
			return minutes;
		return Utils.map(new Array(60), function (tmp, i) { return i; });
	};
	_UITimeInput.setMinutes = function (value) {
		this.options.minutes = value;
		rerenderPicker.call(this);
	};

	_UITimeInput.getSeconds = function () {
		if (!this.options.hasOwnProperty("seconds")) {
			this.options.seconds = this.$el.attr("opt-seconds");
		}
		var seconds = Renderer.fn.getIntValues(this.options.seconds, 0, 59);
		if (seconds && seconds.length > 0)
			return seconds;
		return Utils.map(new Array(60), function (tmp, i) { return i; });
	};
	_UITimeInput.setSeconds = function (value) {
		this.options.seconds = value;
		rerenderPicker.call(this);
	};

	// ====================================================
	_UITimeInput._snapshoot_shoot = function (state) {
		state.data = this.getTime();
	};

	_UITimeInput._snapshoot_compare = function (state) {
		return state.data == this.getTime();
	};

	// ====================================================
	var iptClickHandler = function (e) {
		showTimePicker.call(this);
	};

	var clearBtnHandler = function (e) {
		setTimeInner.call(this, null);
		if (this.picker)
			setPickerTime.call(this, this.picker, "");
		return false;
	};

	var mouseHoverHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideTimePicker.bind(this));
	};

	var pickerTapHandler = function (e) {
		if ($(e.target).is(".picker"))
			hideTimePicker.call(this);
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
				var time = getPickerTime.call(this, this.picker);
				var waitToStop = function () {
					self.t_touchend = setTimeout(function () {
						self.t_touchend = null;
						var _time = getPickerTime.call(self, self.picker);
						if (time == _time) {
							scrollToTime.call(self, self.picker, _time);
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

		checkPickerEnabled.call(this, this.picker);

		var time = getPickerTime.call(this, this.picker);
		setTimeInner.call(this, getLimitTime.call(this, time));
	};

	var pickerItemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".selected"))
			return ;
		item.addClass("selected").siblings().removeClass("selected");

		checkPickerEnabled.call(this, this.picker);

		var time = getPickerTime.call(this, this.picker);
		setTimeInner.call(this, getLimitTime.call(this, time));

		return false;
	};

	// ====================================================
	var rerender = function () {
		var self = this;
		Utils.debounce("timeinput_render-" + this.getViewId(), function () {
			setTimeInner.call(self, self.getTime());
			if (this.picker)
				renderPicker.call(self, this.picker.empty());
		});
	};

	var rerenderPicker = function () {
		if (this.picker) {
			var self = this;
			Utils.debounce("timeinput_renderpicker-" + this.getViewId(), function () {
				renderPicker.call(self, this.picker.empty());
			});
		}
	};

	var setTimeInner = function (time) {
		var snapshoot = this._snapshoot();
		this.$el.attr("data-t", time || "");
		var input = this.inputTag.find("input");
		if (time) {
			time = TimeInputRender.getTime(time, this.isSecondVisible());
			input.val(this.isUse12Hour() ? TimeInputRender.get12HourTime(time) : time);
			this.$el.addClass("has-val");
		}
		else {
			input.val("");
			this.$el.removeClass("has-val");
		}
		snapshoot.done();
	};

	var getLimitTime = function (time) {
		var min = this.getMinTime();
		if (min && time < min)
			time = min;
		var max = this.getMaxTime();
		if (max && time > max)
			time = max;
		return time;
	};

	// ====================================================
	var showTimePicker = function () {
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
		}
		else {
			target.on("mouseenter", mouseHoverHandler.bind(this));
			target.on("mouseleave", mouseHoverHandler.bind(this));

			var offset = Utils.offset(picker, this._getScrollContainer(), 0, picker[0].scrollHeight);
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		scrollToTime.call(this, picker, this.getTime());

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideTimePicker = function () {
		var target = this.$el.addClass("animate-out");

		if (this.isRenderAsApp()) {
			$("html,body").removeClass("ui-scrollless");
			this.picker.off("tap").off("touchstart").off("touchend");
		}
		else {
			target.off("mouseenter").off("mouseleave");
		}

		setTimeout(function () {
			target.removeClass("show-picker").removeClass("show-before");
			target.removeClass("animate-in").removeClass("animate-out");
		}, 300);
	};

	var scrollToTime = function (picker, time) {
		var _renderAsApp = this.isRenderAsApp();
		var target = picker.children(".cols");
		if (time) {
			var use12Hour = this.isUse12Hour();
			var scroll = function (name, value) {
				var col = target.children("." + name);
				var item = Utils.find(col.children(), function (temp) {
					return temp.text() == value;
				});
				if (item && item.length > 0) {
					var scrollTop = item.index() * item.height();
					if (_renderAsApp)
						scrollTop += item.height();
					col.scrollTop(scrollTop);
				}
			};
			time = time.split(":");
			var hour = parseInt(time[0]) || 0;
			scroll("hour", ((hour > 11 && use12Hour) ? (hour - 12) : hour));
			scroll("minute", parseInt(time[1]) || 0);
			scroll("second", parseInt(time[2]) || 0);
			if (_renderAsApp && use12Hour) {
				scroll("apm", (hour < 12 ? "AM" : "PM"));
			}
		}
		else if (_renderAsApp) {
			target.children().scrollTop(0);
		}
	};

	var renderPicker = function (picker) {
		var target = $("<div class='cols'></div>").appendTo(picker);

		var addCol = function (name, values) {
			var col = $("<div class='col'></div>").appendTo(target);
			col.addClass(name);
			Utils.each(values, function (temp) {
				$("<div class='item'></div>").appendTo(col).text(temp);
			});
		};

		// 时
		addCol("hour", this.getHours());
		// 分
		addCol("minute", this.getMinutes());
		// 秒
		if (this.isSecondVisible())
			addCol("second", this.getSeconds());
		if (this.isUse12Hour())
			addCol("apm", ["AM", "PM"]);

		setPickerTime.call(this, picker, this.getTime());
		checkPickerEnabled.call(this, picker);

		if (this.isRenderAsApp())
			target.children(".col").on("scroll", pickerScrollHandler.bind(this));
	};

	var getPickerTime = function (picker) {
		var target = picker.children(".cols");
		var time = [];
		// 时
		var hour = parseInt(target.children(".hour").find(".selected").text()) || 0;
		if (this.isUse12Hour()) {
			if (target.children(".apm").find(".selected").text() == "PM")
				hour += 12;
		}
		time.push((hour < 10 ? "0" : "") + hour);
		// 分
		var minute = parseInt(target.children(".minute").find(".selected").text()) || 0;
		time.push((minute < 10 ? "0" : "") + minute);
		// 秒
		if (this.isSecondVisible()) {
			var second = parseInt(target.children(".second").find(".selected").text()) || 0;
			time.push((second < 10 ? "0" : "") + second);
		}
		return time.join(":");
	};

	var setPickerTime = function (picker, time) {
		var target = picker.children(".cols");
		target.find(".selected").removeClass("selected");
		if (time) {
			var setSelected = function (name, value) {
				var col = target.children("." + name);
				var item = Utils.find(col.children(), function (temp) {
					return temp.text() == value;
				});
				if (item && item.length > 0)
					item.addClass("selected");
			};
			
			time = time.split(":");
			var hour = parseInt(time[0]) || 0;

			if (this.isUse12Hour()) {
				setSelected("apm", (hour < 12 ? "AM" : "PM"));
				if (hour > 11)
					hour -= 12;
			}

			setSelected("hour", hour);
			setSelected("minute", parseInt(time[1]) || 0);
			if (this.isSecondVisible())
				setSelected("second", parseInt(time[2]) || 0);
		}
	};

	var checkPickerEnabled = function (picker) {
		var target = picker.children(".cols");

		var min = (this.getMinTime() || "00:00:00").split(":");
		var max = (this.getMaxTime() || "23:59:59").split(":");
		var minHour = parseInt(min[0]) || 0;
		var minMinute = parseInt(min[1]) || 0;
		var minSecond = parseInt(min[2]) || 0;
		var maxHour = parseInt(max[0]) || 0;
		var maxMinute = parseInt(max[1]) || 0;
		var maxSecond = parseInt(max[2]) || 0;

		var ispm = target.children(".apm").find(".selected").text() == "PM";
		var hour = -1, minute = -1;

		var _min = minHour * 10000, _max = maxHour * 10000, _time = 0;
		Utils.each(target.children(".hour").children(), function (item) {
			var _hour = (parseInt(item.text()) || 0) + (ispm ? 12 : 0);
			var _t = _time + _hour * 10000;
			if (_t < _min || _t > _max)
				item.addClass("disabled");
			else
				item.removeClass("disabled");
			if (item.is(".selected"))
				hour = _hour;
		});

		_min += minMinute * 100; _max += maxMinute * 100; _time += (hour < 0 ? 0 : (hour * 10000));
		Utils.each(target.children(".minute").children(), function (item) {
			var _minute = parseInt(item.text()) || 0;
			var _t = _time + _minute * 100;
			if (_t < _min || _t > _max)
				item.addClass("disabled");
			else
				item.removeClass("disabled");
			if (item.is(".selected"))
				minute = _minute;
		});

		_min += minSecond; _max += maxSecond; _time += (minute < 0 ? 0 : (minute * 100));
		Utils.each(target.children(".second").children(), function (item) {
			item.removeClass("disabled");
			var _second = parseInt(item.text()) || 0;
			var _t = _time + _second;
			if (_t < _min || _t > _max)
				item.addClass("disabled");
		});

		Utils.each(target.children(".apm").children(), function (item) {
			item.removeClass("disabled");
			if (item.text() == "AM" && minHour > 11)
				item.addClass("disabled");
			else if (item.text() == "PM" && maxHour < 12)
				item.addClass("disabled");
		});
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-timeipt", UITimeInput);

})();