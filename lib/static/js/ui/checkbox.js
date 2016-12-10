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

	var Holder = function (options) {
		this.options = options || {};
		this.setLabel(this.options.label);
		this.setValue(this.options.value);
		this.setName(this.options.name);
		this.setChecked(this.options.checked);
	};
	var _Holder = Holder.prototype = new Object();

	_Holder.render = function ($, target) {
		target.addClass("ui-chkbox");

		var input = $("<input type='checkbox'/>").appendTo(target);

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
	};

	// ====================================================
	_Holder.getLabel = function () {
		return this.c_label;
	};
	_Holder.setLabel = function (value) {
		this.c_label = value;
	};

	_Holder.getValue = function () {
		return this.c_value;
	};
	_Holder.setValue = function (value) {
		this.c_value = value;
	};

	_Holder.getName = function () {
		return this.c_name;
	};
	_Holder.setName = function (value) {
		this.c_name = value;
	};

	_Holder.isChecked = function () {
		if (Utils.isBlank(this.c_checked))
			return false;
		return Utils.isTrue(this.c_checked);
	};
	_Holder.setChecked = function (bool) {
		this.c_checked = bool;
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
		options = $.extend(options, {tagName: "label"});
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UICheckbox(target, options, holder);
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
