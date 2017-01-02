// ========================================================
// 下拉选择框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UICombobox = VRender.UICombobox;

var ModuleCombobox = ModuleBase.extend(module, {
	className: "mod-combobox",

	getCompName: function () {
		return "UICombobox";
	},

	getSubName: function () {
		return "下拉选择框";
	},

	getDescription: function () {
		return "用户点击组件，会弹出一个下拉选项列表，在选项中点击一项进行选择。";
	},

	renderView: function () {
		ModuleCombobox.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
		this.showDemo5();
		this.showDemo6();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.addChild(new UIGroup(this))
			.append(new UICombobox(this, {prompt: "下拉选择提示信息",
				data: ["选项1", ["选项2", "选项3"], "选项4", "选项5"]}));
		demoView.addChild(new UIGroup(this))
			.append(new UICombobox(this, {prompt: "请选择-使用对象数据集", 
				data: [{id: 1, label: "选项1"}, {id: 2, label: "选项2"}, 
					{id: 3, label: "选项3"}, {id: 4, label: "选项4"}]}));

		var source = [];
		source.push("var data1 = ['选项1', ['选项2', '选项3'], '选项4', '选项5'];");
		source.push("new UICombobox(this, {prompt: '下拉选择提示信息', data: data1});");
		source.push("// -----------------------------------------------------");
		source.push("var data2 = [];");
		source.push("data2.push({id: 1, label: '选项1'});");
		source.push("data2.push({id: 2, label: '选项2'});");
		source.push("data2.push({id: 3, label: '选项3'});");
		source.push("data2.push({id: 4, label: '选项4'});");
		source.push("new UICombobox(this, {prompt: '请选择-使用对象数据集', data: data2});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端渲染");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("var datas = [];");
		source.push("datas.push({id: 1, label: '选项1'});");
		source.push("datas.push({id: 2, label: '选项2'});");
		source.push("datas.push({id: 3, label: '选项3'});");
		source.push("datas.push({id: 4, label: '选项4'});");
		source.push("VRender.Component.Combobox.create({" +
			"\n\ttarget: '.demo-front', \n\tdata: datas, \n\tprompt: '==请选择=='});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("可输入下拉选择框", 
			"指定该选择框可以输入，并实时定位选项。请设置属性为<code>{editable: true}</code>。");

		var datas = [];
		datas.push({id: 1, name: "微微一笑很倾城", score: 5.4});
		datas.push({id: 2, name: "疯狂动物城", score: 9.3});
		datas.push({id: 3, name: "反黑行动组", score: 5.5});
		datas.push({id: 4, name: "塔洛", score: 7.8});
		datas.push({id: 5, name: "凄灵室", score: 2.9});
		datas.push({id: 6, name: "肖申克的救赎", score: 9.6});
		var demoView = new UICombobox(this, {prompt: "请选择", data: datas, editable: true});

		var source = [];
		source.push("var datas = [];");
		source.push("datas.push({id: 1, name: '微微一笑很倾城', score: 5.4});");
		source.push("datas.push({id: 2, name: '疯狂动物城', score: 9.3});");
		source.push("datas.push({id: 3, name: '反黑行动组', score: 5.5});");
		source.push("datas.push({id: 4, name: '塔洛', score: 7.8});");
		source.push("datas.push({id: 5, name: '凄灵室', score: 2.9});");
		source.push("datas.push({id: 6, name: '肖申克的救赎', score: 9.6});");
		source.push("new UICombobox(this, {prompt: '请选择', data: datas, editable: true});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("设置默认选择项", "设置属性<code>selectedIndex</code>" +
			"或<code>selectedId</code>指定组件默认选择项，前者是默认选中的项索引（从0开始），" +
			"后者是默认选中的项编号值（可以与属性<code>idField</code>）配合使用。");

		var datas = [];
		datas.push({id: 1, code: 101, label: "选项1"});
		datas.push({id: 2, code: 102, label: "选项2"});
		datas.push({id: 3, code: 103, label: "选项3"});
		datas.push({id: 4, code: 104, label: "选项4"});
		datas.push({id: 5, code: 105, label: "选项5"});

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append("<div class='demo-title'>selectedIndex</div>");
		demoView.append(new UICombobox(this, {data: datas, selectedIndex: 2}));
		demoView.append("<div class='demo-title'>selectedId</div>");
		demoView.append(new UICombobox(this, {data: datas, selectedId: 2}));
		demoView.append("<div class='demo-title'>selectedId&amp;idField</div>");
		demoView.append(new UICombobox(this, {data: datas, selectedId: 103, idField: "code"}));

		var source = [];
		source.push("var datas = [];");
		source.push("datas.push({id: 1, code: 101, label: '选项1'});");
		source.push("datas.push({id: 2, code: 102, label: '选项2'});");
		source.push("datas.push({id: 3, code: 103, label: '选项3'});");
		source.push("datas.push({id: 4, code: 104, label: '选项4'});");
		source.push("datas.push({id: 5, code: 105, label: '选项5'});");
		source.push("// ---------------------------------------------");
		source.push("new UICombobox(this, {data: datas, selectedIndex: 2});");
		source.push("new UICombobox(this, {data: datas, selectedId: 2});");
		source.push("new UICombobox(this, {data: datas, selectedId: 103, idField: 'code'});");

		this.showDemo(section, demoView, source);
	},

	showDemo5: function () {
		var section = this.appendSection("自定义文本标签");

		var datas = [];
		datas.push({id: 1, name: "微微一笑很倾城", label: "微微一笑很倾城_5.4分", score: 5.4});
		datas.push({id: 2, name: "疯狂动物城", label: "疯狂动物城_9.3分", score: 9.3});
		datas.push({id: 3, name: "反黑行动组", label: "反黑行动组_5.5分", score: 5.5});
		datas.push({id: 4, name: "塔洛", label: "塔洛_7.8分", score: 7.8});
		datas.push({id: 5, name: "凄灵室", label: "凄灵室_2.9分", score: 2.9});
		datas.push({id: 6, name: "肖申克的救赎", label: "肖申克的救赎_9.6分", score: 9.6});

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append("<div class='demo-title'>默认</div>");
		demoView.append(new UICombobox(this, {data: datas, selectedIndex: 0}));
		demoView.append("<div class='demo-title'>使用labelField</div>");
		demoView.append(new UICombobox(this, {data: datas, selectedIndex: 0, labelField: "name"}));
		demoView.append("<div class='demo-title'>使用labelFunction</div>");
		demoView.append(new UICombobox(this, {data: datas, selectedIndex: 0, labelFunction: function (data) {
			return data.name + "(" + parseFloat(data.score).toFixed(1) + "分)";
		}}));

		var source = [];
		source.push("var datas = [];");
		source.push("datas.push({id: 1, name: '微微一笑很倾城', label: '微微一笑很倾城_5.4分', score: 5.4});");
		source.push("datas.push({id: 1, name: '疯狂动物城', label: '疯狂动物城_9.3分', score: 9.3});");
		source.push("datas.push({id: 1, name: '反黑行动组', label: '反黑行动组_5.5分', score: 5.5});");
		source.push("datas.push({id: 1, name: '塔洛', label: '凄灵室_2.9分', score: 2.9});");
		source.push("datas.push({id: 1, name: '凄灵室', label: '', score: 5.4});");
		source.push("datas.push({id: 1, name: '肖申克的救赎', label: '肖申克的救赎_9.6分', score: 9.6});");
		source.push("// ---------------------------------------------");
		source.push("var labelFunc = function (data, index) {" +
			"\n\treturn data.name + '(' + parseFloat(data.score).toFixed(1) + '分)';\n};");
		source.push("// ---------------------------------------------");
		source.push("new UICombobox(this, {data: datas, selectedIndex: 0});");
		source.push("new UICombobox(this, {data: datas, selectedIndex: 0, labelField: 'name'});");
		source.push("new UICombobox(this, {data: datas, selectedIndex: 0, labelFunction: labelFunc});");

		this.showDemo(section, demoView, source);
	},

	showDemo6: function () {
		var section = this.appendSection("动态数据集");

		var demoView = new UICombobox(this, {apiName: "demo.datas.musics", selectedIndex: 2});

		var source = [];
		source.push("new UICombobox(this, {apiName: 'demo.datas.musics', selectedIndex: 2});");

		this.showDemo(section, demoView, source);
	}
});

ModuleCombobox.import("./front/combobox.js");
