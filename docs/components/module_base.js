// ========================================================
// 模块视图基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

var VRender = require("../../index");


var ModuleBase = VRender.UIView.extend(module, {
	// 获取组件名称
	getCompName: function () {
		// 子类继承
	},

	// 获取组件子标题名称
	getSubName: function () {
		// 子类继承
	},

	// 获取组件描述信息，返回html源码
	getDescription: function () {
		// 子类继承
	},

	renderView: function () {
		ModuleBase.__super__.renderView.call(this);
		this.$el.addClass("comp-mod-base");

		this.renderCompInfos();
	},

	// 渲染组件基本信息
	renderCompInfos: function () {

	},

	// 渲染警告信息窗口
	// type：warn, danger, 默认danger
	renderMsgBox: function (title, text, type) {
		// 
	},
});
