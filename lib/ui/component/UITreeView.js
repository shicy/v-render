// ========================================================
// 树
// @author shicy <shicy85@163.com>
// Create on 2018-03-29
// ========================================================

var Utils = require("../../util/Utils");
var UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var TreeViewRenderer = require("../../static/js/render/treeview");

var UITreeView = UIItems.extend(module, {

	doInit: function () {
		UITreeView.__super__.doInit.call(this);
		this.renderer = new TreeViewRenderer(this, this.options);
	},

	isChkboxVisible: function () {
		return this.renderer.isChkboxVisible();
	},
	setChkboxVisible: function (bool) {
		this.options.chkbox = bool;
	},

	getIcon: function () {
		return this.options.icon;
	},
	setIcon: function (value) {
		this.options.icon = value;
	},

	getOpenIndex: function () {
		return this.options.openIndex;
	},
	setOpenIndex: function (value) {
		this.options.openIndex = value;
		delete this.options.openId;
	},

	getOpenId: function () {
		return this.options.openId;
	},
	setOpenId: function (value) {
		this.options.openId = value;
		delete this.options.openIndex;
	},

	render: function (output) {
		UITreeView.__super__.render.call(this, output);
		this.renderer.render(VRender.$, this.$el);
	}

});
