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
		initPager.call(this);
	};
	var _UIListView = UIListView.prototype = new Component.list();

	UIListView.find = function (view) {
		return Component.find(view, ".ui-listview", UIListView);
	};

	UIListView.create = function (options) {
		return Component.create(options, UIListView, ListViewRender);
	};

	// ====================================================
	_UIListView.isChkboxVisible = function () {
		return this.$el.is(".show-chkbox");
	};

	_UIListView.getPaginator = function () {
		return Component.list.getPager.call(this);
	};

	_UIListView.setPaginator = function (pager) {
		Component.list.setPager.call(this, pager);
	};

	// ====================================================
	_UIListView._getItemContainer = function () {
		return this.$el.children("ul");
	};

	_UIListView._renderOneItem = function ($, item, data, index, bSelected) {
		ListViewRender.renderOneItem.call(this, $, item, data, index, bSelected);
	};

	// ====================================================
	var initPager = function () {
		Component.list.initPager.call(this);
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-listview", UIListView);

})();