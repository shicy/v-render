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
	var HolderBase = (isFront ? VRender.Component : require("./base")).HolderBase;

	var Holder = function (options) {
		HolderBase.call(this, options);
		this.setLabel(this.options.label);
		this.setType(this.options.type);
		this.setSize(this.options.size);
		this.setIcon(this.options.icon);
		this.setLink(this.options.link);
		this.setStyle(this.options.style);
		this.setDropdownData(this.options.dropdown);
	};
	var _Holder = Holder.prototype = new HolderBase();

	// 默认按钮样式
	Holder.innerStyles = ["ui-btn-default", "ui-btn-primary", "ui-btn-success", "ui-btn-danger", 
		"ui-btn-warn", "ui-btn-info", "ui-btn-link", "ui-btn-text"];
	// 按钮大小定义
	Holder.sizes = ["large", "big", "normal", "small", "tiny"];

	_Holder.render = function ($, target) {
		HolderBase.render.call(this, $, target);
		
		target.addClass("ui-btn");
		target.addClass(this.getStyle());
		target.addClass(this.getSize());

		var mainBtn = $("<button class='btn'></button>").appendTo(target);
		var icon = this.getIcon();
		if (Utils.isNotBlank(icon))
			mainBtn.append("<img class='icon' src='" + icon + "'/>");
		mainBtn.append("<span class='lbl'>" + this.getLabel() + "</span>");

		var dropdownData = this.getDropdownData();
	};

	// ====================================================
	_Holder.getLabel = function () {
		return Utils.trimToEmpty(this.b_label);
	};
	_Holder.setLabel = function (value) {
		this.b_label = value;
	};

	_Holder.getType = function () {
		return this.b_type;
	};
	_Holder.setType = function (value) {
		this.b_type = value;
	};

	_Holder.getSize = function () {
		if (this.b_size) {
			if (Holder.sizes.indexOf(this.b_size) >= 0)
				return this.b_size;
		}
		return null; // 默认normal
	};
	_Holder.setSize = function (value) {
		this.b_size = value;
	};

	_Holder.getIcon = function () {
		return this.b_icon;
	};
	_Holder.setIcon = function (value) {
		this.b_icon = value;
	};

	_Holder.getLink = function () {
		return this.b_link;
	};
	_Holder.setLink = function (value) {
		this.b_link = value;
	};

	_Holder.getDropdownData = function () {
		return this.b_dropdown;
	};
	_Holder.setDropdownData = function (value) {
		this.b_dropdown = value;
	};

	_Holder.isToggle = function () {
		return this.b_toggle;
	};
	_Holder.setToggle = function (bool) {
		this.b_toggle = bool;
	};

	_Holder.getStyle = function () {
		var style = this.b_style;
		if (Utils.isBlank(style)) {
			var type = this.getType();
			if (["ok", "submit", "save", "primary", "major"].indexOf(type) >= 0)
				style = "ui-btn-primary";
			else if (["danger", "error"].indexOf(type) >= 0)
				style = "ui-btn-danger";
			else if (["success", "complete", "finish"].indexOf(type) >= 0)
				style = "ui-btn-success";
			else if (["warn", "warning"].indexOf(type) >= 0)
				style = "ui-btn-warn";
			else if (["info", "highlight"].indexOf(type) >= 0)
				style = "ui-btn-info";
			else if (type === "text")
				style = "ui-btn-text";
			else if (type === "link")
				style = "ui-btn-link";
			else
				style = "ui-btn-default";
		}
		if (Holder.innerStyles.indexOf(style) < 0)
			style = "ui-btn-default " + style;
		return style;
	};
	_Holder.setStyle = function (value) {
		this.b_style = value;
	};

	// ====================================================
	if (!isFront)
		return module.exports = Holder;

	///////////////////////////////////////////////////////
	var Component = VRender.Component;

	var UIButton = Component.Button = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);
	};
	var _UIButton = UIButton.prototype = new Component.base();

	UIButton.find = function (view) {
		return Component.find(view, ".ui-btn", UIButton);
	};

	UIButton.create = function (options) {
		var target = Component.create(options);
		var holder = new Holder(options).render($, target);
		return new UIButton(target, options, holder);
	};

	// ====================================================
	Component.register(".ui-btn", UIButton);

})(typeof VRender !== "undefined");
