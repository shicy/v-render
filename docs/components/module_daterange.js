// ========================================================
// 日期范围选择框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-24
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIDateRange = VRender.UIDateRange;

var ModuleDateRange = ModuleBase.extend(module, {
	className: "mod-daterange",

	getCompName: function () {
		return "UIDateRange";
	},

	getSubName: function () {
		return "日期范围";
	},

	getDescription: function () {
		return "该组件可以选择一个日期范围，默认显示为输入框的样式，点击输入框时弹出一个日历面板，" +
			"选择日历面板上的日期来选择范围。";
	},

	renderView: function () {
		ModuleDateRange.__super__.renderView.call(this);
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
			.append(new UIDateRange(this, {prompt: "请选择起止日期"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: "2016-12-12", end: "2016-12-30"}));

		var source = [];
		source.push("new UIDateRange(this, {prompt: '请选择起止日期'});");
		source.push("new UIDateRange(this, {start: '2016-12-12', end: '2016-12-30'});");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.DateRange.create({" +
			"target: '.demo-front', start: '2016-12-10', end: '2016-12-20'});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("设置默认起止日期", "给组件设置默认的起止日期使用" +
			"<code>start</code>和<code>end</code>属性，分别是开始日期和结束日期，其中属性值" +
			"可以是日期对象(<code>Date</code>)或者日期字符串(<code>'2016-12-25'</code>)。");

		this.showMessage(section, "关于start和end属性", "日期start必须在日期end之前，否则无效；" +
			"可以只设置start或end中的一个属性，这样的日期范围即为一天。", "warn");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: "2016-10-5", end: "2016-12-30"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: "2016-12-25", prompt: "请选择"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {end: new Date()}));

		var start = new Date(), end = new Date();
		start.setMonth(start.getMonth() - 1);
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: start, end: end}));

		var source = [];
		source.push("new UIDateRange(this, {start: '2016-10-5', end: '2016-12-30'});");
		source.push("new UIDateRange(this, {start: '2016-12-25', prompt: '请选择'});");
		source.push("new UIDateRange(this, {end: new Date()}); // 今天");
		source.push("// ---------------------------------------------");
		source.push("var start = new Date(), end = new Date();");
		source.push("start.setMonth(start.getMonth() - 1);")
		source.push("new UIDateRange(this, {start: start, end: end}); // 最近一个月");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("设置日期选择范围", "使用属性<code>min</code>" +
			"和<code>max</code>设置组件可以选择的最小和最大日期，设置属性可以是日期对象" +
			"(<code>Date</code>)或者日期字符串(<code>'2016-12-25'</code>)。");

		var demoView = new UIGroup(this);
		var min = new Date(), max = new Date();
		min.setDate(min.getDate() - 7);
		demoView.append(new UIDateRange(this, {prompt: "请选择起止日期，最近7天", 
			min: min, max: max}));

		var source = [];
		source.push("var min = new Date(), max = new Date();");
		source.push("min.setDate(min.getDate() - 7);");
		source.push("new UIDateRange(this, {prompt: '请选择起止日期，最近7天', " +
			"min: min, max: max});");

		this.showDemo(section, demoView, source);
	},

	showDemo5: function () {
		var section = this.appendSection("设置日期显示格式");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: new Date()}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: new Date(), format: "yyyy/MM/dd"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: new Date(), format: "yyyy.MM.dd"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: new Date(), format: "yyyy年MM月dd日"}));

		var source = [];
		source.push("new UIDateRange(this, {start: new Date()});");
		source.push("new UIDateRange(this, {start: new Date(), format: 'yyyy/MM/dd'});");
		source.push("new UIDateRange(this, {start: new Date(), format: 'yyyy.MM.dd'});");
		source.push("new UIDateRange(this, {start: new Date(), format: 'yyyy年MM月dd日'});");

		this.showDemo(section, demoView, source);
	},

	showDemo6: function () {
		var section = this.appendSection("设置快捷选择按钮");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: new Date(), quickDates: [3, 5, 15, 30]}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {start: new Date(), 
				quickDates: [{label: "最近3天", value: 3}, {label: "最近5天", value: 5}, 
					{label: "最近15天", value: 15}, {label: "最近一个月", value: 30}]}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {quickDates: [{label: "今天", value: 1}, 
				{label: "最近一周", value: 7}, {label: "最近一个月", value: 30}], quickDef: 30}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateRange(this, {quickDates: [1, 2, 3, 4, 5], dropdown: true}));

		var source = [];
		source.push("new UIDateRange(this, {start: new Date(), quickDates: [3, 5, 15, 30]});");
		source.push("new UIDateRange(this, {start: new Date(), quickDates: [" +
			"\n\t{label: '最近3天', value: 3}, {label: '最近5天', value: 5}, " +
			"\n\t{label: '最近15天', value: 15}, {label: '最近一个月', value: 30}]});");
		source.push("new UIDateRange(this, {quickDates: [{label: '今天', value: 1}, " +
			"{label: '最近一周', value: 7}, \n\t{label: '最近一个月', value: 30}], quickDef: 30});");
		source.push("new UIDateRange(this, {quickDates: [1, 2, 3, 4, 5], dropdown: true});");

		this.showDemo(section, demoView, source);
	}
});

ModuleDateRange.import("./front/daterange.js");
