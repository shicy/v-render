// ========================================================
// 网页局部，嵌套在网页中可异步加载的内容
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var VRender = require("../v-render");
var UIView = require("./UIView");


var Fragment = UIView.extend(module, {
	renderView: function () {
		var tagid = VRender.uuid();
		var target = this.$el.appendAndGet("<script id='" + tagid + "' class='vrender-fragment-script'></script>");
		target.write("$(function(){");
		target.write("$('#" + tagid + "').remove();");
		target.write("});");
	}
});
