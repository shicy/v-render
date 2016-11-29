// ========================================================
// 单页面视图，整站只在一个页面上显示，页面的切换不会刷新浏览器，页面主要内容通过动态异步加载实现。
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

var StringUtils = require("../util/StringUtils");
var VRender = require("../v-render");
var PageView = require("./PageView");


var SinglePageView = PageView.extend(module, {
	doFileImport: function () {
		SinglePageView.__super__.doFileImport.call(this);
		this.import("/VRender/css/plugin/singlepage.css", {group: "plugin", index: 0});
		this.import("/VRender.plugin.singlepage.js", {group: "plugin", index: 0});
	},

	// 获取单页面容器，当路由变更时，只会更换容器中的内容，容器外的内容保持不变
	// 默认容器为“body”
	getSinglePageContainer: function () {
		//
	},

	renderBody: function (body) {
		SinglePageView.__super__.renderBody.call(this, body);

		var container = this.getSinglePageContainer();
		if (StringUtils.isBlank(container))
			container = "body";

		var tagid = VRender.uuid();
		var script = body.appendAndGet("<script id='" + tagid + "'></script>");

		var params = JSON.stringify({target: container});
		script.write("$(function(){");
		script.write("var a=VRender,b=a.plugins,c=b&&b.singlepage;");
		script.write("if(a.Utils.isFunction(c&&c.init))c.init(" + params+ ");");
		script.write("$('#" + tagid + "').remove();");
		script.write("});");
	}
});
