// ========================================================
// 对话框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2017-01-11
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIHGroup = VRender.UIHGroup;
var UIButton = VRender.UIButton;
var UIDialog = VRender.UIDialog;

var ModuleDialog = ModuleBase.extend(module, {
	className: "mod-dialog",

	getCompName: function () {
		return "UIDialog";
	},

	getSubName: function () {
		return "对话框";
	},

	getDescription: function () {
		return "用户的强交互界面，对话框包括标题、按钮和内容，打开对话框将禁止页面上其他地方的操作，主页面变暗。";
	},

	renderView: function () {
		ModuleDialog.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
		// this.showDemo5();
		// this.showDemo6();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		this.showMessage(section, "对话框模式", "对话框可以显示为嵌入式和弹出式，由 Node 端创建的对话框都是嵌入式的，" +
			"嵌入显示在页面中某个节点下面，由浏览器端创建的对话框如果包含<code>target</code>属性将显示为嵌入式的，" +
			"否则显示为弹出式的。", "info");

		var demoView = new UIDialog(this, {title: "我的第一个对话框", 
			content: "就来一段文字吧，当然也可以是一个视图，或者异步加载的模块。"});

		var source = [];
		source.push("new UIDialog(this, {title: '我的第一个对话框', " +
			"content: '就来一段文字吧，当然也可以是一个视图，或者异步加载的模块。'});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("弹出式对话框");

		var demoView = new UIGroup(this, {cls: "demo2"});
		demoView.append(new UIButton(this, {label: "点击打开对话框", type: "ok"}));

		var source = [];
		source.push("new UIButton(this, {label: '点击打开对话框', type: 'ok'});");
		source.push("// ---------------------------------------------");
		source.push("// 前端脚本");
		source.push("VRender.Component.Dialog.create({content: '这是前端创建的对话框'});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("添加组件");

		var demoView = new UIGroup(this, {cls: "demo3"});
		demoView.append(new UIButton(this, {label: "点我吧，对话框内嵌组件", type: "ok"}));

		var source = [];
		source.push("// 前端脚本");
		source.push("var content = $('<div></div>');");
		source.push("VRender.Component.TextView.create({target: content});");
		source.push("VRender.Component.DateInput.create({target: content});");
		source.push("VRender.Component.Dialog.create({content: content});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("对话框大小");

		var demoView = new UIHGroup(this, {cls: "demo4", gap: 10});
		demoView.append(new UIButton(this, {name: "btn1", label: "自动缩放（默认）"}));
		demoView.append(new UIButton(this, {name: "btn2", label: "固定中等大小"}));
		demoView.append(new UIButton(this, {name: "btn3", label: "占满屏幕"}));
		demoView.append(new UIButton(this, {name: "btn4", label: "内容填充无边距"}));

		var source = [];
		source.push("VRender.Component.Dialog.create({title: '自动缩放', content: '随着内容的大小自动调整对话框大小'});");
		source.push("VRender.Component.Dialog.create({title: '固定中等大小', style: 'normal'});");
		source.push("VRender.Component.Dialog.create({title: '占满屏幕', style: 'full'});");
		source.push("VRender.Component.Dialog.create({title: '内容填充无边距', style: 'fill', content: '无边距，内容靠边显示'});");

		this.showDemo(section, demoView, source);
	}
});

ModuleDialog.import("./front/dialog.js");
