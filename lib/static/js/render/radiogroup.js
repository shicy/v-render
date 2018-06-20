// ========================================================
// 单选框组
// @author shicy <shicy85@163.com>
// Create on 2018-01-26
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.radiogroup)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;
	var UIRadiobox = backend ? require("../../../ui/component/UIRadiobox"): VRender.Component.Radiobox;

	var globleGroupID = 1;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._select.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._select();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-radgrp");
		this.radioGroupId = "rad-" + Utils.randomTxt(backend ? 3 : 4) + globleGroupID++;
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
		return false;
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
		if (Utils.isPrimitive(data))
			data = {label: data};
		var params = Utils.extend({}, data);
		params.name = this.radioGroupId;
		params.value = this._getDataKey(data);
		params.label = this._getDataLabel(data, index);
		params.checked = this._isSelected(data, index, this._cache_selected_indexs, this._cache_selected_ids);
		if (backend) {
			return new UIRadiobox(this.context, params).render(item);
		}
		else {
			params.target = item;
			return UIRadiobox.create(params);
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