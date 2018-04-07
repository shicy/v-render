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
		this.$el.on("tap", "li.more > div", onMoreBtnClickHandler.bind(this));

		doInit.call(this);
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
	_UITreeView.setChkboxVisible = function (value) {
		value = Utils.isNull(value) ? true : Utils.isTrue(value);
		if (this.isChkboxVisible() != value) {
			var nodes = this.$el.find(".tree-node");
			if (value) {
				this.$el.attr("opt-chk", "1");
				nodes.children(".ep").after("<span class='chkbox'><i></i></span>");
			}
			else {
				this.$el.removeAttr("opt-chk");
				nodes.parent().removeClass("selected").removeClass("selected_");
				nodes.children(".chkbox").remove();
			}
		}
	};

	_UITreeView.getChildrenField = function () {
		return this.$el.attr("opt-child") || null;
	};

	_UITreeView.getSelectedIndex = function (needArray, deep) {
		var indexs = [];
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();
		doLoop.call(this, function (item, index, level) {
			if (_hasChkbox) {
				if (item.is(".selected")) {
					indexs.push(index);
					if (!_isMultiple)
						return false;
				}
			}
			else if (item.children(".tree-node").is(".active")) {
				indexs.push(index);
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		if (needArray || _isMultiple)
			return indexs.length > 0 ? indexs : null;
		return indexs.length > 0 ? indexs[0] : -1;
	};
	_UITreeView.setSelectedIndex = function (value, deep) {
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();

		var indexs = Component.list.getIntValues(value, 0);
		if (indexs.length > 1 && !(_hasChkbox && _isMultiple))
			indexs = [indexs.pop()];

		var nodes = this.$el.find(".tree-node");
		if (_hasChkbox)
			nodes.parent().removeClass("selected").removeClass("selected_");
		else
			nodes.removeClass("active");

		doLoop.call(this, function (item, index, level) {
			if (indexs.indexOf(index) >= 0) {
				if (_hasChkbox) {
					item.addClass("selected");
					setParentSelected(item);
					if (_isMultiple) {
						setChildrenSelected(item, true);
						return true;
					}
				}
				else {
					item.children(".tree-node").addClass("active");
				}
			}
			if (!deep && !item.is(".open"))
				return true;
		});
	};

	_UITreeView.getSelectedId = function (needArray, deep) {
		var ids = [];
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();
		var self = this;
		doLoop.call(this, function (item, index, level) {
			if (_hasChkbox) {
				if (item.is(".selected")) {
					ids.push(getItemId.call(self, item));
					if (!_isMultiple)
						return false;
				}
			}
			else if (item.children(".tree-node").is(".active")) {
				ids.push(getItemId.call(self, item));
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		if (needArray || _isMultiple)
			return ids.length > 0 ? ids : null;
		return ids.length > 0 ? ids[0] : -1;
	};
	_UITreeView.setSelectedId = function (value, deep) {

	};

	_UITreeView.getSelectedData = function (needArray, deep) {

	};

	_UITreeView.isAllSelected = function () {

	};

	_UITreeView.open = function () {

	};

	_UITreeView.close = function () {

	};

	_UITreeView.addItem = function () {

	};

	_UITreeView.updateItem = function () {

	};

	_UITreeView.removeItem = function () {

	};

	_UITreeView.addOrUpdateItem = function () {

	};

	_UITreeView.load = function (api, params, callback) {
		api = api || this.lastLoadApi;
		if (Utils.isBlank(api))
			return false;

		var openProps = this._getOpenProps() || {};
		if (openProps.indexs)
			openProps.ids = null;

		var self = this;
		var _load = function (container, _params) {
			doLoad.call(self, container, api, _params, function () {
				if (openProps.indexs && openProps.indexs.length > 0) {
					var item = getItemByIndex.call(self, openProps.indexs.shift(), true);
					if (item) {
						var itemId = getItemId.call(self, item);
						_load(item.addClass("open"), Utils.extend(params, {pid: itemId}));
					}
				}
				else if (openProps.ids) {
					Utils.each(openProps.id, function (id) {
						var item = getItemById.call(self, id);
						if (item) {
							var itemId = getItemId.call(self, item);
							_load(item.addClass("open"), Utils.extend(params, {pid: itemId}));
						}
					});
				}
			});
		};

		_load(this._getItemContainer().empty(), params);
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

	_UITreeView._isIconVisible = function () {
		if (Utils.isTrue(this.options.icon))
			return true;
	};

	_UITreeView._getIcon = function (data, index, level) {
		return TreeViewRender.getIcon.call(this, this.options.icon, data, index);
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

	_UITreeView._getItemData = function (item) {
		return getItemData.call(this, item);
	};

	// ====================================================
	var doInit = function () {
		if (!this.options.hasOwnProperty("icon")) {
			var icon = this.$el.attr("opt-icon");
			if (icon == "1")
				icon = true;
			else if (/^function/.test(icon))
				icon = (new Function("var Utils=VRender.Utils;return (" + unescape(icon) + ");"))();
			else if (Utils.isBlank(icon))
				icon = false;
			this.options.icon = icon;
		}
		this.$el.removeAttr("opt-icon");

		// 随着节点展开和关闭，索引值一直会变
		this.$el.removeAttr("data-inds").removeAttr("data-ids");
	};

	var doLoad = function (item, api, params, callback) {
		var container = item;
		if (item.is("li")) {
			container = item.children("ul");
			if (!(container && container.length > 0)) {
				container = $("<ul></ul>").appendTo(item);
				container.attr("level", parseInt(item.parent().attr("level")) + 1);
			}
		}
		if (item.is(".is-loaded,.is-loading"))
			return false;

		item.addClass("is-loading");
		var loadingItem = $("<li class='loading'></li>").appendTo(container);
		loadingItem.append("<div>" + (this.loadingText || "正在加载...") + "</div>");

		container.children(".more").remove();

		var self = this;
		var nodeIndex = getItemIndex.call(this, (item.is("li") ? item : item.children().last));
		var nodeLevel = parseInt(container.attr("level"));
		Component.load.call(this, api, params, function (err, data) {
			loadingItem.remove();
			var datas = Utils.toArray(data);
			if (datas && datas.length > 0) {
				Utils.each(datas, function (data) {
					addItem.call(self, container, data, nodeIndex, nodeLevel);
					nodeIndex += 1;
				});
				var hasMore = self._totalSize > (self._pageSize * self._pageNo);
				if (hasMore) {
					var moreItem = $("<li class='more'></li>").appendTo(container);
					moreItem.append("<div>" + (self.moreText || "加载更多..") + "</div>");
					moreItem.attr("page-no", self._pageNo);
				}
				else {
					item.addClass("is-loaded");
				}
			}
			else {
				item.addClass("is-loaded");
				if (container.children().length == 0)
					item.addClass("is-leaf");
			}
			item.removeClass("is-loading");
			if (Utils.isFunction(callback))
				callback();
		});
	};

	// ====================================================
	var onNodeClickHandler = function (e) {
		var node = $(e.currentTarget);
		if (!node.is(".active")) {
			this.$el.find(".tree-node.active").removeClass("active");
			node.addClass("active");
			this.trigger("itemclick", this._getItemData(node.parent()));
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
			if (this.lastLoadApi && !item.is(".is-loaded")) {
				var params = {pid: getItemId.call(this, item)};
				params = Utils.extend(this.lastLoadParams, params);
				doLoad.call(this, item, this.lastLoadApi, params);
			}
			this.trigger("open", this._getItemData(item));
		}
		return false;
	};

	var onChkboxClickHandler = function (e) {
		var node = $(e.currentTarget).parent();
		var item = node.parent();
		setItemSelectedOrNot.call(this, item, !item.is(".selected"));
		return false;
	};

	var onMoreBtnClickHandler = function (e) {
		var btn = $(e.currentTarget).parent();
		var params = {p_no: (parseInt(btn.attr("page-no")) + 1)};
		var parentItem = btn.parent();
		if (parentItem.is(".root")) {
			params.pid = null;
		}
		else {
			parentItem = parentItem.parent();
			params.pid = getItemId.call(this, parentItem);
		}
		params = Utils.extend(this.lastLoadParams, params);
		doLoad.call(this, parentItem, this.lastLoadApi, params);
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
			if (item.is(".more,.loading"))
				return ;
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
				if (_item.is(".more,.loading"))
					return ;
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
	var rerenderNodes = function () {
		if (this.t_rerender) {
			clearTimeout(this.t_rerender);
			this.t_rerender = 0;
		}
		var self = this;
		this.t_rerender = setTimeout(function () {
			self.t_rerender = 0;
			var datas = self.getData();

		}, 0);
	};

	var addItem = function (itemContainer, data, index, level) {
		var item = this._getNewItem($, itemContainer, data, index);
		TreeViewRender.renderOneNode.call(this, $, item, data, index, level);
	};

	var getItemByIndex = function (index, beOpen) {
		if (isNaN(index))
			return null;
		index = parseInt(index);
		if (isNaN(index) || index < 0)
			return null;

		var nodeIndex = 0;
		var _find = function (container) {
			var items = container.children();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (item.is(".more,.loading"))
					continue;
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

		return _find(this._getItemContainer());
	};

	var getItemById = function (id) {
		if (Utils.isBlank(id))
			return null;

		var self = this;
		var _find = function (container) {
			var items = container.children();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (item.is(".more,.loading"))
					continue;
				if (id == getItemId.call(self, item))
					return item;
				item = _find(item.children("ul"));
				if (item)
					return item;
			}
		};

		return _find(this._getItemContainer());
	};

	var getItemIndex = function (item, beOpen) {
		if (item && item.length > 0) {
			var nodeIndex = 0;
			var _index = function (container) {
				var items = container.children();
				for (var i = 0, l = items.length; i < l; i++) {
					var _item = items.eq(i);
					if (item.is(".more,.loading"))
						continue;
					if (_item.is(item))
						return nodeIndex;
					nodeIndex += 1;
					if (!beOpen || _item.is(".open")) {
						var index = _index(_item.children("ul"));
						if (index >= 0)
							return index;
					}
				}
				return -1;
			};
			return _index(this._getItemContainer());
		}
		return -1;
	};

	var getItemId = function (item) {
		return this._getDataId(this._getItemData(item));
	};

	var getItemData = function (item) {
		var data = item.children(".tree-node").data("itemData");
		if (Utils.isBlank(data)) {
			var nodeIndex = getItemIndex.call(this, item);
			var index = 0;
			var childrenField = this.getChildrenField() || "children";
			var _loop = function (datas) {
				for (var i = 0, l = datas.length; i < l; i++) {
					var data = datas[i];
					if (index == nodeIndex)
						return data;
					index += 1;
					if (Utils.isArray(data[childrenField])) {
						data = _loop(data[childrenField]);
						if (data)
							return data;
					}
				}
			};
			data = _loop(this.getData());
		}
		return data;
	};

	// 遍历树，
	// callback 返回true时结束本节点（包括子节点）的遍历，并继续遍历其他节点。返回false时结束本次遍历
	var doLoop = function (callback) {
		var nodeIndex = 0;
		var _loop = function (container) {
			var nodeLevel = parseInt(container.attr("level")) || 0;
			var items = container.children();
			for (var i = 0, l = items.length; i < l; i++) {
				var item = items.eq(i);
				if (item.is(".more,.loading"))
					continue;
				var result = callback(item, nodeIndex, nodeLevel);
				nodeIndex += 1;
				if (result === false)
					return true;
				if (result !== true) {
					result = _loop(item.children("ul"));
					if (result)
						return true;
				}
			}
		};
		_loop(this._getItemContainer());
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