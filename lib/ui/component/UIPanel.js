// ========================================================
// 面板
// 可选属性：title, tabs, buttons, content/view, module
// @author shicy <shicy85@163.com>
// Create on 2017-02-05
// ========================================================

var ArrayUtils = require("../../util/ArrayUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var PanelRender = require("../../static/js/render/panel");


var UIPanel = UIView.extend(module, {

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

	// getModuleView: function () {
	// 	return this.options.module;
	// },
	// setModuleView: function (value) {
	// 	this.options.module = value;
	// },

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

	getViewports: function () {
		return ArrayUtils.toArray(this.options.viewports);
	},
	setViewports: function (value) {
		this.options.viewports = value;
	},
	addViewport: function (value) {
		if (!ArrayUtils.isArray(this.options.viewports))
			this.options.viewports = [];
		this.options.viewports.push(value);
	},

	render: function (output) {
		UIPanel.__super__.render.call(this, output);
		var renderer = new PanelRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
