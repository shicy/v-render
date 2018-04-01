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
	};
	var _UITreeView = UITreeView.prototype = new Component.list();

	UITreeView.find = function (view) {
		return Component.find(view, ".ui-treeview", UITreeView);
	};

	UITreeView.create = function (options) {
		return Component.create(options, UITreeView, TreeViewRender);
	};

	// ====================================================
	_UITreeView._getItemContainer = function () {
		return this.$el.children("ul");
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