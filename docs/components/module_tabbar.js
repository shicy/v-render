// ========================================================
// 选项卡
// @author shicy <shicy85@163.com>
// Create on 2017-03-19
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIButton = VRender.UIButton;
var UIGroup = VRender.UIGroup;
var UIHGroup = VRender.UIHGroup;
var UITabbar = VRender.UITabbar;
var UITextView = VRender.UITextView;
var UICheckbox = VRender.UICheckbox;

var ModuleTabbar = ModuleBase.extend(module, {
	className: "mod-tabbar",

	getCompName: function () {
		return "UITabbar";
	},

	getSubName: function () {
		return "选项卡";
	},

	getDescription: function () {
		return "选项卡组件，显示一组选项，当点击其中某一项时激活这一项，同时将其它项重置为默认状态。";
	},

	renderView: function () {
		ModuleTabbar.__super__.renderView.call(this);

		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIGroup(this, {gap: 10});

		demoView.append(new UITabbar(this, {data: ["选项1", "选项2", "选项3"], selectedIndex: 0}));

		var tabs = [{name: "a", label: "选项卡1"}, {name: "b", label: "选项卡2"}, 
			{name: "c", label: "选项卡3"}, {name: "d", label: "选项卡4", disabled: true}, 
			{name: "e", label: "选项卡5", closable: true}];
		demoView.append(new UITabbar(this, {data: tabs, selectedIndex: 1}));

		var sources = [];
		sources.push("new UITabbar(this, {data: ['选项1', '选项2', '选项3'], selectedIndex: 0});");
		sources.push("// --------------------------------------------");
		sources.push("var tabs = [];");
		sources.push("tabs.push({name: 'a', label: '选项卡1'});");
		sources.push("tabs.push({name: 'b', label: '选项卡2'});");
		sources.push("tabs.push({name: 'c', label: '选项卡3'});");
		sources.push("tabs.push({name: 'd', label: '选项卡4', disabled: true}); // 选项卡被禁用");
		sources.push("tabs.push({name: 'e', label: '选项卡5', closable: true}); // 选项卡可关闭");
		sources.push("new UITabbar(this, {data: tabs, selectedIndex: 1});");
		sources.push("// --------------------------------------------");
		sources.push("// 前端构建方法");
		sources.push("VR_Tabbar.create({target: [$el], data: [tabs], selectedIndex: [index]});");

		this.showDemo(section, demoView, sources);
	},

	showDemo2: function () {
		var section = this.appendSection("启用或禁用选项卡", "禁用某个选项卡，" +
			"设置属性<code>{disabled: true}</code>，方法<code>setEnabled(name)</code>" +
			"和<code>setDisabled(name)</code>可以用来启用或禁用选项卡。");

		var demoView = new UIGroup(this, {gap: 10, cls: "demo2"});
		demoView.append(new UITabbar(this, {data: [{name: "tab1", label: "选项卡"}]}));
		var btns = demoView.addChild(new UIGroup(this));
		btns.append(new UIButton(this, {name: "demo2-disabled", label: "禁用"}));
		btns.append(new UIButton(this, {name: "demo2-enabled", label: "启用"}));

		var sources = [];
		sources.push("var tabbar = new UITabbar(this, {data: [{name: 'tab1', label: '选项卡'}]});");
		sources.push("// --------------------------------------------");
		sources.push("$('.disabled').click(function () { tabbar.setDisabled('tab1'); });");
		sources.push("$('.enabled').click(function () { tabbar.setEnabled('tab1'); });");

		this.showDemo(section, demoView, sources);
	},

	showDemo3: function () {
		var section = this.appendSection("添加和删除选项卡", "设置属性<code>{closable: true}</code>" +
			"时该选项卡可关闭，方法<code>addItem(data[, index])</code>用来添加选项卡，" +
			"方法<code>removeItem(name)</code>用来删除（即关闭）选项卡。");

		var demoView = new UIGroup(this, {gap: 10, cls: "demo3"});
		var tabs = [{name: "aa", label: "默认选项卡"}, {name: "bb", label: "可关闭选项卡", closable: true}];
		demoView.append(new UITabbar(this, {data: tabs, selectedIndex: 0}));
		var addView = demoView.addChild(new UIHGroup(this, {gap: 20}));
		addView.append(new UITextView(this, {prompt: "请输入选项卡名称"}));
		addView.append(new UICheckbox(this, {label: "可关闭"}));
		addView.append(new UIButton(this, {name: "demo3-add", label: "添加", type: "primary"}));

		var sources = [];
		sources.push("var tabs = []");
		sources.push("tabs.push({name: 'aa', label: '默认选项卡'});");
		sources.push("tabs.push({name: 'bb', label: '可关闭选项卡', closable: true});");
		sources.push("var tabbar = new UITabbar(this, {data: tabs, selectedIndex: 0});");
		sources.push("// --------------------------------------------");
		sources.push("var input = new UITextView(this, {prompt: '请输入选项卡名称'});");
		sources.push("var checkbox = new UICheckbox(this, {label: '可关闭'});");
		sources.push("var button = new UIButton(this, {name: 'addbtn', label: '添加', type: 'primary'});");
		sources.push("// --------------------------------------------");
		sources.push("var ind = 1;");
		sources.push("$('[addbtn]').click(function () { " +
			"\n\ttabbar.addItem({name: ('tab-' + ind++), label: input.val(), closable: checkbox.isChecked()}); \n});");

		this.showDemo(section, demoView, sources);
	},

	showDemo4: function () {
		var section = this.appendSection("太多选项卡显示下拉菜单");

		var demoView = new UIGroup();
		var tabs = ["选项卡1", "选项卡2", "选项卡3", "选项卡4", "选项卡5", "选项卡6", "选项卡7", 
			"选项卡8", "选项卡9", "选项卡10", "选项卡11", "选项卡12", "选项卡13", "选项卡14", "选项卡15",
			"选项卡16", "选项卡17", "选项卡18", "选项卡19", "选项卡20"];
		demoView.append(new UITabbar(this, {data: tabs, selectedIndex: 3}));

		var sources = [];
		sources.push("var tabs = [];");
		sources.push("for (var i = 1; i < 21; i++) { tabs.push('选项卡' + i); }");
		sources.push("new UITabbar(this, {data: tabs});");

		this.showDemo(section, demoView, sources);
	}
});

ModuleTabbar.import("./front/tabbar.js");
