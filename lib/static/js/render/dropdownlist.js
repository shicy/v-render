// ========================================================
// 前后端（通用）渲染方法
// @author shicy <shicy85@163.com>
// Create on 2017-12-12
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.dropdownlist)
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
		target.addClass("ui-dropdownlist");

		if (this.isMultiple())
			target.attr("multiple", "multiple");

		return this;
	};

	_Renderer.renderData = function ($, target) {
		var list = $("<ul></ul>").appendTo(target);
		renderItems.call(this, $, list, this.getData());
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
			var content = self.renderOneData($, item, data, index);
			if (Utils.isNotNull(content))
				item.html(content);
			if (self.isDataSelected(data, index, selectedIndex, selectedId))
				item.addClass("selected");
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
