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
		if (!Component.base.isElement(view))
			return UIDateInput.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		if (Utils.isTrue(this.options.native))
			this.$el.attr("opt-native", "1");

		var inputTarget = this.inputTag = this.$el.children(".ipt");

		inputTarget.on("tap", ".clear", clearHandler.bind(this));
		if (this.isRenderAsApp() && this.isNative()) {
			renderOriginDates.call(this);
		}
		else {
			inputTarget.on("tap", iptClickHandler.bind(this));
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
		this.options.dateFormat = format;
		return format;
	};
	_UIDateInput.setDateFormat = function (value) {
		this.options.dateFormat = value;
		this.$el.children(".format").remove();
		this.setDate(this.getDate());
	};

	_UIDateInput.isNative = function () {
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
		if (this.t_mouse) {
			clearTimeout(this.t_mouse);
			this.t_mouse = 0;
		}
		if (e.type == "mouseleave") {
			if (this.$el.is(".show-picker")) {
				var self = this;
				this.t_mouse = setTimeout(function () {
					self.t_mouse = 0;
					hideDatePicker.call(self);
				}, 500);
			}
		}
	};

	var pickerChangeHandler = function (e, date) {
		this.setDate(date);
		hideDatePicker.call(this); // 关闭太快了，让他有个视觉差
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
		var target = this.$el.addClass("show-picker").removeClass("show-before");

		if (this.isRenderAsApp()) {
			$("html, body").addClass("ui-scrollless");
			target.children(".picker").on("tap", hideDatePicker.bind(this));
		}
		else {
			target.on("mouseenter", dateIptMouseHandler.bind(this));
			target.on("mouseleave", dateIptMouseHandler.bind(this));

			var picker = target.children(".picker");
			var container = target.attr("opt-box");
			var offset = Utils.offset(picker, container, 0, picker[0].scrollHeight);
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
			target.children(".picker").off("tap");
		}
		else {
			target.off("mouseenter").off("mouseleave");
		}

		setTimeout(function () {
			target.removeClass("show-picker");
			target.removeClass("animate-in");
			target.removeClass("animate-out");
		}, 300);
	};

	// ====================================================
	var refresh = function () {
		if (this.t_refresh) {
			clearTimeout(this.t_refresh);
		}
		var self = this;
		this.t_refresh = setTimeout(function () {
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
		if (this.isRenderAsApp() && this.isNative()) {
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