// ========================================================
// 单选组，确保组内只有一个被选中
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.RadioGroup)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderItems = (isFront ? VRender.Component : require("./base")).HolderItems;

	var globleGroupID = 1;

	var Holder = function (context, options) {
		HolderItems.call(this, context, options);
		this.radioGroupId = Utils.randomTxt(3) + globleGroupID++;
	};
	var _Holder = Holder.prototype = new HolderItems();

	_Holder.render = function ($, target) {
		HolderItems.render.call(this, $, target);
		target.addClass("ui-radgrp");
		var self = this;
		Utils.each(this.getData(), function (data, i) {
			if (Utils.isNull(data))
				return ;
			if (typeof data === "string")
				data = {label: data};
			renderItem.call(self, $, target, data, i);
		});
		return this;
	};

	// ====================================================
	var renderItem = function ($, target, data, index) {
		var options = {};
		options.name = "radgrp-" + this.radioGroupId;
		options.label = this.getDataLabel(data, index);
		options.value = this.getDataId(data);
		options.checked = this.isDataSelected(data, index);
		if (isFront) {
			options.target = target;
			VRender.Component.Radiobox.create(options);
		}
		else {
			var UIRadiobox = require("../../../ui/component/UIRadiobox");
			new UIRadiobox(this.context, options).render(target);
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIRadioGroup = Component.RadioGroup = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIRadioGroup = UIRadioGroup.prototype = new Component.base();

	UIRadioGroup.find = function (view) {
		return Component.find(view, ".ui-radgrp", UIRadioGroup);
	};

	UIRadioGroup.create = function (options) {
		return Component.create(options, UIRadioGroup, Holder);
	};

	// ====================================================
	_UIRadioGroup.getSelectedIndex = function () {
		var input = this.$el.find("input:checked");
		if (input && input.length > 0)
			return input.parent().index();
		return -1;
	};

	_UIRadioGroup.setSelectedIndex = function (index) {
		index = parseInt(index);
		var items = this.$el.children();
		if (!isNaN(index) && index >= 0 && index < items.length) {
			var input = items.eq(index).find("input");
			input[0].checked = true;
			input.trigger("change");
		}
	};

	_UIRadioGroup.getSelectedId = function () {
		var input = this.$el.find("input:checked");
		if (input && input.length > 0)
			return input.val();
		return null;
	};

	_UIRadioGroup.setSelectedId = function (value) {
		var items = this.$el.children();
		for (var i = 0, l = items.length; i < l; i++) {
			var input = items.eq(i).find("input");
			if (input.val() == value) {
				input[0].checked = true;
				input.trigger("change");
				return ;
			}
		}
	};

	// ====================================================
	Component.register(".ui-radgrp", UIRadioGroup);

})(typeof VRender !== "undefined");
