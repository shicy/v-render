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

	Renderer.getData = function () {
		this.options.data = doAdapter.call(this, this.options.data);
		var results = [];
		Utils.each(this.options.data, function (data) {
			Utils.each(data, function (temp) {
				results.push(temp);
			});
		});
		return results;
	};

	Renderer.renderData = function ($, target) {
		if (backend) {
			this.options.data = doAdapter.call(this, this.options.data);
			var self = this;
			var datas = Utils.map(this.options.data, function (data) {
				return Utils.map(data, function (temp) {
					return self.getMapData(temp);
				});
			});
			ListRenderer.renderData.call(this, $, target, datas);
		}
	};

	Renderer.dataFormat = function (data) {
		var datas = [], tempArr = [];
		Utils.each(Utils.toArray(data), function (temp) {
			if (Utils.isArray(temp)) {
				if (tempArr.length > 0) {
					datas.push(tempArr);
					tempArr = [];
				}
				datas.push(temp);
			}
			else {
				tempArr.push(temp);
			}
		});
		if (tempArr.length > 0)
			datas.push(tempArr);
		return datas;
	};

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-dropdownlist");

		target.append("<div class='items'></div>");
		if (this.isMultiple())
			target.attr("multiple", "multiple");
		
		this.options.data = Renderer.dataFormat.call(this, this.options.data);
		ListRenderer.render.call(this, $, target);

		return this;
	};

	_Renderer.getData = function () {
		return Renderer.getData.call(this);
	};

	_Renderer.renderData = function ($, target) {
		Renderer.renderData.call(this, $, target);
	};

	// ====================================================
	_Renderer._renderItems = function ($, target) {
		var list = target.children(".items").empty();
		this.options.data = doAdapter.call(this, this.options.data);
		renderItems.call(this, $, list, this.options.data);
	};

	_Renderer._renderOneItem = function ($, item, data, index, bSelected) {
		ListRenderer.renderOneItem.call(this, $, item, null, data, index, bSelected);
	};

	// ====================================================
	var renderItems = function ($, target, datas) {
		var self = this;
		var index = 0;

		// 缓存防止反复获取
		var selectedIndex = this.getSelectedIndex(true);
		var selectedId = this.getSelectedId(true) || []; // []确保不会重复获取

		var addItem = function (group, data) {
			var item = $("<div class='item'></div>").appendTo(group);
			var bSelected = self._isSelected(data, index, selectedIndex, selectedId);
			self._renderOneItem($, item, data, index, bSelected);
			item.attr(self.getMapData(data));
			if (backend) {
				self.renderItemData($, item, data);
			}
			else {
				item.data("itemData", data);
			}
		};

		Utils.each(Utils.toArray(datas), function (data) {
			if (Utils.isArray(data) && data.length > 0) {
				var group = $("<div class='grp'></div>").appendTo(target);
				Utils.each(data, function (temp) {
					addItem(group, temp);
					index += 1;
				});
			}
		});
	};

	var doAdapter = function (data) {
		var datas = Utils.toArray(data);
		if (datas._vr_adapter_flag)
			return datas;

		var self = this, _index = 0;
		if (Utils.isFunction(this._doAdapter)) {
			datas = Utils.map(datas, function (data) {
				return Utils.map(data, function (temp) {
					return self._doAdapter(temp, _index++);
				});
			});
			datas._vr_adapter_flag = true;
		}

		return datas;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.doAdapter = doAdapter;
		Renderer.renderItems = renderItems;
		VRender.Component.Render.dropdownlist = Renderer;
	}

})(typeof VRender === "undefined");
