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
		this.$el.on("tap", ".tree-node > .chkbox", onChkboxClickHandler.bind(this));
		this.$el.on("tap", "li.more > div", onMoreBtnClickHandler.bind(this));

		if (!this.isRenderAsApp()) {
			this.$el.on("tap", ".tree-node > .ep", onExpandClickHandler.bind(this));
		}

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
	_UITreeView.getDataAt = function (index, deep) {
		var item = getItemByIndex.call(this, index, deep);
		return !!item ? this._getItemData(item) : null;
	};

	_UITreeView.getDataIndex = function (data, deep) {
		var item = getItemByData.call(this, data, deep);
		return !!item ? getItemIndex.call(this, item, deep) : -1;
	};

	_UITreeView.getDataById = function (value, deep) {
		var item = getItemById.call(this, value, deep);
		return !!item ? this._getItemData(item) : null;
	};

	_UITreeView.getIndexById = function (value, deep) {
		var item = getItemById.call(this, value, deep);
		return !!item ? getItemIndex.call(this, item, deep) : -1;
	};

	_UITreeView.getDataByName = function (value, deep) {
		if (Utils.isBlank(value))
			return null;
		var self = this;
		var findData = null;
		doLoop.call(this, function (item) {
			var data = self._getItemData(item);
			if (data && data.name == value) {
				findData = data;
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		return findData;
	};

	_UITreeView.getIndexByName = function (value, deep) {
		if (Utils.isBlank(value))
			return -1;
		var self = this;
		var findIndex = -1;
		doLoop.call(this, function (item, index) {
			var data = self._getItemData(item);
			if (data && data.name == value) {
				findIndex = index;
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		return findIndex;
	};

	_UITreeView.isChkboxVisible = function () {
		return this.$el.attr("opt-chk") == "1";
	};
	_UITreeView.setChkboxVisible = function (value) {
		value = Utils.isNull(value) ? true : Utils.isTrue(value);
		if (this.isChkboxVisible() != value) {
			var snapshoot = this._snapshoot();
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
			snapshoot.done();
		}
	};

	_UITreeView.getChildrenField = function () {
		return this.$el.attr("opt-child") || null;
	};

	_UITreeView.getLeafField = function () {
		return this.options.leafField;
	};

	_UITreeView.getSelectedIndex = function (needArray, deep) {
		var indexs = [];
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();
		doLoop.call(this, function (item, index) {
			if (_hasChkbox) {
				if (item.is(".selected")) {
					indexs.push(index);
					if (_isMultiple) {
						if (!deep)
							return true;
					}
					else {
						return false;
					}
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

		var snapshoot = this._snapshoot();

		var nodes = this.$el.find(".tree-node");
		if (_hasChkbox)
			nodes.parent().removeClass("selected").removeClass("selected_");
		else
			nodes.removeClass("active");

		if (indexs.length > 0) {
			doLoop.call(this, function (item, index) {
				if (indexs.indexOf(index) >= 0) {
					if (_hasChkbox) {
						if (!item.is(".selected")) {
							item.addClass("selected");
							setParentSelected(item);
							if (_isMultiple) {
								setChildrenSelected(item, true);
							}
							else {
								return false;
							}
						}
					}
					else {
						item.children(".tree-node").addClass("active");
						return false;
					}
				}
				if (!deep && !item.is(".open"))
					return true;
			});
		}

		snapshoot.done();
	};

	_UITreeView.getSelectedId = function (needArray, deep) {
		var ids = [];
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();
		var self = this;
		doLoop.call(this, function (item) {
			if (_hasChkbox) {
				if (item.is(".selected")) {
					ids.push(getItemId.call(self, item));
					if (_isMultiple) {
						if (!deep)
							return true;
					}
					else {
						return false;
					}
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
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();

		var ids = Utils.isArray(value) ? value : (Utils.isBlank(value) ? [] : Utils.trimToEmpty(value).split(","));
		if (ids.length > 1 && !(_hasChkbox && _isMultiple))
			ids = [ids.pop()];

		var snapshoot = this._snapshoot();

		var nodes = this.$el.find(".tree-node");
		if (_hasChkbox)
			nodes.parent().removeClass("selected").removeClass("selected_");
		else
			nodes.removeClass("active");

		if (ids.length > 0) {
			var self = this;
			doLoop.call(this, function (item, index) {
				var _id = getItemId.call(self, item);
				var _hasSelected = Utils.index(ids, function (tmp) {
					return tmp == _id;
				}) >= 0;
				if (_hasSelected) {
					if (_hasChkbox) {
						if (!item.is(".selected")) {
							item.addClass("selected");
							setParentSelected(item);
							if (_isMultiple) {
								setChildrenSelected(item, true);
							}
							else {
								return false;
							}
						}
					}
					else {
						item.children(".tree-node").addClass("active");
						return false;
					}
				}
				if (!deep && !item.is(".open"))
					return true;
			});
		}

		snapshoot.done();
	};

	_UITreeView.getSelectedData = function (needArray, deep) {
		var datas = [];
		var _hasChkbox = this.isChkboxVisible();
		var _isMultiple = this.isMultiple();
		var self = this;
		doLoop.call(this, function (item) {
			if (_hasChkbox) {
				if (item.is(".selected")) {
					datas.push(getItemData.call(self, item));
					if (_isMultiple) {
						if (!deep)
							return true;
					}
					else {
						return false;
					}
				}
			}
			else if (item.children(".tree-node").is(".active")) {
				datas.push(getItemData.call(self, item));
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		if (needArray || _isMultiple)
			return datas.length > 0 ? datas : null;
		return datas.length > 0 ? datas[0] : null;
	};

	_UITreeView.isAllSelected = function () {
		var _allSelected = true;
		doLoop.call(this, function (item) {
			if (!item.is(".selected")) {
				_allSelected = false;
				return false;
			}
			return true;
		});
		return _allSelected;
	};

	_UITreeView.open = function (data) {
		var item = getItemByData.call(this, data, true);
		if (item) {
			doOpen.call(this, item);
		}
	};

	_UITreeView.openAt = function (index, deep) {
		var item = getItemByIndex.call(this, index, deep);
		if (item) {
			doOpen.call(this, item);
		}
	};

	_UITreeView.openById = function (value) {
		var item = getItemById.call(this, value, true);
		if (item) {
			doOpen.call(this, item);
		}
	};

	_UITreeView.close = function (data) {
		var item = getItemByData.call(this, data, true);
		if (item) {
			doClose.call(this, item);
		}
	};

	_UITreeView.closeAt = function (index, deep) {
		var item = getItemByIndex.call(this, index, deep);
		if (item) {
			doClose.call(this, item);
		}
	};

	_UITreeView.closeById = function (value) {
		var item = getItemById.call(this, value, true);
		if (item) {
			doClose.call(this, item);
		}
	};

	_UITreeView.addItem = function (data, pdata, index) {
		if (Utils.isBlank(data))
			return false;
		var container = this._getItemContainer();
		if (Utils.isNotBlank(pdata)) {
			var item = getItemByData.call(this, pdata, true);
			if (item) {
				container = item.children("ul");
				if (!(container && container.length > 0)) {
					container = $("<ul></ul>").appendTo(item);
					container.attr("level", parseInt(item.parent().attr("level")) + 1);
				}
			}
		}
		var children = container.children();
		var nodeIndex = container.is(".root") ? 0 : getItemIndex.call(this, container.parent(), true);
		index = Utils.getIndexValue(index);
		if (index >= 0 && index < children.length - 1)
			nodeIndex += index;
		var snapshoot = this._snapshoot();
		addItem.call(this, container, data, index, nodeIndex);
		snapshoot.done();
		return true;
	};

	_UITreeView.updateItem = function (data, pdata, index) {
		if (Utils.isBlank(data))
			return false;
		if (!isNaN(pdata) && (pdata || pdata === 0)) {
			index = pdata;
			pdata = null;
		}
		var snapshoot = this._snapshoot();
		if (pdata) { // 此时只修改 pdata 下的节点
			var parentItem = getItemByData.call(this, pdata, true);
			if (!parentItem) {
				snapshoot.release();
				return false;
			}
			var children = parentItem.children("ul").children();
			if (Utils.isBlank(index)) {
				var self = this;
				var dataId = this._getDataId(data);
				var item = Utils.find(children, function (_item) {
					var _data = self._getItemData(_item);
					return data == _data || dataId == self._getDataId(_data);
				});
				if (item)
					updateItem.call(this, item, data);
			}
			else if (!isNaN(index)) {
				index = parseInt(index);
				if (index >= 0 && index < children.length)
					updateItem.call(this, children.eq(index), data);
			}
		}
		else if (Utils.isBlank(index)) {
			var item = getItemByData.call(this, data, true);
			if (item)
				updateItem.call(this, item, data);
		}
		else if (!isNaN(index)) { // 此时 index 为展开的节点
			index = parseInt(index);
			var item = getItemByIndex.call(this, index);
			if (item)
				updateItem.call(this, item, data);
		}
		snapshoot.done();
		return true;
	};

	_UITreeView.removeItem = function (data, pdata) {
		if (Utils.isBlank(data))
			return false;
		var snapshoot = this._snapshoot();
		if (pdata) {
			var parentItem = getItemByData.call(this, pdata, true);
			if (!parentItem) {
				snapshoot.release();
				return false;
			}
			var self = this;
			var dataId = this._getDataId(data);
			var children = parentItem.children("ul").children();
			var item = Utils.find(children, function (_item) {
				var _data = self._getItemData(_item);
				return data == _data || dataId == self._getDataId(_data);
			});
			if (item)
				removeItem.call(this, item);
		}
		else {
			var item = getItemByData.call(this, data, true);
			if (item)
				removeItem.call(this, item);
		}
		snapshoot.done();
		return true;
	};

	_UITreeView.removeItemAt = function (index, pdata) {
		index = Utils.getIndexValue(index);
		if (index < 0)
			return false;
		var snapshoot = this._snapshoot();
		if (pdata) {
			var parentItem = getItemByData.call(this, pdata, true);
			if (!parentItem) {
				snapshoot.release();
				return false;
			}
			var children = parentItem.children("ul").children();
			if (index < children.length)
				removeItem.call(this, children.eq(index));
		}
		else {
			var item = getItemByIndex.call(this, index);
			if (item)
				removeItem.call(this, item);
		}
		snapshoot.done();
		return true;
	};

	_UITreeView.addOrUpdateItem = function (data, pdata) {
		if (Utils.isBlank(data))
			return ;
		if (!this.updateItem(data, pdata))
			this.addItem(data, pdata);
	};

	_UITreeView.setItems = function (datas, pdata) {
		datas = Utils.toArray(datas);
		if (pdata) {
			var parentItem = getItemByData.call(this, pdata, true);
			if (!parentItem)
				return ;
			var snapshoot = this._snapshoot();
			var children = parentItem.children("ul").children();
			for (var i = children.length - 1; i >= 0; i--) {
				removeItem.call(this, children.eq(i));
			}
			if (datas && datas.length > 0) {
				var container = parentItem.children("ul");
				if (!(container && container.length > 0)) {
					container = $("<ul></ul>").appendTo(parentItem);
					container.attr("level", parseInt(parentItem.parent().attr("level")) + 1);
				}
				var nodeIndex = getItemIndex.call(this, parentItem, true);
				for (var i = 0, l = datas.length; i < l; i++) {
					addItem.call(this, container, datas[i], i, nodeIndex);
					nodeIndex += 1;
				}
			}
			snapshoot.done();
		}
		else {
			this.setData(datas);
		}
	};

	_UITreeView.load = function (api, params, callback) {
		api = api || this.lastLoadApi;
		if (Utils.isBlank(api))
			return false;

		var openProps = this._getOpenProps() || {};
		if (openProps.indexs)
			openProps.ids = null;

		var self = this;
		var loadCount = 0;
		var errors = [];
		var allDatas = [];
		var _load = function (container, _params) {
			loadCount += 1;
			doLoad.call(self, container, api, _params, function (err, datas) {
				loadCount -= 1;
				if (err)
					errors.push(err);
				else if (datas && datas.length > 0)
					allDatas = allDatas.concat(datas);
				if (openProps.indexs && openProps.indexs.length > 0) {
					var item = getItemByIndex.call(self, openProps.indexs.shift(), true);
					if (item && !item.is(".is-loaded")) {
						var itemId = getItemId.call(self, item);
						_load(item.addClass("open"), Utils.extend(params, {pid: itemId}));
					}
				}
				else if (openProps.ids) {
					Utils.each(openProps.id, function (id) {
						var item = getItemById.call(self, id, true);
						if (item && !item.is(".is-loaded")) {
							var itemId = getItemId.call(self, item);
							_load(item.addClass("open"), Utils.extend(params, {pid: itemId}));
						}
					});
				}
				if (loadCount <= 0 && Utils.isFunction(callback)) {
					errors = errors.join("\n");
					callback(errors || false, allDatas);
					self.trigger("loaded", errors, allDatas);
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

	_UITreeView._doAdapter = function (data) {
		var datas = Utils.toArray(data);
		if (datas._vr_adapter_flag)
			return datas;

		var self = this;
		var dataIndex = 0;
		var childrenField = this.getChildrenField() || "children";
		var _loopmap = function (_datas) {
			return Utils.map(_datas, function (_data, i) {
				_data = Component.list.doAdapter.call(self, _data, dataIndex++);
				if (Utils.isArray(_data[childrenField]))
					_data[childrenField] = _loopmap(_data[childrenField]);
				return _data;
			});
		};
		datas = _loopmap(datas);
		datas._vr_adapter_flag = true;

		return datas;
	};

	_UITreeView._snapshoot_shoot = function (state) {
		state.selectedIndex = this.getSelectedIndex(true);
	};

	_UITreeView._snapshoot_compare = function (state) {
		var selectedIndex = this.getSelectedIndex(true);
		return Component.list.equalIndex(state.selectedIndex, selectedIndex);
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
		Component.load.call(this, api, params, function (err, data) {
			loadingItem.remove();
			var datas = !err ? Utils.toArray(data) : null;
			if (datas && datas.length > 0) {
				Utils.each(datas, function (data) {
					addItem.call(self, container, data, -1, nodeIndex);
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
					item.addClass("is-leaf").removeClass("open");
			}
			item.removeClass("is-loading");
			if (Utils.isFunction(callback))
				callback(err, datas);
		});
	};

	var doOpen = function (item) {
		var parentItems = [];
		var _item = item.parent(); // ul
		while (!_item.is(".root")) {
			_item = _item.parent(); // li
			parentItems.push(_item);
			_item = _item.parent(); // ul
		}
		var self = this;
		Utils.each(parentItems, function (_item) {
			if (!_item.is(".open")) {
				_item.addClass("open");
				self.trigger("open", self._getItemData(_item));
			}
		});

		if (!item.is(".open") && !item.is(".is-leaf")) {
			doNodeShowAnimate.call(this, item);

			var itemData = this._getItemData(item);
			if (this.lastLoadApi && !item.is(".is-loaded")) {
				if (item.children("ul").children().length == 0) {
					var params = {pid: getItemId.call(this, item), p_no: 1};
					params = Utils.extend(this.lastLoadParams, params);
					doLoad.call(this, item, this.lastLoadApi, params, function (err, datas) {
						self.trigger("loaded", err, datas, itemData);
					});
				}
			}

			this.trigger("open", itemData);
		}
	};

	var doClose = function (item) {
		if (item.is(".open")) {
			doNodeHideAnimate.call(this, item);
			this.trigger("close", this._getItemData(item));
		}
	};

	// ====================================================
	var onNodeClickHandler = function (e) {
		var node = $(e.currentTarget);
		if (!node.is(".active")) {
			this.$el.find(".tree-node.active").removeClass("active");
			node.addClass("active");
			this.trigger("itemclick", this._getItemData(node.parent()));
		}
		if (this.isRenderAsApp()) {
			var item = node.parent();
			if (item.is(".open")) {
				doClose.call(this, item);
			}
			else {
				doOpen.call(this, item);
			}
		}
	};

	var onExpandClickHandler = function (e) {
		var item = $(e.currentTarget).parent().parent();
		if (item.is(".open")) {
			doClose.call(this, item);
		}
		else {
			doOpen.call(this, item);
		}
		return false;
	};

	var onChkboxClickHandler = function (e) {
		var item = $(e.currentTarget).parent().parent();
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
		var self = this;
		var parentItemData = this._getItemData(parentItem);
		doLoad.call(this, parentItem, this.lastLoadApi, params, function (err, datas) {
			self.trigger("loaded", err, datas, parentItemData);
		});
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
	var addItem = function (itemContainer, data, index, nodeIndex) {
		index = Utils.getIndexValue(index);

		var item = this._getNewItem($, itemContainer, data, nodeIndex);
		if (index >= 0 && index < itemContainer.children().length - 1)
			itemContainer.children().eq(index).before(item);
		var nodeLevel = parseInt(itemContainer.attr("level"));
		TreeViewRender.renderOneNode.call(this, $, item, data, nodeIndex, nodeLevel);

		if (!itemContainer.is(".root")) {
			var parentItem = itemContainer.parent().removeClass("is-leaf");
			if (this.isChkboxVisible() && this.isMultiple() && parentItem.is(".selected"))
				item.addClass("selected");
		}

		var datas = null;
		if (itemContainer.is(".root"))
			datas = this.getData();
		else {
			datas = this._getItemData(itemContainer.parent());
			if (datas) {
				var childrenField = this.getChildrenField() || "children";
				if (!Utils.isArray(datas[childrenField]))
					datas[childrenField] = [];
				datas = datas[childrenField];
			}
		}

		if (Utils.isArray(datas)) {
			if (index >= 0 && index < datas.length)
				datas.splice(index, 0, data);
			else
				datas.push(data);
		}
	};

	var updateItem = function (item, data) {
		var container = item.parent();
		var nodeIndex = getItemIndex.call(this, item, true);

		item.children(".tree-node .lbl").empty();
		var nodeLevel = parseInt(container.attr("level"));
		TreeViewRender.renderOneNode.call(this, $, item, data, nodeIndex, nodeLevel);

		var datas = null;
		if (container.is(".root"))
			datas = this.getData();
		else
			datas = this._getItemData(container.parent());

		var index = item.index();
		if (Utils.isArray(datas) && index < datas.length) {
			var childrenField = this.getChildrenField() || "children";
			if (!Utils.isArray(data[childrenField]))
				data[childrenField] = datas[index][childrenField];
			datas.splice(index, 1, data);
		}
	};

	var removeItem = function (item) {
		doNodeHideAnimate.call(this, item);

		var container = item.parent();
		var index = item.index();
		if (container.is(".root")) {
			var datas = this.getData();
			if (datas && index < datas.length)
				datas.splice(index, 1);
		}
		else {
			var data = this._getItemData(container.parent());
			var childrenField = this.getChildrenField() || "children";
			if (Utils.isArray(data[childrenField]) && index < data[childrenField].length)
				data[childrenField].splice(index, 1);
		}

		var self = this;
		setTimeout(function () {
			item.remove();
			if (!container.is(".root")) {
				item = container.parent();
				var children = container.children();
				if (children.length > 0) {
					setParentSelected.call(self, children.eq(0));
				}
				else {
					container.remove();
					if (item.is(".selected_")) {
						item.removeClass("selected_");
						setParentSelected.call(self, item);
					}
				}
			}
		}, 220);
	};

	var getItemByIndex = function (index, deep) {
		index = Utils.getIndexValue(index);
		if (index < 0)
			return null;
		var findItem = null;
		doLoop.call(this, function (item, nodeIndex) {
			if (index == nodeIndex) {
				findItem = item;
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		return findItem;
	};

	var getItemById = function (id, deep) {
		if (Utils.isBlank(id))
			return null;
		var self = this;
		var findItem = null;
		doLoop.call(this, function (item) {
			var _id = getItemId.call(self, item);
			if (id == _id) {
				findItem = item;
				return false;
			}
			if (!deep && !item.is(".open"))
				return true;
		});
		return findItem;
	};

	var getItemByData = function (data, deep) {
		var self = this;
		var findItem = null;
		var dataId = this._getDataId(data);
		doLoop.call(this, function (item) {
			var _data = self._getItemData(item);
			var isMatch = data == _data;
			if (!isMatch) {
				var _id = self._getDataId(_data);
				isMatch = _id == dataId;
			}
			if (isMatch) {
				findItem = item;
				return false;
			}
			else if (!deep && !item.is(".open")) {
				return true;
			}
		});
		return findItem;
	};

	var getItemIndex = function (item, deep) {
		var index = -1;
		if (item && item.length > 0) {
			doLoop.call(this, function (_item, _index) {
				if (_item.is(item)) {
					index = _index;
					return false;
				}
				if (!deep && !_item.is(".open"))
					return true;
			});
		}
		return index;
	};

	var getItemId = function (item) {
		return this._getDataId(this._getItemData(item));
	};

	var getItemData = function (item) {
		var data = item.children(".tree-node").data("itemData");
		if (Utils.isBlank(data)) {
			var index = 0;
			var nodeIndex = getItemIndex.call(this, item, true);
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