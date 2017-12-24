// ========================================================
// 选项卡
// @author shicy <shicy85@163.com>
// Create on 2017-12-19
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.tabbar)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();


	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-tabbar");

		var tabbar = $("<div class='bar'></div>").appendTo(target);
		tabbar.append("<ul class='tabs'></ul>");
		tabbar.append("<div class='thumb'></div>");

		ListRenderer.render.call(this, $, target);
		renderButtons.call(this, $, target);
		return this;
	};

	_Renderer.renderOneItem = function ($, item, data, index, bSelected) {
		renderOneItem.call(this, $, item, data, index, bSelected);
	};

	_Renderer.getItemContainer = function ($, target) {
		return target.find(".tabs");
	};

	_Renderer.getNewItem = function ($, target) {
		return getNewItem.call(this, $, target);
	};

	// ====================================================
	var renderOneItem = function ($, item, data, index, bSelected) {
		var box = item.children(".box");
		ListRenderer.renderOneItem.call(this, $, item, box, data, index, bSelected);
		data = data || {};
		if (Utils.isNotBlank(data.name))
			item.attr("name", data.name);
		if (Utils.isTrue(data.closable))
			item.addClass("closable").append("<i class='close'></i>");
	};

	var getNewItem = function ($, target) {
		var item = $("<li class='tab'></li>").appendTo(target);
		item.append("<div class='box'></div>");
		return item;
	};

	var renderButtons = function ($, target) {
		target = $("<div class='btns'></div>").appendTo(target);
		target.append("<span class='btn prev'>&lt;</span>");
		target.append("<span class='btn next'>&gt;</span>");
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.renderOneItem = renderOneItem;
		Renderer.getNewItem = getNewItem;
		VRender.Component.Render.tabbar = Renderer;
	}

})(typeof VRender === "undefined");