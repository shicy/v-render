// ========================================================
// 单页面视图，整站只在一个页面上显示，页面的切换不会刷新浏览器，页面主要内容通过动态异步加载实现。
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

var PageView = require("./PageView");


var SinglePageView = PageView.extend(module, {
	doFileImport: function () {
		SinglePageView.__super__.doFileImport.call(this);
		this.import("/VRender.plugin.singlepage.js", {group: "plugin"});
	},

	// 获取单页面容器，当路由变更时，只会更换容器中的内容，容器外的内容保持不变
	// 默认容器为“body”
	getSinglePageContainer: function () {
		//
	}
});
