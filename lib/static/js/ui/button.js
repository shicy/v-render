// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function (isFront) {
	var Utils = isFront ? VRender.Utils : require(__vrender__).Utils;

	var Holder = function (options) {
		this.options = options || {};
		this.setLabel(this.options.label);
		this.setType(this.options.type);
		this.setSize(this.options.size);
		this.setIcon(this.options.icon);
		this.setLink(this.options.link);
		this.setStyle(this.options.style);
		this.setDropdownData(this.options.dropdown);
	};
	var _Holder = Holder.prototype = new Object();

	// 默认按钮样式
	Holder.innerStyles = ["ui-btn-default", "ui-btn-primary", "ui-btn-success", "ui-btn-danger", 
		"ui-btn-warn", "ui-btn-info", "ui-btn-link", "ui-btn-text"];
	// 按钮大小定义
	Holder.sizes = ["large", "big", "normal", "small", "tiny"];

	_Holder.render = function ($, target) {
		target.addClass("ui-btn").addClass(this.getStyle()).addClass(this.getSize());

		var mainBtn = $("<button class='btn'></button>").appendTo(target);
		var icon = this.getIcon();
		if (Utils.isNotBlank(icon))
			mainBtn.write("<img class='icon' src='" + icon + "'/>");
		mainBtn.write("<span class='lbl'>" + this.getLabel() + "</span>");

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
		var style = Utils.isBlank(this.b_style) ? "ui-btn-default" : this.b_style;
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
	var UIButton = VRender.Component.Button = function (view, options) {
		// console.log("init button", view);
	};
	var _UIButton = UIButton.prototype = new VRender.Component.base();

	VRender.Component.register(".ui-btn", UIButton);
})(typeof VRender !== "undefined");
