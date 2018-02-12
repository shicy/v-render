// ========================================================
// 单选组，确保组内只有一个被选中
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

(function () {
	if (VRender.Component.RadioGroup)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var RadioGroupRender = Component.Render.radiogroup;

	///////////////////////////////////////////////////////
	var UIRadioGroup = window.UIRadioGroup = Component.RadioGroup = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
		this.$el.on("change", "input", selectedChangeHandler.bind(this));
	};
	var _UIRadioGroup = UIRadioGroup.prototype = new Component.list();

	UIRadioGroup.find = function (view) {
		return Component.find(view, ".ui-radgrp", UIRadioGroup);
	};

	UIRadioGroup.create = function (options) {
		return Component.create(options, UIRadioGroup, RadioGroupRender);
	};

	// ====================================================
	_UIRadioGroup.setSelectedIndex = function (value) {
		var snapshoot = this._snapshoot();
		var index = Utils.getIndexValue(value);
		if (index >= 0) {
			Component.get(this.$el.children().eq(index).children()).setChecked(true);
		}
		else if (snapshoot.selectedIndex >= 0) {
			Component.get(this.$el.children().eq(snapshoot.selectedIndex).children()).setChecked(false);
		}
		snapshoot.done();
	};

	// ====================================================
	_UIRadioGroup._getItems = function () {
		return this.$el.children();
	};

	_UIRadioGroup._getNewItem = function ($, itemContainer, data, index) {
		return RadioGroupRender.getNewItem.call(this, $, itemContainer, data, index);
	};

	_UIRadioGroup._renderOneItem = function ($, item, data, index, bSelected) {
		RadioGroupRender.renderOneItem.call(this, $, item, data, index, bSelected);
	};

	// ====================================================
	var selectedChangeHandler = function (e) {
		var snapshoot = this._snapshoot();
		var index = Utils.index(this.$el.find("input"), function (input) {
			return input.is(":checked");
		});
		Component.list.setSelectedIndex.call(this, index);
		snapshoot.done();
	};

	// ====================================================
	Component.register(".ui-radgrp", UIRadioGroup);

})();
