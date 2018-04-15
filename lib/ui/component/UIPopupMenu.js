// ========================================================
// 弹出菜单
// @author shicy <shicy85@163.com>
// Create on 2018-04-12
// ========================================================

var Utils = require("../../util/Utils");
var UIItems = require("./_UIItems");
var VRender = require("../../v-render");
var PopupMenuRender = require("../../static/js/render/popupmenu");


var UIPopupMenu = UIItems.extend(module, {
	
	getActionTarget: function () {
		return this.options.actionTarget;
	},
	setActionTarget: function (value) {
		this.options.actionTarget = value;
	},

	getActionType: function () {
		return this.options.actionType;
	},
	setActionType: function (value) {
		this.options.actionType = value;
	},

	getPosition: function () {
		return this.options.position;
	},
	setPosition: function (value) {
		this.options.position = value;
	},

	getOffsetLeft: function () {
		return this.options.offsetLeft;
	},
	setOffsetLeft: function (value) {
		this.options.offsetLeft = value;
	},

	getOffsetTop: function () {
		return this.options.offsetTop;
	},
	setOffsetTop: function (value) {
		this.options.offsetTop = value;
	},

	render: function (output) {
		UIPopupMenu.__super__.render.call(this, output);
		var renderer = new PopupMenuRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
