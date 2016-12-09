// ========================================================
// 复选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-02
// ========================================================

(function (isFront) {
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;

	var Holder = function (options) {
		this.options = options || {};
		this.setLabel(this.options.label);
		this.setValue(this.options.value);
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

	if (VRender.Component.Checkbox)
		return ;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UICheckbox = Component.Checkbox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		var self = this;
		this.$el.on("change", "input", function (e) { return self.chkboxChangeHandler(e); });
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

	// 复选框状态变更事件
	_UICheckbox.chkboxChangeHandler = function (e) {
		if ($(e.currentTarget).is(":checked"))
			this.$el.addClass("checked");
		else
			this.$el.removeClass("checked");
	};

	// ====================================================
	Component.register(".ui-chkbox", UICheckbox);

})(typeof VRender !== "undefined");
