// ========================================================
// 确认对话框
// @author shicy <shicy85@163.com>
// Create on 2017-07-30
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var ConfirmRender = require("../../static/js/render/confirm");


var UIConfirm = UIView.extend(module, {

	getTitle: function () {
		return this.options.title;
	},
	setTitle: function (value) {
		this.options.title = value;
	},

	getContent: function () {
		return this.options.content;
	},
	setContent: function (value) {
		this.options.content = value;
	},

	getFocusHtmlContent: function () {
		return this.options.focusHtmlContent;
	},
	setFocusHtmlContent: function (value) {
		this.options.focusHtmlContent = value;
	},

	getConfirmLabel: function () {
		return this.options.confirmLabel || "确认";
	},
	setConfirmLabel: function (value) {
		this.options.confirmLabel = value;
	},

	getCancelLabel: function () {
		return this.options.cancelLabel || "取消";
	},
	setCancelLabel: function (value) {
		this.options.cancelLabel = value;
	},

	render: function (output) {
		UIConfirm.__super__.render.call(this, output);
		var renderer = new ConfirmRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
