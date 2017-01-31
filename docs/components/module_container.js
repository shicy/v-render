// ========================================================
// 边框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2017-01-30
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var Utils = VRender.Utils;
var UIContainer = VRender.UIContainer;

var ModuleContainer = ModuleBase.extend(module, {
	className: "mod-container",

	getCompName: function () {
		return "UIContainer";
	},

	getSubName: function () {
		return "边框容器";
	},

	getDescription: function () {
		var props = ["padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
			"margin", "marginLeft", "marginRight", "marginTop", "marginBottom", "border",
			"borderRadius", "borderColor", "borderWidth", "borderLeft", "borderRight",
			"borderTop", "borderBottom", "bg", "bgcolor", "image", "width", "minWidth",
			"maxWidth", "heigth", "minHeight", "maxHeight", "overflow", "align", "color", "shadow"];
		var desc = "一个带边框的容器，可以设置容器的边框、内边距、外边距、背景等，允许添加一个子视图。<br/>";
		desc += "可选属性包括：";
		desc += Utils.map(props, function (temp) { return "<code>" + temp + "</code>"; }).join(", ");
		return desc + "。";
	},

	renderView: function () {
		ModuleContainer.__super__.renderView.call(this);
		this.showDemo1();
		// this.showDemo4();
		// this.showDemo2();
		// this.showDemo3();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIContainer(this, {
			padding: 20, 
			borderRadius: 5,
			bgcolor: "#f6f7f9",
			shadow: "0px 3px 10px 0px #ccc",
			content: "组件或网页内容<br/><br/><br/><br/><br/>================end"
		});

		var sources = [];
		sources.push("new UIContainer(this, {\n\tpadding: 20, " +
			"\n\tborderRadius: 5," +
			"\n\tbgcolor: '#fcfcfc'," +
			"\n\tshadow: '0px 3px 10px 0px #ccc'," +
			"\n\tcontent: '组件或网页内容<br/><br/><br/><br/><br/>================end'});");

		this.showDemo(section, demoView, sources);
	}
});
