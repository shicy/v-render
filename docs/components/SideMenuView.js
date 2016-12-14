// ========================================================
// 组件模块侧边菜单栏
// @author shicy <shicy85@163.com>
// Create on 2016-11-10
// ========================================================

var VRender = require("../../index");


var Utils = VRender.Utils;

var menus = [{grp: "基础组件", children: [
	{name: "button", label: "UIButton"},
	{name: "checkbox", label: "UICheckbox"},
	{name: "combobox", label: "UICombobox"},
	{name: "datagrid", label: "UIDatagrid"},
	{name: "dateinput", label: "UIDateInput"},
	{name: "datepicker", label: "UIDatePicker"},
	{name: "daterange", label: "UIDateRange"},
	{name: "dropdownlist", label: "UIDropdownList"},
	{name: "list", label: "UIList"},
	{name: "paginator", label: "UIPaginator"},
	{name: "panel", label: "UIPanel"},
	{name: "radiobox", label: "UIRadiobox"},
	{name: "radiogroup", label: "UIRadioGroup"},
	{name: "tabbar", label: "UITabbar"},
	{name: "tabview", label: "UITabView"},
	{name: "textview", label: "UITextView"},
	{name: "timerange", label: "UITimeRange"},
	{name: "tree", label: "UITree"}
]}, {grp: "公共组件", children: [
	{name: "buttonbar", label: "UIButtonBar"},
	{name: "formview", label: "UIFormView"}
]}, {grp: "布局", children: [
	{name: "container", label: "UIContainer"},
	{name: "gridview", label: "UIGridView"},
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
