// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-28
// ========================================================

var UIView = require("../UIView");
var ButtonHolder = require("../../static/js/ui/button");
var VRender = require(__vrender__);


var UIButton = UIView.extend(module, {
	doInit: function () {
		UIButton.__super__.doInit.call(this);
		this.holder = new ButtonHolder(this.options);
	},

	// 文字
	getLabel: function () {
		return this.holder.getLabel();
	},
	setLabel: function (value) {
		this.holder.setLabel(value);
	},

	// 类型
	getType: function () {
		return this.holder.getType();
	},
	setType: function (value) {
		this.holder.setType(value);
	},

	// 大小
	getSize: function () {
		return this.holder.getSize();
	},
	setSize: function (value) {
		this.holder.setSize(value);
	},

	// 图标
	getIcon: function () {
		return this.holder.getIcon();
	},
	setIcon: function (value) {
		this.holder.setIcon(value);
	},

	// 按钮点击链接
	getLink: function () {
		return this.holder.getLink();
	},
	setLink: function (value) {
		this.holder.setLink(value);
	},

	// 下拉选项
	getDropdownData: function () {
		return this.holder.getDropdownData();
	},
	setDropdownData: function (value) {
		this.holder.setDropdownData(value);
	},

	isToggle: function () {
		return this.holder.isToggle();
	},
	setToggle: function (bool) {
		this.holder.setToggle(bool);
	},

	getStyle: function () {
		return null; // 由holder添加
	},
	setStyle: function (value) {
		// UIButton.__super__.setStyle.call(this, value);
		if (this.holder)
			this.holder.setStyle(value);
	},

	///////////////////////////////////////////////////////
	render: function (output) {
		UIButton.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
