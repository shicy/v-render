// ========================================================
// 输入框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-05
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UITextView = VRender.UITextView;

var ModuleTextView = ModuleBase.extend(module, {
	className: "mod-textview",

	getCompName: function () {
		return "UITextView";
	},

	getSubName: function () {
		return "文本输入框";
	},

	getDescription: function () {
		return "该组件包含一个文本输入框(<code>&lt;input&gt;</code>或<code>&lt;textarea&gt;</code>)元素，" +
			"组件可以给输入框添加描述或标注信息，设置输入框的数据类型，自动过滤相应的按键，以及自动格式化。";
	},

	renderView: function () {
		ModuleTextView.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
		this.showDemo5();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例", "");

		var demoView = new UIGroup(this, {cls: "demo-first"});
		demoView.append(new UITextView(this, {prompt: "文本输入框提示信息", 
			desc: "该输入框的说明描述内容，介绍信息等", tips: "标注", width: 300, maxSize: 25}));

		var source = [];
		source.push("new UITextView(this, {\n\tprompt: '文本输入框提示信息', " +
			"\n\tdesc: '该输入框的说明描述内容，介绍信息等', \n\ttips: '标注', " +
			"\n\twidth: 300, \n\tmaxSize: 25});");

		this.showDemo(section, demoView, source.join("\n"));
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建", "");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.TextView.create({\n\ttarget: '.demo-front', " +
			"\n\tprompt: '文本输入框提示信息', \n\trequired: true, \n\tempty: '输入框不能为空', " +
			"\n\tdesc: '该输入框组件由前端动态创建', \n\tvalue: '默认文本框内容'});");

		this.showDemo(section, demoView, source.join("\n"));
	},

	showDemo3: function () {
		var section = this.appendSection("多行文本输入框", 
			"设置属性<code>{multi: true}</code>支持多行文本输入，输入框显示为<code>textarea</code>元素。");

		var demoView = new UITextView(this, {multi: true, value: "在 box-sizing 的威力下，" +
			"这本应该是非常容易的事，并且在大多数浏览器下也确实如此。不过在webkit下，本应正好嵌入div的 " +
			"textarea 还是将外部容器的滚动条顶了出来。尽管查看 textarea 的尺寸和边距没有任何发现，" +
			"但是仍然会有幽灵一样的空白在其周围，使得滚动条不请自来。", required: true});

		var source = [];
		source.push("new UITextView(this, {multi: true, value: '...'});");

		this.showDemo(section, demoView, source.join("\n"));
	},

	showDemo4: function () {
		var section = this.appendSection("指定文本输入框类型", "属性<code>type</code>" +
			"设置输入框的数据类型，目前支持的数据类型有：<code>text</code>，<code>password</code>，" +
			"<code>number</code>，<code>tel</code>，<code>mobile</code>，<code>phone</code>，" +
			"<code>email</code>，<code>url</code>，默认数据类型为<code>text</code>。");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.append(new UIGroup(this).append(new UITextView(this, {
			type: "number", min: 5, max: 10, decimals: 1, prompt: "请输入5-10之间的数字",
			desc: "数字类型输入框，只接收数字类型按键，默认保留2位小数"})));
		demoView.append(new UIGroup(this).append(new UITextView(this, {
			type: "email", prompt: "请输入电子邮箱地址",
			desc: "电子邮箱类型输入框，验证输入框内容为电子邮箱地址，否则报错"})));
		demoView.append(new UIGroup(this).append(new UITextView(this, {
			type: "password", prompt: "请输入密码", 
			desc: "密码类型输入框，输入内容被隐藏显示"})));
		demoView.append(new UIGroup(this).append(new UITextView(this, {
			type: "number", prompt: "数字类型的密码", displayAsPwd: true,
			desc: "数字类型的密码输入框，内容被隐藏显示，只能输入数字类型"})));
		demoView.append(new UIGroup(this).append(new UITextView(this, {
			type: "tel", prompt: "请输入电话号码或手机号码",
			desc: "电话号码或手机号码类型输入框，支持电话或手机号码输入"})));
		demoView.append(new UIGroup(this).append(new UITextView(this, {
			type: "url", prompt: "请输入网页地址", width: 320, value: "http://",
			desc: "URL类型输入框，验证输入框内容为url，如：http://www.xxx.com/a/b"})));

		var source = [];
		source.push("new UITextView(this, {type: 'number', min: 5, max: 10, decimals: 1}); // 数字类型输入框");
		source.push("new UITextView(this, {type: 'email'}); // 电子邮箱类型输入框");
		source.push("new UITextView(this, {type: 'password'}); // 密码类型输入框");
		source.push("new UITextView(this, {type: 'number', displayAsPwd: true}); // 数字类型的密码输入框");
		source.push("new UITextView(this, {type: 'tel'}); // 电话或手机号码类型输入框");
		source.push("new UITextView(this, {type: 'url', width: 320, value: 'http://'}); // URL类型输入框");

		this.showDemo(section, demoView, source.join("\n"));
	},

	showDemo5: function () {
		var section = this.appendSection("设置输入框为只读", "设置属性<code>{readonly: true}</code>。");

		var demoView = new UITextView(this, {readonly: true, width: 300,
			value: "只读输入框，该输入框不能修改"});

		var source = [];
		source.push("new UITextView(this, {readonly: true, value: '...'});");

		this.showDemo(section, demoView, source.join("\n"));
	}
});

ModuleTextView.import("./front/textview.js");
