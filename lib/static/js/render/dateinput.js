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

		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<span class='clear'></span>");

		var dateFormat = this.getDateFormat();
		if (backend && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='format'>" + dateFormat + "</div>");
		}

		var selectedDate = this.getDate();
		if (selectedDate) {
			target.attr("data-dt", Utils.toDateString(selectedDate, "yyyy/MM/dd"));
			input.val(getFormatDate(selectedDate, dateFormat));
			target.addClass("has-val");
		}

		input.attr("placeholder", this.options.prompt || "");

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
	_Renderer.getDate = function () {
		if (this.options.hasOwnProperty("date"))
			return Utils.toDate(this.options.date);
		return new Date();
	};

	_Renderer.getDateFormat = function () {
		return this.options.dateFormat || this.options.format;
	};

	// ====================================================
	var getFormatDate = function (date, dateFormat) {
		if (Utils.isFunction(dateFormat))
			return dateFormat(date);
		if (Utils.isBlank(dateFormat))
			dateFormat = "yyyy-MM-dd";
		return Utils.toDateString(date, dateFormat);
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