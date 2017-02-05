// ========================================================
// 组视图使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var Utils = VRender.Utils;
var UIGroup = VRender.UIGroup;
var UITextView = VRender.UITextView;
var UIDateInput = VRender.UIDateInput;
var UIDateRange = VRender.UIDateRange;

var ModuleGroup = ModuleBase.extend(module, {
	className: "mod-group",

	getCompName: function () {
		return "UIGroup";
	},

	getSubName: function () {
		return "组视图容器";
	},

	getDescription: function () {
		return "这是一个视图（或组件）容器，将多个视图（或组件）组合成一个视图。注意该视图是同步渲染的。";
	},

	renderView: function () {
		ModuleGroup.__super__.renderView.call(this);

		this.showMessage(this.$el, "组视图异步问题", 
			"需要注意的是，组视图容器是同步渲染的，不支持组件内异步处理。" +
			"如果要添加的视图是异步处理的，请在容器外面（即父视图上）完成异步管理。", "warn");

		this.showDemo1();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIGroup(this, {orientation: UIGroup.VERTICAL, gap: 10});
		demoView.append(new UITextView(this, {prompt: "这是一个文本输入框"}))
			.append(new UITextView(this, {prompt: "这是另一个文本输入框"}));
		var dateIpt = demoView.addChild(new UIDateInput(this));
		dateIpt.setDate(new Date(2017, 1, 1));
		demoView.addChildren([new UIDateRange(this), new UIDateRange(this)]);
		demoView.append("<div>可以添加网页源码到容器里，如：<h3>标题文本信息</h3></div>");

		var sources = [];
		sources.push("var group = new UIGroup(this);");
		sources.push("// 使用“append()”方法，可以链式调用");
		sources.push("group.append(new UITextView(this, {prompt: '这是一个文本输入框'}))" +
			"\n\t.append(new UITextView(this, {prompt: '这是另一个文本输入框'}));");
		sources.push("// 使用“addChild()”方法，返回被添加的视图");
		sources.push("var dateIpt = group.addChild(new UIDateInput(this));");
		sources.push("dateIpt.setDate(new Date(2017, 1, 1));");
		sources.push("// 使用“addChildren()”方法，批量添加视图");
		sources.push("group.addChildren([new UIDateRange(this), new UIDateRange(this)]);");
		sources.push("// 添加网页代码，文本信息");
		sources.push("group.append('<div>可以添加网页源码到容器里，如：<h3>标题文本信息</h3></div>');");

		this.showDemo(section, demoView, sources);
	}
});
