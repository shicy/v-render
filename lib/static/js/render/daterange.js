// ========================================================
// 日期范围选择框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.daterange)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-daterange");

		if (Utils.isTrue(this.options.dropdown))
			target.addClass("tools-dropdown");

		var start = Utils.toDate(this.options.start);
		var end = Utils.toDate(this.options.end);

		var quickDates = formatQuickDates(this.getQuickDates());
		var quickDefault = parseInt(this.options.quickDef) || 0;

		if (quickDates && quickDates.length > 0 && quickDefault > 0) {
			var match = Utils.index(quickDates, function (tmp) {
				return tmp.value === quickDefault;
			});
			if (match >= 0) {
				start = new Date();
				end = new Date();
				if (quickDefault > 1)
					start.setDate(start.getDate() - quickDefault - 1);
			}
		}

		if (start && !end)
			end = new Date(start.getTime());
		if (end && !start)
			start = new Date(end.getTime());

		if (start && end) {
			target.attr("data-start", Utils.toDateString(start, "yyyy/MM/dd"));
			target.attr("data-end", Utils.toDateString(end, "yyyy/MM/dd"));
		}

		renderQuickDates.call(this, $, target, quickDates, quickDefault);
		renderDateInput.call(this, $, target, start, end);

		var minDate = Utils.toDate(this.options.min);
		if (minDate)
			target.attr("data-min", Utils.toDateString(minDate, "yyyy/MM/dd"));

		var maxDate = Utils.toDate(this.options.max);
		if (maxDate)
			target.attr("data-max", Utils.toDateString(maxDate, "yyyy/MM/dd"));

		if (Utils.isTrue(this.options.native))
			target.attr("data-native", "1");

		return this;
	};

	// ====================================================
	_Renderer.getDateFormat = function () {
		return this.options.dateFormat || this.options.format;
	};

	_Renderer.getQuickDates = function () {
		return this.options.shortcuts || this.options.quickDates;
	};

	// ====================================================
	var renderQuickDates = function ($, target, quickDates, quickDefault) {
		target.children(".tools").remove();
		if (quickDates && quickDates.length > 0) {
			var self = this;
			target.addClass("has-tools");
			var tools = $("<div class='tools'></div>").prependTo(target);
			var label = $("<span class='label'></span>").appendTo(tools);
			var items = $("<div class='items'></div>").appendTo(tools);
			Utils.each(quickDates, function (data, i) {
				var value = parseInt(data && data.value) || 0;
				var item = $("<div class='item'></div>").appendTo(items);
				item.attr("data-val", value);
				item.text(Utils.isBlank(data.label) ? ("最近" + value + "天") : data.label);
				if (quickDefault == value)
					item.addClass("selected");
			});
			var selectedItem = items.children(".selected");
			// if (target.is(".tools-dropdown")) {
			// 	if (selectedItem.length === 0)
			// 		selectedItem = items.children(":eq(0)").addClass("selected");
			// }
			label.text(selectedItem.length > 0 ? selectedItem.text() : "选择日期");
		}
		else {
			target.removeClass("has-tools");
		}
	};

	var renderDateInput = function ($, target, start, end) {
		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<button class='clear'></button>");

		var prompt = this.options.prompt;
		if (Utils.isNotBlank(prompt))
			iptTarget.append("<span class='prompt'>" + prompt + "</span>");

		var dateFormat = this.getDateFormat();
		var dateRange = getDateRangeLabel(start, end, dateFormat);

		input.val(dateRange);

		if (backend && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='format'>" + dateFormat + "</div>");
		}

		if (Utils.isNotBlank(dateRange))
			target.addClass("has-val");
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

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getDateRangeLabel = getDateRangeLabel;
		VRender.Component.Render.daterange = Renderer;
	}

})(typeof VRender === "undefined");