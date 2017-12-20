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
		ListRenderer.render.call(this, $, target);
		target.addClass("ui-tabbar");
		renderTabs.call(this, $, target);
		renderButtons.call(this, $, target);
		return this;
	};

	// ====================================================
	var renderTabs = function ($, target) {
		target = $("<div class='bar'></div>").appendTo(target);
		var tabs = $("<ul class='tabs'></ul>").appendTo(target);
		target.append("<div class='thumb'></div>");
		renderTabItems.call(this, $, tabs);
	};

	var renderTabItems = function ($, target) {
		var self = this;
		var selectedIndex = this.getSelectedIndex(true);
		var selectedId = this.getSelectedId(true) || [];
		Utils.each(this.getData(), function (data, index) {
			renderTabItem.call(self, $, target, data, index, selectedIndex, selectedId);
		});
	};

	var renderTabItem = function ($, target, data, index, selectedIndex, selectedId) {
		var tab = $("<li class='tab'></li>").appendTo(target);
		var box = $("<div class='box'></div>").appendTo(tab);
		this.renderOneData($, box, data, index);

		data = data || {};
		if (typeof data === "string")
			data = {name: data, label: data};

		if (Utils.isNotBlank(data.name))
			tab.attr("name", data.name);
		if (Utils.isTrue(data.closable)) {
			tab.addClass("closable");
			tab.append("<i class='close'></i>");
		}
		if (Utils.isTrue(data.disabled))
			tab.addClass("disabled");
		if (this.isDataSelected(data, index, selectedIndex, selectedId))
			tab.addClass("selected");

		return tab;
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
		Renderer.renderItems = renderTabItems;
		VRender.Component.Render.tabbar = Renderer;
	}

})(typeof VRender === "undefined");