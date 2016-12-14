// ========================================================
// 单选组组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIRadioGroup = VRender.UIRadioGroup;

var ModuleRadgrp = ModuleBase.extend(module, {
	className: "mod-radgrp",

	getCompName: function () {
		return "UIRadioGroup";
	},

	getSubName: function () {
		return "单选组";
	},

	getDescription: function () {
		return "同时创建多个单选框，并且使单选框之间互斥，只能选中一个单选项。";
	},

	renderView: function () {
		ModuleRadgrp.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例", "指定一个数据集<code>data</code>，" +
			"数据集的每一项将显示为一个单选框，其中<code>label</code>属性作为其文本信息。");

		var demoView = new UIRadioGroup(this, {data: ["A", "B", "C", "D"]});

		var source = [];
		source.push("new UIRadioGroup(this, {data: ['A', 'B', 'C', 'D']});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.RadioGroup.create({" +
			"\n\ttarget: '.demo-front', data: ['a', 'b', 'c', 'd']});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("指定显示文本属性名称", "设置<code>labelField</code>" +
			"属性作为单选框的文本信息，默认属性名称为<code>label</code>。");

		var demoView = new UIGroup(this);
		demoView.append(new UIRadioGroup(this, {data: [{id: 1, label: "选项1"}, 
			{id: 2, label: "选项2"}, {id: 3, label: "选项3"}, {id: 4, label: "选项4"}]}));
		demoView.append(new UIRadioGroup(this, {labelField: "title", data: [
			{title: "标题A", label: "aaa"}, {title: "标题B", label: "bbb"}, 
			{title: "标题C", label: "ccc"}, {title: "标题D", label: "ddd"}, 
			{title: "标题E", label: "eee"}]}));

		var source = [];
		source.push("new UIRadioGroup(this, {data: [" +
			"\n\t{id: 1, label: '选项1'}, {id: 2, label: '选项2'}, " +
			"\n\t{id: 3, label: '选项3'}, {id: 4, label: '选项4'}]});");
		source.push("new UIRadioGroup(this, {labelField: 'title', data: [" +
			"\n\t{title: '标题A', label: 'aaa'}, {title: '标题B', label: 'bbb'}, " +
			"\n\t{title: '标题C', label: 'ccc'}, {title: '标题D', label: 'ddd'}, " +
			"\n\t{title: '标题E', label: 'eee'}]});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("设置默认选择项", "使某一项处于选中状态，设置" +
			"<code>selectedIndex</code>属性指定选中项的索引，或者设置<code>selectedId</code>" +
			"属性指定选中项对应的值。设置值属性名称使用<code>idField</code>，默认取<code>id</code>，" +
			"<code>code</code>或<code>value</code>值。");

		var data = [{id: 1, label: "选项1", val: "aa"}, {id: 2, label: "选项2", val: "bb"}, 
			{id: 3, label: "选项3", val: "cc"}, {id: 4, label: "选项4", val: "dd"}];

		var demoView = new UIGroup(this);
		demoView.append(new UIRadioGroup(this, {selectedIndex: 2, data: data}));
		demoView.append(new UIRadioGroup(this, {selectedId: 4, data: data}));
		demoView.append(new UIRadioGroup(this, {selectedId: "bb", data: data, idField: "val"}));

		var source = [];
		source.push("var data = [{id: 1, label: '选项1', val: 'aa'}, " +
			"{id: 2, label: '选项2', val: 'bb'}, \n\t{id: 3, label: '选项3', val: 'cc'}, " +
			"{id: 4, label: '选项4', val: 'dd'}];");
		source.push("new UIRadioGroup(this, {selectedIndex: 2, data: data});");
		source.push("new UIRadioGroup(this, {selectedId: 4, data: data});");
		source.push("new UIRadioGroup(this, {selectedId: 'bb', data: data, idField: 'val'});");

		this.showDemo(section, demoView, source);
	}
});

ModuleRadgrp.import("./front/radiogroup.js");
