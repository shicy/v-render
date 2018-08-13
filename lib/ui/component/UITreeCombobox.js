// ========================================================
// 树形下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2018-08-12
// ========================================================

var Utils = require("../../util/Utils");
var UISelect = require("./_UISelect");
var VRender = require(__vrender__);
var TreeComboboxRenderer = require("../../static/js/render/treecombobox");


var UITreeCombobox = UISelect.extend(module, {

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
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

	getApiName: function () {
		return null;
	},

	getApiParams: function () {
		return null;
	},

	render: function (output) {
		UITreeCombobox.__super__.render.call(this, output);
		var renderer = new TreeComboboxRenderer(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});