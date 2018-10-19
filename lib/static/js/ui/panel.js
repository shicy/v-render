// ========================================================
// 面板
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

(function () {
	if (VRender.Component.Panel)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var PanelRender = Component.Render.panel;

	///////////////////////////////////////////////////////
	var UIPanel = window.UIPanel = Component.Panel = function (view, options) {
		if (!Component.base.isElement(view))
			return UIPanel.create(view);
		
		if (this.init(view, options) != this)
			return Component.get(view);

		this.header = this.$el.children("header");
		this.container = this.$el.children("section").children();

		this.header.on("tap", ".tabbar > .tab", onTabClickHandler.bind(this));

		if (this.isRenderAsApp()) {
			this.header.on("tap", ".btnbar > .popbtn", onPopupButtonClickHandler.bind(this));
		}
		else {
			this.header.on("tap", ".btnbar > .item > .btn", onButtonClickHandler.bind(this));
			this.header.on("tap", ".btnbar > .item > ul > li", onDropdownButtonClickHandler.bind(this));
		}

		doInit.call(this);
	};
	var _UIPanel = UIPanel.prototype = new Component.base();

	UIPanel.find = function (view) {
		return Component.find(view, ".ui-panel", UIPanel);
	};

	UIPanel.create = function (options) {
		return Component.create(options, UIPanel, PanelRender);
	};

	UIPanel.instance = function (target) {
		return Component.instance(target, ".ui-panel");
	};

	// ====================================================
	_UIPanel.getTitle = function () {
		return this.header.children(".title").text();
	};
	_UIPanel.setTitle = function (value) {
		if (Utils.isNotNull(value)) {
			value = Utils.trimToEmpty(value);
			var title = this.header.children(".title");
			if (title && title.length > 0) {
				if (value) {
					title.empty().append(value);
				}
				else {
					title.remove();
				}
			}
			else if (value) {
				title = $("<div class='title'></div>").prependTo(this.header);
				title.append(value);
			}
		}
	};

	_UIPanel.getButtons = function () {
		if (this.options.hasOwnProperty("buttons"))
			return Utils.toArray(this.options.buttons);
		var buttons = this.$el.attr("data-btns");
		if (buttons) {
			try {
				buttons = JSON.parse(buttons);
			}
			catch (e) {}
		}
		this.$el.removeAttr("data-btns");
		this.options.buttons = Utils.toArray(buttons);
		return buttons;
	};
	_UIPanel.setButtons = function (value) {
		this.options.buttons = value;
		PanelRender.renderButtons.call(this, $, this.$el, Utils.toArray(value));
		if (this.popupMenu) {
			this.popupMenu.destory();
			this.popupMenu = null;
		}
	};

	_UIPanel.setViewports = function (value, active) {
		var viewports = PanelRender.getFormatViewports.call(this, value);
		PanelRender.renderTabs.call(this, $, this.$el, viewports);
		PanelRender.renderViewports.call(this, $, this.container, viewports);
		this.setViewActive(active);
	};

	_UIPanel.isViewActive = function (name) {
		var item = Utils.find(this.header.find(".tabbar .tab"), function (tab) {
			return tab.attr("name") == name;
		});
		return item && item.is(".selected");
	};

	_UIPanel.getViewActive = function () {
		var item = this.header.find(".tabbar .selected");
		return item && item.attr("name");
	};

	_UIPanel.setViewActive = function (name) {
		if (Utils.isNotBlank(name))
			showViewport.call(this, name);
	};

	// ====================================================
	var onButtonClickHandler = function (e) {
		var btn = $(e.currentTarget);
		var item = btn.parent();
		if (item.attr("has-dropdown") == 1) {
			showBtnDropdown.call(this, item);
		}
		else if (item.attr("opt-toggle") == 1) {
			item.toggleClass("active");
		}
		var name = item.attr("name");
		if (Utils.isNotBlank(name))
			this.trigger("btnclick", name, btn.is(".active"));
	};

	var onPopupButtonClickHandler = function (e) {
		if (this.popupMenu) {
			this.popupMenu.open();
		}
		else {
			var items = getPopupMenus.call(this, this.getButtons());
			if (items && items.length > 0) {
				this.popupMenu = new Component.PopupMenu({target: this.$el, data: items});
				this.popupMenu.on("itemclick", onPopupMenuButtonHandler.bind(this));
			}
			if (this.popupMenu) {
				this.popupMenu.open();
			}
		}
	};

	var onPopupMenuButtonHandler = function (e, data) {
		if (data && Utils.isNotBlank(data.name))
			this.trigger("btnclick", data.name, !!data.checked);
	};

	var onDropdownButtonClickHandler = function (e) {
		var dropdownItem = $(e.currentTarget);
		var item = dropdownItem.parent().parent();
		if (item.attr("opt-toggle") == 1 && !dropdownItem.is(".active")) {
			dropdownItem.addClass("active").siblings().removeClass("active");
			var btn = item.children(".btn");
			// btn.attr("name", dropdownItem.attr("name"));
			var label = btn.children("span");
			if (label && label.length > 0)
				label.text(dropdownItem.children("span").text());
			var icon = btn.children("i");
			if (icon && icon.length > 0) {
				if (!icon.attr("data-src"))
					icon.attr("data-src", icon.css("backgroundImage"));
				var iconUrl = dropdownItem.children("i").css("backgroundImage") || icon.attr("data-src");
				icon.css("backgroundImage", iconUrl);
			}
		}
		hideBtnDropdown.call(this, item);
		var name = dropdownItem.attr("name");
		if (Utils.isNotBlank(name))
			this.trigger("btnclick", name, dropdownItem.is(".active"));
	};

	var onButtonMouseHandler = function (e) {
		var item = $(e.currentTarget);
		var timerId = parseInt(item.attr("timerid"));
		if (timerId) {
			clearTimeout(timerId);
			item.removeAttr("timerid");
		}
		if (e.type == "mouseleave") {
			var self = this;
			timerId = setTimeout(function () {
				item.removeAttr("timerid");
				hideBtnDropdown.call(self, item);
			}, 400);
			item.attr("timerid", timerId);
		}
	};

	var onTabClickHandler = function (e) {
		var item = $(e.currentTarget);
		if (!item.is(".selected"))
			showViewport.call(this, item.attr("name"));
	};

	// ====================================================
	var doInit = function () {
		this.getButtons(); // 初始化

		var tab = this.header.find(".tabbar .tab.selected");
		if (tab && tab.length > 0)
			showViewportThumbs.call(this, tab);
	};

	var showViewport = function (name) {
		var tabs = this.header.find(".tabbar .tab");
		var tabItem = Utils.find(tabs, function (tab) {
			return tab.attr("name") == name;
		});
		if (!tabItem || tabItem.length == 0)
			return ; // 不存在的视图
		if (tabItem.is(".selected"))
			return ;

		var lastTabItem = tabs.filter(".selected").removeClass("selected");
		tabItem.addClass("selected");
		showViewportThumbs.call(this, tabItem);

		var viewports = this.container.children();
		var viewport = Utils.find(viewports, function (item) {
			return item.attr("name") == name;
		});

		if (!viewport || viewport.length == 0)
			viewport = viewports.eq(0);

		if (!viewport.is(".selected")) {
			var currentViewport = viewports.filter(".selected");
			var swrapLeft = lastTabItem.index() < tabItem.index();
			viewport.addClass("animate-in");
			viewport.addClass(swrapLeft ? "animate-in-right" : "animate-in-left");
			currentViewport.addClass("animate-out");
			setTimeout(function () {
				viewport.removeClass("animate-in-left animate-in-right");
				currentViewport.addClass(swrapLeft ? "animate-out-left" : "animate-out-right");
				setTimeout(function () {
					viewport.addClass("selected").removeClass("animate-in");
					currentViewport.removeClass("selected animate-out animate-out-left animate-out-right");
				}, 400);
			}, 0);
		}

		this.trigger("change", tabItem.attr("name"), lastTabItem.attr("name"));
	};

	var showViewportThumbs = function (tab) {
		var thumb = this.header.children(".tabbar").children(".thumb");
		if (thumb && thumb.length > 0) {
			thumb.css("left", tab.position().left);
			thumb.css("width", tab.outerWidth());
		}
	};

	// ====================================================
	var showBtnDropdown = function (btnItem) {
		if (btnItem.is(".show-dropdown"))
			return ;
		btnItem.addClass("show-dropdown");
		btnItem.on("mouseenter", onButtonMouseHandler.bind(this));
		btnItem.on("mouseleave", onButtonMouseHandler.bind(this));
		setTimeout(function () {
			btnItem.addClass("animate-in");
		}, 0);
	};

	var hideBtnDropdown = function (btnItem) {
		btnItem.addClass("animate-out");
		btnItem.off("mouseenter").off("mouseleave");
		setTimeout(function () {
			btnItem.removeClass("show-dropdown");
			btnItem.removeClass("animate-in").removeClass("animate-out");
		}, 300);
	};

	var getPopupMenus = function (buttons) {
		if (buttons && buttons.length > 0) {
			var format = function (data) {
				var temp = {};
				temp.name = data.name;
				temp.label = data.label || data.name || "按钮";
				if (data.icon)
					temp.icon = data.icon;
				if (data.toggle)
					temp.toggle = data.toggle;
				if (data.disabled)
					temp.disabled = data.disabled;
				return temp;
			};
			return Utils.map(buttons, function (data) {
				var item = format(data);
				item.children = Utils.map(data.items, format);
				if (item.children.length == 0)
					delete item.children;
				return item;
			});
		}
		return null;
	};


	///////////////////////////////////////////////////////
	Component.register(".ui-panel", UIPanel);

})();