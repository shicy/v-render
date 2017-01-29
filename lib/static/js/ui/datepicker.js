// ========================================================
// 日历
// @author shicy <shicy85@163.com>
// Create on 2016-12-22
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.DatePicker)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	var cn_month = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

	var getMonthStr = function (date) {
		if (date instanceof Date) {
			var strDate = date.getFullYear() + "年";
			strDate += " " + cn_month[date.getMonth()] + "月";
			return strDate;
		}
		return null;
	};

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-datepicker");

		var pickerDate = this.getDate() || new Date();

		var header = $("<header></header>").appendTo(target);
		header.append("<label>" + getMonthStr(pickerDate) + "</label>");
		header.append("<button class='prev'></button><button class='next'></button>");

		var table = $("<table></table>").appendTo(target);
		table.append("<thead><tr><th>一</th><th>二</th><th>三</th><th>四</th>" +
			"<th>五</th><th>六</th><th>日</th></tr></thead>");
		var tbody = $("<tbody></tbody>").appendTo(table);

		renderPickerDate.call(this, $, target, tbody, pickerDate);

		var selectedDate = this.getDate();
		if (selectedDate)
			target.attr("data-dt", Utils.toDateString(selectedDate, "yyyy/MM/dd"));

		var minDate = Utils.toDate(this.options.min);
		if (minDate)
			target.attr("data-min", Utils.toDateString(minDate, "yyyy/MM/dd"));

		var maxDate = Utils.toDate(this.options.max);
		if (maxDate)
			target.attr("data-max", Utils.toDateString(maxDate, "yyyy/MM/dd"));

		return this;
	};

	// ====================================================
	_Holder.getDate = function () {
		return Utils.toDate(this.options.date);
	};

	_Holder.getMinDate = function () {
		return Utils.toDate(this.options.min);
	};

	_Holder.getMaxDate = function () {
		return Utils.toDate(this.options.max);
	};

	// ====================================================
	var renderPickerDate = function ($, target, tbody, date) {
		var y = date.getFullYear(), m = date.getMonth();
		target.attr("data-y", y).attr("data-m", m);

		var dt = new Date(y, m, 1); // 起始到当月第1天
		var weekday = dt.getDay(); // 获取星期几
		dt.setDate(weekday ? (2 - weekday) : -5); // 计算日历显示的第一个日期

		var dt0 = new Date(); // today
		var t0 = dt0.getFullYear() * 10000 + dt0.getMonth() * 100 + dt0.getDate();

		var dt1 = this.getDate(), t1 = 0; // selected
		if (dt1)
			t1 = dt1.getFullYear() * 10000 + dt1.getMonth() * 100 + dt1.getDate();

		var min = this.getMinDate(), tmin = 0;
		if (min)
			tmin = min.getFullYear() * 10000 + min.getMonth() * 100 + min.getDate();

		var max = this.getMaxDate(), tmax = 21001231;
		if (max)
			tmax = max.getFullYear() * 10000 + max.getMonth() * 100 + max.getDate();

		while (true) {
			var tr = $("<tr></tr>").appendTo(tbody);
			for (var i = 0; i < 7; i++) {
				var _y = dt.getFullYear(), _m = dt.getMonth(), _d = dt.getDate();
				var _t = _y * 10000 + _m * 100 + _d;
				var td = $("<td></td>").appendTo(tr).append("<span>" + _d + "</span>");
				td.attr("data-dt", (_y + "/" + (_m + 1) + "/" + _d));
				if (_t === t0)
					td.addClass("today");
				if (_t === t1)
					td.addClass("selected");
				if (_m !== m || _t < tmin || _t > tmax)
					td.addClass("disabled");
				dt.setDate(_d + 1);
			}
			if (dt.getMonth() > m || dt.getFullYear() > y)
				break;
		};
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIDatePicker = Component.DatePicker = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		var self = this;
		this.tap("header > button", function (e) { monthSwitchHandler.call(self, e); });
		this.tap("tbody td", function (e) { dateChangeHandler.call(self, e); });
	};
	var _UIDatePicker = UIDatePicker.prototype = new Component.base();

	UIDatePicker.find = function (view) {
		return Component.find(view, ".ui-datepicker", UIDatePicker);
	};

	UIDatePicker.create = function (options) {
		options = $.extend({}, options);
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIDatePicker(target, options, holder);
	};

	// ====================================================
	_UIDatePicker.getDate = function () {
		return Utils.toDate(this.$el.attr("data-dt"));
	};
	_UIDatePicker.setDate = function (value, trigger) {
		var date = Utils.toDate(value);
		if (date) {
			this.$el.attr("data-dt", Utils.toDateString(date, "yyyy/MM/dd"));
			reRenderPicker.call(this, date);
		}
		else {
			this.$el.removeAttr("data-dt");
			this.$el.find("td.selected").removeClass("selected");
		}
		if (!!trigger)
			this.trigger("change", this.getDate());
	};

	_UIDatePicker.getMinDate = function () {
		return Utils.toDate(this.$el.attr("data-min"));
	};
	_UIDatePicker.setMinDate = function (value) {
		var date = Utils.toDate(value);
		if (date)
			this.$el.attr("data-min", Utils.toDateString(date, "yyyy/MM/dd"));
		else
			this.$el.removeAttr("data-min");
		reRenderPicker.call(this);
	};

	_UIDatePicker.getMaxDate = function () {
		return Utils.toDate(this.$el.attr("data-max"));
	};
	_UIDatePicker.setMaxDate = function (value) {
		var date = Utils.toDate(value);
		if (date)
			this.$el.attr("data-max", Utils.toDateString(date, "yyyy/MM/dd"));
		else
			this.$el.removeAttr("data-max");
		reRenderPicker.call(this);
	};

	// ====================================================
	var monthSwitchHandler = function (e) {
		var year = parseInt(this.$el.attr("data-y"));
		var month = parseInt(this.$el.attr("data-m"));
		var date = new Date(year, month, 1);
		date.setMonth(date.getMonth() + ($(e.currentTarget).is(".prev") ? -1 : 1));
		reRenderPicker.call(this, date);
	};

	var dateChangeHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;
		if (item.is(".selected"))
			return ;

		this.$el.find("tbody td.selected").removeClass("selected");
		item.addClass("selected");

		this.$el.attr("data-dt", item.attr("data-dt"));
		this.trigger("change", this.getDate());
	};

	// ====================================================
	var reRenderPicker = function (pickerDate) {
		if (!pickerDate) {
			var year = parseInt(this.$el.attr("data-y"));
			var month = parseInt(this.$el.attr("data-m"));
			pickerDate = new Date(year, month, 1);
		}
		this.$el.find("header > label").text(getMonthStr(pickerDate));
		var tbody = this.$el.find("tbody").empty();
		renderPickerDate.call(this, $, this.$el, tbody, pickerDate);
	};

	// ====================================================
	Component.register(".ui-datepicker", UIDatePicker);

})(typeof VRender !== "undefined");
