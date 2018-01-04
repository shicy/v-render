// ========================================================
// 日期输入框
// @author shicy <shicy85@163.com>
// Create on 2016-12-23
// ========================================================

(function () {
	if (VRender.Component.DateInput)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DateInputRender = Component.Render.dateinput;

	///////////////////////////////////////////////////////
	var UIDateInput = window.UIDateInput = Component.DateInput = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		if (Utils.isTrue(this.options.native))
			this.$el.attr("data-native", "1");

		this.input = this.$el.find(".ipt > input");

		this.tap(".ipt", iptClickHandler.bind(this));
		this.tap(".ipt > .clear", clearHandler.bind(this));

		if (this.isRenderAsApp()) {
			if (this.isNative()) {
				var dateInput = $("<input class='origin-dateipt' type='date'/>").appendTo(this.$el.children(".ipt"));
				// 移到端直接设置无效
				// var minDate = this.getMinDate();
				// if (minDate)
				// 	dateInput.attr("min", Utils.toDateString(minDate, "yyyy-MM-dd"));
				// var maxDate = this.getMaxDate();
				// if (maxDate)
				// 	dateInput.attr("max", Utils.toDateString(maxDate, "yyyy-MM-dd"));
				dateInput.on("change", originDateChangeHandler.bind(this));
			}
		}
		else {
			this.$el.on("mouseenter", dateIptMouseHandler.bind(this));
			this.$el.on("mouseleave", dateIptMouseHandler.bind(this));
		}
	};
	var _UIDateInput = UIDateInput.prototype = new Component.base();

	UIDateInput.find = function (view) {
		return Component.find(view, ".ui-dateipt", UIDateInput);
	};

	UIDateInput.create = function (options) {
		return Component.create(options, UIDateInput, DateInputRender);
	}

	// ====================================================
	_UIDateInput.getDate = function () {
		return Utils.toDate(this.$el.attr("data-dt"));
	};
	_UIDateInput.setDate = function (value, trigger) {
		var date = Utils.toDate(value);

		setDateInner.call(this, date);

		if (this.picker)
			this.picker.setDate(date);

		var originDateInput = this.$el.find(".origin-dateipt");
		if (originDateInput && originDateInput.length > 0)
			originDateInput.val(date || "");

		if (!!trigger)
			this.trigger("change", date);
	};

	_UIDateInput.getMinDate = function () {
		return Utils.toDate(this.$el.attr("data-min"));
	};
	_UIDateInput.setMinDate = function (value) {
		var date = Utils.toDate(value);
		this.$el.attr("data-min", Utils.toDateString(date, "yyyy/MM/dd"));
		if (this.picker)
			this.picker.setMinDate(date);
	};

	_UIDateInput.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("data-max"));
	};
	_UIDateInput.setMaxDate = function (value) {
		var date = Utils.toDate(value);
		this.$el.attr("data-max", Utils.toDateString(date, "yyyy/MM/dd"));
		if (this.picker)
			this.picker.setMaxDate(date);
	};

	_UIDateInput.getDateFormat = function () {
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
	_UIDateInput.setDateFormat = function (value) {
		this._dateFormat = value;
		this.$el.children(".format").remove();
		this.setDate(this.getDate());
	};

	_UIDateInput.isNative = function () {
		return this.$el.attr("data-native") == 1;
	};

	// ====================================================
	var iptClickHandler = function (e) {
		if (this.isRenderAsApp()) {
			if (!this.isNative())
				showDatePicker.call(this);
		}
		else {
			showDatePicker.call(this);
		}
	};

	var clearHandler = function (e) {
		this.setDate(null, true);
		return false;
	};

	var dateIptMouseHandler = function (e) {
		var target = this.$el;
		if (this.hideTimerId) {
			clearTimeout(this.hideTimerId);
			this.hideTimerId = 0;
		}
		if (e.type === "mouseleave") {
			if (this.$el.is(".show-picker")) {
				var self = this;
				this.hideTimerId = setTimeout(function () {
					self.hideTimerId = 0;
					target.removeClass("show-picker");
				}, 500);
			}
		}
	};

	var showDatePicker = function () {
		var self = this;
		if (!this.picker) {
			var params = {};
			params.target = $("<div class='picker'></div>").appendTo(this.$el);
			params.date = this.getDate();
			params.min = this.getMinDate();
			params.max = this.getMaxDate();

			this.picker = Component.DatePicker.create(params);

			this.picker.on("change", function (e, date) { pickerChangeHandler.call(self, e, date); });
		}

		if (this.$el.is(".show-picker"))
			return ;
		this.$el.addClass("show-picker").removeClass("show-before");

		if (this.isRenderAsApp()) {
			this.$el.children(".picker").on("tap", function (e) { hideDatePicker.call(self); });
		}
		else {
			var picker = this.$el.children(".picker");
			var bottomHeight = $(window).height() + $("body").scrollTop();
			var pickerHeight = picker.offset().top + picker.height();
			if (bottomHeight < pickerHeight)
				this.$el.addClass("show-before");
		}
	};

	var hideDatePicker = function () {
		this.$el.removeClass("show-picker");
		if (this.isRenderAsApp()) {
			this.$el.children(".picker").off("tap");
		}
	};

	var pickerChangeHandler = function (e, date) {
		hideDatePicker.call(this);
		setDateInner.call(this, date);
		this.trigger("change", date);
	};

	var originDateChangeHandler = function (e) {
		var date = Utils.toDate($(e.currentTarget).val());
		if (date) {
			var minDate = this.getMinDate();
			if (minDate && minDate.getTime() > date.getTime())
				date = new Date(minDate.getTime());
			var maxDate = this.getMaxDate();
			if (maxDate && maxDate.getTime() < date.getTime())
				date = new Date(maxDate.getTime());
		}
		setDateInner.call(this, date);
		this.trigger("change", date);
	};

	var setDateInner = function (date) {
		if (date) {
			this.$el.addClass("has-val");
			this.$el.attr("data-dt", Utils.toDateString(date, "yyyy/MM/dd"));
			this.input.val(DateInputRender.getFormatDate(date, this.getDateFormat()));
		}
		else {
			this.$el.removeClass("has-val");
			this.$el.removeAttr("data-dt");
			this.input.val("");
		}
	}

	///////////////////////////////////////////////////////
	Component.register(".ui-dateipt", UIDateInput);

})();
