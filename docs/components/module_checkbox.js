// ========================================================
// 复选框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-01
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UICheckbox = VRender.UICheckbox;

var ModuleChkbox = ModuleBase.extend(module, {
	className: "mod-chkbox",

	getCompName: function () {
		return "UICheckbox";
	},

	getSubName: function () {
		return "复选框";
	},

	getDescription: function () {
		return "与标准复选框<code>&lt;input type='checkbox'/&gt;</code>类同，增加了复选框的文字内容，" +
			"将复选框和文字包含在一个<code>&lt;label&gt;</code>元素中，用户点击文字等同于点击复选框。";
	},

	renderView: function () {
		ModuleChkbox.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo4();
		this.showDemo2();
		this.showDemo3();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例", "创建一个复选框，设置复选框的文字内容。");

		var demoView = new UIGroup(this);
		demoView.append(new UICheckbox(this));
		demoView.append(new UICheckbox(this, {label: "checkbox"}));

		var source = [];
		source.push("new UICheckbox(this); // 第一个复选框没有文字");
		source.push("new UICheckbox(this, {label: 'checkbox'});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("默认选中", "想要复选框默认为选中状态，" +
			"需设置属性<code>{checked: true}</code>。");

		var demoView = new UIGroup(this);
		demoView.append(new UICheckbox(this, {label: "未选中状态"}));
		demoView.append(new UICheckbox(this, {label: "选中状态", checked: true}));

		var source = [];
		source.push("new UICheckbox(this, {label: '未选中状态'});");
		source.push("new UICheckbox(this, {label: '选中状态', checked: true});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("设置复选框的值", "给复选框指定一个值，设置属性<code>value</code>。");

		var demoView = new UIGroup(this, {cls: "demo-value"});
		demoView.append(new UICheckbox(this, {label: "复选框1", value: "1"}));
		demoView.append(new UICheckbox(this, {label: "复选框2", value: "2"}));
		demoView.append(new UICheckbox(this, {label: "复选框abc", value: "abc"}));

		demoView.append("<div class='msg'></div>");

		var source = [];
		source.push("new UICheckbox(this, {label: '复选框1', value: '1'};");
		source.push("new UICheckbox(this, {label: '复选框2', value: '2'};");
		source.push("new UICheckbox(this, {label: '复选框abc', value: 'abc'};");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.Checkbox.create({" +
			"\n\ttarget: '.demo-front', label: '前端动态创建的复选框'});");

		this.showDemo(section, demoView, source);
	}
});

ModuleChkbox.import("./front/checkbox.js");
