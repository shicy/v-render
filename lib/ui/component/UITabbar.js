// ========================================================
// 选项卡，继承自_UIItems
// @author shicy <shicy85@163.com>
// Create on 2017-03-19
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require("../../v-render");
var TabbarRender = require("../../static/js/render/tabbar");


var UITabbar = _UIItems.extend(module, {
	doInit: function () {
		UITabbar.__super__.doInit.call(this);
		this.holder = new TabbarRender(this, this.options);
		this.options.idField = "name";
	},

	setIdField: function (value) {
		// this.options.idField = "name";
	},

	render: function (output) {
		UITabbar.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
