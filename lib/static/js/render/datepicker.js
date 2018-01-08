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
	var cn_week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-datepicker");

		var options = this.options || {};

		var minDate = Utils.toDate(options.min);
		if (minDate)
			target.attr("opt-min", Utils.toDateString(minDate, "yyyy-MM-dd"));
		var maxDate = Utils.toDate(options.max);
		if (maxDate)
			target.attr("opt-max", Utils.toDateString(maxDate, "yyyy-MM-dd"));

		var date = this.getDate();
		if (this.isRangeDate()) {
			target.addClass("is-range");
			if (date) {
				target.attr("opt-start", Utils.toDateString(date.start, "yyyy-MM-dd"));
				target.attr("opt-end", Utils.toDateString(date.end, "yyyy-MM-dd"));
			}
		}
		else if (date) {
			target.attr("date-dt", Utils.toDateString(date, "yyyy-MM-dd"));
		}

		renderHeader.call(this, $, target);
		renderTables.call(this, $, target);
		renderFooter.call(this, $, target);

		renderDate.call(this, $, target);

		return this;
	};

	_Renderer.getDate = function () {
		var min = this.getMinDate(), max = this.getMaxDate();
		var tmin = getTime(min), tmax = getTime(max);
		if (tmin && tmax && tmin > tmax)
			return null;

		if (this.isRangeDate()) {
			var start = Utils.toDate(this.options.start);
			var end = Utils.toDate(this.options.end) || start;
			if (start && end) {
				var tstart = getTime(start), tend = getTime(end);
				if (tstart <= tend) {
					if (tmin && tstart < tmin)
						start = min;
					if (tmax && tend > tmax)
						end = max;
					if (getTime(start) <= getTime(end))
						return {start: start, end: end};
				}
			}
		}
		else {
			var date = Utils.toDate(this.options.date);
			if (date) {
				var tdate = getTime(date);
				if ((tmin && tdate >= tmin) || (tmax && tdate <= tmax))
					return date;
			}
		}

		return null;
	};

	_Renderer.getMinDate = function () {
		return Utils.toDate(this.options.min);
	};

	_Renderer.getMaxDate = function () {
		return Utils.toDate(this.options.max);
	};

	_Renderer.isRangeDate = function () {
		return Utils.isTrue(this.options.range);
	};

	// ====================================================
	var renderHeader = function ($, target) {
		var header = $("<header></header>").appendTo(target);

		var title = $("<div class='title'></div>").appendTo(header);
		if (this.isRangeDate()) {
			title.append("<dl class='item s'><dt class='lbl'>开始日期<span class='year'></span></dt><dd class='val'>-</dd></dl>");
			title.append("<dl class='item e'><dt class='lbl'>结束日期<span class='year'></span></dt><dd class='val'>-</dd></dl>");
		}
		else {
			title.append("<dl class='item'><dt class='lbl'>-</dt><dd class='val'>-</dd></dl>");
		}

		header.append("<button class='today'><label>今天</label></button>");
		header.append("<button class='clear'><label>清除</label></button>");
		header.append("<button class='prev y'>&nbsp;</button>");
		header.append("<button class='prev m'>&nbsp;</button>");
		header.append("<button class='next m'>&nbsp;</button>");
		header.append("<button class='next y'>&nbsp;</button>");
	};

	var renderTables = function ($, target) {
		var tables = $("<section></section>").appendTo(target);

		var renderTable = function (date) {
			var table = $("<table></table>").appendTo(target);
			table.append("<thead><tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th><th>日</th></tr></thead>");
			table.append("<tbody class='month'><tr><td colspan='7'>-</td></tr></tbody>");
			table.append("<tbody class='dates'></tbody>");
			return table;
		};

		if (this.isRangeDate() && !this.isRenderAsApp()) {
			renderTable().addClass("s");
			renderTable().addClass("e");
		}
		else {
			renderTable().addClass("t0");
		}
	};

	var renderFooter = function ($, target) {
		if (this.isRangeDate()) {
			var footer = $("<footer></footer>").appendTo(target);
			if (this.isRenderAsApp()) {
				footer.append("<button class='ui-btn ui-btn-primary ok'>使用日期</button>");
			}
			else {
				footer.append("<div class='vals'><span class='s'>-</span> - <span class='e'>-</span></div>");
				var buttons = $("<div class='btns'></div>").appendTo(footer);
				buttons.append("<button class='ui-btn ui-btn-primary ok'>确定</button>");
				buttons.append("<button class='ui-btn ui-btn-cancel cancel'>取消</button>");
			}
		}
	};

	var renderDate = function ($, target) {
		var date = this.getDate();
		renderHeaderDate.call(this, $, target, date);
		renderTableDate.call(this, $, target, date);
		renderFooterDate.call(this, $, target, date);
	};

	var renderHeaderDate = function ($, target, date) {
		if (this.isRangeDate()) {
			var start = date && date.start;
			var end = date && date.end;

			var today = new Date(), year = today.getFullYear();
			var startLabel = (start && start.getFullYear() != year) ? start.getFullYear() : "";
			target.find(".title .item.s .lbl").text(startLabel);
			var endLabel = (end && end.getFullYear() != year) ? end.getFullYear() : "";
			target.find(".title .item.e .lbl").text(endLabel);

			var startValue = endValue = "--";
			if (start)
				startValue = Utils.toDateString(start, "M月d日") + " " + cn_week[start.getDay()];
			if (end)
				endValue = Utils.toDateString(end, "M月d日") + " " + cn_week[end.getDay()];
			target.find(".title .item.s .val").text(startValue);
			target.find(".title .item.e .val").text(endValue);
		}
		else {
			var pickerDate = date || new Date();
			var label = pickerDate.getFullYear() + "年 " + cn_month[pickerDate.getMonth()] + "月";
			target.find(".title .item .lbl").text(label); // 显示当前“年月”
			target.find(".title .item .val").text(date ? Utils.toDateString(date, "yyyy.MM.dd") : "-");
		}
	};

	var renderTableDate = function ($, target, date) {
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			var start = date && date.start || new Date();
			renderPickerDate.call(this, $, target, target.find("table.s"), start);
			var end = date && date.end || start;
			if (start.getFullYear() == end.getFullYear() && start.getMonth() == end.getMonth())
				end.setMonth(end.getMonth() + 1);
			renderPickerDate.call(this, $, target, target.find("table.e"), end);
		}
		else {
			renderPickerDate.call(this, $, target, target.find("table.t0"), (date || new Date()));
		}
	};

	var renderFooterDate = function ($, target, date) {
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			var start = (date && date.start) ? Utils.toDateString(date.start, "yyyy.MM.dd") : "-";
			var end = (date && date.end) ? Utils.toDateString(date.end, "yyyy.MM.dd") : "-";
			var valueTarget = target.find("footer .vals");
			valueTarget.children(".s").text(start);
			valueTarget.children(".e").text(end);
		}
	};

	var renderPickerDate = function ($, target, table, date) {
		var y = date.getFullYear(), m = date.getMonth();
		table.attr("data-y", y).attr("data-m", m);

		var dt = new Date(y, m, 1); // 当月第1天
		var weekday = dt.getDay();
		dt.setDate(weekday ? (2 - weekday) : -5); // 日历显示的第1天

		table.find("tbody.month td").text(cn_month[m] + "月");

		var tbody = table.find("tbody.dates");
		while (true) {
			var tr = $("<tr></tr>").appendTo(tbody);
			for (var i = 0; i < 7; i++) {
				var _y = dt.getFullYear(), _m = dt.getMonth(), _d = dt.getDate();
				var td = $("<td></td>").appendTo(tr);
				td.append("<span>" + _d + "</span>");
				td.attr("data-dt", (_y + "-" + _m + "-" + _d));
				dt.setDate(_d + 1);
			}
			if (dt.getMonth() > m || dt.getFullYear() > y)
				break;
		}


		// var y = date.getFullYear(), m = date.getMonth();
		// // target.attr("data-y", y).attr("data-m", m);

		// var dt = new Date(y, m, 1); // 起始到当月第1天
		// var weekday = dt.getDay(); // 获取星期几
		// dt.setDate(weekday ? (2 - weekday) : -5); // 计算日历显示的第一个日期

		// var dt0 = new Date(); // today
		// var t0 = dt0.getFullYear() * 10000 + dt0.getMonth() * 100 + dt0.getDate();

		// var dt1 = this.getDate(), t1 = 0; // selected
		// if (dt1)
		// 	t1 = dt1.getFullYear() * 10000 + dt1.getMonth() * 100 + dt1.getDate();

		// var min = this.getMinDate(), tmin = 0;
		// if (min)
		// 	tmin = min.getFullYear() * 10000 + min.getMonth() * 100 + min.getDate();

		// var max = this.getMaxDate(), tmax = 21001231;
		// if (max)
		// 	tmax = max.getFullYear() * 10000 + max.getMonth() * 100 + max.getDate();

		// while (true) {
		// 	var tr = $("<tr></tr>").appendTo(tbody);
		// 	for (var i = 0; i < 7; i++) {
		// 		var _y = dt.getFullYear(), _m = dt.getMonth(), _d = dt.getDate();
		// 		var _t = _y * 10000 + _m * 100 + _d;
		// 		var td = $("<td></td>").appendTo(tr).append("<span>" + _d + "</span>");
		// 		td.attr("data-dt", (_y + "/" + (_m + 1) + "/" + _d));
		// 		if (_t === t0)
		// 			td.addClass("today");
		// 		if (_t === t1)
		// 			td.addClass("selected");
		// 		if (_m !== m || _t < tmin || _t > tmax)
		// 			td.addClass("disabled");
		// 		dt.setDate(_d + 1);
		// 	}
		// 	if (dt.getMonth() > m || dt.getFullYear() > y)
		// 		break;
		// };
	};

	var getMonthStr = function (date) {
		if (date instanceof Date) {
			var strDate = date.getFullYear() + "年";
			strDate += " " + cn_month[date.getMonth()] + "月";
			return strDate;
		}
		return null;
	};

	var getTime = function (date) {
		if (date)
			return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
		return 0;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.renderDate = renderDate;
		Renderer.renderPickerDate = renderPickerDate;
		VRender.Component.Render.datepicker = Renderer;
	}

})(typeof VRender === "undefined");