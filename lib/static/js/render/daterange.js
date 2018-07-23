// ========================================================
// 日期范围选择框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.daterange)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-daterange");

		if (Utils.isTrue(this.options.dropdown))
			target.addClass("tools-dropdown");

		if (Utils.isTrue(this.options.native))
			target.attr("opt-native", "1");

		var minDate = Utils.toDate(this.options.min);
		if (minDate)
			target.attr("opt-min", Utils.toDateString(minDate, "yyyy-MM-dd"));

		var maxDate = Utils.toDate(this.options.max);
		if (maxDate)
			target.attr("opt-max", Utils.toDateString(maxDate, "yyyy-MM-dd"));

		var start = Utils.toDate(this.options.start), end = null;
		if (start) {
			end = Utils.toDate(this.options.end) || new Date(start.getTime());
			if (minDate && getTime(minDate) > getTime(start))
				start = minDate;
			if (maxDate && getTime(maxDate) < getTime(end))
				end = maxDate;
			if (getTime(start) > getTime(end))
				start = end = null;
		}

		var defVal = parseInt(this.options.quickDef) || 0;
		if (start && end) {
			defVal = 0;
		}
		else if (defVal) {
			end = new Date();
			start = new Date();
			start.setDate(start.getDate() - defVal);
		}

		if (start && end) {
			target.addClass("has-val");
			target.attr("data-start", Utils.toDateString(start, "yyyy-MM-dd"));
			target.attr("data-end", Utils.toDateString(end, "yyyy-MM-dd"));
		}

		renderShortcuts.call(this, $, target, this.getShortcutDates(), defVal);
		renderDateInput.call(this, $, target, start, end);

		return this;
	};

	_Renderer.getDateFormat = function () {
		return this.options.dateFormat || this.options.format;
	};

	_Renderer.getShortcutDates = function () {
		return this.options.shortcuts || this.options.quickDates;
	};

	// ====================================================
	var renderShortcuts = function ($, target, shortcuts, defVal) {
		target.removeClass("has-tools").children(".tools").remove();
		shortcuts = formatQuickDates(shortcuts);
		if (shortcuts && shortcuts.length > 0) {
			target.addClass("has-tools");

			var tools = $("<div class='tools'></div>").prependTo(target);
			tools.append("<span class='label'>选择日期</span>");
			var items = $("<div class='items'></div>").appendTo(tools);

			Utils.each(shortcuts, function (data) {
				var value = parseInt(data.value) || 0;
				var item = $("<div class='item'></div>").appendTo(items);
				item.attr("data-val", value);
				item.text(Utils.isBlank(data.label) ? ("最近" + value + "天") : data.label);
				if (value == defVal)
					item.addClass("selected");
			});
		}
	};

	var renderDateInput = function ($, target, start, end) {
		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<span class='clear'></span>");

		var prompt = this.options.prompt;
		if (Utils.isNotBlank(prompt)) {
			$("<span class='prompt'></span>").appendTo(iptTarget).text(prompt);
		}

		var dateFormat = this.getDateFormat();
		input.val(getDateRangeLabel(start, end, dateFormat) || "");

		if (backend && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='format'>" + dateFormat + "</div>");
		}
	};

	// ====================================================
	var getFormatDate = function (date, dateFormat) {
		if (Utils.isFunction(dateFormat))
			return dateFormat(date);
		if (Utils.isBlank(dateFormat))
			dateFormat = "yyyy-MM-dd";
		return Utils.toDateString(date, dateFormat);
	};

	var formatQuickDates = function (quickDates) {
		var results = [];
		Utils.each(Utils.toArray(quickDates), function (data) {
			if (Utils.isNotBlank(data)) {
				if (typeof data !== "object")
					data = {value: data};
				data.value = parseInt(data && data.value) || 0;
				if (data.value > 0)
					results.push(data);
			}
		});
		return results;
	};

	var getDateRangeLabel = function (start, end, dateFormat) {
		if (start && end) {
			return getFormatDate(start, dateFormat) + " 至 " + getFormatDate(end, dateFormat);
		}
		return "";
	};

	var getTime = function (date) {
		if (date instanceof Date) {
			return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
		}
		return 0;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getDateRangeLabel = getDateRangeLabel;
		Renderer.renderShortcuts = renderShortcuts;
		VRender.Component.Render.daterange = Renderer;
	}

})(typeof VRender === "undefined");