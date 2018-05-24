// ========================================================
// 文本输入框
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.textview)
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
		target.addClass("ui-textview");

		var ipt = $("<div class='ipt'></div>").appendTo(target);
		var input = renderInput.call(this, $, target, ipt);

		var options = this.options || {};

		var width = Utils.getFormatSize(options.width, this.isRenderAsRem());
		if (width)
			target.attr("opt-fixed", "1").css("width", width);

		if (Utils.isTrue(options.readonly)) {
			target.attr("opt-readonly", "1");
			input.attr("readonly", "readonly");
		}

		if (Utils.isTrue(options.required))
			target.attr("opt-required", "1");

		if (this.isDisplayAsPassword())
			target.attr("opt-pwd", "1");

		var maxSize = parseInt(options.maxSize) || 0;
		if (maxSize > 0) {
			target.addClass("show-size").attr("opt-size", maxSize);
			var len = Utils.trimToEmpty(input.val()).length;
			$("<span class='size'></span>").appendTo(ipt).text(len + "/" + maxSize);
		}

		if (Utils.isNotBlank(options.prompt))
			$("<span class='prompt'></span>").appendTo(ipt).text(options.prompt);

		if (Utils.isNotBlank(options.tips))
			$("<span class='tips'></span>").appendTo(ipt).html(options.tips);

		var description = options.description || options.desc;
		if (Utils.isNotBlank(description))
			$("<div class='desc'></div>").appendTo(target).html(description);
		
		renderErrorMsg.call(this, $, target);

		if (Utils.isTrue(options.autoHeight))
			renderAsAutoHeight.call(this, $, target);

		return this;
	};

	// ====================================================
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
		var options = this.options || {};
		if (options.hasOwnProperty("multiple"))
			return Utils.isTrue(options.multiple);
		return Utils.isTrue(options.multi);
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
			if (/^(number|num|int)$/.test(type))
				type = "_number";
			if (/^(email|password|tel|url|number)$/.test(type))
				input.attr("type", type); // 标准类型添加“type”属性
			target.attr("opt-type", type);
			if (type == "_number") {
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

		if (Utils.isNotBlank(this.options.errmsg))
			target.attr("opt-errmsg", this.options.errmsg);

		BaseRender.fn.renderFunction(target, "validate", this.options.validate);
	};

	var renderAsAutoHeight = function ($, target) {
		target.attr("opt-autoheight", "1");
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.textview = Renderer;
	}

})(typeof VRender === "undefined");