// ========================================================
// 面板
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

(function () {
	if (VRender.Component.Panel)
		return ;

	var Utils = VRender.Utils;
	var PanelRender = VRender.Component.Render.panel;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIPanel = window.UIPanel = Component.Panel = function (view, options) {
		if (this.init(view, options) != this)
			return Component.get(view);

		this.header = this.$el.children("header");

		this.$el.on("click", "header > .tabbar > .tab", tabClickHandler.bind(this));
		
		var btnbar = this.header.children(".btns");
		btnbar.on("click", ".btn", buttonHandler.bind(this));
		btnbar.on("mouseenter", ".subbtns > .item", buttonHoverHandler.bind(this));
		btnbar.on("mouseleave", ".subbtns > .item", buttonHoverHandler.bind(this));
	};
	var _UIPanel = UIPanel.prototype = new Component.base();

	UIPanel.find = function (view) {
		return Component.find(view, ".ui-panel", UIPanel);
	};

	UIPanel.create = function (options) {
		return Component.create(options, UIPanel, PanelRender);
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

	///////////////////////////////////////////////////////
	Component.register(".ui-panel", UIPanel);

})();
