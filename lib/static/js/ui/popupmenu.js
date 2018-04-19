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
	var PopupMenuRender = Component.Render.popupmenu;

	///////////////////////////////////////////////////////
	var UIPopupMenu = window.UIPopupMenu = Component.PopupMenu = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);

		this.viewId = Utils.randomTxt(8);
		this.options.autoLoad = false;

		this.setActionTarget(this.getActionTarget());

		this.$el.on("tap", onClickHandler.bind(this));
		this.$el.on("tap", ".menu", onItemClickHandler.bind(this));
		if (this.isRenderAsApp()) {
		}
		else {
			this.$el.on("mouseenter", ".menu", onItemMouseEnterHandler.bind(this));
			this.$el.on("mouseleave", ".menu", onItemMouseLeaveHandler.bind(this));
			// this.$el.on("mousedown", ".menu-container > .btn", onScrollMouseHandler.bind(this));
			this.$el.on("mouseenter", ".menu-container > .btn", onScrollMouseEnterHandler.bind(this));
			this.$el.on("mouseleave", ".menu-container > .btn", onScrollMouseLeaveHandler.bind(this));
		}
	};
	var _UIPopupMenu = UIPopupMenu.prototype = new Component.list();

	UIPopupMenu.find = function (view) {
		return Component.find(view, ".ui-popupmenu", UIPopupMenu);
	};

	UIPopupMenu.create = function (options) {
		return Component.create(options, UIPopupMenu, PopupMenuRender);
	};

	// ====================================================
	_UIPopupMenu.open = function () {
		doOpen.call(this, this.$el);
		if (!this.isRenderAsApp()) {
			var self = this;
			setTimeout(function () {
				$("body").on(("tap._" + self.viewId), function () {
					self.close();
				});
			}, 0);
		}
	};

	_UIPopupMenu.close = function () {
		this.$el.empty();
		if (!this.isRenderAsApp()) {
			$("body").off("tap._" + this.viewId);
		}
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
		var eventType = actionType + "." + this.viewId;

		if (this.actionTarget) {
			if (typeof this.actionTarget == "string")
				$("body").off(eventType, this.actionTarget);
			else 
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
		this.options.actionType = Utils.trimToNull(this.$el.attr("opt-tigger"));
		this.$el.removeAttr("opt-tigger");
		return this.options.actionType;
	};
	_UIPopupMenu.setActionType = function (value) {
		this.options.actionType = value;
		this.$el.removeAttr("opt-tigger");
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
		return Component.list.getFunction.call(this, "iconFunction", "icfunc");
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
		// if (this.options.hasOwnProperty("disabledField"))
		// 	return this.options.disabledField;
		// var disabledField = Utils.trimToNull(this.$el.attr("opt-ic")) || "disabled";
		// this.options.disabledField = disabledField;
		// this.$el.removeAttr("opt-ic");
		// return disabledField;
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
	}

	// ====================================================
	var onActionTargetHandler = function (e) {
		this.open();
	};

	var onClickHandler = function (e) {
		if (this.isRenderAsApp()) {

		}
		else {
			return false;
		}
	};

	var onItemClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;
		if (item.is(".has-child"))
			return ;

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
	};

	var onItemMouseEnterHandler = function (e) {
		var item = $(e.currentTarget);
		if (item.is(".disabled"))
			return ;

		var itemContainer = item.parent().parent();
		var lastItem = itemContainer.find(".hover");
		if (lastItem && lastItem.length > 0) {
			lastItem.removeClass("hover");
			closeAfter.call(this, itemContainer);

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
		var itemContainer = item.parent().parent();
		if (itemContainer.next().length == 0) {
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
		var data = item.is(".ui-popupmenu") ? null : getItemData.call(this, item);
		var subDatas = !data ? this.getData() : getSubDatas.call(this, data);

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

		var itemContainer = $("<ul class='menus'></ul>").appendTo(container);
		renderMenuItems.call(this, itemContainer, datas);

		item.data("submenu", container);
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

	var doOpenAfter = function (item, menuContainer) {
		if (item.is(".ui-popupmenu")) {
			var offsetLeft = this.getOffsetLeft();
			if (offsetLeft)
				menuContainer.css("left", offsetLeft);
			var offsetTop = this.getOffsetTop();
			if (offsetTop)
				menuContainer.css("top", offsetTop);
		}
		else {
			var offset = item.offset();
			offset.top -= 3;
			offset.left += item.outerWidth() + 1;
			menuContainer.offset(offset);
		}

		var target = $(window);
		var targetWidth = target.width();
		var targetHeight = target.height();

		menuContainer.css("maxHeight", targetHeight);

		var offset = Utils.offsetWindow(menuContainer);
		offset.width = menuContainer.outerWidth();
		offset.height = menuContainer.outerHeight();

		var _offset = menuContainer.offset();
		if (offset.left + offset.width > targetWidth) {
			// _offset.left -= offset.left + offset.width - targetWidth + offset.width;
			_offset.left = item.offset().left - item.outerWidth();
		}
		if (offset.top + offset.height > targetHeight) {
			if (item.is(".ui-popupmenu"))
				menuContainer.css("maxHeight", targetHeight - offset.top);
			else
				_offset.top -= offset.top + offset.height - targetHeight;
		}

		menuContainer.offset({left: _offset.left, top: _offset.top});
		if (menuContainer.height() < menuContainer.children(".menus").height())
			menuContainer.addClass("scroll").css("minHeight", "80px");
	};

	var renderMenuItems = function (container, datas) {
		if (datas && datas.length > 0) {
			var self = this;
			var addMenu = function (data) {
				var item = $("<li class='menu'></li>").appendTo(container);
				renderOneMenuItem.call(self, item, data);
			};

			var isLastGroup = false;
			Utils.each(datas, function (data, i) {
				if (Utils.isArray(data) && data.length > 0) {
					if (i > 0)
						$("<li class='sep'></li>").appendTo(container);
					if (data.title)
						$("<li class='title'></li>").appendTo(container).text(data.title);
					Utils.each(data, function (temp, j) {
						if (j === 0 && temp.__group__) {
							$("<li class='title'></li>").appendTo(container).text(temp.__group__);
						}
						else {
							var item = $("<li class='menu'></li>").appendTo(container);
							renderOneMenuItem.call(self, item, temp);
						}
					});
					isLastGroup = true;
				}
				else {
					if (isLastGroup)
						$("<li class='sep'></li>").appendTo(container);
					var item = $("<li class='menu'></li>").appendTo(container);
					renderOneMenuItem.call(self, item, data);
					isLastGroup = false;
				}
			});
		}
	};

	var renderOneMenuItem = function (item, data) {
		item.data("itemData", data);

		var box = $("<div class='box'></div>").appendTo(item);

		var iconUrl = this._getIcon(data);
		if (Utils.isNotBlank(iconUrl)) {
			var icon = $("<i></i>").appendTo(box);
			icon.css("backgroundImage", "url(" + iconUrl + ")");
		}

		var content = $("<div></div>").appendTo(box);
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
		for (var i = menus.length - 1; i >= 0; i--) {
			var menu = menus.eq(i);
			if (menu.is(menuContainer))
				return ;
			menu.remove();
		}
	};

	// ====================================================
	var tryLoadData = function (item) { console.log(item);
		var apiName = getLoadApi.call(this);
		if (Utils.isBlank(apiName))
			return false;

		var apiParams = getLoadParams.call(this) || {};
		apiParams.p_no = 1;
		apiParams.pid = item.is(".ui-popupmenu") ? null : getItemId.call(this, item);

		var self = this;
		setTimeout(function () {
			var container = item.data("submenu");
			doLoad.call(self, container, apiName, apiParams, function (err, datas) { console.log(item);
				if (item.is(".ui-popupmenu"))
					self.options.data = datas || [];
				else {
					var data = getItemData.call(self, item);
					var childrenField = self._getChildrenField();
					data[childrenField] = datas || [];
				}
				if (!datas || datas.length == 0) {
					var menuContainer = container.children(".menus");
					var item = $("<li class='menu disabled' disabled='disabled'></li>").appendTo(menuContainer);
					item.append("<div class='box'><div>没有选项</div></div>");
				}
			});
		}, 0);

		return true;
	};

	var doLoad = function (container, api, params, callback) {
		var menuContainer = container.children(".menus");
		var loadingItem = $("<li class='loading'></li>").appendTo(menuContainer);
		loadingItem.append("<div>" + (this.loadingText || "正在加载...") + "</div>");

		var self = this;
		Component.load.call(this, api, params, function (err, data) {
			loadingItem.remove();
			var datas = !err ? Utils.toArray(data) : null;
			if (datas && datas.length > 0) {
				datas[0].children = [];
				renderMenuItems.call(self, menuContainer, datas);
				var hasMore = self._totalSize > (self._pageSize * self._pageNo);
				if (hasMore) {
					var moreItem = $("<li class='more'></li>").appendTo(container);
					moreItem.append("<div>" + (self.moreText || "加载更多..") + "</div>");
					moreItem.attr("page-no", self._pageNo);
				}
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
	var getItemId = function (item) {
		return this._getDataId(getItemData.call(this, item));
	};

	var getItemData = function (item) {
		return item.data("itemData");
	};

	var getSubDatas = function (data) {
		if (data) {
			var childrenField = this._getChildrenField();
			if (Utils.isArray(data[childrenField]))
				return data[childrenField];
		}
		return null;
	};

	///////////////////////////////////////////////////////
	Component.register(".ui-popupmenu", UIPopupMenu);

})();