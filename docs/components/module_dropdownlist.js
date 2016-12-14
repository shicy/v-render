// ========================================================
// 下拉选择组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIDropdownList = VRender.UIDropdownList;

var ModuleDropdownList = ModuleBase.extend(module, {
	className: "mod-dropdownlist",

	getCompName: function () {
		return "UIDropdownList";
	},

	getSubName: function () {
		return "下拉选择列表";
	},

	getDescription: function () {
		return "显示一个选择项列表，用户点击其中的一项选中该项。可以与组件<code>UIButton</code>和" +
			"<code>UICombobox</code>配合使用，分别用作菜单按钮和下拉选择框。";
	},

	renderView: function () {
		ModuleDropdownList.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var data = ["选项1", ["选项2", "选项3"], "选项4", "选项5"];
		var demoView = new UIDropdownList(this, {data: data, selectedIndex: 1});

		var source = [];
		source.push("var data = ['选项1', ['选项2', '选项3'], '选项4', '选项5'];");
		source.push("new UIDropdownList(this, {data: data, selectedIndex: 1});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("var data = ['选项1', ['选项2', '选项3'], '选项4', '选项5'];");
		source.push("VRender.Component.DropdownList.create({" +
			"\n\ttarget: '.demo-front', data: data, selectedIndex: 1});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("设置选项标签", "设置属性<code>labelField</code>" +
			"指定数据集中的某个属性对应的值作为选项标签，默认属性<code>label</code>值作为标签。");

		var data = [[{id: 1, name: "微微一笑很倾城", score: 5.4},
				{id: 2, name: "疯狂动物城", score: 9.3}], 
			[{id: 3, name: "反黑行动组", score: 5.5}, {id: 4, name: "塔洛", score: 7.8}, 
				{id: 5, name: "凄灵室", score: 2.9}],
			{id: 6, name: "肖申克的救赎", score: 9.6}];
		var demoView = new UIDropdownList(this, {data: data, labelField: "name"});

		var source = [];
		source.push("var data = [[{id: 1, name: '微微一笑很倾城', score: 5.4}, " +
			"\n\t\t{id: 2, name: '疯狂动物城', score: 9.3}], " +
			"\n\t[{id: 3, name: '反黑行动组', score: 5.5}, " +
			"\n\t\t{id: 4, name: '塔洛', score: 7.8}, " + 
			"\n\t\t{id: 5, name: '凄灵室', score: 2.9}], " +
			"\n\t{id: 6, name: '肖申克的救赎', score: 9.6}];");
		source.push("new UIDropdownList(this, {data: data, labelField: 'name'});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("设置选项标签2", "通过<code>labelFunction</code>" +
			"属性设置标签回调方法，该方法返回每一个选项的标签值。");

		
		var data = [[{id: 1, name: "微微一笑很倾城", score: 5.4},
				{id: 2, name: "疯狂动物城", score: 9.3}], 
			[{id: 3, name: "反黑行动组", score: 5.5}, {id: 4, name: "塔洛", score: 7.8}, 
				{id: 5, name: "凄灵室", score: 2.9}],
			{id: 6, name: "肖申克的救赎", score: 9.6}];
		var demoView = new UIDropdownList(this, {data: data, labelFunction: function (data) {
			return data.name + "(" + parseFloat(data.score).toFixed(1) + "分)";
		}});

		var source = [];
		source.push("var data = [[{id: 1, name: '微微一笑很倾城', score: 5.4}, " +
			"\n\t\t{id: 2, name: '疯狂动物城', score: 9.3}], " +
			"\n\t[{id: 3, name: '反黑行动组', score: 5.5}, " +
			"\n\t\t{id: 4, name: '塔洛', score: 7.8}, " + 
			"\n\t\t{id: 5, name: '凄灵室', score: 2.9}], " +
			"\n\t{id: 6, name: '肖申克的救赎', score: 9.6}];");
		source.push("var lblFun = function (data) {" +
			"\n\treturn data.name + '(' + parseFloat(data.score).toFixed(1) + '分)';" +
			"\n};");
		source.push("new UIDropdownList(this, {data: data, labelFunction: lblFun});");

		this.showDemo(section, demoView, source);
	}
});

ModuleDropdownList.import("./front/dropdownlist.js");
