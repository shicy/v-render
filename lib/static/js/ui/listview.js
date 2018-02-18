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

		var list = this.list = this.$el.children("ul");

		list.on("tap", "li", itemClickHandler.bind(this));
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
	var itemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.parent().is(this.list)) {
			if (item.is(".disabled"))
				return ;

			var snapshoot = this._snapshoot();

			if (item.is(".selected")) {
				item.removeClass("selected");
			}
			else {
				item.addClass("selected");
				if (!this.isMultiple())
					item.siblings().removeClass("selected");
			}

			var indexs = Utils.map(this.list.children(".selected"), function (item) {
				return item.index();
			});
			Component.list.setSelectedIndex.call(this, indexs);

			snapshoot.done();
		}
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-listview", UIListView);

})();