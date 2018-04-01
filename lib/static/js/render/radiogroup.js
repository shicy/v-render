// ========================================================
// 单选框组
// @author shicy <shicy85@163.com>
// Create on 2018-01-26
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.radiogroup)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;
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
		this.radioGroupId = "rad-" + Utils.randomTxt(backend ? 3 : 4) + globleGroupID++;
		ListRenderer.render.call(this, $, target);
	};

	_Renderer._renderOneItem = function ($, item, data, index, bSelected) {
		renderOneItem.call(this, $, item, data, index, bSelected);
	};

	_Renderer._getNewItem = function ($, target) {
		return getNewItem.call(this, $, target);
	};

	// ====================================================
	var getNewItem = function ($, target) {
		return $("<div class='item'></div>").appendTo(target);
	};

	var renderOneItem = function ($, item, data, index, bSelected) {
		var params = {};
		params.name = this.radioGroupId;
		params.checked = bSelected;
		params.label = this._getDataLabel(data, index);
		if (backend) {
			return new UIRadiobox(this.context, params).render(item);
		}
		else {
			params.target = item;
			UIRadiobox.create(params);
		}
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getNewItem = getNewItem;
		Renderer.renderOneItem = renderOneItem;
		VRender.Component.Render.radiogroup = Renderer;
	}

})(typeof VRender === "undefined");