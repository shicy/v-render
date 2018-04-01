// ========================================================
// 树
// @author shicy <shicy85@163.com>
// Create on 2018-03-29
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.treeview)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var ListRenderer = backend ? require("./_base").ListRenderer : VRender.Component.Render._list;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		ListRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new ListRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-treeview");

		target.append("<ul class='root' level='0'></ul>");
		ListRenderer.render.call(this, $, target);

		return this;
	};

	// ====================================================
	_Renderer.isChkboxVisible = function () {
		return Utils.isTrue(this.options.chkbox);
	};

	_Renderer.getChildrenField = function () {
		return this.options.childrenField;
	};

	// ====================================================
	_Renderer._getItemContainer = function ($, target) {
		return target.children("ul");
	};

	// 重构渲染方法，逐层显示展开节点
	_Renderer._renderItems = function ($, target) {
		var itemContainer = this._getItemContainer($, target);
		renderItems.call(this, $, target, itemContainer, this.getData());
	};

	_Renderer._getNewItem = function ($, itemContainer, data, index) {
		var item = $("<li></li>").appendTo(itemContainer);
		var title = $("<div class='tree-node'></div>").appendTo(item);
		title.append("<span class='ep'></span>");
		if (this.isChkboxVisible())
			title.append("<span class='chkbox'><i></i></span>");
		if (this._isShowIcon())
			title.append("<span class='ic'><i></i></span>");
		title.append("<div class='lbl'></div>");
		return item;
	};

	_Renderer._isShowIcon = function () {
		return Utils.isTrue(this.options.icon);
	};

	// ====================================================
	var renderItems = function ($, target, itemContainer, datas) {
		this.renderScope = {};
		this.renderScope.openedItems = [];

		var index = renderTreeNodes.call(this, $, itemContainer, datas, 0, 1);

		this.renderScope = null;
	};

	// nodeIndex 为起始索引，返回最后一个渲染节点的索引
	var renderTreeNodes = function ($, itemContainer, datas, nodeIndex, nodeLevel) {
		var self = this;
		var childrenField = this.getChildrenField() || "children";
		Utils.each(datas, function (data) {
			var item = self._getNewItem($, itemContainer, data, nodeIndex);
			renderOneNode.call(self, $, item, data, nodeIndex, nodeLevel);
			nodeIndex += 1;

			var children = data && data[childrenField];
			if (Utils.isArray(children) && children.length > 0) {
				var _container = $("<ul></ul>").appendTo(item);
				_container.attr("level", nodeLevel);
				nodeIndex = renderTreeNodes.call(self, $, _container, children, nodeIndex, nodeLevel + 1);
			}
		});
		return nodeIndex;
	};

	var renderOneNode = function ($, item, data, index, level) {
		if (isNodeExpand.call(this, data, index)) {
			item.addClass("open");
		}

		var node = item.children();
		var container = node.children(".lbl");
		// 不做选取设置，树选择比较复杂，需要统一处理
		ListRenderer.renderOneItem.call(this, $, node, container, data, index, false);
	};

	var isNodeExpand = function (data, index, openIndex, openId) {

	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.treeview = Renderer;
	}

})(typeof VRender === "undefined");