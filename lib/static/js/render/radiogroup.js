// ========================================================
// 单选框组
// @author shicy <shicy85@163.com>
// Create on 2018-01-26
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.radiogroup)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_list").ListRenderer : VRender.Component.Render._list;
	var UIRadiobox = backend ? require("../../../ui/component/UIRadiobox"): VRender.Component.Radiobox;

	var globleGroupID = 1;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-radgrp");
		this.radioGroupId = Utils.randomTxt(backend ? 3 : 4) + globleGroupID++;

		ListRenderer.render.call(this, $, target);
		// renderItems.call(this, $, target, Utils.toArray(this.getData()));
	};

	// _Renderer.renderItems = function ($, target) {

	// };

	_Renderer.renderOneItem = function ($, item, data, index, bSelected) {

	};

	_Renderer.getNewItem = function ($, target, data) {

	};

	// ====================================================
	// var renderItems = function ($, target, datas) {

	// };

	// var renderOneItem = function ($, target, data) {

	// };

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.radiogroup = Renderer;
	}

})(typeof VRender === "undefined");