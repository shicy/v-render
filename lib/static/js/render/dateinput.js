// ========================================================
// 日期输入框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.dateinput)
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
		target.addClass("ui-dateipt");

		if (Utils.isTrue(this.options.native))
			target.attr("opt-native", "1");

		var minDate = Utils.toDate(this.options.min);
		if (minDate)
			target.attr("opt-min", Utils.toDateString(minDate, "yyyy-MM-dd"));

		var maxDate = Utils.toDate(this.options.max);
		if (maxDate)
			target.attr("opt-max", Utils.toDateString(maxDate, "yyyy-MM-dd"));

		var selectedDate = Utils.toDate(this.options.date);
		if (selectedDate) {
			var time = getTime(selectedDate);
			if ((minDate && getTime(minDate) > time) || (maxDate && getTime(maxDate) < time))
				selectedDate = null;
		}

		if (selectedDate) {
			target.addClass("has-val");
			target.attr("data-dt", Utils.toDateString(selectedDate, "yyyy-MM-dd"));
		}

		renderDateInput.call(this, $, target, selectedDate);

		return this;
	};

	// ====================================================
	_Renderer.getDateFormat = function () {
		return this.options.dateFormat || this.options.format;
	};

	// ====================================================
	var renderDateInput = function ($, target, date) {
		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<span class='clear'></span>");

		var prompt = this.options.prompt;
		if (Utils.isNotBlank(prompt)) {
			$("<span class='prompt'></span>").appendTo(iptTarget).text(prompt);
		}

		var dateFormat = this.getDateFormat();
		input.val(getFormatDate(date, dateFormat) || "");

		if (backend && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='format'>" + dateFormat + "</div>");
		}
	};

	var getFormatDate = function (date, dateFormat) {
		if (date) {
			if (Utils.isFunction(dateFormat))
				return dateFormat(date);
			if (Utils.isBlank(dateFormat))
				dateFormat = "yyyy-MM-dd";
			return Utils.toDateString(date, dateFormat);
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
		Renderer.getFormatDate = getFormatDate;
		VRender.Component.Render.dateinput = Renderer;
	}

})(typeof VRender === "undefined");