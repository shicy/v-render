// ========================================================
// 对话框
// 可选属性：title, content/view, buttons, size, padding
// 其中 size 可选值有：auto-自动大小，small-小对话框，normal-中等对话框（默认），big-大（满屏）对话框
// @author shicy <shicy85@163.com>
// Create on 2017-01-11
// ========================================================

var UIView = require("../UIView");
var VRender = require("../../v-render");
var DialogRender = require("../../static/js/render/dialog");


var UIDialog = UIView.extend(module, {

	getTitle: function () {
		return this.options.title;
	},
	setTitle: function (value) {
		this.options.title = value;
	},

	getContent: function () {
		return this.options.content || this.options.view;
	},
	setContent: function (value) {
		this.options.content = value;
		delete this.options.view;
	},

	getButtons: function () {
		return this.options.buttons;
	},
	setButtons: function (value) {
		this.options.buttons = value;
	},

	getSize: function () {
		return this.options.size;
	},
	setSize: function (value) {
		this.options.size = value;
	},

	isFill: function () {
		return this.options.fill;
	},
	setFill: function (value) {
		this.options.fill = value;
	},

	renderView: function () {
		UIDialog.__super__.renderView.call(this);
		var renderer = new DialogRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
