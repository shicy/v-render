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

	isChkboxVisible: function () {
		return Utils.isTrue(this.options.chkbox);
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
		var renderer = new TreeViewRenderer(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
