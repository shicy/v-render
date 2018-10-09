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
	var Renderer = Component.Render;
	var DateInputRender = Renderer.dateinput;

	///////////////////////////////////////////////////////
	var UIDateInput = window.UIDateInput = Component.DateInput = function (view, options) {
		if (!Component.base.isElement(view))
			return UIDateInput.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);

		var inputTarget = this.inputTag = this.$el.children(".ipt");

		inputTarget.on("tap", ".clear", clearHandler.bind(this));
		this.$el.on("change", ".ui-datepicker", onPickerChangeHandler.bind(this));
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
	};

	// ====================================================
	_UIDateInput.val = function (value, options) {
		if (Utils.isNull(value)) {
			return this.getDate(options && options.format);
		}
		this.setDate(value);
		return this;
	};

	_UIDateInput.getDate = function (format) {
		var date = Utils.toDate(this.$el.attr("data-dt"));
		if (date && Utils.isNotBlank(format))
			return Utils.toDateString(date, format);
		return date;
	};
	_UIDateInput.setDate = function (value) {
		var date = value ? Utils.toDate(value) : null;
		setDateInner.call(this, date);
		updatePicker.call(this, date, this.getMinDate(), this.getMaxDate());
	};

	_UIDateInput.getMinDate = function () {
		return Utils.toDate(this.$el.attr("opt-min"));
	};
	_UIDateInput.setMinDate = function (value) {
		var min = Utils.toDate(value);
		if (getTime(min) != getTime(this.getMinDate())) {
			this.$el.attr("opt-min", (min ? Utils.toDateString(min, "yyyy-MM-dd") : ""));
			updatePicker.call(this, this.getDate(), min, this.getMaxDate());
		}
	};

	_UIDateInput.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("opt-max"));
	};
	_UIDateInput.setMaxDate = function (value) {
		var max = Utils.toDate(value);
		if (getTime(max) != getTime(this.getMaxDate())) {
			this.$el.attr("opt-max", (max ? Utils.toDateString(max, "yyyy-MM-dd") : ""));
			updatePicker.call(this, this.getDate(), this.getMinDate(), max);
		}
	};

	_UIDateInput.getDateFormat = function () {
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
	_UIDateInput.setDateFormat = function (value) {
		this.options.dateFormat = value;
		this.$el.children(".format").remove();
		setDateInner.call(this, this.getDate());
	};

	_UIDateInput.getPrompt = function () {
		return this.inputTag.children(".prompt").text();
	};
	_UIDateInput.setPrompt = function (value) {
		this.inputTag.children(".prompt").remove();
		if (Utils.isNotNull(value)) {
			value = Utils.trimToEmpty(value);
			$("<span class='prompt'></span>").appendTo(this.inputTag).text(value);
		}
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
		this.trigger("clear");
		return false;
	};

	var dateIptMouseHandler = function (e) {
		Renderer.fn.mouseDebounce(e, hideDatePicker.bind(this));
	};

	var pickerChangeHandler = function (e, date) {
		this.setDate(date);
		hideDatePicker.call(this);
	};

	var pickerClearHandler = function (e) {
		this.setDate(null);
		hideDatePicker.call(this);
	};

	var originDateChangeHandler = function (e) {
		this.setDate(Utils.toDate($(e.currentTarget).val()));
	};

	// 禁止 UIDatePicker 原生 jquery change 事件传播
	var onPickerChangeHandler = function (e) {
		// e.stopPropagation();
		return false;
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
			this.picker.on("clear", pickerClearHandler.bind(this));
		}

		if (this.$el.is(".show-picker"))
			return ;
		var target = this.$el.addClass("show-picker");

		if (this.isRenderAsApp()) {
			$("html, body").addClass("ui-scrollless");
			target.children(".picker").on("tap", hideDatePicker.bind(this));
		}
		else {
			target.on("mouseenter", dateIptMouseHandler.bind(this));
			target.on("mouseleave", dateIptMouseHandler.bind(this));

			var picker = target.children(".picker");
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

	// ====================================================
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

	var setDateInner = function (date) {
		var snapshoot = this._snapshoot();
		var input = this.inputTag.find("input");
		if (date) {
			this.$el.addClass("has-val").attr("data-dt", Utils.toDateString(date, "yyyy-MM-dd"));
			input.val(DateInputRender.getFormatDate(date, this.getDateFormat()));
		}
		else {
			this.$el.removeClass("has-val").attr("data-dt", "");
			input.val("");
		}
		snapshoot.done();
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