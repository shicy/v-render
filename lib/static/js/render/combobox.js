// ========================================================
// 下拉选择框，下拉列表使用 DropdownList 组件
// @author shicy <shicy85@163.com>
// Create on 2017-12-13
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.combobox)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;
	var DropdownListRenderer = backend ? require("./dropdownlist") : VRender.Component.Render.dropdownlist;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-combobox");

		if (Utils.isTrue(this.options.native))
			target.attr("opt-native", "1");

		target.attr("opt-scroll", this.options.scroller);

		this.options.data = dataFormat.call(this, this.options.data);
		ListRenderer.render.call(this, $, target);

		renderTextView.call(this, $, target);

		return this;
	};

	_Renderer.getData = function () {
		return DropdownListRenderer.getData.call(this);
	};

	_Renderer.renderData = function ($, target) {
		DropdownListRenderer.renderData.call(this, $, target);
	};

	_Renderer._getItemContainer = function () {
		return null; // 禁止渲染子项
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
				return self._getDataLabel(temp);
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

	var dataFormat = function (data) {
		return DropdownListRenderer.dataFormat.call(this, data);
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.dataFormat = dataFormat;
		VRender.Component.Render.combobox = Renderer;
	}

})(typeof VRender === "undefined");