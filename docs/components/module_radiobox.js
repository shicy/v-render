// ========================================================
// 单选框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIRadiobox = VRender.UIRadiobox;

var ModuleRadbox = ModuleBase.extend(module, {
	className: "mod-radbox",

	getCompName: function () {
		return "UIRadiobox";
	},

	getSubName: function () {
		return "单选框";
	},

	getDescription: function () {
		return "与标准单选框<code>&lt;input type='radio'/&gt;</code>类同，增加了单选框的文字内容，" +
			"将单选框和文字包含在一个<code>&lt;label&gt;</code>元素中，用户点击文字等同于点击单选框。";
	},

	renderView: function () {
		ModuleRadbox.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIGroup(this);
		demoView.append(new UIRadiobox(this, {name: "radio1"}));
		demoView.append(new UIRadiobox(this, {name: "radio1", label: "radiobox"}));

		var source = [];
		source.push("new UIRadiobox(this, {name: 'radio1'}); // 第一个单选框没有文字");
		source.push("new UIRadiobox(this, {name: 'radio1', label: 'radiobox'});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.Radiobox.create({" +
			"\n\ttarget: '.demo-front', name: 'radio2', label: '单选框1'});");
		source.push("VRender.Component.Radiobox.create({" +
			"\n\ttarget: '.demo-front', name: 'radio2', label: '单选框2'});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("默认选中", "设置属性<code>{checked: true}</code>" +
			"将单选框置为选中状态，只有最后一个会被选中。");

		var demoView = new UIGroup(this);
		demoView.append(new UIRadiobox(this, {name: "radio3", label: "未选中单选框"}));
		demoView.append(new UIRadiobox(this, {name: "radio3", label: "选中单选框", checked: true}));

		var source = [];
		source.push("new UIRadiobox(this, {name: 'radio3', label: '未选中单选框'});");
		source.push("new UIRadiobox(this, {name: 'radio3', label: '选中单选框', checked: true});");

		this.showDemo(section, demoView, source);
	}
});

ModuleRadbox.import("./front/radiobox.js");
