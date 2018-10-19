// ========================================================
// 边框容器
// @author shicy <shicy85@163.com>
// Create on 2017-12-18
// ========================================================

(function () {
	if (VRender.Component.Container)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ContainerRender = Component.Render.container;

	///////////////////////////////////////////////////////
	var UIContainer = window.UIContainer = Component.Container = function (view, options) {
		if (!Component.base.isElement(view))
			return UIContainer.create(view);
		
		if (this.init(view, options) != this)
			return Component.get(view);
	};
	var _UIContainer = UIContainer.prototype = new Component.base();

	UIContainer.find = function (view) {
		return Component.find(view, ".ui-container", UIContainer);
	};

	UIContainer.create = function (options) {
		return Component.create(options, UIContainer, ContainerRender);
	};

	UIContainer.instance = function (target) {
		return Component.instance(target, ".ui-container");
	};

	// ====================================================
	// Component.register(".ui-container", UIContainer); // 默认不实例化

})();