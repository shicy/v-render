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
		this.showDemo4();
		// this.showDemo5();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIPanel(this, {content: "内容"});

		var sources = [];
		sources.push("new UIPanel(this, {content: '内容'});");
		sources.push("// 前端构建方法");
		sources.push("VR_Panel.create({target: [$el], content: '内容'});");

		this.showDemo(section, demoView, sources);
	},

	showDemo2: function () {
		var section = this.appendSection("标题和内容", "设置<code>title</code>属性指定嵌板标题，" +
			"未设置标题时默认显示为“标题”。为嵌板添加内容可以使用<code>content</code>或<code>view</code>" +
			"属性，支持文本、网页代码以及组件。");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append(new UIPanel(this, {title: "自定义标题", content: "文本内容"}));
		demoView.append(new UIPanel(this, {title: "", content: "不显示标题，设置title为false或空"}));
		demoView.append(new UIPanel(this, {title: "网页", content: "<h3>这里是网页代码</h3><p>网页内容等等。。</p>"}));
		demoView.append(new UIPanel(this, {title: "组件", content: new UITextView(this, {prompt: "支持组件内容"})}));

		var sources = [];
		sources.push("new UIPanel(this, {title: '自定义标题', content: '文本内容'});");
		sources.push("new UIPanel(this, {title: '', content: '不显示标题，设置title为false或空'});");
		sources.push("new UIPanel(this, {title: '网页', content: '<h3>这里是网页代码</h3><p>网页内容等等。。</p>'});");
		sources.push("new UIPanel(this, {title: '组件', content: new UITextView(this, {prompt: '支持组件内容'})});");

		this.showDemo(section, demoView, sources);
	},

	showDemo3: function () {
		var section = this.appendSection("给嵌板添加按钮", "在嵌板右上角添加按钮，使用<code>buttons</code>属性，" +
			"如果按钮存在<code>children</code>属性，将作为下拉菜单显示，当按钮设置属性<code>{disabled: true}</code>时不可点击。");

		var buttons = [{name: "aa", label: "标准按钮"}];
		buttons.push({name: "bb", label: "禁用的按钮", disabled: true});
		buttons.push({name: "cc", label: "下拉按钮", toggle: true, children: [{name: "cca", label: "选项1"},
			{name: "ccb", label: "选项2", disabled: true}, {name: "ccc", label: "选项3", 
				children: [{name: "ccc1", label: "选项3-1"}, {name: "ccc2", label: "选项3-2"}]}, 
			{name: "ccd", label: "选项4"}, {name: "cce", label: "长文本长文本长文本长文本"}]});
		var demoView = new UIPanel(this, {title: "带按钮的面板", content: "按钮显示在标题栏右边", buttons: buttons});

		var sources = [];
		sources.push("var buttons = [\n\t{name: 'aa', label: '标准按钮'}, " +
			"\n\t{name: 'bb', label: '禁用的按钮', disabled: true}, \n\t{name: 'cc', label: '下拉按钮', toggle: true, " +
				"children: [\n\t\t{name: 'cca', label: '选项1'}, \n\t\t{name: 'ccb', label: '选项2', disabled: true}, " +
					"\n\t\t{name: 'ccc', label: '选项3'}, \n\t\t{name: 'ccd', label: '选项4'}, " +
					"\n\t\t{name: 'cce', label: '长文本长文本长文本长文本'}\n\t]}\n];");
		sources.push("new UIPanel(this, {title: '带按钮的面板', content: '按钮显示在标题栏右边', buttons: buttons});")

		this.showDemo(section, demoView, sources);
	},

	showDemo4: function () {
		var section = this.appendSection("选项卡设置", "");

		var tabs = [];
		tabs.push({name: "tab1", title: "选项卡1", view: "<h1>这是第一个视图</h1><p>支持网页源码，自由显示</p>"});
		tabs.push({name: "tab2", title: "选项卡2", view: new UITextView(this, {prompt: "组件视图"})});
		tabs.push({name: "tab3", title: "选项卡3"});
		tabs.push({name: "tab4", title: "选项卡4"});
		var demoView = new UIPanel(this, {title: "选择选项卡", tabs: tabs, tabIndex: 0});

		var sources = [];
		sources.push("var tabs = [];");
		sources.push("tabs.push({name: 'tab1', title: '选项卡1', view: '<h1>这是第一个视图</h1><p>支持网页源码，自由显示</p>'});");
		sources.push("tabs.push({name: 'tab2', title: '选项卡2', view: new UITextView(this, {prompt: '组件视图'})});");
		sources.push("tabs.push({name: 'tab3', title: '选项卡3'});");
		sources.push("tabs.push({name: 'tab4', title: '选项卡4'});");
		sources.push("new UIPanel(this, {title: '选择选项卡', tabs: tabs, tabIndex: 2});");

		this.showDemo(section, demoView, sources);
	}
});
