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
		target.addClass("ui-panel");
		BaseRenderer.render.call(this, $, target);
		renderHeader.call(this, $, target);
		renderContent.call(this, $, target);
		// renderTabs.call(this, $, target);
		// renderButtons.call(this, $, target);
		return this;
	};

	Renderer.getTitle = function () {
		if (this.options.hasOwnProperty("title"))
			return this.options.title;
		var viewports = this.getViewports();
		if (viewports && viewports.length > 0)
			return false;
		return "标题";
	};

	// ====================================================
	_Renderer.getTitle = function () {
		return Renderer.getTitle.call(this);
	};

	_Renderer.getViewports = function () {
		if (this._viewports)
			return this._viewports;
		var viewports = this._viewports = [];
		Utils.each(Utils.toArray(this.options.viewports), function (data, i) {
			if (Utils.isNotBlank(data) && (typeof data == "object")) {
				data.name = data.name || ("view_" + i);
				viewports.push(data);
			}
		});
		return viewports;
	};

	_Renderer.getButtons = function () {
		return Utils.toArray(this.options.buttons);
	};

	// ====================================================
	var renderHeader = function ($, target) {
		var options = this.options || {};

		var header = $("<header></header>").appendTo(target);

		// 标题
		if (options.focusHtmlTitle) {
			$("<div class='title'></div>").appendTo(header).html(options.focusHtmlTitle);
		}
		else {
			var title = this.getTitle();
			if (title !== false && Utils.isNotBlank(title))
				$("<div class='title'></div>").appendTo(header).text(title);
		}

		// 视图
		renderTabs.call(this, $, target, this.getViewports());

		// 按钮
		renderButtons.call(this, $, target, this.getButtons());
	};

	var renderTabs = function ($, target, viewports) {
		var header = target.children("header");
		header.children(".tabbar").remove();
		if (viewports && viewports.length > 0) {
			var tabbar = $("<div class='tabbar'></div>").prependTo(header);
			header.children(".title").after(tabbar);
			
			var viewIndex = parseInt(this.options.viewIndex);
			viewIndex = (!isNaN(viewIndex) && viewIndex >= 0 && viewIndex < viewports.length) ? viewIndex : -1;
			Utils.each(viewports, function (data, i) {
				var tab = $("<div class='tab'></div>").appendTo(tabbar);
				tab.attr("name", data.name);

				if (data.focusHtmlLabel)
					tab.html(data.focusHtmlLabel);
				else
					$("<span></span>").appendTo(tab).text(data.label || data.name);

				if (i == viewIndex)
					tab.addClass("selected");
			});
		}
	};

	var renderButtons = function ($, target, buttons) {
		if (buttons && buttons.length > 0) {
			var self = this;
			var btnbar = $("<div class='btnbar'></div>").appendTo(target.children("header"));
			Utils.each(buttons, function (data) {

			});
			// var renderButtonsInner = function (target, datas) {
			// 	Utils.each(datas, function (data) {
			// 		if (typeof data === "string")
			// 			data = {name: data, label: data};
			// 		else if (!data)
			// 			return ;

			// 		var btn = $("<div class='item'></div>").appendTo(target);
			// 		btn.append("<button class='btn' name='" + (data.name || "") + 
			// 			"'>" + (data.label || data.name || "按钮") + "</button>");
			// 		if (Utils.isTrue(data.disabled))
			// 			btn.attr("disabled", "disabled");
			// 		if (Utils.isTrue(data.toggle))
			// 			btn.attr("toggle", "toggle");

			// 		var children = Utils.toArray(data.children);
			// 		if (children.length > 0) {
			// 			btn.addClass("has-child");
			// 			var subBtns = $("<div class='subbtns'></div>").appendTo(btn);
			// 			renderButtonsInner(subBtns, children);
			// 		}
			// 	});
			// };

			// var header = target.children("header");
			// var btns = $("<div class='btns'></div>").appendTo(header);
			// renderButtonsInner(btns, buttons);
		}
	};

	var renderOneButton = function ($, btnbar, data) {

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

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.panel = Renderer;
	}

})(typeof VRender === "undefined");