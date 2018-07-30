// ========================================================
// 确认对话框
// @author shicy <shicy85@163.com>
// Create on 2018-07-30
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.confirm)
		return ;

	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRender = backend ? require("./_base") : VRender.Component.Render;
	var UIButton = backend ? require("../../../ui/component/UIButton") : VRender.Component.Button;

	///////////////////////////////////////////////////////
	var Renderer = function (context, options) {
		BaseRender._base.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRender._base();

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRender._base.render.call(this, $, target);
		target.addClass("ui-confirm");

		renderView.call(this, $, target);

		return this;
	};

	_Renderer.getConfirmLabel = function () {
		return Utils.trimToNull(this.options.confirmLabel) || "确认";
	};

	_Renderer.getCancelLabel = function () {
		return Utils.trimToNull(this.options.cancelLabel) || "取消";
	};

	// ====================================================
	var renderView = function ($, target) {
		var container = $("<div class='container'></div>").appendTo(target);

		// var icon = $("<i class='img'></i>").appendTo(container);

		var title = Utils.trimToNull(this.options.title);
		if (title)
			$("<div class='title'></div>").appendTo(container).text(title);

		var content = $("<div class='content'></div>").appendTo(container);
		content = $("<div></div>").appendTo(content);
		if (this.options.hasOwnProperty("focusHtmlContent")) {
			content.html(this.options.focusHtmlContent || "无内容");
		}
		else {
			content.text(this.options.content || "无内容");
		}

		var btnbar = $("<div class='btnbar'></div>").appendTo(container);
		addButton($, btnbar, {name: "ok", label: this.getConfirmLabel(), type: "primary"});
		addButton($, btnbar, {name: "cancel", label: this.getCancelLabel()});
	};

	var addButton = function ($, target, data) {
		target = $("<div></div>").appendTo(target);
		if (backend) {
			new UIButton(this.context, data).render(target);
		}
		else {
			UIButton.create(Utils.extend(data, {target: target}));
		}
	};


	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.confirm = Renderer;
	}

})(typeof VRender === "undefined");