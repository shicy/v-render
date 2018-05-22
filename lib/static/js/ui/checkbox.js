// ========================================================
// 复选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-02
// ========================================================

(function () {
	if (VRender.Component.Checkbox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var CheckboxRender = Component.Render.checkbox;

	///////////////////////////////////////////////////////
	var UICheckbox = window.UICheckbox = Component.Checkbox = function (view, options) {
		if (!Component.base.isElement(view))
			return UICheckbox.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		this.input = this.$el.children("input");

		this.input.on("change", chkboxChangeHandler.bind(this));
	};
	var _UICheckbox = UICheckbox.prototype = new Component.base();

	UICheckbox.find = function (view) {
		return Component.find(view, ".ui-chkbox", UICheckbox);
	};

	UICheckbox.create = function (options) {
		options = $.extend({}, options, {tagName: "label"});
		return Component.create(options, UICheckbox, CheckboxRender);
	};

	// ====================================================
	_UICheckbox.val = function (value) {
		if (Utils.isNotNull(value)) {
			this.input.val(value);
		}
		return this.input.val();
	};

	_UICheckbox.isChecked = function () {
		return this.input.is(":checked");
	};

	_UICheckbox.setChecked = function (bool) {
		var checked = Utils.isNull(bool) ? true : Utils.isTrue(bool);
		this.input[0].checked = checked;
		this.input.trigger("change");
	};

	_UICheckbox.getLabel = function () {
		return this.$el.children("span").text();
	};

	_UICheckbox.setLabel = function (value) {
		this.$el.children("span").remove();
		if (Utils.isNotBlank(value))
			$("<span></span>").appendTo(this.$el).text(value);
	};

	// ====================================================
	// 复选框状态变更事件
	var chkboxChangeHandler = function (e) {
		if ($(e.currentTarget).is(":checked"))
			this.$el.addClass("checked");
		else
			this.$el.removeClass("checked");
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-chkbox", UICheckbox);

})();