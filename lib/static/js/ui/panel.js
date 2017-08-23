// ========================================================
// 面板
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Panel)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-panel");
		renderHeader.call(this, $, target);
		renderContent.call(this, $, target);
		renderTabs.call(this, $, target);
		renderButtons.call(this, $, target);
		return this;
	};

	// ====================================================
	var renderHeader = function ($, target) {
		var options = this.options || {};

		var header = $("<header></header>").appendTo(target);

		// 标题
		var title = false;
		if (options.hasOwnProperty("title"))
			title = options.title;
		else if (!options.tabs)
			title = "标题";
		if (title || title === "0")
			header.append("<div class='title'>" + title + "</div>");
	};

	var renderContent = function ($, target) {
		var container = $("<section></section>").appendTo(target);
		var contentView = this.options.content || this.options.view;
		if (Utils.isNotBlank(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(container);
			else
				container.append(contentView.$el || contentView);
		}
	};

	var renderTabs = function ($, target) {
		var tabs = Utils.toArray(this.options.tabs);
		if (tabs.length > 0) {
			var tabIndex = parseInt(this.options.tabIndex);
			tabIndex = (!isNaN(tabIndex) && tabIndex >= 0) ? tabIndex : -1;

			var tabbar = $("<div class='tabbar'></div>").appendTo(target.children("header"));
			var tabviews = null;

			Utils.each(tabs, function (data, i) {
				if (typeof data === "string")
					data = {name: data, title: data};
				else if (!data)
					return ;

				var tab = $("<span class='tab'></span>").appendTo(tabbar);
				tab.attr("name", (data.name || ""));
				tab.text(data.title || data.name || "选项卡");
				if (tabIndex === i)
					tab.addClass("selected");

				if (data.name && (data.content || data.view || data.module)) {
					if (!tabviews)
						tabviews = $("<div class='tabviews'></div>").appendTo(target.children("section"));
					var tabview = $("<div class='tabview'></div>").appendTo(tabviews);
					tabview.attr("name", data.name);
					if (tabIndex === i)
						tabview.addClass("selected");
					var view = data.content || data.view;
					if (view) {
						if (Utils.isFunction(view.render))
							view.render(tabview);
						else
							tabview.append(view.$el || view);
					}
					if (data.module)
						tabview.attr("module", data.module);
				}
			});
		}
	};

	var renderButtons = function ($, target) {
		var buttons = Utils.toArray(this.options.buttons);
		if (buttons.length > 0) {
			var renderButtonsInner = function (target, datas) {
				Utils.each(datas, function (data) {
					if (typeof data === "string")
						data = {name: data, label: data};
					else if (!data)
						return ;

					var btn = $("<div class='item'></div>").appendTo(target);
					btn.append("<button class='btn' name='" + (data.name || "") + 
						"'>" + (data.label || data.name || "按钮") + "</button>");
					if (Utils.isTrue(data.disabled))
						btn.attr("disabled", "disabled");
					if (Utils.isTrue(data.toggle))
						btn.attr("toggle", "toggle");

					var children = Utils.toArray(data.children);
					if (children.length > 0) {
						btn.addClass("has-child");
						var subBtns = $("<div class='subbtns'></div>").appendTo(btn);
						renderButtonsInner(subBtns, children);
					}
				});
			};

			var header = target.children("header");
			var btns = $("<div class='btns'></div>").appendTo(header);
			renderButtonsInner(btns, buttons);
		}
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIPanel = window.UIPanel = Component.Panel = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);

		this.header = this.$el.children("header");

		var self = this;
		var btnbar = this.header.children(".btns");
		btnbar.on("click", ".btn", function (e) { return buttonHandler.call(self, e); });
		btnbar.on("mouseenter mouseleave", ".subbtns > .item", function (e) { buttonHoverHandler.call(self, e); });
		this.$el.on("click", "header > .tabbar > .tab", function (e) { tabClickHandler.call(self, e); });
	};
	var _UIPanel = UIPanel.prototype = new Component.base();

	UIPanel.find = function (view) {
		return Component.find(view, ".ui-panel", UIPanel);
	};

	UIPanel.create = function (options) {
		return Component.create(options, UIPanel, Holder);
	};

	// ====================================================
	var buttonHandler = function (e) {
		var btn = $(e.currentTarget), item = btn.parent();
		if (item.is("[disabled]"))
			return false;

		var body = $("body").off("click.vr_panel_btn");
		if (item.parent().is(".btns")) {
			item.parent().children(".open").removeClass("open");
			if (item.is(".has-child")) {
				item.addClass("open");
				var children = item.children(".subbtns").removeClass("pull-right");
				var right = children.offset().left + children.width();
				if (right > $(window).width())
					children.addClass("pull-right");
				setTimeout(function () {
					body.on("click.vr_panel_btn", function (e) {
						body.off("click.vr_panel_btn");
						item.removeClass("open");
					});
				}, 0);
			}
		}
		else {
			this.header.find(".btns > .item").removeClass("open");
			var topBtn = item;
			while (!topBtn.parent().is(".btns")) {
				topBtn = topBtn.parent();
			} console.log(topBtn)
			if (topBtn.is("[toggle]"))
				topBtn.children(".btn").text(btn.text());
		}

		var name = btn.attr("name");
		if (Utils.isNotBlank(name))
			this.trigger("btnclick", name, btn);
		return false;
	};

	var buttonHoverHandler = function (e) {
		var children = $(e.currentTarget).children(".subbtns");
		if (children && children.length > 0) {
			if (e.type === "mouseenter") {
				children.show().removeClass("pull-right");
				var right = children.offset().left + children.width();
				if (right > $(window).width())
					children.addClass("pull-right");
			}
			else {
				children.hide();
			}
		}
	};

	var tabClickHandler = function (e) {
		var tab = $(e.currentTarget);
		if (tab.is(".selected"))
			return ;

		tab.addClass("selected").siblings().removeClass("selected");

		var views = this.$el.find(".tabviews > .tabview").removeClass("selected");

		var name = tab.attr("name");
		if (Utils.isNotBlank(name))
			views.filter("[name='" + name + "']").addClass("selected");
	};

	// ====================================================
	Component.register(".ui-panel", UIPanel);

})(typeof VRender !== "undefined");
