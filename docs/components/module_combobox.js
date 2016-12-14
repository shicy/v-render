// ========================================================
// 下拉选择框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var ModuleCombobox = ModuleBase.extend(module, {
	className: "mod-combobox",

	getCompName: function () {
		return "UICombobox";
	},

	getSubName: function () {
		return "下拉选择框";
	},

	getDescription: function () {
		return "用户点击组件，会弹出一个下拉选项列表，在选项中点击一项进行选择。";
	},

	renderView: function () {
		ModuleCombobox.__super__.renderView.call(this);
		// this.showDemo1();
		// this.showDemo4();
		// this.showDemo2();
		// this.showDemo3();
	}
});
