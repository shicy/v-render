// ========================================================
// 列表
// @author shicy <shicy85@163.com>
// Create on 2018-01-07
// ========================================================

(function () {
	if (VRender.Component.ListView)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var ListViewRender = Component.Render.listview;

	///////////////////////////////////////////////////////
	var UIListView = window.UIListView = Component.ListView = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIListView = UIListView.prototype = new Component.list();

	UIListView.find = function (view) {
		return Component.find(view, ".ui-listview", UIListView);
	};

	UIListView.create = function (options) {
		return Component.create(options, UIListView, ListViewRender);
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-listview", UIListView);

})();