// ========================================================
// 快速入门
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var VRender = require("../../index");


var QuickstartView = VRender.WebPageView.extend(module, {
	getPageTitle: function () {
		return "VRender快速入门";
	},

	renderBody: function (body) {
		QuickstartView.__super__.renderBody.call(this, body);
		body.write("<h1>快速入门</h1>");
	}
});
