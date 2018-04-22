// ========================================================
// 滚动加载
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function () {
	if (VRender.Component.ScrollBox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ScrollBoxRender = Component.Render.scrollbox;

	///////////////////////////////////////////////////////
	var UIScrollBox = window.UIScrollBox = Component.ScrollBox = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIScrollBox = UIScrollBox.prototype = new Component.base();

	UIScrollBox.find = function (view) {
		return Component.find(view, ".ui-scrollbox", UIScrollBox);
	};

	UIScrollBox.create = function (options) {
		return Component.create(options, UIScrollBox, ScrollBoxRender);
	};


	// ====================================================
	Component.register(".ui-scrollbox", UIScrollBox);

})();