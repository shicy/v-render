// ========================================================
// 对话框
// @author shicy <shicy85@163.com>
// Create on 2017-01-11
// ========================================================

var UIView = require("../UIView");
var VRender = require(__vrender__);
var DialogHolder = require("../../static/js/ui/dialog");


var UIDialog = UIView.extend(module, {
	doInit: function () {
		UIDialog.__super__.doInit.call(this);
		this.holder = new DialogHolder(this.options);
	},

	getTitle: function () {
		return this.holder.getTitle();
	},
	setTitle: function (value) {
		this.holder.setTitle(value);
	},

	getContentView: function () {
		return this.holder.getContentView();
	},
	setContentView: function (value) {
		this.holder.setContentView(value);
	},

	getButtons: function () {
		return this.holder.getButtons();
	},
	setButtons: function (value) {
		this.holder.setButtons(value);
	},

	renderView: function () {
		UIDialog.__super__.renderView.call(this);
		this.holder.render(VRender.$, this.$el);
	}
});
