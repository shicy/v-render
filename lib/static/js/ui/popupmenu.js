// ========================================================
// 弹出菜单
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

(function () {
	if (VRender.Component.PopupMenu)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var PopupMenuRender = Renderer.popupmenu;

	///////////////////////////////////////////////////////
	var UIPopupMenu = window.UIPopupMenu = Component.PopupMenu = function (view, options) {
		if (!Component.base.isElement(view))
			return UIPopupMenu.create(view);
		
		if (this.init(view, options) != this)
			return Component.get(view);

		this.options.autoLoad = false;

		this.setActionTarget(this.getActionTarget());

		this.$el.on("tap", onClickHandler.bind(this));
		this.$el.on("tap", ".menu", onItemClickHandler.bind(this));
		this.$el.on("tap", ".more", onMoreClickHandler.bind(this));
		if (this.isRenderAsApp()) {
			this.$el.on("tap", ".back", onBackClickHandler.bind(this));
		}
		else {
			this.$el.on("mouseenter", ".menu", onItemMouseEnterHandler.bind(this));
			this.$el.on("mouseleave", ".menu", onItemMouseLeaveHandler.bind(this));
			this.$el.on("mouseenter", ".menu-container > .btn", onScrollMouseEnterHandler.bind(this));
			this.$el.on("mouseleave", ".menu-container > .btn", onScrollMouseLeaveHandler.bind(this));
		}
	};
	var _UIPopupMenu = UIPopupMenu.prototype = new Component.item();

	UIPopupMenu.find = function (view) {
		return Component.find(view, ".ui-popupmenu", UIPopupMenu);
	};

	UIPopupMenu.create = function (options) {
		return Component.create(options, UIPopupMenu, PopupMenuRender);
	};

	UIPopupMenu.instance = function (target) {
		return Component.instance(target, ".ui-popupmenu");
	};

	// ====================================================
	_UIPopupMenu.open = function () {
		var target = this.$el.show();
		doOpen.call(this, target);
		if (this.isRenderAsApp()) {
			$("body").addClass("ui-scrollless");
			setTimeout(function () {
				target.addClass("animate-open");
			}, 0);
		}
		else {
			var self = this;
			setTimeout(function () {
				$("body").on(("tap._" + self.getViewId()), function () {
					self.close();
					self.trigger("cancel");
				});
			}, 0);
		}
	};

	_UIPopupMenu.close = function () {
		var target = this.$el;
		if (this.isRenderAsApp()) {
			$("body").removeClass("ui-scrollless");
			target.removeClass("animate-open");
			target.children(".menu-container").last().height(0);
			setTimeout(function () {
				target.empty().hide();
			}, 300);
		}
		else {
			target.empty().hide();
			$("body").off("tap._" + this.getViewId());
		}
	};

	_UIPopupMenu.destory = function () {
		this.close();
		var self = this;
		setTimeout(function () {
			self.$el.remove();
		}, 300);
	};

	// ====================================================
	_UIPopupMenu.getActionTarget = function () {
		if (this.options.hasOwnProperty("actionTarget"))
			return this.options.actionTarget;
		this.options.actionTarget = Utils.trimToNull(this.$el.attr("opt-target"));
		this.$el.removeAttr("opt-target");
		return this.options.actionTarget;
	};
	_UIPopupMenu.setActionTarget = function (value) {
		if (this.actionTarget == value)
			return ;

		var actionType = Utils.trimToNull(this.getActionType()) || "click";
		var eventType = actionType + "._" + this.getViewId();

		if (this.actionTarget) {
			if (typeof this.actionTarget == "string")
				$("body").off(eventType, this.actionTarget);
			else // if (Utils.isFunction(this.actionTarget.off))
				this.actionTarget.off(eventType);
		}

		this.actionTarget = value;
		if (this.actionTarget) {
			if (typeof this.actionTarget == "string")
				$("body").on(eventType, this.actionTarget, onActionTargetHandler.bind(this));
			else {
				this.actionTarget = $(this.actionTarget);
				this.actionTarget.on(eventType, onActionTargetHandler.bind(this));
			}
		}

		this.$el.removeAttr("opt-target");
	};

	_UIPopupMenu.getActionType = function () {
		if (this.options.hasOwnProperty("actionType"))
			return this.options.actionType;
		this.options.actionType = Utils.trimToNull(this.$el.attr("opt-trigger"));
		this.$el.removeAttr("opt-trigger");
		return this.options.actionType;
	};
	_UIPopupMenu.setActionType = function (value) {
		this.options.actionType = value;
		this.$el.removeAttr("opt-trigger");
	};

	_UIPopupMenu.getIconField = function () {
		if (this.options.hasOwnProperty("iconField"))
			return this.options.iconField;
		this.options.iconField = Utils.trimToNull(this.$el.attr("opt-ic")) || "icon";
		this.$el.removeAttr("opt-ic");
		return this.options.iconField;
	};
	_UIPopupMenu.setIconField = function (value) {
		this.options.iconField = value;
		this.$el.removeAttr("opt-ic");
	};

	_UIPopupMenu.getIconFunction = function () {
		return Renderer.fn.getFunction.call(this, "iconFunction", "icfunc");
	};
	_UIPopupMenu.setIconFunction = function (value) {
		this.options.iconFunction = value;
		this.$el.children(".ui-fn[name='icfunc']").remove();
	};

	_UIPopupMenu.getOffsetLeft = function () {
		if (!this.options.hasOwnProperty("offsetLeft")) {
			this.options.offsetLeft = this.$el.attr("opt-offsetl");
			this.$el.removeAttr("opt-offsetl");
		}
		if (this.options.offsetLeft)
			return Utils.getFormatSize(this.options.offsetLeft, this.isRenderAsRem());
		return null;
	};
	_UIPopupMenu.setOffsetLeft = function (value) {
		this.options.offsetLeft = value;
		this.$el.removeAttr("opt-offsetl");
	};

	_UIPopupMenu.getOffsetTop = function () {
		if (!this.options.hasOwnProperty("offsetTop")) {
			this.options.offsetTop = this.$el.attr("opt-offsett");
			this.$el.removeAttr("opt-offsett");
		}
		if (this.options.offsetTop)
			return Utils.getFormatSize(this.options.offsetTop, this.isRenderAsRem());
		return null;
	};
	_UIPopupMenu.setOffsetTop = function (value) {
		this.options.offsetTop = value;
		this.$el.removeAttr("opt-offsett");
	};

	// ====================================================
	_UIPopupMenu._getChildrenField = function () {
		return "children";
	};

	_UIPopupMenu._getDisabledField = function () {
		return "disabled";
	};

	_UIPopupMenu._getIcon = function (data) {
		var iconFunction = this.getIconFunction();
		if (Utils.isFunction(iconFunction))
			return iconFunction(data);

		var iconField = this.getIconField();
		return (data && iconField) ? data[iconField] : null;
	};

	_UIPopupMenu._isDisabled = function (data) {
		if (data) {
			var disabledField = this._getDisabledField();
			if (disabledField) {
				if (Utils.isTrue(data[disabledField]))
					return true;
			}
			return false;
		}
		return true;
	};

	_UIPopupMenu._isChecked = function (data) {
		if (data) {
			return !!data.checked;
		}
		return false;
	};

	_UIPopupMenu._checkIfEmpty = function () {
		// do nothing
	};

	// ====================================================
	var onActionTargetHandler = function (e) {
		if (!this._isMounted(this.$el)) {
			this.setActionTarget(null);
		}
		else {
			this.open();
		}
	};

	var onClickHandler = function (e) {
		if (this.isRenderAsApp()) {
			if ($(e.target).is(".ui-popupmenu")) {
				this.close();
				this.trigger("cancel");
			}
		}
		return false;
	};

	var onItemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;
		if (item.is(".has-child")) {
			if (this.isRenderAsApp())
				doOpen.call(this, item);
		}
		else {
			var data = getItemData.call(this, item);
			if (data.toggle) {
				if (!data.checked) {
					var self = this;
					var _loop = function (datas) {
						if (!(datas && datas.length > 0))
							return ;
						Utils.each(datas, function (_data) {
							if (Utils.isArray(_data)) {
								_loop(_data);
							}
							else {
								if (_data.toggle === data.toggle)
									_data.checked = false;
								_loop(getSubDatas.call(self, _data));
							}
						});
					};
					_loop(this.getData());
					data.checked = true;
				}
				else if (!data.toggleRadio) {
					data.checked = false;
				}
			}
			this.trigger("itemclick", data);
			this.close();
		}
	};

	var onMoreClickHandler = function (e) {
		var item = $(e.currentTarget);
		var container = item.parent().parent().parent();

		var api = getLoadApi.call(this);
		var params = getLoadParams.call(this);

		params.p_no = parseInt(item.attr("page-no")) || 1;
		params.p_no += 1;

		var parentData = container.data("itemData");
		params.pid = this._getDataKey(parentData);

		item.parent().remove();
		var datas = !parentData ? this.getData() : getSubDatas.call(this, parentData);
		datas.pop();

		var self = this;
		doLoad.call(this, container, api, params, function (err, _datas) {
			if (_datas && _datas.length > 0) {
				Utils.each(_datas, function (temp) {
					datas.push(temp);
				});
			}
		});
	};

	var onBackClickHandler = function (e) {
		var item = $(e.currentTarget);
		var container = item.parent();
		container.height(0);
		var prevContainer = container.prev();
		prevContainer.height(0);
		setTimeout(function () {
			container.remove();
			prevContainer.height(prevContainer.get(0).scrollHeight);
		}, 120);
	};

	var onItemMouseEnterHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;

		var container = item.parent().parent().parent();
		var lastItem = container.find(".hover");
		if (lastItem && lastItem.length > 0) {
			lastItem.removeClass("hover");
			closeAfter.call(this, container);

			var timerId = parseInt(lastItem.attr("t-hover"));
			if (timerId) {
				clearTimeout(timerId);
				lastItem.removeAttr("t-hover");
			}
		}

		item.addClass("hover");

		if (item.is(".has-child"))
			doOpen.call(this, item);
	};

	var onItemMouseLeaveHandler = function (e) {
		var item = $(e.currentTarget);
		var container = item.data("submenu");
		if (!container || container.length == 0) {
			var self = this;
			var timerId = setTimeout(function () {
				item.removeClass("hover");
				item.removeAttr("t-hover");
			}, 100);
			item.attr("t-hover", timerId);
		}
	};

	var onScrollMouseEnterHandler = function (e) {
		var btn = $(e.currentTarget);
		var container = btn.parent();

		var self = this;
		var _scroll = function () {
			var menuContainer = container.children(".menus");
			var maxHeight = container.height() - menuContainer.height();

			var top = parseInt(container.attr("scroll-top")) || 0;
			var step = btn.is(".up") ? 5 : -5;
			
			var __scroll = function () {
				var timerId = setTimeout(function () {
					var _top = top + step;
					if (btn.is(".up")) {
						if (_top > 0)
							_top = 0;
					}
					else {
						if (_top < maxHeight)
							_top = maxHeight;
					}
					if (top != _top) {
						top = _top;
						container.attr("scroll-top", top);
						menuContainer.css("transform", "translate(0px, " + top + "px)");
					}
					__scroll();
				}, 50);
				container.attr("t_scroll", timerId);
			};
			__scroll();
		};

		// 停留一段时间开始滚动
		container.attr("t_scroll", setTimeout(_scroll, 200));
	};

	var onScrollMouseLeaveHandler = function (e) {
		var container = $(e.currentTarget).parent();
		var timerId = parseInt(container.attr("t_scroll"));
		if (timerId) {
			clearTimeout(timerId);
			container.removeAttr("t_scroll");
		}
	};

	// ====================================================
	var doOpen = function (item) {
		var data = getItemData.call(this, item);
		var subDatas = getItemSubDatas.call(this, item);

		var datas = doOpenBefore.call(this, item, data, subDatas);
		if (Utils.isNull(datas)) {
			if (!tryLoadData.call(this, item))
				return ;
		}
		else if (!(datas && datas.length > 0)) {
			if (!tryLoadData.call(this, item))
				return ;
		}

		var container = $("<div class='menu-container'></div>").appendTo(this.$el);
		container.append("<div class='btn up'></div><div class='btn down'></div>");

		if (this.isRenderAsApp() && !isRootItem(item)) {
			$("<div class='back'></div>").appendTo(container).text(this.options.backText || "返回");
		}

		var menuContainer = $("<div class='menus'></div>").appendTo(container);
		renderMenuItems.call(this, menuContainer, datas);

		item.data("submenu", container);
		container.data("itemData", data);
		doOpenAfter.call(this, item, container);

		this.trigger("open", data);
	};

	var doOpenBefore = function (item, data, subDatas) {
		var event = {type: "open_before"};
		this.trigger(event, data, subDatas);
		if (event.hasOwnProperty("returnValue"))
			subDatas = event.returnValue;

		var datas = !!subDatas ? Utils.toArray(subDatas) : null;
		if (data) {
			var childrenField = this._getChildrenField();
			data[childrenField] = datas;
		}

		return datas;
	};

	var doOpenAfter = function (item, container) {
		if (this.isRenderAsApp()) {
			// 
		}
		else {
			var _isRootItem = isRootItem(item);
			if (_isRootItem) {
				container.css("left", this.getOffsetLeft() || "");
				container.css("top", this.getOffsetTop() || "");
			}
			else {
				var offset = item.offset();
				offset.top -= 3;
				offset.left += item.outerWidth() + 1;
				container.offset(offset);
			}

			var offset = Utils.offset(container);

			var maxHeight = offset.windowHeight;
			if (_isRootItem)
				maxHeight -= offset.top;
			container.css("maxHeight", maxHeight + "px");

			if (!_isRootItem) {
				var _offset = container.offset();
				if (offset.isOverflowX) {
					_offset.left -= offset.width + item.outerWidth();
				}
				if (offset.isOverflowY) {
					_offset.top -= offset.top + offset.height - offset.windowHeight;
				}
				container.offset({left: _offset.left, top: _offset.top});
			}

			if (container.height() < container.children(".menus").height())
				container.addClass("scroll").css("minHeight", "80px");
		}
	};

	var renderMenuItems = function (menuContainer, datas) {
		if (!datas || datas.length == 0)
			return ;
		var self = this;
		var group = menuContainer.children(".grp").last();
		Utils.each(datas, function (data, i) {
			if (Utils.isArray(data) && data.length > 0) {
				group = $("<div class='grp'></div>").appendTo(menuContainer);
				if (data.title)
					$("<div class='title'></div>").appendTo(group).text(data.title);
				Utils.each(data, function (temp, j) {
					if (j === 0 && temp.__group__) {
						$("<div class='title'></div>").appendTo(group).text(temp.__group__);
					}
					else if (temp.__type__ == "more") {
						var more = $("<div class='more'></div>").appendTo(group);
						more.attr("page-no", temp.page);
						more.text(self.options.moreText || "加载更多");
					}
					else {
						var item = $("<div class='menu'></div>").appendTo(group);
						renderOneMenuItem.call(self, item, temp);
					}
				});
				group = null;
			}
			else {
				if (!group || group.length == 0)
					group = $("<div class='grp'></div>").appendTo(menuContainer);
				var item = $("<div class='menu'></div>").appendTo(group);
				renderOneMenuItem.call(self, item, data);
			}
		});
		if (this.isRenderAsApp()) {
			var container = menuContainer.parent();
			container.height(0);
			setTimeout(function () {
				container.height(container.get(0).scrollHeight);
			}, 0);
		}
	};

	var renderOneMenuItem = function (item, data) {
		item.data("itemData", data);

		var iconUrl = this._getIcon(data);
		if (Utils.isNotBlank(iconUrl)) {
			var icon = $("<i></i>").appendTo(item);
			icon.css("backgroundImage", "url(" + iconUrl + ")");
		}

		var content = $("<div></div>").appendTo(item);
		var itemRenderer = this.getItemRenderer();
		if (Utils.isFunction(itemRenderer)) {
			var result = itemRenderer($, content, data);
			if (Utils.isNotNull(result))
				content.empty().append(result);
		}
		else {
			var label = this._getDataLabel(data);
			content.text(Utils.trimToEmpty(label));
		}

		if (!!getSubDatas.call(this, data))
			item.addClass("has-child");
		if (this._isDisabled(data))
			item.addClass("disabled").attr("disabled", "disabled");
		if (this._isChecked(data))
			item.addClass("checked");
	};

	var closeAfter = function (menuContainer) {
		var menus = this.$el.children(".menu-container");
		var index = menuContainer.index();
		for (var i = menus.length - 1; i >= 0; i--) {
			if (index >= i)
				return ;
			menus.eq(i).remove();
		}
	};

	// ====================================================
	var tryLoadData = function (item) {
		var apiName = getLoadApi.call(this);
		if (Utils.isBlank(apiName))
			return false;

		var apiParams = getLoadParams.call(this) || {};
		apiParams.p_no = 1;
		apiParams.pid = getItemId.call(this, item);

		var self = this;
		setTimeout(function () {
			var container = item.data("submenu");
			doLoad.call(self, container, apiName, apiParams, function (err, datas) {
				var isEmpty = false
				if (!datas || datas.length == 0) {
					isEmpty = true;
					datas = [{label: "没有选项"}];
					datas[0][self._getDisabledField()] = true;
				}
				if (isRootItem(item))
					self.options.data = datas;
				else {
					var data = getItemData.call(self, item);
					if (data)
						data[self._getChildrenField()] = datas;
				}
				if (isEmpty) {
					renderMenuItems.call(self, container.children(".menus"), datas);
				}
			});
		}, 0);

		return true;
	};

	var doLoad = function (container, api, params, callback) {
		var menuContainer = container.children(".menus");
		var loadingGrp = $("<div class='grp'></div>").appendTo(menuContainer);
		var loadingItem = $("<div class='loading'></div>").appendTo(loadingGrp);
		loadingItem.append(this.options.loadingText || "正在加载...");

		var self = this;
		Component.load.call(this, api, params, function (err, data) {
			loadingGrp.remove();
			var datas = !err ? Utils.toArray(data) : null;
			if (datas && datas.length > 0) {
				datas[0].children = [];

				if (self.hasMore()) {
					datas.push([{__type__: "more", page: self._pageInfo.page}]);
				}
				
				renderMenuItems.call(self, menuContainer, datas);
			}
			callback(err, datas);
		});
	};

	var getLoadApi = function () {
		if (this.lastLoadApi)
			return this.lastLoadApi;
		if (this.options.hasOwnProperty("api"))
			return this.options.api;
		return this.$el.attr("api-name");
	};

	var getLoadParams = function () {
		if (this.lastLoadParams)
			return this.lastLoadParams;
		if (this.options.hasOwnProperty("params"))
			return this.options.params;
		try {
			return JSON.parse(this.$el.attr("api-params") || null);
		}
		catch (e) {}
		return null;
	};

	// ====================================================
	var isRootItem = function (item) {
		return item.is(".ui-popupmenu");
	};

	var getItemId = function (item) {
		return this._getDataKey(getItemData.call(this, item));
	};

	var getItemData = function (item) {
		if (isRootItem(item))
			return null;
		return item.data("itemData");
	};

	var getItemSubDatas = function (item) {
		if (isRootItem(item))
			return this.getData();
		var data = getItemData.call(this, item);
		return getSubDatas.call(this, data);
	};

	var getSubDatas = function (data) {
		if (data) {
			var childrenField = this._getChildrenField();
			if (Utils.isArray(data[childrenField]))
				return data[childrenField];
		}
		return null;
	};

	var hasSubDatas = function (data) {
		var datas = getSubDatas.call(this, data);
		if (!!datas)
			return true;
		if (data) {
			if (data.hasOwnProperty("hasChild")) {
				if (Utils.isTrue(data.hasChild))
					return true;
			}
			if (data.hasOwnProperty("leaf")) {
				if (Utils.isTrue(data.leaf))
					return false;
			}
		}
		return false;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-popupmenu", UIPopupMenu);

})();