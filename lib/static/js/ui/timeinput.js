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
	};
	var _UITimeInput = UITimeInput.prototype = new Component.base();

	UITimeInput.find = function (view) {
		return Component.find(view, ".ui-timeipt", UITimeInput);
	};

	UITimeInput.create = function (options) {
		return Component.create(options, UITimeInput, TimeInputRender);
	};

	// ====================================================
	_UITimeInput.getTime = function () {
		return this.$el.attr("data-t") || "";
	};
	_UITimeInput.setTime = function (value) {
		var time = TimeInputRender.getTime(value, this.isSecondVisible());
		this.$el.attr("data-t", time);
		this._rerender();
	};

	_UITimeInput.isSecondVisible = function () {
		if (!this.options.hasOwnProperty("showSecond")) {
			this.options.showSecond = !!this.$el.attr("opt-sec");
		}
		return Utils.isTrue(this.options.showSecond);
	};
	_UITimeInput.setSecondVisible = function (value) {
		this.options.showSecond = value;
		this._rerender();
	};

	_UITimeInput.isUse12Hour = function () {
		if (!this.options.hasOwnProperty("use12Hour")) {
			this.options.use12Hour = !!this.$el.attr("opt-h12");
		}
		return Utils.isTrue(this.options.use12Hour);
	};
	_UITimeInput.setUse12Hour = function (value) {
		this.options.use12Hour = value;
		this._rerender();
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

	_UITimeInput._rerender = function () {

	};

	// ====================================================
	var iptClickHandler = function (e) {
		showTimePicker.call(this);
	};

	var mouseHoverHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideTimePicker.bind(this));
	};

	var pickerTapHandler = function (e) {
		hideTimePicker.call(this);
	};

	// ====================================================
	var showTimePicker = function () {
		var picker = this.$el.children(".picker");
		if (!picker || picker.length == 0) {
			picker = $("<div class='picker'></div>").appendTo(this.$el);
			renderPicker.call(this, picker);
		}

		if (this.$el.is(".show-picker"))
			return ;
		var target = this.$el.addClass("show-picker");

		if (this.isRenderAsApp()) {
			$("html,body").addClass("ui-scrollless");
			picker.on("tap", pickerTapHandler.bind(this));
		}
		else {
			target.on("mouseenter", mouseHoverHandler.bind(this));
			target.on("mouseleave", mouseHoverHandler.bind(this));

			var offset = Utils.offset(picker, this._getScrollContainer(), 0, picker[0].scrollHeight);
			if (offset.isOverflowY)
				target.addClass("show-before");
		}

		scrollToTime.call(this, this.getTime());

		setTimeout(function () {
			target.addClass("animate-in");
		}, 0);
	};

	var hideTimePicker = function () {
		var target = this.$el.addClass("animate-out");

		if (this.isRenderAsApp()) {
			$("html,body").removeClass("ui-scrollless");
			target.children(".picker").off("tap");
		}
		else {
			target.off("mouseenter").off("mouseleave");
		}

		setTimeout(function () {
			target.removeClass("show-picker").removeClass("show-before");
			target.removeClass("animate-in").removeClass("animate-out");
		}, 300);
	};

	var scrollToTime = function (time) {
		if (time) {
			time = time.split(":");
			var hour = parseInt(time[0]) || 0;
			var minute = parseInt(time[1]) || 0;
			var second = parseInt(time[2]) || 0;
		}
	};

	var renderPicker = function (target) {
		target = $("<div class='cols'></div>").appendTo(target);

		var addCol = function (name, values) {
			var col = $("<div class='col'></div>").appendTo(target);
			col.addClass(name);
			Utils.each(values, function (temp) {
				var item = $("<div class='item'></div>").appendTo(col);
				item.text(temp);
			});
		};

		var use12Hour = this.isUse12Hour();

		// 时
		addCol("hour", this.getHours());
		// 分
		addCol("minute", this.getMinutes());
		// 秒
		if (this.isSecondVisible())
			addCol("second", this.getSeconds());
		if (use12Hour)
			addCol("apm", ["AM", "PM"]);

		var time = this.getTime();
		if (time) {
			time = time.split(":");
			var hour = parseInt(time[0]) || 0;
			var minute = parseInt(time[1]) || 0;
			var second = parseInt(time[2]) || 0;
			if (use12Hour) {
				var apmTarget = target.children(".apm").children();
				if (hour < 12) {
					apmTarget.eq(0).addClass("selected");
				}
				else {
					hour -= 12;
					apmTarget.eq(1).addClass("selected");
				}
			}
			target.children(".hour").children().eq(hour).addClass("selected");
			target.children(".minute").children().eq(minute).addClass("selected");
			target.children(".second").children().eq(second).addClass("selected");
		}
	};

	var rerenderPicker = function () {
		var target = this.$el.children(".picker");
		if (target && target.length > 0) {
			var self = this;
			Utils.debounce("timeinput_renderpicker", function () {
				renderPicker.call(self, target.empty());
			});
		}
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-timeipt", UITimeInput);

})();