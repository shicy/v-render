// ========================================================
// 多选框组
// @author shicy <shicy85@163.com>
// Create on 2018-06-20
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.checkgroup)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;
	var UICheckbox = backend ? require("../../../ui/component/UICheckbox"): VRender.Component.Checkbox;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._select.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._select();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-chkgrp");
		BaseRender._select.render.call(this, $, target);
	};

	_Renderer.renderSelection = function ($, target) {
		var indexs = this.getSelectedIndex(true);
		if (indexs)
			target.attr("data-inds", indexs.join(","));

		var ids = this.getSelectedKey(true);
		if (ids)
			target.attr("data-ids", ids.join(","));
	};

	_Renderer.isMultiple = function () {
		return true;
	};

	_Renderer._renderItems = function ($, target) {
		var itemContainer = this._getItemContainer($, target);
		if (itemContainer) {
			renderItems.call(this, $, itemContainer);
		}
	};

	_Renderer._renderOneItem = function ($, item, data, index) {
		renderOneItem.call(this, $, item, data, index);
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
	var getNewItem = function ($, target) {
		return $("<div class='item'></div>").appendTo(target);
	};

	var renderItems = function ($, itemContainer, datas) {
		this._cache_selected_indexs = this.getSelectedIndex(true);
		this._cache_selected_ids = this.getSelectedKey(true) || [];
		BaseRender._item.renderItems.call(this, $, itemContainer, datas);
		delete this._cache_selected_indexs;
		delete this._cache_selected_ids;
	};

	var renderOneItem = function ($, item, data, index) {
		if (typeof data == "string")
			data = {label: data};
		var params = Utils.extend({}, data);
		params.value = this._getDataKey(data);
		params.label = this._getDataLabel(data, index);
		params.checked = this._isSelected(data, index, this._cache_selected_indexs, this._cache_selected_ids);
		if (backend) {
			return new UICheckbox(this.context, params).render(item);
		}
		else {
			params.target = item;
			return UICheckbox.create(params);
		}
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getNewItem = getNewItem;
		Renderer.renderItems = renderItems;
		Renderer.renderOneItem = renderOneItem;
		VRender.Component.Render.checkgroup = Renderer;
	}

})(typeof VRender === "undefined");