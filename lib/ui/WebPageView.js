// ========================================================
// 为电脑端设计网页视图，引入了适用于电脑端的脚本和样式
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var PageView = require("./PageView");


var WebPageView = PageView.extend(module, {
	renderBody: function (body) {
		WebPageView.__super__.renderBody.call(this, body);
		body.addClass("render-as-pc");
	},

	doFileImport: function () {
		this.import("/VRender.core.js?v=1611071212", {group: false});
		this.import("/VRender.front.css", {group: false});
		this.import("/VRender.front.js", {group: false});
	}
});
