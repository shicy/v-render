// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function (isFront) {
	if (isFront && VRender.Component.Button)
		return ;

	///////////////////////////////////////////////////////
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;
	var HolderBase = (isFront ? VRender.Component : require("./_base")).HolderBase;

	///////////////////////////////////////////////////////
	var Holder = function (context, options) {
		HolderBase.call(this, context, options);
	};
	var _Holder = Holder.prototype = new HolderBase();

	// 默认按钮样式
	Holder.innerStyles = ["ui-btn-default", "ui-btn-primary", "ui-btn-success", "ui-btn-danger", 
		"ui-btn-warn", "ui-btn-info", "ui-btn-link", "ui-btn-text"];
	// 按钮大小定义
	Holder.sizes = ["bigger", "big", "normal", "small", "tiny"];

	Holder.getTypeStyle = function (type) {
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

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		target.addClass("ui-btn");

		var options = this.options || {};

		var size = options.size;
		if (size && Holder.sizes.indexOf(size) >= 0)
			target.addClass(size);
		var style = options.style || Holder.getTypeStyle(options.type);
		if (Utils.isNotBlank(style)) // 自定义样式已在外部添加
			target.addClass(Holder.innerStyles.indexOf(style) < 0 ? "ui-btn-default" : style);

		var mainBtn = $("<button class='btn'></button>").appendTo(target);
		if (Utils.isNotBlank(options.icon))
			mainBtn.append("<img class='icon' src='" + options.icon + "'/>");
		if (Utils.isNotBlank(options.label))
			mainBtn.append("<span class='lbl'>" + Utils.trimToEmpty(options.label) + "</span>");

		return this;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIButton = window.UIButton = Component.Button = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIButton = UIButton.prototype = new Component.base();

	UIButton.find = function (view) {
		return Component.find(view, ".ui-btn", UIButton);
	};

	UIButton.create = function (options) {
		return Component.create(options, UIButton, Holder);
	};

	// ====================================================
	// Component.register(".ui-btn", UIButton);

})(typeof VRender !== "undefined");
