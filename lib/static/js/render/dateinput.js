// ========================================================
// 日期输入框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.dateinput)
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
		target.addClass("ui-dateipt");

		if (Utils.isTrue(this.options.native))
			target.attr("opt-native", "1");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		var minDate = Utils.toDate(this.options.min);
		target.attr("opt-min", minDate ? Utils.toDateString(minDate, "yyyy-MM-dd") : null);

		var maxDate = Utils.toDate(this.options.max);
		target.attr("opt-max", maxDate ? Utils.toDateString(maxDate, "yyyy-MM-dd") : null);

		renderView.call(this, $, target, Utils.toDate(this.options.date));

		return this;
	};

	// ====================================================
	_Renderer.getDateFormat = function () {
		return this.options.dateFormat || this.options.format;
	};

	// ====================================================
	var renderView = function ($, target, date) {
		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<span class='clear'></span>");

		var prompt = this.options.prompt;
		if (Utils.isNotBlank(prompt)) {
			$("<span class='prompt'></span>").appendTo(iptTarget).text(prompt);
		}

		var dateFormat = this.getDateFormat();
		if (date) {
			target.addClass("has-val").attr("data-dt", Utils.toDateString(date, "yyyy-MM-dd"));
			input.val(getFormatDate(date, dateFormat) || "");
		}

		if (backend && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='ui-hidden format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='ui-hidden format'>" + dateFormat + "</div>");
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