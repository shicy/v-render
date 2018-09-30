// ========================================================
// 时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-09-29
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.timeinput)
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
		target.addClass("ui-timeipt");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		if (this.isSecondVisible())
			target.attr("opt-sec", "1");

		if (this.isUse12Hour())
			target.attr("opt-h12", "1");

		if (Utils.isArray(this.options.hours))
			target.attr("opt-hours", this.options.hours.join(",") || null);
		if (Utils.isArray(this.options.minutes))
			target.attr("opt-minutes", this.options.minutes.join(",") || null);
		if (Utils.isArray(this.options.seconds))
			target.attr("opt-seconds", this.options.seconds.join(",") || null);

		renderTimeInput.call(this, $, target, this.options.time);

		return this;
	};

	_Renderer.isSecondVisible = function () {
		return Utils.isTrue(this.options.showSecond);
	};

	_Renderer.isUse12Hour = function () {
		return Utils.isTrue(this.options.use12Hour);
	};

	// ====================================================
	var renderTimeInput = function ($, target, time) {
		var iptTarget = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text' readonly='readonly'/>").appendTo(iptTarget);
		iptTarget.append("<span class='clear'></span>");

		var prompt = this.options.prompt;
		if (Utils.isNotBlank(prompt)) {
			$("<span class='prompt'></span>").appendTo(iptTarget).text(prompt);
		}

		time = getTime(time, this.isSecondVisible());
		if (time) {
			input.val(this.isUse12Hour() ? get12HourTime(time) : time);
			target.addClass("has-val").attr("data-t", time);
		}
	};

	var getTime = function (value, showSecond) {
		if (value) {
			value = value.split(":");
			var hour = Math.max(0, parseInt(value[0])) || 0;
			var minute = Math.max(0, parseInt(value[1])) || 0;
			var second = Math.max(0, parseInt(value[2])) || 0;

			if (second > 59) {
				minute += parseInt(second / 60);
				second = second % 60;
			}
			if (minute > 59) {
				hour += parseInt(minute / 60);
				minute = minute % 60;
			}
			if (hour > 23) {
				hour = hour % 24;
			}

			var time = [];
			time.push((hour < 10 ? "0" : "") + hour);
			time.push((minute < 10 ? "0" : "") + minute);
			if (showSecond)
				time.push((second < 10 ? "0" : "") + second);
			return time.join(":");
		}
		return "";
	};

	var get12HourTime = function (time) {
		if (time) {
			time = time.split(":");
			var hour = Math.max(0, parseInt(time[0])) || 0;
			if (hour > 11) {
				time[0] = hour - 12;
				if (time[0] < 10)
					time[0] = "0" + time[0];
			}
			return getAPMName(hour) + " " + time.join(":");
		}
		return "";
	};

	var getAPMName = function (hour) {
		if (hour < 6)
			return "凌晨";
		if (hour < 12)
			return "上午";
		if (hour < 14)
			return "中午";
		if (hour < 18)
			return "下午";
		return "晚上";
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getTime = getTime;
		Renderer.get12HourTime = get12HourTime;
		VRender.Component.Render.timeinput = Renderer;
	}

})(typeof VRender === "undefined");