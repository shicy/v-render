// ========================================================
// 选项卡
// @author shicy <shicy85@163.com>
// Create on 2017-12-19
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.tabbar)
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
		target.addClass("ui-tabbar");

		var tabbar = $("<div class='bar'></div>").appendTo(target);
		tabbar.append("<ul class='tabs'></ul>");
		tabbar.append("<div class='thumb'></div>");

		BaseRender._select.render.call(this, $, target);
		renderButtons.call(this, $, target);

		return this;
	};

	_Renderer.isMultiple = function () {
		return false;
	};

	_Renderer._renderOneItem = function ($, item, data, index) {
		renderOneItem.call(this, $, item, data, index);
	};

	_Renderer._getItemContainer = function ($, target) {
		return target.find(".tabs");
	};

	_Renderer._getNewItem = function ($, target) {
		return getNewItem.call(this, $, target);
	};

	_Renderer._renderEmptyView = function () {
		// do nothing
	};

	_Renderer._renderLoadView = function () {
		// do nothing
	};

	// ====================================================
	var renderOneItem = function ($, item, data, index) {
		var box = item.children(".box");
		BaseRender._item.renderOneItem.call(this, $, item, box, data, index);
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