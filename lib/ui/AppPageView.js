// ========================================================
// 为移动端设计网页视图，引入了适用于移动端的脚本和样式
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var PageView = require("./PageView");


var AppPageView = PageView.extend(module, {
	renderBody: function (body) {
		AppPageView.__super__.renderBody.call(this, body);
		body.attr("render-as-app", "");
	},

	doFileImport: function () {
		if (this.getContext().config("babel")) {
			this.import("/VRender/babel/polyfill.js", {group: "core", minify: false, index: -2, b: "yy"});
		}
		this.import("/VRender.core.js", {group: "core", minify: false, index: -1});
		this.import("/VRender.front.mobile.min.js", {group: "core", minify: false, index: -1});
	},

	isRenderAsApp: function () {
		return true;
	}
});
