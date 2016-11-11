// ========================================================
// 页面顶部视图，状态、菜单拦
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

var VRender = require("../index");


var menus = [{name: "quickstart", label: "快速入门", uri: "/docs/quickstart"}, 
	{name: "documents", label: "说明文档", uri: "/docs/documents"}, 
	{name: "components", label: "组件", uri: "/docs/components"}, 
	{name: "styles", label: "全局样式", uri: "/docs/styles"}, 
	{name: "apis", label: "API", uri: "/docs/apis"}];

var HeaderView = VRender.UIView.extend(module, {
	id: "main-header",

	renderView: function () {
		// this.$el.write("<span>joidsjfi</span>");
		HeaderView.__super__.renderView.call(this);

		var content = VRender.$("<div></div>").appendTo(this.$el);
	}
});
