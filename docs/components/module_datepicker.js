// ========================================================
// 日历组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-22
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIDatePicker = VRender.UIDatePicker;

var ModuleDatepicker = ModuleBase.extend(module, {
	className: "mod-datepicker",

	getCompName: function () {
		return "UIDatePicker";
	},

	getSubName: function () {
		return "日历";
	},

	getDescription: function () {
		return "一个日历面板用于选择日期。";
	},

	renderView: function () {
		ModuleDatepicker.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIDatePicker(this);

		var source = [];
		source.push("new UIDatePicker(this);");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.DatePicker.create({target: '.demo-front'});")

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("设置默认选中日期", "想要日历默认选择一个日期，设置属性" +
			"<code>date</code>到相应的日期值，该属性可以是一个日期对象(<code>Date</code>)，" +
			"也可以是一个日期字符串(<code>'2016-12-22'</code>)。");

		var demoView = new UIDatePicker(this, {date: "2016-12-25"});

		var source = [];
		source.push("new UIDatePicker(this, {date: '2016-12-25'});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("设置日期选择范围", "属性<code>min</code>" +
			"设置日历可选择的最早日期(包含)，属性<code>max</code>设置日历可选择的最迟日期(包含)。" +
			"同样的可以是日期对象(<code>Date</code>)，也可以是日期字符串(<code>'2016-12-22'</code>)。");

		var demoView = new UIDatePicker(this, {min: "2016-12-10", max: "2016-12-30"});

		var source = [];
		source.push("new UIDatePicker(this, {min: '2016-12-10', max: '2016-12-30'});");

		this.showDemo(section, demoView, source);
	}
});

ModuleDatepicker.import("./front/datepicker.js");
