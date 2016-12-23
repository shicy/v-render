// ========================================================
// 日期输入框组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-12-23
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var Utils = VRender.Utils;
var UIGroup = VRender.UIGroup;
var UIDateInput = VRender.UIDateInput;

var ModuleDateInput = ModuleBase.extend(module, {
	className: "mod-dateipt",

	getCompName: function () {
		return "UIDateInput";
	},

	getSubName: function () {
		return "日期选择框";
	},

	getDescription: function () {
		return "一个日期选择组件，类似于输入框样式，用户点击输入框会弹出一个日历面板，" +
			"通过点击日历面板上的日期选择。";
	},

	renderView: function () {
		ModuleDateInput.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
		this.showDemo3();
		this.showDemo4();
		this.showDemo5();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例");

		var demoView = new UIDateInput(this);

		var source = [];
		source.push("new UIDateInput(this); // 默认是今天");

		this.showDemo(section, demoView, source);
	},

	showDemo2: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.DateInput.create({target: '.dome-front'});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("设置默认值", "组件创建成功后，默认选中的日期为当天。" +
			"设置属性<code>date</code>可以修改默认选中日期，该属性可以是日期对象(<code>Date</code>)，" +
			"或是日期字符串(<code>'2016-12-25'</code>)，当设置<code>{date: null}</code>时无日期选中。");

		var demoView = new UIDateInput(this, {date: "2016-12-25"});

		var source = [];
		source.push("new UIDateInput(this, {date: '2016-12-25'});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("设置日期的可选范围", "属性<code>min</code>" +
			"设置日历可选择的最早日期(包含)，属性<code>max</code>设置日历可选择的最迟日期(包含)。" +
			"同样的可以是日期对象(<code>Date</code>)，也可以是日期字符串(<code>'2016-12-22'</code>)。");

		var demoView = new UIDateInput(this, {min: "2016-12-10", max: "2016-12-20"});

		var source = [];
		source.push("new UIDateInput(this, {min: '2016-12-10', max: '2016-12-20'});");

		this.showDemo(section, demoView, source);
	},

	showDemo5: function () {
		var section = this.appendSection("日期显示格式");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.addChild(new UIGroup(this))
			.append(new UIDateInput(this));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateInput(this, {format: "yyyy/MM/dd"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateInput(this, {format: "yyyy.MM.dd"}));
		demoView.addChild(new UIGroup(this))
			.append(new UIDateInput(this, {format: "yyyy年MM月dd日"}));

		var dateFormat = function (date) {
			var dateString = Utils.toDateString(date, "MM月dd日");
			if (Utils.isToday(date))
				dateString += "（今天）";
			else if (Utils.isTomorrow(date))
				dateString += "（明天）";
			else if (Utils.isYesterday(date))
				dateString += "（昨天）";
			return dateString;
		};
		demoView.addChild(new UIGroup(this))
			.append(new UIDateInput(this, {format: dateFormat}));

		var source = [];
		source.push("new UIDateInput(this);");
		source.push("new UIDateInput(this, {format: 'yyyy/MM/dd'});");
		source.push("new UIDateInput(this, {format: 'yyyy.MM.dd'});");
		source.push("new UIDateInput(this, {format: 'yyyy年MM月dd日'});");
		source.push("// ---------------------------------------------");
		source.push("var dateFormat = function (date) {" +
			"\n\tvar dateString = Utils.toDateString(date, 'MM月dd日');" +
			"\n\tif (Utils.isToday(date))\n\t\tdateString += '（今天）';" +
			"\n\tif (Utils.isTomorrow(date))\n\t\tdateString += '（明天）';" +
			"\n\tif (Utils.isYesterday(date))\n\t\tdateString += '（昨天）';" +
			"\n\treturn dateString;\n};");
		source.push("new UIDateInput(this, {format: dateFormat}); // 自定义格式化方法");

		this.showDemo(section, demoView, source);
	}
});

ModuleDateInput.import("./front/dateinput.js");
