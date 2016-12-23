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
	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setDate(this.options.date);
		this.setMinDate(this.options.min);
		this.setMaxDate(this.options.max);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
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

	// ====================================================
	var renderPickerDate = function ($, target, tbody, date) {
		var y = date.getFullYear(), m = date.getMonth();
		target.attr("data-y", y).attr("data-m", m);

		var dt = new Date(y, m, 1); // 起始到当月第1天
		var weekday = dt.getDay(); // 获取星期几
		dt.setDate(weekday ? (2 - weekday) : -5); // 计算日历显示的第一个日期

		var dt0 = new Date(); // today
		var y0 = dt0.getFullYear(), m0 = dt0.getMonth(), d0 = dt0.getDate();
		var t0 = y0 * 10000 + m0 * 100 + d0;

		var dt1 = this.getDate(), t1 = 0; // selected
		if (dt1) {
			var y1 = dt1.getFullYear(), m1 = dt1.getMonth(), d1 = dt1.getDate();
			t1 = y1 * 10000 + m1 * 100 + d1;
		}

		var min = this.getMinDate(), tmin = 0;
		if (min) {
			var ymin = min.getFullYear(), mmin = min.getMonth(), dmin = min.getDate();
			tmin = ymin * 10000 + mmin * 100 + dmin;
		}

		var max = this.getMaxDate(), tmax = 21001231;
		if (max) {
			var ymax = max.getFullYear(), mmax = max.getMonth(), dmax = max.getDate();
			tmax = ymax * 10000 + mmax * 100 + dmax;
		}

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
		this.$el.tap("header > button", function (e) { monthSwitchHandler.call(self, e); });
		this.$el.tap("tbody td", function (e) { dateChangeHandler.call(self, e); });
	};
	var _UIDatePicker = UIDatePicker.prototype = new Component.base();

	UIDatePicker.find = function (view) {
		return Component.find(view, ".ui-datepicker", UIDatePicker);
	};

	UIDatePicker.create = function (options) {
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