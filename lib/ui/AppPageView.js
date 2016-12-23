// ========================================================
// 为移动端设计网页视图，引入了适用于移动端的脚本和样式
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var PageView = require("./PageView");


var AppPageView = PageView.extend(module, {
	renderBody: function (body) {
		AppPageView.__super__.renderBody.call(this, body);
		body.addClass("render-as-mobile");
	},

	doFileImport: function () {
		this.import("/VRender.core.js?v=1611071212", {group: false, index: -1});
		this.import("/VRender.front.mobile.min.css?v=1612232314", {group: false, index: -1});
		this.import("/VRender.front.mobile.min.js?v=1612232314", {group: false, index: -1});
	}
});
