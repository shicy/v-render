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
		this.trigger("itemclick", getItemData.call(this, item));
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

	// ====================================================
	var doOpen = function (item) {
		var data = item.is(".ui-popupmenu") ? null : item.data("itemData");
		var subDatas = !data ? this.getData() : getSubDatas.call(this, data);

		var datas = doOpenBefore.call(this, item, data, subDatas);
		if (Utils.isNull(datas)) {
			if (!tryLoadData.call(this, item))
				return ;
		}
		else if (!(datas && datas.length > 0)) {
			return ;
		}

		var container = $("<div class='menu-container'></div>").appendTo(this.$el);
		container.append("<div class='btn up'></div><div class='btn down'></div>");

		var itemContainer = $("<ul class='menus'></ul>").appendTo(container);
		renderMenuItems.call(this, itemContainer, datas);

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
			offset.top -= 2;
			offset.left += item.outerWidth();
			menuContainer.offset(offset);
		}
	};

	var renderMenuItems = function (container, datas) { console.log(datas)
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
	var tryLoadData = function (item) {
		return false;
	};

	var load = function (pdata, callback) {

	};

	// ====================================================
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