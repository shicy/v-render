// ========================================================
// 日期输入框
// @author shicy <shicy85@163.com>
// Create on 2016-12-23
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.DateInput)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	var getFormatDate = function (date, dateFormat) {
		if (Utils.isFunction(dateFormat))
			return dateFormat(date);
		if (Utils.isBlank(dateFormat))
			dateFormat = "yyyy-MM-dd";
		return Utils.toDateString(date, dateFormat);
	};

	///////////////////////////////////////////////////////
	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setDate(this.options.hasOwnProperty("date") ? this.options.date : (new Date()));
		this.setMinDate(this.options.min);
		this.setMaxDate(this.options.max);
		this.setDateFormat(this.options.format || this.options.dateFormat);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		target.addClass("ui-dateipt");

		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<button class='clear'></button>");

		var dateFormat = this.getDateFormat();
		if (!isFront && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='format'>" + dateFormat + "</div>");
		}

		var selectedDate = this.getDate();
		if (selectedDate) {
			target.attr("data-dt", Utils.toDateString(selectedDate, "yyyy/MM/dd"));
			input.val(getFormatDate(selectedDate, dateFormat));
		}

		var minDate = this.getMinDate();
		if (minDate)
			target.attr("data-min", Utils.toDateString(minDate, "yyyy/MM/dd"));

		var maxDate = this.getMaxDate();
		if (maxDate)
			target.attr("data-max", Utils.toDateString(maxDate, "yyyy/MM/dd"));

		return this;
	};

	// ====================================================
	_Holder.getDate = function () {
		return Utils.isBlank(this.d_date) ? null : Utils.toDate(this.d_date);
	};
	_Holder.setDate = function (value) {
		this.d_date = value;
	};

	_Holder.getMinDate = function () {
		return Utils.isBlank(this.d_min) ? null : Utils.toDate(this.d_min);
	};
	_Holder.setMinDate = function (value) {
		this.d_min = value;
	};

	_Holder.getMaxDate = function () {
		return Utils.isBlank(this.d_max) ? null : Utils.toDate(this.d_max);
	};
	_Holder.setMaxDate = function (value) {
		this.d_max = value;
	};

	_Holder.getDateFormat = function () {
		return this.d_format;
	};
	_Holder.setDateFormat = function (value) {
		this.d_format = value;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIDateInput = Component.DateInput = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.input = this.$el.find(".ipt > input");

		var self = this;
		this.$el.tap(".ipt", function (e) { return iptClickHandler.call(self, e); });
		this.$el.tap(".ipt > .clear", function (e) { return clearHandler.call(self, e); }, true);
		this.$el.on("mouseenter", function (e) { dateIptMouseHandler.call(self, e); });
		this.$el.on("mouseleave", function (e) { dateIptMouseHandler.call(self, e); });
	};
	var _UIDateInput = UIDateInput.prototype = new Component.base();

	UIDateInput.find = function (view) {
		return Component.get(view, ".ui-dateipt", UIDateInput);
	};

	UIDateInput.create = function (options) {
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIDateInput(target, options, holder);
	}

	// ====================================================
	_UIDateInput.getDate = function () {
		return Utils.toDate(this.$el.attr("data-dt"));
	};
	_UIDateInput.setDate = function (value, trigger) {
		var date = Utils.toDate(value); console.log(date);

		if (date) {
			this.$el.attr("data-dt", Utils.toDateString(date, "yyyy/MM/dd"));
			this.input.val(getFormatDate(date, this.getDateFormat()));
		}
		else {
			this.$el.removeAttr("data-dt");
			this.input.val("");
		}

		if (this.picker)
			this.picker.setDate(date);

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

	// ====================================================
	var iptClickHandler = function (e) {
		if (!this.picker) {
			var params = {};
			params.target = this.$el;
			params.date = this.getDate();
			params.min = this.getMinDate();
			params.max = this.getMaxDate();
			this.picker = VRender.Component.DatePicker.create(params);

			var self = this;
			this.picker.on("change", function (e, date) {
				pickerChangeHandler.call(self, e, date);
			});
		}

		if (this.$el.is(".show-picker"))
			return ;
		this.$el.addClass("show-picker").removeClass("show-before");

		var picker = this.picker.$el;
		var bottomHeight = $(window).height() + $("body").scrollTop();
		var pickerHeight = picker.offset().top + picker.height();
		if (bottomHeight < pickerHeight)
			this.$el.addClass("show-before");
	};

	var clearHandler = function (e) {
		this.setDate(null, true);
	};

	var dateIptMouseHandler = function (e) {
		var target = this.$el;
		if (e.type === "mouseenter") {
			var timerId = parseInt(target.attr("timerid"));
			if (timerId) {
				clearTimeout(timerId);
				target.removeAttr("timerid");
			}
		}
		else /*if (e.type === "mouseleave")*/ {
			var timerId = setTimeout(function () {
				target.removeClass("show-picker");
				// target.removeClass("show-before");
				target.removeAttr("timerid");
			}, 500);
			target.attr("timerid", timerId);
		}
	};

	var pickerChangeHandler = function (e, date) {
		this.$el.attr("data-dt", Utils.toDateString(date, "yyyy/MM/dd"));
		this.input.val(getFormatDate(date, this.getDateFormat()));

		this.$el.removeClass("show-picker");
		// this.$el.removeClass("show-before");

		this.trigger("change", date);
	};

	// ====================================================
	Component.register(".ui-dateipt", UIDateInput);

})(typeof VRender !== "undefined");
