// ========================================================
// 组件模块侧边菜单栏
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

var VRender = require("../../index");


var Utils = VRender.Utils;

var menus = [{grp: "常用组件", children: [
	{name: "checkbox", label: "UICheckbox"},
	{name: "combobox", label: "UICombobox"},
	{name: "datagrid", label: "UIDatagrid"}
]}, {grp: "布局", children: [
	{name: "container", label: "UIContainer"},
	{name: "group", label: "UIGroup"}
]}];

var SideMenuView = VRender.UIView.extend(module, {
	className: "sidemenu",

	renderView: function () {
		SideMenuView.__super__.renderView.call(this);

		var currentMenu = this.options.active;

		var target = this.$el;
		Utils.each(menus, function (data) {
			var group = target.appendAndGet("<div class='grp'></div>");
			group.write("<div class='title'>" + data.grp + "</div>");

			var list = group.appendAndGet("<ul class='menus'></ul>");
			Utils.each(data.children, function (data) {
				var item = list.appendAndGet("<li class='menu'></li>");
				item.attr("name", data.name).text(data.label);
				if (data.name === currentMenu)
					item.addClass("selected");
			});
		});
	}
});
