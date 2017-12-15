// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2017-12-15
// ========================================================

(function (backend) {
	if (!backend && VRender.Component.Render.button)
		return ;

	///////////////////////////////////////////////////////
	var Utils = backend ? require(__vrender__).Utils : VRender.Utils;
	var BaseRenderer = backend ? require("./_base").BaseRenderer : VRender.Component.Render._base;

	var Renderer = function (context, options) {
		BaseRenderer.call(this, context, options);
	};
	var _Renderer = Renderer.prototype = new BaseRenderer();

	// ====================================================
	// 默认按钮样式
	Renderer.innerStyles = ["ui-btn-default", "ui-btn-primary", "ui-btn-success", "ui-btn-danger", 
		"ui-btn-warn", "ui-btn-info", "ui-btn-link", "ui-btn-text"];
	// 按钮大小定义
	Renderer.sizes = ["bigger", "big", "normal", "small", "tiny"];

	Renderer.getTypeStyle = function (type) {
		if (Utils.isNotBlank(type)) {
			if (["ok", "submit", "save", "primary", "major"].indexOf(type) >= 0)
				return "ui-btn-primary";
			if (["danger", "error"].indexOf(type) >= 0)
				return "ui-btn-danger";
			if (["success", "complete", "finish"].indexOf(type) >= 0)
				return "ui-btn-success";
			if (["warn", "warning"].indexOf(type) >= 0)
				return "ui-btn-warn";
			if (["info", "highlight"].indexOf(type) >= 0)
				return "ui-btn-info";
			if (type === "text")
				return "ui-btn-text";
			if (type === "link")
				return "ui-btn-link";
		}
		return "ui-btn-default";
	};

	// ====================================================
	_Renderer.render = function ($, target) {
		BaseRenderer.render.call(this, $, target);
		target.addClass("ui-btn");

		var options = this.options || {};

		var size = options.size;
		if (size && Renderer.sizes.indexOf(size) >= 0)
			target.addClass(size);

		// 如果是内置 style 就用该样式，否则通过 type 获取一个样式
		// 注：style 样式已在 base 或 UIView 中添加
		var style = options.style || "";
		if (Renderer.innerStyles.indexOf(style) < 0) {
			target.addClass(Renderer.getTypeStyle(options.type)); // 会返回一个默认样式
		}

		var mainBtn = $("<button class='btn'></button>").appendTo(target);
		if (Utils.isNotBlank(options.icon))
			mainBtn.append("<img class='icon' src='" + options.icon + "'/>");
		if (Utils.isNotBlank(options.label))
			mainBtn.append("<span class='lbl'>" + Utils.trimToEmpty(options.label) + "</span>");

		return this;
	};

	///////////////////////////////////////////////////////
	if (backend) {
		module.exports = Renderer;
	}
	else {
		VRender.Component.Render.button = Renderer;
	}

})(typeof VRender === "undefined");