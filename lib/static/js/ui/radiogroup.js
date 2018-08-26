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
		if (!Component.base.isElement(view))
			return UIRadioGroup.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);
		
		this.$el.on("change", "input", selectedChangeHandler.bind(this));
	};
	var _UIRadioGroup = UIRadioGroup.prototype = new Component.select();

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

	_UIRadioGroup.isMultiple = function () {
		return false;
	};

	_UIRadioGroup.isDisabled = function (value) {
		if (typeof value == "number") {
			var radbox = Component.get(this._getItemAt(value).children());
			return radbox ? radbox.isDisabled() : false;
		}
		if (typeof value == "string") {
			return this.isDisabled(this.getIndexByName(value));
		}
		return this.$el.is(".disabled");
	};
	_UIRadioGroup.setDisabled = function (disabled, value) {
		if (typeof value == "string") {
			return this.setDisabled(disabled, this.getIndexByName(value));
		}
		if (typeof value == "number") {
			var radbox = Component.get(this._getItemAt(value).children());
			radbox && radbox.setDisabled(disabled);
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
	_UIRadioGroup._getItems = function () {
		return this.$el.children();
	};

	_UIRadioGroup._getNewItem = function ($, itemContainer, data, index) {
		return RadioGroupRender.getNewItem.call(this, $, itemContainer, data, index);
	};

	_UIRadioGroup._renderItems = function ($, itemContainer, datas) {
		RadioGroupRender.renderItems.call(this, $, itemContainer, datas);
	};

	_UIRadioGroup._renderOneItem = function ($, item, data, index) {
		RadioGroupRender.renderOneItem.call(this, $, item, data, index);
	};

	// ====================================================
	var selectedChangeHandler = function (e) {
		e.stopPropagation();
		var snapshoot = this._snapshoot();
		var index = Utils.index(this.$el.find("input"), function (input) {
			return input.is(":checked");
		});
		Component.select.setSelectedIndex.call(this, index);
		snapshoot.done();
	};

	// ====================================================
	Component.register(".ui-radgrp", UIRadioGroup);

})();