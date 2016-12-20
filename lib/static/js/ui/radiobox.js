// ========================================================
// 单选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Radiobox)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setLabel(this.options.label);
		this.setValue(this.options.value);
		this.setName(this.options.name);
		this.setChecked(this.options.checked);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		
		target.addClass("ui-radbox");

		var input = $("<input type='radio'/>").appendTo(target);

		var value = this.getValue();
		if (Utils.isNotNull(value))
			input.val(this.getValue());

		if (this.isChecked()) {
			target.addClass("checked");
			input.attr("checked", "checked");
		}

		var label = this.getLabel();
		if (Utils.isNotNull(label))
			target.append("<span>" + label + "</span>");

		var name = this.getName();
		if (Utils.isNotBlank(name))
			input.attr("name", name);

		return this;
	};

	// ====================================================
	_Holder.getLabel = function () {
		return this.r_label;
	};
	_Holder.setLabel = function (value) {
		this.r_label = value;
	};

	_Holder.getValue = function () {
		return this.r_value;
	};
	_Holder.setValue = function (value) {
		this.r_value = value;
	};

	_Holder.getName = function () {
		return this.r_name;
	};
	_Holder.setName = function (value) {
		this.r_name = value;
	};

	_Holder.isChecked = function () {
		if (Utils.isBlank(this.r_checked))
			return false;
		return Utils.isTrue(this.r_checked);
	};
	_Holder.setChecked = function (bool) {
		this.r_checked = bool;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIRadiobox = Component.Radiobox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.input = this.$el.children("input");

		var self = this;
		this.input.change(function (e) { radboxChangeHandler.call(self, e); });

		if (this.input.is(":checked"))
			this.input.trigger("change");
	};
	var _UIRadiobox = UIRadiobox.prototype = new Component.base();

	UIRadiobox.find = function (view) {
		return Component.find(view, ".ui-radbox", UIRadiobox);
	};

	UIRadiobox.create = function (options) {
		options = $.extend(options, {tagName: "label"});
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIRadiobox(target, options, holder);
	};

	// ====================================================
	_UIRadiobox.val = function (value) {
		if (Utils.isNull(value))
			return this.input.val();
		this.input.val(value);
		return this;
	};

	_UIRadiobox.isChecked = function () {
		return this.input.is(":checked");
	};

	_UIRadiobox.setChecked = function (bool) {
		var checked = Utils.isNull(bool) ? true : Utils.isTrue(bool);
		this.input[0].checked = checked;
		this.input.trigger("change");
	};

	// ====================================================
	var radboxChangeHandler = function (e) {
		var input = $(e.currentTarget);
		if (input.is(":checked")) {
			input.parent().addClass("checked");
			var name = input.attr("name");
			if (Utils.isNotBlank(name)) {
				var radios = $("input[name='" + name + "']").not(input);
				radios.parent().removeClass("checked");
			}
		}
		else {
			input.parent().removeClass("checked");
		}
	};

	// ====================================================
	Component.register(".ui-radbox", UIRadiobox);

})(typeof VRender !== "undefined");
