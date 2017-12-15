// ========================================================
// 文本输入框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.textview)
		return ;

	///////////////////////////////////////////////////////
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-textview");

		var options = this.options || {};

		if (this.isDisplayAsPassword())
			target.addClass("display-as-pwd");

		var ipt = $("<div class='ipt'></div>").appendTo(target);
		var input = renderInput.call(this, $, target, ipt);

		var width = this.getWidth() || null;
		if (Utils.isNotBlank(width))
			ipt.css("width", width);

		if (Utils.isTrue(options.readonly)) {
			target.addClass("readonly");
			input.attr("readonly", "readonly");
		}

		if (Utils.isTrue(options.required))
			target.attr("required", "required");

		var maxSize = parseInt(options.maxSize) || 0;
		if (maxSize > 0) {
			target.addClass("show-size").attr("opt-size", maxSize);
			var len = Utils.trimToEmpty(input.val()).length;
			ipt.append("<span class='size'>" + len + "/" + maxSize + "</span>");
		}

		if (Utils.isNotBlank(options.prompt))
			ipt.append("<span class='prompt'>" + options.prompt + "</span>");

		if (Utils.isNotBlank(options.tips))
			ipt.append("<span class='tips'>" + options.tips + "</span>");

		var description = options.description || options.desc;
		if (Utils.isNotBlank(description))
			target.append("<div class='desc'>" + description + "</div>");
		
		renderErrorMsg.call(this, $, target);

		return this;
	};

	// ====================================================
	_Renderer.getWidth = function () {
		return Utils.getMeasureSize(this.options.width);
	};

	_Renderer.getDecimals = function () {
		if (this.isDisplayAsPassword())
			return 0;
		var options = this.options || {};
		var type = options.dataType || options.type;
		if (type === "int")
			return 0;
		if (options.hasOwnProperty("decimals"))
			return parseInt(options.decimals) || 0;
		return 2;
	};

	_Renderer.isDisplayAsPassword = function () {
		return Utils.isTrue(this.options.displayAsPwd);
	}

	_Renderer.isMultiline = function () {
		if (this.options.hasOwnProperty("multiple"))
			return Utils.isTrue(this.options.multiple);
		return Utils.isTrue(this.options.multi);
	};

	// ====================================================
	var renderInput = function ($, target, parent) {
		var options = this.options || {};
		var multiple = this.isMultiline();
		var input = multiple ? "<textarea></textarea>" : "<input type='text'/>";
		input = $(input).appendTo(parent);

		if (multiple)
			target.addClass("multi");
		else
			parent.append("<span class='clear'></span>");

		var iptValue = options.value;
		var type = options.dataType || options.type;
		if (Utils.isNotBlank(type)) {
			if (type === "int")
				type = "number";
			if (/^(email|password|tel|url|number)$/.test(type))
				input.attr("type", type); // 标准类型添加“type”属性
			target.attr("opt-type", type);
			if (/^(number|num|int)$/.test(type)) {
				var decimals = this.getDecimals(); // 保留小数点，只有数字类型有效
				target.attr("opt-decimal", decimals);
				var minValue = parseFloat(options.min);
				var maxValue = parseFloat(options.max);
				if (!isNaN(minValue))
					target.attr("opt-min", minValue);
				if (!isNaN(maxValue))
					target.attr("opt-max", maxValue);
				if (Utils.isNotBlank(iptValue)) {
					iptValue = parseFloat(iptValue);
					if (isNaN(iptValue)) {
						iptValue = "";
					}
					else {
						if (!isNaN(minValue) && iptValue < minValue)
							iptValue = minValue;
						if (!isNaN(maxValue) && iptValue > maxValue)
							iptValue = maxValue;
						iptValue = iptValue.toFixed(decimals);
					}
				}
			}
		}
		if (Utils.isNotBlank(iptValue)) {
			input.val(iptValue);
			target.addClass("has-val");
		}

		return input;
	};

	var renderErrorMsg = function ($, target) {
		if (Utils.isNotBlank(this.options.empty))
			target.attr("opt-empty", this.options.empty);

		var errorMsg = this.options.errmsg;
		if (Utils.isFunction(errorMsg)) {
			BaseRenderer.renderFunction(target, "errmsg", errorMsg);
		}
		else if (Utils.isNotBlank(errorMsg)) {
			target.attr("opt-errmsg", errorMsg);
		}
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.textview = Renderer;
	}

})(typeof VRender === "undefined");