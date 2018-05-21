// ========================================================
// 日历
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.datepicker)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;
	var UIButton = backend ? require("../../../ui/component/UIButton") : VRender.Component.Button;

	var cn_month = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
	var cn_week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
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
				target.attr("data-start", Utils.toDateString(date[0], "yyyy-MM-dd"));
				target.attr("data-end", Utils.toDateString(date[1], "yyyy-MM-dd"));
			}
		}
		else if (date) {
			target.attr("data-dt", Utils.toDateString(date, "yyyy-MM-dd"));
		}

		renderHeader.call(this, $, target);
		renderTables.call(this, $, target);
		renderFooter.call(this, $, target);

		renderDate.call(this, $, target, date);

		return this;
	};

	_Renderer.getDate = function () {
		var min = this.getMinDate(), max = this.getMaxDate();
		var tmin = getTime(min), tmax = getTime(max);
		if (tmin && tmax && tmin > tmax)
			return null;

		if (this.isRangeDate()) {
			var start = Utils.toDate(this.options.start);
			if (start) {
				start = new Date(start.getTime());
				var end = Utils.toDate(this.options.end) || new Date(start.getTime());
				end = new Date(end ? end.getTime() : start.getTime());
				var tstart = getTime(start), tend = getTime(end);
				if (tstart <= tend) {
					if (tmin && tstart < tmin)
						start = min;
					if (tmax && tend > tmax)
						end = max;
					if (getTime(start) <= getTime(end))
						return [start, end];
				}
			}
		}
		else {
			var date = Utils.toDate(this.options.date);
			if (date) {
				date = new Date(date.getTime());
				var tdate = getTime(date);
				if ((tmin && tdate < tmin) || (tmax && tdate > tmax))
					return null;
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
		var addItem = function () {
			var item = $("<dl class='item'></dl>").appendTo(title);
			item.append("<dt class='lbl'>-</dt><dd class='val'>-</dd>");
			item.append("<button class='prev y'>&nbsp;</button>");
			item.append("<button class='prev m'>&nbsp;</button>");
			item.append("<button class='next m'>&nbsp;</button>");
			item.append("<button class='next y'>&nbsp;</button>");
			return item;
		};

		if (this.isRangeDate()) {
			addItem().addClass("s").children(".lbl").html("开始日期<span class='y'></span>");
			addItem().addClass("e").children(".lbl").html("结束日期<span class='y'></span>");
		}
		else {
			addItem();
		}

		if (this.isRenderAsApp()) {
			header.append("<button class='today'><label>今天</label></button>");
			header.append("<button class='clear'><label>清除</label></button>");
		}
	};

	var renderTables = function ($, target) {
		var tables = $("<section></section>").appendTo(target);
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			createTable($, tables).addClass("s");
			createTable($, tables).addClass("e");
		}
		else {
			createTable($, tables).addClass("t0");
		}
	};

	var renderFooter = function ($, target) {
		if (this.isRangeDate()) {
			var footer = $("<footer></footer>").appendTo(target);
			if (this.isRenderAsApp()) {
				addButton.call(this, footer, {label: "使用日期", type: "primary", cls: "okbtn"});
			}
			else {
				footer.append("<div class='vals'><span class='s'>-</span> - <span class='e'>-</span></div>");
				var buttons = $("<div class='btns'></div>").appendTo(footer);
				addButton.call(this, buttons, {label: "确定", type: "primary", cls: "okbtn"});
				addButton.call(this, buttons, {label: "取消", type: "cancel", cls: "cancelbtn"});
			}
		}
	};

	var renderDate = function ($, target, selectedDate, pickerDate) {
		pickerDate = Utils.toArray(pickerDate);
		if (!(pickerDate[0] instanceof Date)) {
			if (this.isRangeDate() && !this.isRenderAsApp()) {
				pickerDate.push(selectedDate && selectedDate[0] || new Date());
				pickerDate.push(selectedDate && selectedDate[1])
			}
			else {
				pickerDate = selectedDate || new Date();
			}
		}
		renderHeaderDate.call(this, $, target, pickerDate, selectedDate);
		renderTableDate.call(this, $, target, pickerDate, selectedDate);
		renderFooterDate.call(this, $, target, pickerDate, selectedDate);
	};

	var renderHeaderDate = function ($, target, pickerDate, selectedDate) {
		var header = target.children("header");
		if (this.isRangeDate()) {
			var start, end;
			var startValue = "--", endValue = "--";
			var startLabel = " ", endLabel = " ";
			if (this.isRenderAsApp()) { // 显示选中日期范围
				if (selectedDate) {
					start = selectedDate[0], end = selectedDate[1];
					var today = new Date(), year = today.getFullYear();
					if (start) {
						if (start.getFullYear() != year)
							startLabel = start.getFullYear();
						startValue = Utils.toDateString(start, "M月d日") + " " + cn_week[start.getDay()];
					}
					if (end) {
						if (end.getFullYear() != year)
							endLabel = end.getFullYear();
						endLabel = end.getFullYear() == year ? " " : end.getFullYear();
						endValue = Utils.toDateString(end, "M月d日") + " " + cn_week[end.getDay()];
					}
				}
				header.find(".item.s .y").text(startLabel);
				header.find(".item.e .y").text(endLabel);
			}
			else {
				start = pickerDate && pickerDate[0] || new Date();
				end = pickerDate && pickerDate[1] || start;
				if (isSameMonth(start, end)) {
					end = new Date(end.getTime());
					end.setMonth(end.getMonth() + 1);
				}
				startValue = start.getFullYear() + "年 " + cn_month[start.getMonth()] + "月";
				endValue = end.getFullYear() + "年 " + cn_month[end.getMonth()] + "月";

				checkRangeHeadBtns($, target, start, end);
			}
			header.find(".item.s .val").text(startValue);
			header.find(".item.e .val").text(endValue);
		}
		else {
			var date = pickerDate || new Date();
			var label = date.getFullYear() + "年 " + cn_month[date.getMonth()] + "月";
			header.find(".item .lbl").text(label); // 显示当前“年月”
			header.find(".item .val").text(selectedDate ? Utils.toDateString(selectedDate, "yyyy.MM.dd") : "-");
		}
	};

	var renderTableDate = function ($, target, pickerDate, selectedDate) {
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			var start = pickerDate && pickerDate[0] || new Date();
			var end = pickerDate && pickerDate[1] || start;
			if (isSameMonth(start, end)) {
				end = new Date(end.getTime());
				end.setMonth(end.getMonth() + 1);
			}
			renderPickerDate.call(this, $, target, target.find(".table.s"), start, selectedDate);
			renderPickerDate.call(this, $, target, target.find(".table.e"), end, selectedDate);
		}
		else {
			var date = pickerDate || new Date();
			renderPickerDate.call(this, $, target, target.find(".table.t0"), date, selectedDate);
		}
	};

	var renderFooterDate = function ($, target, pickerDate, selectedDate) {
		if (this.isRangeDate() && !this.isRenderAsApp()) {
			var start = " ", end = " ";
			if (selectedDate) {
				if (selectedDate[0])
					start = Utils.toDateString(selectedDate[0], "yyyy.MM.dd");
				if (selectedDate[1])
					end = Utils.toDateString(selectedDate[1], "yyyy.MM.dd");
			}
			var valueTarget = target.find("footer .vals");
			valueTarget.children(".s").text(start);
			valueTarget.children(".e").text(end);
		}
	};

	var renderPickerDate = function ($, target, table, pickerDate, selectedDate) {
		var y = pickerDate.getFullYear(), m = pickerDate.getMonth();
		table.attr("data-y", y).attr("data-m", m);

		var dt0 = new Date(), t0 = getTime(dt0); // today
		var dtstart = (selectedDate instanceof Date) ? selectedDate : (selectedDate && selectedDate[0]);
		var dtend = (selectedDate instanceof Date) ? selectedDate : (selectedDate && selectedDate[1]);
		var tstart = getTime(dtstart), tend = getTime(dtend) || tstart; // selected
		var tmin = getTime(this.getMinDate()), tmax = getTime(this.getMaxDate()) || 21001231; // limit

		var dt = new Date(y, m, 1); // 当月第1天
		var weekday = dt.getDay();
		dt.setDate(weekday ? (2 - weekday) : -5); // 日历显示的第1天

		var monthLabel = (dt0.getFullYear() == y ? "" : (y + "年 ")) + cn_month[m] + "月";
		table.find(".month").text(monthLabel);

		var tbody = table.find("table.body tbody").empty();
		while (true) {
			var tr = $("<tr></tr>").appendTo(tbody);
			for (var i = 0; i < 7; i++) {
				var _y = dt.getFullYear(), _m = dt.getMonth(), _d = dt.getDate(), _t = _y * 10000 + _m * 100 + _d;

				var td = $("<td></td>").appendTo(tr);
				td.append("<span>" + _d + "</span>");
				td.attr("data-dt", (_y + "-" + (_m + 1) + "-" + _d));

				if (_t == t0)
					td.addClass("today");
				if (_m != m)
					td.addClass("over");
				if (_m != m || _t < tmin || _t > tmax)
					td.addClass("disabled");
				if (_t >= tstart && _t <= tend) {
					td.addClass("selected");
					if (_t == tstart)
						td.addClass("start")
					if (_t == tend)
						td.addClass("end");
				}

				dt.setDate(_d + 1);
			}
			if (dt.getMonth() > m || dt.getFullYear() > y)
				break;
		}
	};

	var checkRangeHeadBtns = function ($, target, start, end) {
		target = target.children("header");

		var yearbtns = target.find(".item.s .next.y, .item.e .prev.y");
		var monthbtns = target.find(".item.s .next.m, .item.e .prev.m");

		var syear = start.getFullYear(), smonth = start.getMonth();
		var eyear = end.getFullYear(), emonth = end.getMonth();

		if ((syear * 100 + smonth) >= ((eyear - 1) * 100 + emonth))
			yearbtns.addClass("disabled");
		else
			yearbtns.removeClass("disabled");

		if (syear > eyear || (syear == eyear && smonth >= emonth - 1))
			monthbtns.addClass("disabled");
		else
			monthbtns.removeClass("disabled");
	};

	var createTable = function ($, tableContainer) {
		tableContainer = $("<div class='table'></div>").appendTo(tableContainer);

		var table = $("<table class='head'></table>").appendTo(tableContainer);
		table.append("<thead><tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th><th>日</th></tr></thead>");

		var table = $("<table class='body'></table>").appendTo(tableContainer);
		table.append("<thead><tr><th colspan='7'><div class='month'>-</div></th></tr></thead>");
		table.append("<tbody></tbody>");

		return tableContainer;
	};

	var addButton = function (target, options) {
		if (backend) {
			new UIButton(this.context, options).render(target);
		}
		else {
			UIButton.create(Utils.extend({}, options, {target: target}));
		}
	};

	var isSameMonth = function (dt1, dt2) {
		if (dt1 && dt2) {
			return dt1.getMonth() == dt2.getMonth() && dt1.getFullYear() == dt2.getFullYear();
		}
		return false;
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
		Renderer.createTable = createTable;
		Renderer.renderDate = renderDate;
		Renderer.renderPickerDate = renderPickerDate;
		VRender.Component.Render.datepicker = Renderer;
	}

})(typeof VRender === "undefined");