// ========================================================
// 按钮组件使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-11-28
// ========================================================

var VRender = require(__vrender__);
var ModuleBase = require("./module_base");


var UIGroup = VRender.UIGroup;
var UIHGroup = VRender.UIHGroup;
var UIButton = VRender.UIButton;

var ModuleButton = ModuleBase.extend(module, {
	className: "mod-button",

	getCompName: function () {
		return "UIButton";
	},

	getSubName: function () {
		return "按钮";
	},

	getDescription: function () {
		return "按钮组件定义，在按钮元素<code>&lt;button&gt;</code>的基础上进行包装，预定义按钮的样式，扩展按钮功能支持下拉选择。";
	},

	renderView: function () {
		ModuleButton.__super__.renderView.call(this);
		this.showDemo1();
		this.showDemo2();
	},

	showDemo1: function () {
		var section = this.appendSection("组件实例", "创建按钮使用不同的样式，可选择样式有：<code>.ui-btn-primary</code>," +
			" <code>.ui-btn-success</code>, <code>.ui-btn-danger</code>, <code>.ui-btn-warn</code>, " +
			"<code>.ui-btn-info</code>, <code>.ui-btn-link</code>, <code>.ui-btn-text</code>。设置按钮样式使用<code>style</code>属性。");

		this.showMessage(section, "使用自定义样式", "当设置的样式<code>style</code>不在可选范围内时，将使用默认样式<code>.ui-btn-default</code>，" +
			"自定义样式<code>style</code>作为类添加在按钮上。", "warn");

		var demoView = new UIHGroup(this, {gap: 10});
		demoView.append(new UIButton(this, {label: "Default"}));
		demoView.append(new UIButton(this, {label: "Primary", style: "ui-btn-primary"}));
		demoView.append(new UIButton(this, {label: "Success", style: "ui-btn-success"}));
		demoView.append(new UIButton(this, {label: "Danger", style: "ui-btn-danger"}));
		demoView.append(new UIButton(this, {label: "Warn", style: "ui-btn-warn"}));
		demoView.append(new UIButton(this, {label: "Info", style: "ui-btn-info"}));
		demoView.append(new UIButton(this, {label: "Link", style: "ui-btn-link"}));
		demoView.append(new UIButton(this, {label: "Text", style: "ui-btn-text"}));

		var source = [];
		source.push("new UIButton(this, {label: \"Default\"});");
		source.push("new UIButton(this, {label: \"Primary\", style: \"ui-btn-primary\"})");
		source.push("new UIButton(this, {label: \"Success\", style: \"ui-btn-success\"})");
		source.push("new UIButton(this, {label: \"Danger\", style: \"ui-btn-danger\"})");
		source.push("new UIButton(this, {label: \"Warn\", style: \"ui-btn-warn\"})");
		source.push("new UIButton(this, {label: \"Info\", style: \"ui-btn-info\"})");
		source.push("new UIButton(this, {label: \"Link\", style: \"ui-btn-link\"})");
		source.push("new UIButton(this, {label: \"Text\", style: \"ui-btn-text\"})");

		this.showDemo(section, demoView, source.join("\n"));
	},

	showDemo2: function () {
		var section = this.appendSection("按钮尺寸", "需要按钮的不同尺寸大小，设置<code>size</code>属性，从小到大依次是<code>tiny</code>, " +
			"<code>small</code>, <code>normal</code>, <code>big</code>, <code>large</code>，默认是<code>normal</code>。");

		var demoView = new UIGroup(this, {gap: 10});
		var group = demoView.addChild(new UIHGroup(this, {gap: 10}));
		group.append(new UIButton(this, {label: "tiny button", size: "tiny"}));
		group.append(new UIButton(this, {label: "tiny button", size: "tiny", style: "ui-btn-primary"}));
		var group = demoView.addChild(new UIHGroup(this, {gap: 10}));
		group.append(new UIButton(this, {label: "small button", size: "small"}));
		group.append(new UIButton(this, {label: "small button", size: "small", style: "ui-btn-primary"}));
		var group = demoView.addChild(new UIHGroup(this, {gap: 10}));
		group.append(new UIButton(this, {label: "normal button", size: "normal"}));
		group.append(new UIButton(this, {label: "normal button", size: "normal", style: "ui-btn-primary"}));
		var group = demoView.addChild(new UIHGroup(this, {gap: 10}));
		group.append(new UIButton(this, {label: "big button", size: "big"}));
		group.append(new UIButton(this, {label: "big button", size: "big", style: "ui-btn-primary"}));
		var group = demoView.addChild(new UIHGroup(this, {gap: 10}));
		group.append(new UIButton(this, {label: "large button", size: "large"}));
		group.append(new UIButton(this, {label: "large button", size: "large", style: "ui-btn-primary"}));

		var source = [];
		source.push("new UIButton(this, {label: \"tiny button\", size: \"tiny\"});");
		source.push("new UIButton(this, {label: \"tiny button\", size: \"tiny\", style: \"ui-btn-primary\"});");
		source.push("new UIButton(this, {label: \"small button\", size: \"small\"});");
		source.push("new UIButton(this, {label: \"small button\", size: \"small\", style: \"ui-btn-primary\"});");
		source.push("new UIButton(this, {label: \"normal button\", size: \"normal\"});");
		source.push("new UIButton(this, {label: \"normal button\", size: \"normal\", style: \"ui-btn-primary\"});");
		source.push("new UIButton(this, {label: \"big button\", size: \"big\"});");
		source.push("new UIButton(this, {label: \"big button\", size: \"big\", style: \"ui-btn-primary\"});");
		source.push("new UIButton(this, {label: \"large button\", size: \"large\"});");
		source.push("new UIButton(this, {label: \"large button\", size: \"large\", style: \"ui-btn-primary\"});");

		this.showDemo(section, demoView, source.join("\n"));
	}
});
