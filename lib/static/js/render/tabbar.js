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
		ListRenderer.render.call(this, $, target);
		renderButtons.call(this, $, target);
		return this;
	};

	_Renderer.renderOneItem = function ($, item, data, index, bSelected) {
		var box = item.children(".box");
		ListRenderer.renderOneItem.call(this, $, item, box, data, index, bSelected);
		data = data || {};
		if (Utils.isNotBlank(data.name))
			item.attr("name", data.name);
		if (Utils.isTrue(data.closable))
			item.addClass("closable").append("<i class='closable'></i>");
		if (Utils.isTrue(data.disabled))
			item.addClass("disabled").attr("disabled", "disabled");
	};

	_Renderer.getItemContainer = function ($, target) {
		target = $("<div class='bar'></div>").appendTo(target);
		var tabs = $("<ul class='tabs'></ul>").appendTo(target);
		target.append("<div class='thumb'></div>");
		return tabs;
	};

	_Renderer.getNewItem = function ($, target) {
		var item = $("<li class='tab'></li>").appendTo(target);
		item.append("<div class='box'></div>");
		return item;
	};

	// ====================================================
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
		// Renderer.renderItems = renderTabItems;
		// Renderer.renderTabItem = renderTabItem;
		VRender.Component.Render.tabbar = Renderer;
	}

})(typeof VRender === "undefined");