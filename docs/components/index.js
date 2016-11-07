// ========================================================
// 组件设计
// @author shicy <shicy85@163.com>
// Create on 2016-11-07
// ========================================================

var VRender = require("../../index");


var ComponentView = VRender.PageView.extend(module, {
	getPageTitle: function () {
		return "VRender组件";
	},

	renderBody: function (body) {
		ComponentView.__super__.renderBody.call(this, body);
		body.write("<h1>组件</h1>");
	}
});
