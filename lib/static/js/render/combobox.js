// ========================================================
// 下拉选择框，下拉列表使用 DropdownList 组件
// @author shicy <shicy85@163.com>
// Create on 2017-12-13
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.combobox)
		return ;

	///////////////////////////////////////////////////////
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;

	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		ListRenderer.render.call(this, $, target);
		target.addClass("ui-combobox");
		target.css("width", Utils.getMeasureSize(this.options.width, this.isRenderAsRem()) || "");

		if (Utils.isTrue(this.options.native))
			target.attr("opt-native", "1");

		target.attr("opt-scroll", this.options.scroller);

		renderTextView.call(this, $, target);
		// 列表在前端渲染

		return this;
	};

	_Renderer.getDataMapper = function () {
		return null; // 交给dropdown处理
	};

	// ====================================================
	var renderTextView = function ($, target) {
		var ipttag = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text'/>").appendTo(ipttag);

		var data = this.getSelectedData(true);
		if (data && data.length > 0) {
			target.addClass("has-val");
			var self = this;
			var labels = Utils.map(data, function (temp) {
				return self.getDataLabel(temp);
			});
			input.val(labels.join(",") || "");
		}

		if (Utils.isTrue(this.options.editable))
			target.addClass("editable");
		else
			input.attr("readonly", "readonly");

		if (target.is(".disabled"))
			input.attr("disabled", "disabled");

		ipttag.append("<button class='dropdownbtn'></button>");
		ipttag.append("<span class='prompt'>" + Utils.trimToEmpty(this.options.prompt) + "</span>");
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.combobox = Renderer;
	}

})(typeof VRender === "undefined");