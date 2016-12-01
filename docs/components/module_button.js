// ========================================================
// 按钮组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-11-28
// ========================================================

var VRender = require("../../index");
var ModuleBase = require("./module_base");


var UIHGroup = VRender.UIHGroup;
var UIButton = VRender.UIButton;


var ModuleButton = ModuleBase.extend(module, {
	className: "mod-button",

	getCompName: function () {
		return "UIButton";
	},

	getSubName: function () {
		return "按钮";
	},

	getDescription: function () {
		return "按钮组件定义，在按钮元素<code>&lt;button&gt;</code>的基础上进行包装，预定义按钮的样式，扩展按钮功能支持下拉选择。";
	},

	renderView: function () {
		ModuleButton.__super__.renderView.call(this);
		this.showDemo1();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例", "创建按钮使用不同的样式，可选择样式有：<code>.ui-btn-primary</code>," +
			" <code>.ui-btn-success</code>, <code>.ui-btn-danger</code>, <code>.ui-btn-warn</code>, " +
			"<code>.ui-btn-info</code>, <code>.ui-btn-link</code>, <code>.ui-btn-text</code>。设置按钮样式使用<code>style</code>属性。");

		this.showMessage(section, "使用自定义样式", "当设置的样式<code>style</code>不在可选范围内时，将使用默认样式<code>.ui-btn-default</code>，" +
			"自定义样式<code>style</code>作为类添加在按钮上。", "warn");

		var demoView = new UIHGroup(this, {gap: 10});
		demoView.append(new UIButton(this, {label: "Default"}));
		demoView.append(new UIButton(this, {label: "Primary", style: "ui-btn-primary"}));

		var source = "new UIButton(this, {label: \"积分微风姐\"}).render(target)";

		this.showDemo(section, demoView, source);
	}
});
