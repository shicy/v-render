// ========================================================
// 对话框
// @author shicy <shicy85@163.com>
// Create on 2018-01-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.dialog)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;
	var UIButton = backend ? require("../../../ui/component/UIButton") : VRender.Component.UIButton;

	var defaultButtons = [{name: "cancel", label: "取消", type: "cancel"}, {name: "ok", label: "确定", type: "primary"}];

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-dialog").addClass("ui-hidden");
		BaseRenderer.render.call(this, $, target);

		var container = $("<div class='dialog-container'></div>").appendTo(target);
		var dialogView = $("<div class='dialog-view'></div>").appendTo(container);

		renderDialogHeader.call(this, $, target, dialogView);
		renderDialogContent.call(this, $, target, dialogView);
		renderDialogFooter.call(this, $, target, dialogView);
	};

	_Renderer.getTitle = function () {
		var title = this.options.title;
		if (Utils.isNull(title))
			return "标题";
		if (Utils.isBlank(title))
			return "&nbsp;";
		return title;
	};

	// ====================================================
	var renderDialogHeader = function ($, target, dialogView) {
		var dialogHeader = $("<header></header>").appendTo(dialogView);

		var title = $("<div class='title'></div>").appendTo(dialogHeader);
		title.html(this.getTitle());

		dialogHeader.append("<button class='closebtn'>x</button>");
	};

	var renderDialogContent = function ($, target, dialogView) {
		dialogView.append("<section></section>");
		var contentView = this.options.content || this.options.view;
		renderContentView.call(this, $, target, contentView);
	};

	var renderDialogFooter = function ($, target, dialogView) {
		dialogView.append("<footer></footer>");
		renderFootButtons.call(this, $, target, this.options.buttons);
	};

	var renderContentView = function ($, target, contentView) {
		var container = target.find(".dialog-view").children("section").empty();
		if (Utils.isNotBlank(contentView)) {
			if (Utils.isFunction(contentView.render))
				contentView.render(container);
			else if (contentView.$el)
				contentView.$el.appendTo(container);
			else
				container.append(contentView);
		}
	};

	var renderFootButtons = function ($, target, buttons) {
		target.removeClass("has-btns");
		var container = target.find(".dialog-view").children("footer");
		container.children(".btnbar").remove();

		buttons = Utils.toArray(buttons || defaultButtons);
		if (buttons && buttons.length > 0) {
			target.addClass("has-btns");
			var btnbar = $("<div class='btnbar'></div>").appendTo(container);
			Utils.each(buttons, function (button) {
				var btn = $("<div class='btn'></div>").appendTo(btnbar);
				btn.attr("name", button.name);
				if (backend)
					new UIButton(this.context, button).render(btn);
				else
					UIButton.create(Utils.extend({}, button, {target: btn}));
			});
		}
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.dialog = Renderer;
	}

})(typeof VRender === "undefined");