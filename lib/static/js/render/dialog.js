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
	var UIButton = backend ? require("../../../ui/component/UIButton") : VRender.Component.Button;

	var defaultButtons = [{name: "cancel", label: "取消", type: "cancel"}, {name: "ok", label: "确定", type: "primary"}];

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	_Renderer.render = function ($, target) {
		target.addClass("ui-dialog").css("display", "none");
		target.attr("opt-trans", "translate");
		BaseRenderer.render.call(this, $, target);

		if (/^small|big|auto$/.test(this.options.size))
			target.attr("opt-size", this.options.size);

		if (Utils.isTrue(this.options.fill))
			target.attr("opt-fill", "1");

		if (this.options.openbtn)
			target.attr("opt-active", this.options.openbtn);

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
		container = $("<div class='container'></div>").appendTo(container);
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
			btnbar.attr("opt-len", buttons.length);
			Utils.each(buttons, function (button) {
				var btn = $("<div class='btn'></div>").appendTo(btnbar);
				btn.attr("name", button.name);

				if (button.waitclose === true)
					btn.attr("opt-wait", "-1");
				else if ((button.waitclose || button.waitclose === 0) && !isNaN(button.waitclose))
					btn.attr("opt-wait", Math.max(0, parseInt(button.waitclose)));

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
		Renderer.renderContentView = renderContentView;
		Renderer.renderFootButtons = renderFootButtons;
		VRender.Component.Render.dialog = Renderer;
	}

})(typeof VRender === "undefined");