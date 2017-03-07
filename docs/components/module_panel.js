// ========================================================
// 面板组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIPanel = VRender.UIPanel;
var UITextView = VRender.UITextView;

var ModulePanel = ModuleBase.extend(module, {
	className: "mod-panel",

	getCompName: function () {
		return "UIPanel";
	},

	getSubName: function () {
		return "嵌板";
	},

	getDescription: function () {
		return "嵌板组件类似于一个容器，用于嵌入到网页，该组件带有标题栏、选项卡、按钮等，" +
			"支持动态模块加载。嵌板具有内部特有样式，可以与其他组件配合使用。";
	},

	renderView: function () {
		ModulePanel.__super__.renderView.call(this);

		this.showMessage(this.$el, "组视图异步问题", 
			"需要注意的是，组视图容器是同步渲染的，不支持组件内异步处理。" +
			"如果要添加的视图是异步处理的，请在容器外面（即父视图上）完成异步管理。", "warn");

		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		// this.showDemo4();
		// this.showDemo5();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIPanel(this, {content: "内容"});

		var sources = [];
		sources.push("new UIPanel(this, {content: '内容'});");
		sources.push("// 前端构建方法");
		sources.push("VRender.Component.Panel.create({target: [target], content: '内容'});");

		this.showDemo(section, demoView, sources);
	},

	showDemo2: function () {
		var section = this.appendSection("标题和内容", "设置<code>title</code>属性指定嵌板标题，" +
			"未设置标题时默认显示为“标题”。为嵌板添加内容可以使用<code>content</code>或<code>view</code>" +
			"属性，支持文本、网页代码以及组件。");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append(new UIPanel(this, {title: "自定义标题", content: "文本内容"}));
		demoView.append(new UIPanel(this, {title: "网页", content: "<h3>这里是网页代码</h3><p>网页内容等等。。</p>"}));
		demoView.append(new UIPanel(this, {title: "组件", content: new UITextView(this, {prompt: "支持组件内容"})}));

		var sources = [];
		sources.push("new UIPanel(this, {title: '自定义标题', content: '文本内容'});");
		sources.push("new UIPanel(this, {title: '网页', content: '<h3>这里是网页代码</h3><p>网页内容等等。。</p>'});");
		sources.push("new UIPanel(this, {title: '组件', content: new UITextView(this, {prompt: '支持组件内容'})});");

		this.showDemo(section, demoView, sources);
	},

	showDemo3: function () {
		var section = this.appendSection("给面板添加按钮");

		var buttons = [{name: "aa", label: "标准按钮"}];
		buttons.push({name: "bb", type: "dropdown"});
		var demoView = new UIPanel(this, {title: "带按钮的面板", content: "按钮显示在标题栏右边"});

		var sources = [];

		this.showDemo(section, demoView, sources);
	}
});
