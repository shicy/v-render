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
			this.$el.attr("opt-native", "1");

		var inputTarget = this.inputTag = this.$el.children(".ipt");

		inputTarget.on("tap", ".clear", clearHandler.bind(this));
		if (this.isRenderAsApp() && this._isNative()) {
			renderOriginDates.call(this);
		}
		else {
			inputTarget.on("tap", iptClickHandler.bind(this));
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
	_UIDateInput.getDate = function (format) {
		var date = Utils.toDate(this.$el.attr("data-dt"));
		if (date && Utils.isNotBlank(format))
			return Utils.toDateString(date, format);
		return date;
	};
	_UIDateInput.setDate = function (value) {
		var snapshoot = this._snapshoot();
		var date = Utils.toDate(value);
		if (date) {
			var _date = getTime(date);
			var min = this.getMinDate();
			if (min && getTime(min) > _date)
				date = null;
			else {
				var max = this.getMaxDate();
				if (max && getTime(max) < _date)
					date = null;
			}
		}
		this.$el.attr("data-dt", (date ? Utils.toDateString(date, "yyyy-MM-dd") : ""));
		refresh.call(this);
		snapshoot.done(date);
	};

	_UIDateInput.getMinDate = function () {
		return Utils.toDate(this.$el.attr("opt-min"));
	};
	_UIDateInput.setMinDate = function (value) {
		var min = Utils.toDate(value);
		if (getTime(min) != getTime(this.getMinDate())) {
			var snapshoot = this._snapshoot();
			this.$el.attr("opt-min", (min ? Utils.toDateString(min, "yyyy-MM-dd") : ""));
			if (min) {
				var date = this.getDate();
				if (date && getTime(min) > getTime(date))
					this.$el.attr("data-dt", "");
			}
			refresh.call(this);
			snapshoot.done();
		}
	};

	_UIDateInput.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDateInput.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		if (getTime(max) != getTime(this.getMaxDate())) {
			var snapshoot = this._snapshoot();
			this.$el.attr("opt-max", (max ? Utils.toDateString(max, "yyyy-MM-dd") : ""));
			if (max) {
				var date = this.getDate();
				if (date && getTime(max) < getTime(date))
					this.$el.attr("data-dt", "");
			}
			refresh.call(this);
			snapshoot.done();
		}
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

	_UIDateInput._isNative = function () {
		return this.$el.attr("opt-native") == 1;
	};

	// ====================================================
	_UIDateInput._snapshoot_shoot = function (state, date) {
		state.data = date || this.getDate();
	};

	_UIDateInput._snapshoot_compare = function (state, date) {
		date = date || this.getDate();
		if (date && state.data) {
			return date.getDate() == state.data.getDate() 
				&& date.getMonth() == state.data.getMonth() 
				&& date.getFullYear() == state.data.getFullYear();
		}
		return date == state.data;
	};

	// ====================================================
	var iptClickHandler = function (e) {
		showDatePicker.call(this);
	};

	var clearHandler = function (e) {
		this.setDate(null);
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

	var pickerChangeHandler = function (e, date) {
		this.setDate(date);
		var self = this;
		setTimeout(function () {
			hideDatePicker.call(self); // 关闭太快了，让他有个视觉差
		}, 100);
	};

	var originDateChangeHandler = function (e) {
		this.setDate(Utils.toDate($(e.currentTarget).val()));
	};

	// ====================================================
	var renderOriginDates = function () {
		var dateInput = $("<input class='origin-dateipt' type='date'/>").appendTo(this.inputTag);
		updatePicker.call(this, this.getDate(), this.getMinDate(), this.getMaxDate());
		dateInput.on("change", originDateChangeHandler.bind(this));
	};

	var showDatePicker = function () {
		if (!this.picker) {
			var params = {};
			params.target = $("<div class='picker'></div>").appendTo(this.$el);
			params.date = this.getDate();
			params.min = this.getMinDate();
			params.max = this.getMaxDate();
			this.picker = Component.DatePicker.create(params);
			this.picker.on("change", pickerChangeHandler.bind(this));
		}

		if (this.$el.is(".show-picker"))
			return ;
		this.$el.addClass("show-picker").removeClass("show-before");

		if (this.isRenderAsApp()) {
			$("html, body").addClass("ui-noscroll");
			this.$el.children(".picker").on("tap", hideDatePicker.bind(this));
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
			$("html, body").removeClass("ui-noscroll");
			this.$el.children(".picker").off("tap");
		}
	};

	// ====================================================
	var refresh = function () {
		if (this.refreshTimerId) {
			clearTimeout(this.refreshTimerId);
		}
		var self = this;
		this.refreshTimerId = setTimeout(function () {
			var date = self.getDate();
			if (date)
				self.$el.addClass("has-val");
			else 
				self.$el.removeClass("has-val");
			self.inputTag.find("input").val(DateInputRender.getFormatDate(date, self.getDateFormat()));
			updatePicker.call(self, date, self.getMinDate(), self.getMaxDate());
		}, 0);
	};

	var updatePicker = function (date, min, max) {
		if (this.isRenderAsApp() && this._isNative()) {
			var dateInput = this.inputTag.children(".origin-dateipt");
			dateInput.val(date ? Utils.toDateString(date, "yyyy-MM-dd") : "");
			dateInput.attr("min", (min ? Utils.toDateString(min, "yyyy-MM-dd") : ""));
			dateInput.attr("max", (max ? Utils.toDateString(max, "yyyy-MM-dd") : ""));
		}
		else if (this.picker) {
			this.picker.setMinDate(min);
			this.picker.setMaxDate(max);
			this.picker.setDate(date);
		}
	};

	var getTime = function (date) {
		if (date) {
			return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
		}
		return 0;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-dateipt", UIDateInput);

})();
