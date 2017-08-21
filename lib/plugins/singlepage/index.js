// ========================================================
// 单页面插件，整站只在一个页面上显示，页面的切换不会刷新浏览器，页面主要内容通过动态异步加载实现。
// @author shicy <shicy85@163.com>
// Create on 2017-08-07
// ========================================================

var StringUtils = require("../../util/StringUtils");
var VRender = require("../../v-render");


var configs = {};

module.exports = {
	install: function (params) {
		configs[this] = params;
		// VRender.logger.debug("plugin installed: singlepage.");
	},

	initView: function () {
		this.import("file://" + __dirname + "/SinglePage.css", {group: "plugin", index: 0});
		this.import("file://" + __dirname + "/SinglePage.front.js", {group: "plugin", index: 0});
	},

	renderBodyAfter: function (body) {
		var config = configs[this.__self__] || {};

		var tagid = VRender.uuid();
		var script = VRender.$("<script id='" + tagid + "'></script>").appendTo(body);

		var params = JSON.stringify({target: config.container});
		script.write("$(function(){");
		script.write("var a=VRender,b=a.plugins,c=b&&b.singlepage;");
		script.write("if(a.Utils.isFunction(c&&c.init))c.init(" + params+ ");");
		script.write("$('#" + tagid + "').remove();");
		script.write("});");
	}
};

