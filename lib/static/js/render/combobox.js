// ========================================================
// 下拉选择框，下拉列表使用 DropdownList 组件
// @author shicy <shicy85@163.com>
// Create on 2017-12-13
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.combobox)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._select.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._select();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-combobox");

		if (Utils.isTrue(this.options.native))
			target.attr("opt-native", "1");

		// 容器，用于下拉列表定位
		target.attr("opt-box", this.options.container);

		renderTextView.call(this, $, target);
		target.append("<div class='dropdown'></div>");
		BaseRender._select.render.call(this, $, target);

		return this;
	};

	_Renderer._getItemContainer = function ($, target) {
		return target.children(".dropdown");
	};

	_Renderer._renderItems = function ($, target) {
		renderItems.call(this._getItemContainer($, target), this.getData());
	};

	// ====================================================
	var renderTextView = function ($, target) {
		var ipttag = $("<div class='ipt'></div>").appendTo(target);
		var input = $("<input type='text'/>").appendTo(ipttag);

		var datas = this.getSelectedData(true);
		if (datas && datas.length > 0) {
			target.addClass("has-val");
			var self = this;
			var labels = Utils.map(datas, function (temp) {
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

	var renderItems = function (itemContainer, datas) {

	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.renderItems = renderItems;
		VRender.Component.Render.combobox = Renderer;
	}

})(typeof VRender === "undefined");