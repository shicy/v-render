// ========================================================
// 前后端（通用）渲染方法
// @author shicy <shicy85@163.com>
// Create on 2017-12-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.dropdownlist)
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
		target.addClass("ui-dropdownlist");
		target.append("<ul></ul>");
		
		ListRenderer.render.call(this, $, target);

		if (this.isMultiple())
			target.attr("multiple", "multiple");

		return this;
	};

	_Renderer.renderItems = function ($, target) {
		var list = target.children("ul").empty();
		renderItems.call(this, $, list, this.getData());
	};

	_Renderer.renderOneItem = function ($, item, data, index, bSelected) {
		ListRenderer.renderOneItem.call(this, $, item, null, data, index, bSelected);
	};

	// ====================================================
	var renderItems = function ($, target, datas) {
		var self = this;
		var index = 0;
		var isPrevGroup = false;

		// 缓存防止反复获取
		var selectedIndex = this.getSelectedIndex(true);
		var selectedId = this.getSelectedId(true) || []; // []确保不会重复获取

		var addItem = function (data) {
			var item = $("<li class='item'></li>").appendTo(target);
			var bSelected = self.isSelected(data, index, selectedIndex, selectedId);
			self.renderOneItem($, item, data, index, bSelected);
			item.attr(self.getMapData(data));
			if (!backend)
				item.data("itemData", data);
		};

		var addSeparator = function () {
			target.append("<li class='sep'></li>");
		};

		Utils.each(Utils.toArray(datas), function (data) {
			if (Utils.isArray(data)) {
				if (index > 0)
					addSeparator();
				Utils.each(data, function (temp) {
					addItem(temp);
					index += 1;
				});
				isPrevGroup = true;
			}
			else {
				if (isPrevGroup)
					addSeparator();
				addItem(data);
				isPrevGroup = false;
				index += 1;
			}
		});
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.renderItems = renderItems;
		VRender.Component.Render.dropdownlist = Renderer;
	}

})(typeof VRender === "undefined");
