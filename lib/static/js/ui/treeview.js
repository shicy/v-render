// ========================================================
// 树
// @author shicy <shicy85@163.com>
// Create on 2018-03-29
// ========================================================

(function () {
	if (VRender.Component.Tree)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var TreeViewRender = Component.Render.treeview;

	///////////////////////////////////////////////////////
	var UITreeView = window.UITreeView = Component.Tree = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

	};
	var _UITreeView = UITreeView.prototype = new Component.list();

	UITreeView.find = function (view) {
		return Component.find(view, ".ui-treeview", UITreeView);
	};

	UITreeView.create = function (options) {
		return Component.create(options, UITreeView, TreeViewRender);
	};

	// ====================================================
	

	// ====================================================
	

	///////////////////////////////////////////////////////
	Component.register(".ui-treeview", UITreeView);

})();