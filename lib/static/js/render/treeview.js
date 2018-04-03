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

	_Renderer.getOpenIndexs = function () {
		var indexs = getOpenIndex.call(this, this.options.openIndex);
		return (indexs && indexs.length > 0) ? indexs : null;
	};

	_Renderer.getOpenIds = function () {
		var ids = getOpenId.call(this, this.options.openId);
		return (ids && ids.length > 0) ? ids : null;
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
		// this.renderScope = {};
		// this.renderScope.selectedIndexs = this.getSelectedIndex(true);
		// this.renderScope.selectedIds = this.getSelectedId(true) || [];
		// this.renderScope.openIndexs = this.getOpenIndexs();
		// this.renderScope.openIds = this.getOpenIds() || [];

		renderTreeNodes.call(this, $, itemContainer, datas, 0, 1);

		renderNodeOpend.call(this, $, itemContainer);
		renderNodeSelected.call(this, $, itemContainer);

		// this.renderScope = null;
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
		if (backend) {
			item.data("_node_data", data);
		}
		var node = item.children();
		var container = node.children(".lbl");
		// 不做选取设置，树选择比较复杂，需要统一处理
		ListRenderer.renderOneItem.call(this, $, node, container, data, index, false);
	};

	var renderNodeOpend = function ($, itemContainer) {
		var openIndexs = this.getOpenIndexs();
		if (openIndexs) { // 0,1,2,3 将逐层展开第一个节点（而非展开第一层的相应节点）
			for (var i = 0, l = openIndexs.length; i < l; i++) {
				var item = findItemByIndex.call(this, itemContainer, openIndexs[i], true);
				if (item) {
					item.addClass("open");
				}
			}
		}
		else {
			var openIds = this.getOpenIds();
			if (openIds) {
				for (var i = 0, l = openIds.length; i < l; i++) {
					var item = findItemById.call(this, itemContainer, openIds[i]);
					if (item) {
						item.addClass("open");
						while (true) {
							var container = item.parent();
							if (container.is(".root"))
								break;
							item = container.parent();
							item.addClass("open");
						}
					}
				}
			}
		}
	};

	var renderNodeSelected = function ($, itemContainer) {
		var selectedIndexs = this.getSelectedIndex(true);
		if (selectedIndexs) {
			for (var i = 0, l = selectedIndexs.length; i < l; i++) {
				var item = findItemByIndex.call(this, itemContainer, selectedIndexs[i], true);
				if (item) {
					item.addClass("selected");
				}
			}
		}
		else {
			var selectedIds = this.getSelectedId(true);
			if (selectedIds) {
				for (var i = 0, l = selectedIds.length; i < l; i++) {
					var item = findItemById.call(this, itemContainer, selectedIds[i]);
					if (item) {
						item.addClass("selected");
					}
				}
			}
		}
		var _checkSelected = function (container) {
			var items = container.children();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (!item.is(".selected")) {
					container = item.children("ul");
					if (container && container.length > 0) {
						var isAllSelected = _checkSelected(container);
						if (isAllSelected)
							item.addClass("selected");
					}
				}
			}
		};
		_checkSelected(itemContainer);
	};

	// ====================================================
	var findItemByIndex = function (itemContainer, index, beOpen) {
		var nodeIndex = 0;
		var _find = function (container) {
			var items = container.children();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (nodeIndex == index)
					return item;
				nodeIndex += 1;
				if (!beOpen || item.is(".open")) {
					item = _find(item.children("ul"));
					if (item)
						return item;
				}
			}
			return null;
		};
		return _find(itemContainer);
	};

	var findItemById = function (itemContainer, id, beOpen) {
		var self = this;
		var _find = function (container) {
			var items = container.children();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				var _id = self._getDataId(getItemData.call(self, item));
				if (_id == id)
					return item;
				if (!beOpen || item.is(".open")) {
					item = _find(item.children("ul"));
					if (item)
						return item;
				}
			}
			return null;
		};
		return _find(itemContainer);
	};

	var getItemData = function (item) {
		if (backend)
			return item.data("_node_data");
		return item.data("itemData");
	};

	// ====================================================
	var isNodeExpand = function (data, index, openIndexs, openIds) {
		if (!openIndexs && !openIds) {
			openIndexs = this.renderScope ? this.renderScope.openIndexs : this.getOpenIndexs();
			openIds = this.renderScope ? this.renderScope.openIds : this.getOpenIds();
		}
		if (openIndexs) {
			return openIndexs.indexOf(index) >= 0;
		}
		if (openIds) {
			var _id = this._getDataId(data);
			return Utils.index(openIds, function (id) {
				return id == _id;
			}) >= 0;
		}
		return false;
	};

	var getOpenIndex = function (value) {
		if (Utils.isBlank(value))
			return [];
		if (!Utils.isArray(value))
			value = ("" + value).split(",");
		var indexs = [];
		Utils.each(value, function (tmp) {
			if (isNaN(tmp))
				return ;
			tmp = parseInt(tmp);
			if (!isNaN(tmp) && tmp >= 0) {
				indexs.push(tmp);
			}
		});
		return indexs;
	};

	var getOpenId = function (value) {
		if (Utils.isBlank(value))
			return [];
		if (!Utils.isArray(value))
			value = ("" + value).split(",");
		var ids = [];
		Utils.each(value, function (tmp) {
			if (tmp || tmp === 0) {
				ids.push(isNaN(tmp) ? tmp : parseInt(tmp));
			}
		});
		return ids;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.treeview = Renderer;
	}

})(typeof VRender === "undefined");