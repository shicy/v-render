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

		this.$el.on("tap", ".tree-node", onNodeClickHandler.bind(this));
		this.$el.on("tap", ".tree-node > .ep", onExpandClickHandler.bind(this));
		this.$el.on("tap", ".tree-node > .chkbox", onChkboxClickHandler.bind(this));

		// 随着节点展开和关闭，索引值一直会变
		// this.$el.removeAttr("data-inds").removeAttr("data-ids");
	};
	var _UITreeView = UITreeView.prototype = new Component.list();

	UITreeView.find = function (view) {
		return Component.find(view, ".ui-treeview", UITreeView);
	};

	UITreeView.create = function (options) {
		return Component.create(options, UITreeView, TreeViewRender);
	};

	// ====================================================
	_UITreeView.isChkboxVisible = function () {
		return this.$el.attr("opt-chk") == "1";
	};

	_UITreeView.getChildrenField = function () {
		return this.$el.attr("opt-child");
	};

	_UITreeView.getSelectedIndex = function (needArray, deep) {

	};

	_UITreeView.getSelectedId = function (needArray, deep) {

	};

	_UITreeView.getSelectedData = function (needArray, deep) {

	};

	_UITreeView.isAllSelected = function () {

	};

	// ====================================================
	_UITreeView._renderItems = function ($, itemContainer, datas) {
		TreeViewRender.renderItems.call(this, $, this.$el, itemContainer, datas);
	};

	_UITreeView._getItemContainer = function () {
		return this.$el.children("ul");
	};

	_UITreeView._getNewItem = function ($, itemContainer, data, index) {
		return TreeViewRender.getNewItem.call(this, $, itemContainer, data, index);
	};

	_UITreeView._isShowIcon = function () {
		return null;
	};

	_UITreeView._getOpenProps = function () {
		var params = {};
		var indexs = this.$el.attr("opt-openinds");
		if (Utils.isNotBlank(indexs)) {
			indexs = TreeViewRender.getOpenIndex.call(this, indexs);
			params.indexs = (indexs && indexs.length > 0) ? indexs : null;
		}
		var ids = this.$el.attr("opt-openids");
		if (Utils.isNotBlank(ids)) {
			ids = TreeViewRender.getOpenId.call(this, ids);
			params.ids = (ids && ids.length > 0) ? ids : null;
		}
		this.$el.removeAttr("opt-openinds").removeAttr("opt-openids");
		return params;
	};

	// ====================================================
	var onNodeClickHandler = function (e) {
		var node = $(e.currentTarget);
		if (!node.is(".active")) {
			this.$el.find(".tree-node.active").removeClass("active");
			node.addClass("active");
		}
	};

	var onExpandClickHandler = function (e) {
		var node = $(e.currentTarget).parent();
		var item = node.parent();
		if (item.is(".open")) {
			doNodeHideAnimate(item);
		}
		else {
			doNodeShowAnimate(item);
		}
		return false;
	};

	var onChkboxClickHandler = function (e) {
		var node = $(e.currentTarget).parent();
		var item = node.parent();
		setItemSelectedOrNot.call(this, item, !item.is(".selected"));
	};

	// ====================================================
	var setItemSelectedOrNot = function (item, beSelected) {
		var _isMultiple = this.isMultiple();
		if (beSelected) {
			if (item.is(".selected"))
				return ;
			if (!_isMultiple) {
				this.$el.find("li.selected").removeClass("selected");
				this.$el.find("li.selected_").removeClass("selected_");
			}
			item.addClass("selected").removeClass("selected_");
			if (_isMultiple) {
				setChildrenSelected(item, true);
				setParentSelected(item);
			}
			else { // 单选状态，设置父节点为半选
				while (true) {
					var container = item.parent();
					if (container.is(".root"))
						break;
					item = container.parent();
					item.addClass("selected_");
				}
			}
		}
		else {
			if (item.is(".selected"))
				item.removeClass("selected");
			else if (item.is(".selected_"))
				item.removeClass(".selected_");
			else
				return ;
			if (_isMultiple) {
				setChildrenSelected(item, false);
			}
			setParentSelected(item);
		}
	};

	var setChildrenSelected = function (item, beSelected) {
		Utils.each(item.children("ul").children(), function (item) {
			item.removeClass("selected_");
			if (beSelected)
				item.addClass("selected");
			else 
				item.removeClass("selected");
			setChildrenSelected(item, beSelected);
		});
	};

	var setParentSelected = function (item) {
		var container = item.parent();
		if (!container.is(".root")) {
			var hasSelected = false;
			var allSelected = true;
			Utils.each(container.children(), function (_item) {
				if (_item.is(".selected")) {
					hasSelected = true;
				}
				else if (_item.is(".selected_")) {
					hasSelected = true;
					allSelected = false;
				}
				else {
					allSelected = false;
				}
			});
			var parentItem = container.parent();
			parentItem.removeClass("selected").removeClass("selected_");
			if (allSelected)
				parentItem.addClass("selected");
			else if (hasSelected)
				parentItem.addClass("selected_");
			setParentSelected(parentItem);
		}
	};

	// ====================================================
	var doNodeShowAnimate = function (nodeItem) {
		nodeItem.addClass("open");
		var target = nodeItem.children("ul");
		if (target && target.length > 0) {
			target.addClass("animate-in");
			setTimeout(function () {
				target.height(target.get(0).scrollHeight);
				setTimeout(function () {
					target.removeClass("animate-in").css("height", "");
				}, 200);
			}, 0);
		}
	};

	var doNodeHideAnimate = function (nodeItem) {
		var target = nodeItem.children("ul");
		if (target && target.length > 0) {
			target.height(target.get(0).offsetHeight);
			target.addClass("animate-out");
			setTimeout(function () {
				target.height(1);
				setTimeout(function () {
					target.removeClass("animate-out").css("height", "");
					nodeItem.removeClass("open");
				}, 200);
			}, 0);
		}
		else {
			nodeItem.removeClass("open");
		}
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-treeview", UITreeView);

})();