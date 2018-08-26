// ========================================================
// 多选组
// @author shicy <shicy85@163.com>
// Create on 2018-06-20
// ========================================================

(function () {
	if (VRender.Component.CheckGroup)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var CheckGroupRender = Renderer.checkgroup;

	///////////////////////////////////////////////////////
	var UICheckGroup = window.UICheckGroup = Component.CheckGroup = function (view, options) {
		if (!Component.base.isElement(view))
			return UICheckGroup.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);
		
		this.$el.on("change", "input", selectedChangeHandler.bind(this));
	};
	var _UICheckGroup = UICheckGroup.prototype = new Component.select();

	UICheckGroup.find = function (view) {
		return Component.find(view, ".ui-chkgrp", UICheckGroup);
	};

	UICheckGroup.create = function (options) {
		return Component.create(options, UICheckGroup, CheckGroupRender);
	};

	// ====================================================
	_UICheckGroup.setSelectedIndex = function (value) {
		var snapshoot = this._snapshoot();
		var indexs = Renderer.fn.getIntValues(value, 0) || [];
		Utils.each(this.$el.children(), function (item, i) {
			var chkbox = Component.get(item.children());
			chkbox.setChecked(indexs.indexOf(i) >= 0);
		});
		snapshoot.done();
	};

	_UICheckGroup.isMultiple = function () {
		return true;
	};

	_UICheckGroup.isDisabled = function (value) {
		if (typeof value == "number") {
			var chkbox = Component.get(this._getItemAt(value).children());
			return chkbox ? chkbox.isDisabled() : false;
		}
		if (typeof value == "string") {
			return this.isDisabled(this.getIndexByName(value));
		}
		return this.$el.is(".disabled");
	};
	_UICheckGroup.setDisabled = function (disabled, value) {
		if (typeof value == "string") {
			return this.setDisabled(disabled, this.getIndexByName(value));
		}
		if (typeof value == "number") {
			var chkbox = Component.get(this._getItemAt(value).children());
			chkbox && chkbox.setDisabled(disabled);
		}
		else {
			disabled = (Utils.isNull(disabled) || Utils.isTrue(disabled)) ? true : false;
			if (disabled)
				this.$el.addClass("disabled").attr("disabled", "disabled");
			else
				this.$el.removeClass("disabled").removeAttr("disabled");
		}
	};

	// ====================================================
	_UICheckGroup._getItems = function () {
		return this.$el.children();
	};

	_UICheckGroup._getNewItem = function ($, itemContainer, data, index) {
		return CheckGroupRender.getNewItem.call(this, $, itemContainer, data, index);
	};

	_UICheckGroup._renderItems = function ($, itemContainer, datas) {
		CheckGroupRender.renderItems.call(this, $, itemContainer, datas);
	};

	_UICheckGroup._renderOneItem = function ($, item, data, index) {
		CheckGroupRender.renderOneItem.call(this, $, item, data, index);
	};

	// ====================================================
	var selectedChangeHandler = function (e) {
		e.stopPropagation();
		var snapshoot = this._snapshoot();
		var indexs = [];
		Utils.each(this.$el.find("input"), function (input, i) {
			if (input.is(":checked"))
				indexs.push(i);
		});
		Component.select.setSelectedIndex.call(this, indexs);
		snapshoot.done();
	};

	// ====================================================
	Component.register(".ui-chkgrp", UICheckGroup);

})();