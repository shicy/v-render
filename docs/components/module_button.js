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
		this.showDemo3();
		this.showDemo4();
		this.showDemo5();
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
		source.push("new UIButton(this, {label: 'Default'});");
		source.push("new UIButton(this, {label: 'Primary', style: 'ui-btn-primary'})");
		source.push("new UIButton(this, {label: 'Success', style: 'ui-btn-success'})");
		source.push("new UIButton(this, {label: 'Danger', style: 'ui-btn-danger'})");
		source.push("new UIButton(this, {label: 'Warn', style: 'ui-btn-warn'})");
		source.push("new UIButton(this, {label: 'Info', style: 'ui-btn-info'})");
		source.push("new UIButton(this, {label: 'Link', style: 'ui-btn-link'})");
		source.push("new UIButton(this, {label: 'Text', style: 'ui-btn-text'})");

		this.showDemo(section, demoView, source);
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
		source.push("new UIButton(this, {label: 'tiny button', size: 'tiny'});");
		source.push("new UIButton(this, {label: 'tiny button', size: 'tiny', style: 'ui-btn-primary'});");
		source.push("new UIButton(this, {label: 'small button', size: 'small'});");
		source.push("new UIButton(this, {label: 'small button', size: 'small', style: 'ui-btn-primary'});");
		source.push("new UIButton(this, {label: 'normal button', size: 'normal'});");
		source.push("new UIButton(this, {label: 'normal button', size: 'normal', style: 'ui-btn-primary'});");
		source.push("new UIButton(this, {label: 'big button', size: 'big'});");
		source.push("new UIButton(this, {label: 'big button', size: 'big', style: 'ui-btn-primary'});");
		source.push("new UIButton(this, {label: 'large button', size: 'large'});");
		source.push("new UIButton(this, {label: 'large button', size: 'large', style: 'ui-btn-primary'});");

		this.showDemo(section, demoView, source);
	},

	showDemo3: function () {
		var section = this.appendSection("浏览器端创建");

		var demoView = new UIGroup(this, {cls: "demo-front"});

		var source = [];
		source.push("VRender.Component.Button.create({" +
			"\n\ttarget: '.demo-front', " +
			"\n\tlabel: '前端动态创建的按钮', " +
			"\n\tstyle: 'ui-btn-primary'});");

		this.showDemo(section, demoView, source);
	},

	showDemo4: function () {
		var section = this.appendSection("已禁用的按钮", "被禁用的按钮不响应任何点击事件。");

		var demoView = new UIGroup(this);
		demoView.append(new UIButton(this, {label: "禁用的按钮", disabled: true, 
			style: "ui-btn-primary"}));

		var source = [];
		source.push("new UIButton(this, {label: '禁用的按钮', disabled: true};");

		this.showDemo(section, demoView, source);
	},

	showDemo5: function () {
		var section = this.appendSection("使用type代替style", "为了简化按钮的使用，" +
			"可以使用<code>type</code>属性代替<code>style</code>属性，相应类型的按钮显示对应的样式，" +
			"如下所示。可选的类型有：<code>ok</code>，<code>save</code>，<code>submit</code>，" +
			"<code>major</code>，<code>primary</code>，<code>danger</code>，<code>error</code>，" +
			"<code>success</code>，<code>complete</code>，<code>finish</code>，<code>warn</code>，" +
			"<code>warning</code>，<code>info</code>，<code>highlight</code>，<code>text</code>，" +
			"<code>link</code>。");

		var demoView = new UIGroup(this, {gap: 10});
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Ok", type: "ok"}))
			.append(new UIButton(this, {label: "Save", type: "save"}))
			.append(new UIButton(this, {label: "Submit", type: "submit"}))
			.append(new UIButton(this, {label: "Major", type: "major"}))
			.append(new UIButton(this, {label: "Primary", type: "primary"}));
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Danger", type: "danger"}))
			.append(new UIButton(this, {label: "Error", type: "error"}));
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Success", type: "success"}))
			.append(new UIButton(this, {label: "Complete", type: "complete"}))
			.append(new UIButton(this, {label: "Finish", type: "finish"}));
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Warn", type: "warn"}))
			.append(new UIButton(this, {label: "Warning", type: "warning"}));
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Info", type: "info"}))
			.append(new UIButton(this, {label: "Highlight", type: "highlight"}));
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Text", type: "text"}));
		demoView.addChild(new UIHGroup(this, {gap: 10}))
			.append(new UIButton(this, {label: "Link", type: "link"}));

		var source = [];
		source.push("new UIButton(this, {label: 'Ok', type: 'ok'});");
		source.push("new UIButton(this, {label: 'Save', type: 'save'});");
		source.push("new UIButton(this, {label: 'Submit', type: 'submit'});");
		source.push("new UIButton(this, {label: 'Major', type: 'major'});");
		source.push("new UIButton(this, {label: 'Primary', type: 'primary'});");
		source.push("// -----------------------------------------------------")
		source.push("new UIButton(this, {label: 'Danger', type: 'danger'});");
		source.push("new UIButton(this, {label: 'Error', type: 'error'});");
		source.push("// -----------------------------------------------------")
		source.push("new UIButton(this, {label: 'Success', type: 'success'});");
		source.push("new UIButton(this, {label: 'Complete', type: 'complete'});");
		source.push("new UIButton(this, {label: 'Finish', type: 'finish'});");
		source.push("// -----------------------------------------------------")
		source.push("new UIButton(this, {label: 'Warn', type: 'warn'});");
		source.push("new UIButton(this, {label: 'Warning', type: 'warning'});");
		source.push("// -----------------------------------------------------")
		source.push("new UIButton(this, {label: 'Info', type: 'info'});");
		source.push("new UIButton(this, {label: 'Highlight', type: 'highlight'});");
		source.push("// -----------------------------------------------------")
		source.push("new UIButton(this, {label: 'Text', type: 'text'});");
		source.push("// -----------------------------------------------------")
		source.push("new UIButton(this, {label: 'Link', type: 'link'});");

		this.showDemo(section, demoView, source);
	}
});

ModuleButton.import("./front/button.js");
