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

	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-radbox");

		var options = this.options || {};

		var input = $("<input type='radio'/>").appendTo(target);

		if (Utils.isNotNull(options.value))
			input.val(options.value);

		if (Utils.isTrue(options.checked)) {
			target.addClass("checked");
			input.attr("checked", "checked");
		}

		if (Utils.isNotNull(options.label))
			target.append("<span>" + options.label + "</span>");

		if (Utils.isNotBlank(options.name))
			input.attr("name", options.name);

		return this;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIRadiobox = window.UIRadiobox = Component.Radiobox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.input = this.$el.children("input");
		this.input.on("change", radboxChangeHandler.bind(this));

		if (this.input.is(":checked"))
			this.input.trigger("change");
	};
	var _UIRadiobox = UIRadiobox.prototype = new Component.base();

	UIRadiobox.find = function (view) {
		return Component.find(view, ".ui-radbox", UIRadiobox);
	};

	UIRadiobox.create = function (options) {
		options = $.extend(options, {tagName: "label"});
		return Component.create(options, UIRadiobox, Holder);
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
