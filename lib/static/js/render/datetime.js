// ========================================================
// 日期时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-10-07
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.datetime)
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
		target.addClass("ui-datetime");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		if (this.isSecondVisible())
			target.attr("opt-sec", "1");

		var minDate = Utils.toDate(this.options.min);
		target.attr("opt-min", minDate ? minDate.getTime() : null);

		var maxDate = Utils.toDate(this.options.max);
		target.attr("opt-max", maxDate ? maxDate.getTime() : null);

		if (Utils.isArray(this.options.hours))
			target.attr("opt-hours", this.options.hours.join(",") || null);
		if (Utils.isArray(this.options.minutes))
			target.attr("opt-minutes", this.options.minutes.join(",") || null);
		if (Utils.isArray(this.options.seconds))
			target.attr("opt-seconds", this.options.seconds.join(",") || null);

		renderView.call(this, $, target, this.options.date);

		return this;
	};

	_Renderer.isSecondVisible = function () {
		return Utils.isTrue(this.options.showSecond);
	};

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

		date = Utils.toDate(date);
		if (date) {
			var showSecond = this.isSecondVisible();

			date.setMilliseconds(0);
			if (!showSecond)
				date.setSeconds(0);

			target.addClass("has-val").attr("data-dt", date.getTime());
			input.val(getFormatDate(date, this.getDateFormat(), showSecond));
		}

		if (backend && dateFormat) {
			if (Utils.isFunction(dateFormat))
				target.write("<div class='ui-hidden format format-fn'>" + escape(dateFormat) + "</div>");
			else
				target.write("<div class='ui-hidden format'>" + dateFormat + "</div>");
		}
	};

	var getFormatDate = function (date, dateFormat, showSecond) {
		if (date) {
			if (Utils.isFunction(dateFormat))
				return dateFormat(date);
			if (Utils.isBlank(dateFormat)) {
				if (showSecond)
					dateFormat = "yyyy-MM-dd HH:mm:ss";
				else
					dateFormat = "yyyy-MM-dd HH:mm";
			}
			return Utils.toDateString(date, dateFormat);
		}
		return "";
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getFormatDate = getFormatDate;
		VRender.Component.Render.datetime = Renderer;
	}

})(typeof VRender === "undefined");