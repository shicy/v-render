// ========================================================
// 复选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-02
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Checkbox)
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
		target.addClass("ui-chkbox");

		var options = this.options || {};

		var input = $("<input type='checkbox'/>").appendTo(target);

		if (Utils.isNotNull(options.value))
			input.val(options.value);

		if (Utils.isTrue(options.checked)) {
			target.addClass("checked");
			input.attr("checked", "checked");
		}

		if (Utils.isNotNull(options.label))
			target.append("<span>" + options.label + "</span>");

		input.attr("name", options.name);

		return this;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UICheckbox = Component.Checkbox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		this.input = this.$el.children("input");

		var self = this;
		this.input.change(function (e) { return chkboxChangeHandler.call(self, e); });
	};
	var _UICheckbox = UICheckbox.prototype = new Component.base();

	UICheckbox.find = function (view) {
		return Component.find(view, ".ui-chkbox", UICheckbox);
	};

	UICheckbox.create = function (options) {
		options = $.extend({}, options, {tagName: "label"});
		return Component.create(options, UICheckbox, Holder);
	};

	// ====================================================
	_UICheckbox.val = function (value) {
		if (Utils.isNull(value))
			return this.input.val();
		this.input.val(value);
		return this;
	};

	_UICheckbox.isChecked = function () {
		return this.input.isChecked();
	};

	_UICheckbox.setChecked = function (bool) {
		var checked = Utils.isNull(bool) ? true : Utils.isTrue(bool);
		this.input[0].checked = checked;
		this.input.trigger("change");
	};

	// ====================================================
	// 复选框状态变更事件
	var chkboxChangeHandler = function (e) {
		if ($(e.currentTarget).is(":checked"))
			this.$el.addClass("checked");
		else
			this.$el.removeClass("checked");
	};

	// ====================================================
	Component.register(".ui-chkbox", UICheckbox);

})(typeof VRender !== "undefined");
