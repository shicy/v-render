// ========================================================
// 单选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

(function () {
	if (VRender.Component.Radiobox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var RadioboxRender = Component.Render.radiobox;

	///////////////////////////////////////////////////////
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
		return Component.create(options, UIRadiobox, RadioboxRender);
	};

	// ====================================================
	_UIRadiobox.val = function (value) {
		if (Utils.isNotBlank(value)) {
			this.input.val(value);
		}
		return this.input.val();
	};

	_UIRadiobox.isChecked = function () {
		return this.input.is(":checked");
	};

	_UIRadiobox.setChecked = function (bool) {
		var checked = Utils.isNull(bool) ? true : Utils.isTrue(bool);
		if (this.isChecked() != checked) {
			this.input[0].checked = checked;
			this.input.trigger("change");
		}
	};

	// ====================================================
	var radboxChangeHandler = function (e) {
		var _isChecked = this.isChecked();
		if (_isChecked) {
			this.input.parent().addClass("checked");
			var name = this.input.attr("name");
			if (Utils.isNotBlank(name)) {
				var radios = $("input[name='" + name + "']").not(this.input);
				radios.parent().removeClass("checked");
			}
		}
		else {
			this.$el.removeClass("checked");
		}
		this.trigger("change");
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-radbox", UIRadiobox);

})();
