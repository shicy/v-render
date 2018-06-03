// ========================================================
// 树
// @author shicy <shicy85@163.com>
// Create on 2018-03-29
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.treeview)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._select.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._select();

	Renderer.getNewItem = function ($, itemContainer, data, index) {
		var item = $("<li></li>").appendTo(itemContainer);
		var title = $("<div class='tree-node'></div>").appendTo(item);
		title.append("<span class='ep'></span>");
		if (this.isChkboxVisible())
			title.append("<span class='chkbox'><i></i></span>");
		if (this._isIconVisible())
			title.append("<span class='ic'><i></i></span>");
		title.append("<div class='lbl'></div>");
		return item;
	};

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-treeview");

		target.append("<ul class='root' level='0'></ul>");
		BaseRender._select.render.call(this, $, target);

		renderOthers.call(this, $, target);

		return this;
	};

	// ====================================================
	_Renderer.getData = function () {
		var datas = Utils.toArray(this.options.data);
		if (datas._vr_adapter_flag)
			return datas;

		var self = this;
		var dataIndex = 0;
		var childrenField = this.getChildrenField() || "children";
		var _loopmap = function (datas) {
			return Utils.map(datas, function (data, i) {
				data = BaseRender.fn.doAdapter.call(self, data, dataIndex++);
				if (Utils.isArray(data[childrenField])) {
					data[childrenField] = _loopmap(data[childrenField]);
				}
				return data;
			});
		};
		datas = _loopmap(datas);
		
		datas._vr_adapter_flag = true;
		this.options.data = datas;

		return datas;
	};

	_Renderer.isChkboxVisible = function () {
		return Utils.isTrue(this.options.chkbox);
	};

	_Renderer.getChildrenField = function () {
		return this.options.childrenField;
	};

	_Renderer.getLeafField = function () {
		return this.options.leafField;
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

	_Renderer._renderEmptyView = function () {
		// do nothing
	};

	_Renderer._renderLoadView = function () {
		// do nothing
	};

	_Renderer._getNewItem = function ($, itemContainer, data, index) {
		return Renderer.getNewItem.call(this, $, itemContainer, data, index);
	};

	_Renderer._isIconVisible = function () {
		return Utils.isTrue(this.options.icon);
	};

	_Renderer._getIcon = function (data, index) {
		return getIcon.call(this, this.options.icon, data, index);
	};

	_Renderer._getOpenProps = function () {
		var indexs = getOpenIndex.call(this, this.options.openIndex);
		indexs = (indexs && indexs.length > 0) ? indexs : null;

		var ids = getOpenId.call(this, this.options.openId);
		ids = (ids && ids.length > 0) ? ids : null;

		return {indexs: indexs, ids: ids};
	};

	// ====================================================
	var renderItems = function ($, target, itemContainer, datas) {
		renderTreeNodes.call(this, $, itemContainer, datas, 0, 1);
		renderNodeOpend.call(this, $, itemContainer);
		renderNodeSelected.call(this, $, itemContainer);

		if (backend) {
			itemContainer.find("li").removeData("_node_data");
		}
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

		var leafField = this.getLeafField() || "leaf";
		if (Utils.isTrue(data && data[leafField]))
			item.addClass("is-leaf");

		var node = item.children(".tree-node");

		var icon = node.children(".ic");
		if (icon && icon.length > 0) {
			var iconUrl = this._getIcon(data, index);
			if (Utils.isNotBlank(iconUrl))
				icon.children("i").css("backgroundImage", "url(" + iconUrl + ")");
		}

		var container = node.children(".lbl");
		// 不做选取设置，树选择比较复杂，需要统一处理
		BaseRender._item.renderOneItem.call(this, $, node, container, data, index);
	};

	var renderNodeOpend = function ($, itemContainer) {
		var openProps = this._getOpenProps() || {};
		var openIndexs = openProps.indexs;
		if (openIndexs && openIndexs.length > 0) { // 0,1,2,3 将逐层展开第一个节点（而非展开第一层的相应节点）
			for (var i = 0, l = openIndexs.length; i < l; i++) {
				var item = findItemByIndex.call(this, itemContainer, openIndexs[i], true);
				if (item) {
					item.addClass("open");
				}
			}
		}
		else {
			var openIds = openProps.ids;
			if (openIds && openIds.length > 0) {
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
					if (!this.isMultiple())
						break;
				}
			}
		}
		else {
			var selectedIds = this.getSelectedKey(true);
			if (selectedIds) {
				for (var i = 0, l = selectedIds.length; i < l; i++) {
					var item = findItemById.call(this, itemContainer, selectedIds[i]);
					if (item) {
						item.addClass("selected");
						if (!this.isMultiple())
							break;
					}
				}
			}
		}
		checkChildrenSelect.call(this, itemContainer, false);
	};

	var renderOthers = function ($, target) {
		if (this.isChkboxVisible())
			target.attr("opt-chk", "1");

		var childrenField = this.getChildrenField();
		if (Utils.isNotBlank(childrenField))
			target.attr("opt-child", childrenField);

		if (this.options.apiName) {
			// 如果是异步数据集，等数据加载完后执行展开操作，仅第一次有效
			var openProps = this._getOpenProps() || {};
			var indexs = openProps.indexs && openProps.indexs.join(",");
			target.attr("opt-openinds", indexs || null);
			var ids = openProps.ids && openProps.ids.join(",");
			target.attr("opt-openids", ids || null);
		}

		if (backend) {
			var icon = this.options.icon;
			if (Utils.isFunction(icon))
				icon = escape(icon);
			else if (typeof icon != "string")
				icon = Utils.isTrue(icon) ? 1 : 0;
			if (icon)
				target.attr("opt-icon", icon);
		}
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
				var _id = self._getDataKey(getItemData.call(self, item));
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
	// 检查所有节点的选中状态(存在连带状态)
	// 根据当前选中的节点，上下反推所有节点的选中状态
	var checkChildrenSelect = function (itemContainer, isParentSelected) {
		var items = itemContainer.children();
		if (items && items.length > 0) {
			var hasSelected = false;
			var allSelected = true;
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				// item.removeClass("selected").removeClass("selected_");
				var subContainer = item.children("ul");
				if (isParentSelected || item.is(".selected")) {
					hasSelected = true;
					item.addClass("selected");
					// 向下选中所有子节点
					if (this.isMultiple())
						checkChildrenSelect.call(this, subContainer, true);
				}
				else {
					// 看看子节点有没有选中的
					var state = checkChildrenSelect.call(this, subContainer, false);
					if (state == "all") {
						// 全部子节点都选中了，当然父节点也要选中
						item.addClass(this.isMultiple() ? "selected" : "selected_");
						hasSelected = true;
					}
					else if (state == "part") {
						item.addClass("selected_"); // 部分子节点选中，当前父节点做标记
						hasSelected = true;
						allSelected = false;
					}
					else {
						allSelected = false;
					}
				}
			}
			return allSelected ? "all" : (hasSelected ? "part" : null);
		}
		return null;
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

	var getIcon = function (value, data, index) {
		if (Utils.isFunction(value))
			return value(data, index);
		if (value === true || value == 1)
			value = "icon";
		if (typeof value == "string") {
			if (/\/|\./.test(value)) // 文件路径
				return value;
			return data && data[value] || null;
		}
		return null;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		Renderer.getIcon = getIcon;
		Renderer.getOpenIndex = getOpenIndex;
		Renderer.getOpenId = getOpenId;
		Renderer.renderItems = renderItems;
		Renderer.renderOneNode = renderOneNode;
		VRender.Component.Render.treeview = Renderer;
	}

})(typeof VRender === "undefined");