// ========================================================
// 页面顶部视图，状态、菜单拦
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

var VRender = require("../index");


var Utils = VRender.Utils;
var UIHGroup = VRender.UIHGroup;

var menus = [{name: "quickstart", label: "快速入门", uri: "/docs/quickstart"}, 
	{name: "documents", label: "说明文档", uri: "/docs/documents"}, 
	{name: "components", label: "组件", uri: "/docs/components"}, 
	{name: "styles", label: "全局样式", uri: "/docs/styles"}, 
	{name: "apis", label: "API", uri: "/docs/apis"}];

var HeaderView = VRender.UIView.extend(module, {
	id: "main-header",

	renderView: function () {
		HeaderView.__super__.renderView.call(this);

		var content = new UIHGroup(this, {clsName: "content"});
		content.append("<div class='logo'></div>");

		var currentMenu = this.options.menu;
		var menuTarget = content.addChild(new UIHGroup(this, {cls: "menus", tag: "nav"}));
		Utils.each(menus, function (data) {
			var item = menuTarget.addChild("<a class='menu'></a>");
			item.addClass(data.name).attr("name", data.name).text(data.label);
			item.attr("href", data.uri);
			if (currentMenu === data.name)
				item.addClass("selected");
		});

		content.render(this.$el);
	}
});
