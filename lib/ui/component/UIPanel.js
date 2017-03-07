// ========================================================
// 面板
// 可选属性：title, tabs, buttons, content/view, module
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

var ArrayUtils = require("../../util/ArrayUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var PanelHolder = require("../../static/js/ui/panel");


var UIPanel = UIView.extend(module, {
	doInit: function () {
		UIPanel.__super__.doInit.call(this);
		this.holder = new PanelHolder(this, this.options);
	},

	getTitle: function () {
		return this.options.title;
	},
	setTitle: function (value) {
		this.options.title = value;
	},

	getContentView: function () {
		return this.options.content || this.options.view;
	},
	setContentView: function (value) {
		this.options.content = value;
		delete this.options.view;
	},

	getModuleView: function () {
		return this.options.module;
	},
	setModuleView: function (value) {
		this.options.module = value;
	},

	getTabs: function () {
		return ArrayUtils.toArray(this.options.tabs);
	},
	setTabs: function (value) {
		this.options.tabs = value;
	},
	addTab: function (value) {
		if (!ArrayUtils.isArray(this.options.tabs))
			this.options.tabs = [];
		this.options.tabs.push(value);
	},

	getButtons: function () {
		return ArrayUtils.toArray(this.options.buttons);
	},
	setButtons: function (value) {
		this.options.buttons = value;
	},
	addButton: function (value) {
		if (!ArrayUtils.isArray(this.options.buttons))
			this.options.buttons = [];
		this.options.buttons.push(value);
	},

	render: function (output) {
		UIPanel.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
