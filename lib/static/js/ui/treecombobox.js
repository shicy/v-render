// ========================================================
// 树形下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2018-08-12
// ========================================================


(function () {
	if (VRender.Component.TreeCombobox)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var TreeComboboxRender = Renderer.treecombobox;

	///////////////////////////////////////////////////////
	var UITreeCombobox = window.UITreeCombobox = Component.TreeCombobox = function (view, options) {
		if (!Component.base.isElement(view))
			return UITreeCombobox.create(view);
		
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UITreeCombobox = UITreeCombobox.prototype = new Component.select();

	UITreeCombobox.find = function (view) {
		return Component.find(view, ".ui-treecombobox", UITreeCombobox);
	};

	UITreeCombobox.create = function (options) {
		return Component.create(options, UITreeCombobox, TreeComboboxRender);
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-treecombobox", UITreeCombobox);

})();