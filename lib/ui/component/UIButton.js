// ========================================================
// 自定义按钮
// 可选属性：label, type, size, icon, link, toggle, dropdown
// @author shicy <shicy85@163.com>
// Create on 2016-11-28
// ========================================================

var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var ButtonRender = require("../../static/js/render/button");


var UIButton = UIView.extend(module, {
	
	// 文字
	getLabel: function () {
		return StringUtils.trimToEmpty(this.options.label);
	},
	setLabel: function (value) {
		this.options.label = value;
	},

	// 类型
	getType: function () {
		return this.options.type;
	},
	setType: function (value) {
		this.options.type = value;
	},

	// 大小
	getSize: function () {
		return this.options.size;
	},
	setSize: function (value) {
		this.options.size = value;
	},

	// 图标
	getIcon: function () {
		return this.options.icon;
	},
	setIcon: function (value) {
		this.options.icon = value;
	},

	// 按钮点击链接
	getLink: function () {
		return this.options.link;
	},
	setLink: function (value) {
		this.options.link = value;
	},

	// 下拉选项
	getDropdownData: function () {
		return this.options.dropdown;
	},
	setDropdownData: function (value) {
		this.options.dropdown = value;
	},

	isToggle: function () {
		return Utils.isTrue(this.options.toggle);
	},
	setToggle: function (bool) {
		this.options.toggle = bool;
	},

	render: function (output) {
		UIButton.__super__.render.call(this, output);
		var renderer = new ButtonRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
