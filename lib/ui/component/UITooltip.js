// ========================================================
// 提示框
// @author shicy <shicy85@163.com>
// Create on 2016-06-07
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var TooltipRender = require("../../static/js/render/tooltip");


var UITooltip = UIView.extend(module, {

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

	getType: function () {
		return this.options.type;
	},
	setType: function (value) {
		this.options.type = value;
	},

	getIcon: function () {
		return this.options.icon;
	},
	setIcon: function (value) {
		this.options.icon = value;
	},

	getDuration: function () {
		return this.options.duration;
	},
	setDuration: function (value) {
		this.options.duration = value;
	},

	getClosable: function () {
		if (Utils.isNull(this.options.closable))
			return true;
		return Utils.isTrue(this.options.closable);
	},
	setClosable: function (value) {
		this.options.closable = value;
	},

	renderView: function () {
		UITooltip.__super__.renderView.call(this);
		var renderer = new TooltipRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
