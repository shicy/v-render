// ========================================================
// 自定义按钮
// @author shicy <shicy85@163.com>
// Create on 2016-11-28
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");


var innerStyles = ["ui-btn-default", "ui-btn-primary", "ui-btn-success", "ui-btn-danger", 
	"ui-btn-warn", "ui-btn-info", "ui-btn-link", "ui-btn-text"];

var UIButton = UIView.extend(module, {
	doInit: function () {
		UIButton.__super__.doInit.call(this);
		var options = this.options || {};
		
	},

	// 文字
	getLabel: function () {
		if (this.hasOwnProperty("b_label"))
			return this.b_label;
		return this.options.label;
	},
	setLabel: function (value) {
		this.b_label = value;
	},

	// 类型
	getType: function () {
		if (this.hasOwnProperty("b_type"))
			return this.b_type;
		return this.options.type;
	},
	setType: function (value) {
		this.b_type = value;
	},

	// 大小
	getSize: function () {
		if (this.hasOwnProperty("b_size"))
			return this.b_size;
		return this.options.size;
	},
	setSize: function (value) {
		this.b_size = value;
	},

	// 图标
	getIcon: function () {
		if (this.hasOwnProperty("b_icon"))
			return this.b_icon;
		return this.options.icon;
	},
	setIcon: function (value) {
		this.b_icon = value;
	},

	// 按钮点击链接
	getLink: function () {
		if (this.hasOwnProperty("b_link"))
			return this.b_link;
		return this.options.link;
	},
	setLink: function (value) {
		this.b_link = value;
	},

	// 下拉选项
	getDropdownData: function () {
		if (this.hasOwnProperty("b_dropdown"))
			return this.b_dropdown;
		return this.options.dropdown;
	},
	setDropdownData: function (value) {
		this.b_dropdown = value;
	},

	// 样式
	getStyle: function () {
		var style = UIButton.__super__.getStyle.call(this);
		return style;
	},

	///////////////////////////////////////////////////////
	render: function (output) {
		UIButton.__super__.render.call(this, output);
		var target = this.$el.addClass("ui-btn");
		
		var mainBtn = target.appendTag("button");
	}
});
