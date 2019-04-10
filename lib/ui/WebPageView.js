// ========================================================
// 为电脑端设计网页视图，引入了适用于电脑端的脚本和样式
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var PageView = require("./PageView");


var WebPageView = PageView.extend(module, {
	renderBody: function (body) {
		WebPageView.__super__.renderBody.call(this, body);
		body.attr("render-as-pc", "");
	},

	doFileImport: function () {
		this.import("/VRender.core.js?v=190409", {group: false, index: -1});
		this.import("/VRender.front.min.css?v=190409", {group: false, index: -1});
		this.import("/VRender.front.min.js?v=190409", {group: false, index: -1});
	}
});
