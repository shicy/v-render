// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (VRender.Component.Button)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ButtonRender = Component.Render.button;

	///////////////////////////////////////////////////////
	var UIButton = window.UIButton = Component.Button = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIButton = UIButton.prototype = new Component.base();

	UIButton.find = function (view) {
		return Component.find(view, ".ui-btn", UIButton);
	};

	UIButton.create = function (options) {
		return Component.create(options, UIButton, ButtonRender);
	};

	// ====================================================
	// Component.register(".ui-btn", UIButton); // 默认先不实例化

})();
