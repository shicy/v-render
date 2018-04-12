// ========================================================
// 弹出菜单
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================


(function () {
	if (VRender.Component.PopupMenu)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var PopupMenuRender = Component.Render.popupmenu;

	///////////////////////////////////////////////////////
	var UIPopupMenu = window.UIPopupMenu = Component.PopupMenu = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);
		doInit.call(this);
	};
	var _UIPopupMenu = UIPopupMenu.prototype = new Component.base();

	UIPopupMenu.find = function (view) {
		return Component.find(view, ".ui-popupmenu", UIPopupMenu);
	};

	UIPopupMenu.create = function (options) {
		return Component.create(options, UIPopupMenu, PopupMenuRender);
	};

	
	// ====================================================
	var doInit = function () {
	};

	


	///////////////////////////////////////////////////////
	Component.register(".ui-panel", UIPopupMenu);

})();