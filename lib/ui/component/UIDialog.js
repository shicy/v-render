// ========================================================
// 对话框
// 可选属性：title, content/view, buttons
// @author shicy <shicy85@163.com>
// Create on 2017-01-11
// ========================================================

var UIView = require("../UIView");
var VRender = require("../../v-render");
var DialogHolder = require("../../static/js/ui/dialog");


var UIDialog = UIView.extend(module, {
	doInit: function () {
		UIDialog.__super__.doInit.call(this);
		this.holder = new DialogHolder(this, this.options);
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

	getButtons: function () {
		return this.options.buttons;
	},
	setButtons: function (value) {
		this.options.buttons = value;
	},

	renderView: function () {
		UIDialog.__super__.renderView.call(this);
		this.holder.render(VRender.$, this.$el);
	}
});
