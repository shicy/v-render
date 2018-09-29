// ========================================================
// 时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-09-29
// ========================================================

(function () {
	if (VRender.Component.TimeInput)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var TimeInputRender = Renderer.timeinput;

	///////////////////////////////////////////////////////
	var UITimeInput = window.UITimeInput = Component.TimeInput = function (view, options) {
		if (!Component.base.isElement(view))
			return UITimeInput.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UITimeInput = UITimeInput.prototype = new Component.base();

	UITimeInput.find = function (view) {
		return Component.find(view, ".ui-timeipt", UITimeInput);
	};

	UITimeInput.create = function (options) {
		return Component.create(options, UITimeInput, TimeInputRender);
	};

	// ====================================================
	_UITimeInput.isNative = function () {
		return this.$el.attr("opt-native") == 1;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-timeipt", UITimeInput);

})();