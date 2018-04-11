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
			
			var viewIndex = Utils.getIndexValue(this.options.viewIndex);
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

			tabbar.append("<div class='thumb'></div>");
		}
	};

	var renderButtons = function ($, target, buttons) {
		var header = target.children("header");
		header.children(".btnbar").remove();
		if (buttons && buttons.length > 0) {
			var self = this;
			var btnbar = $("<div class='btnbar'></div>").appendTo(header);
			if (!this.isRenderAsApp()) {
				Utils.each(buttons, function (data) {
					renderOneButton.call(self, $, btnbar, data);
				});
			}
		}
	};

	var renderOneButton = function ($, btnbar, data) {
		if (Utils.isBlank(data))
			return ;
		if (typeof data == "string")
			data = {name: data};

		var item = $("<div class='item'></div>").appendTo(btnbar);
		item.attr("name", Utils.trimToNull(data.name));

		var _isToggle = Utils.isTrue(data.toggle);

		if (_isToggle)
			item.attr("opt-toggle", "1");
		if (Utils.isNotBlank(data.tooltip))
			item.attr("title", data.tooltip);

		var btn = $("<button class='btn'></button>").appendTo(item);
		if (data.icon) {
			var icon = $("<i>&nbsp;</i>").appendTo(btn);
			if (typeof data.icon == "string")
				icon.css("backgroundImage", "url(" + data.icon + ")");
		}
		if (!data.icon || data.label !== false) {
			var label = $("<span></span>").appendTo(btn);
			label.text(Utils.trimToNull(data.label) || "按钮");
		}

		if (Utils.isArray(data.items) && data.items.length > 0) {
			var dropdown = $("<ul></ul>").appendTo(item.attr("has-dropdown", "1"));
			var hasIcon = false;
			Utils.each(data.items, function (temp, i) {
				var dropdownItem = $("<li></li>").appendTo(dropdown);
				dropdownItem.attr("name", Utils.trimToNull(temp.name));
				if (Utils.isNotBlank(temp.icon)) {
					hasIcon = true;
					$("<i>&nbsp;</i>").appendTo(dropdownItem).css("backgroundImage", "url(" + temp.icon + ")");
				}
				var label = Utils.trimToNull(temp.label);
				$("<span></span>").appendTo(dropdownItem).text(label || "选项");
				if (_isToggle && label && label == data.label)
					dropdownItem.addClass("active");
			});
			if (hasIcon)
				dropdown.attr("show-ic", "1");
		}
	};

	var renderContent = function ($, target) {
		var container = $("<section></section>").appendTo(target);
		container = $("<div class='container'></div>").appendTo(container);

		var content = $("<div></div>").appendTo(container);
		var contentView = this.options.content || this.options.view;
		if (Utils.isNotNull(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(content);
			else
				content.append(contentView.$el || contentView);
		}

		var viewports = this.getViewports();
		if (viewports && viewports.length > 0) {
			var viewIndex = Utils.getIndexValue(this.options.viewIndex);
			Utils.each(viewports, function (data, i) {
				contentView = data.content || data.view;
				if (Utils.isNotNull(contentView)) {
					var viewport = $("<div></div>").appendTo(container);
					viewport.attr("name", data.name);
					if (i == viewIndex)
						viewport.addClass("selected");
					if (Utils.isFunction(contentView.render))
						contentView.render(viewport);
					else
						viewport.append(contentView.$el || contentView);
				}
			});
		}
		
		if (container.children(".selected").length == 0)
			content.addClass("selected");
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.panel = Renderer;
	}

})(typeof VRender === "undefined");