// ========================================================
// 日历
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.datepicker)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	var cn_month = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-datepicker");

		var pickerDate = this.getDate() || new Date();

		var header = $("<header></header>").appendTo(target);
		header.append("<label>" + getMonthStr(pickerDate) + "</label>");
		header.append("<button class='prev'></button><button class='next'></button>");

		var table = $("<table class='head'></table>").appendTo(target);
		table.append("<thead><tr><th>一</th><th>二</th><th>三</th><th>四</th>" +
			"<th>五</th><th>六</th><th>日</th></tr></thead>");

		var content = $("<div class='content'></div>").appendTo(target);
		table = $("<table class='t0'></table>").appendTo(content);
		var tbody = $("<tbody></tbody>").appendTo(table);

		renderPickerDate.call(this, $, target, tbody, pickerDate);
		target.attr("opt-y", pickerDate.getFullYear()).attr("opt-m", pickerDate.getMonth());

		var selectedDate = this.getDate();
		if (selectedDate)
			target.attr("data-dt", Utils.toDateString(selectedDate, "yyyy/MM/dd"));

		var minDate = Utils.toDate(this.options.min);
		if (minDate)
			target.attr("opt-min", Utils.toDateString(minDate, "yyyy/MM/dd"));

		var maxDate = Utils.toDate(this.options.max);
		if (maxDate)
			target.attr("opt-max", Utils.toDateString(maxDate, "yyyy/MM/dd"));

		return this;
	};

	// ====================================================
	_Renderer.isRenderAsRange = function () {
		return Utils.isTrue(this.options.range);
	};

	// ====================================================
	var renderPickerDate = function ($, target, tbody, date) {
		var y = date.getFullYear(), m = date.getMonth();
		// target.attr("data-y", y).attr("data-m", m);

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

	var getMonthStr = function (date) {
		if (date instanceof Date) {
			var strDate = date.getFullYear() + "年";
			strDate += " " + cn_month[date.getMonth()] + "月";
			return strDate;
		}
		return null;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getMonthStr = getMonthStr;
		Renderer.renderPickerDate = renderPickerDate;
		VRender.Component.Render.datepicker = Renderer;
	}

})(typeof VRender === "undefined");