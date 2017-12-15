// ========================================================
// 面板
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.panel)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
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

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.panel = Renderer;
	}

})(typeof VRender === "undefined");