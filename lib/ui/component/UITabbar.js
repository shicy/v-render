// ========================================================
// 选项卡，继承自_UIItems
// @author shicy <shicy85@163.com>
// Create on 2017-03-19
// ========================================================

var _UISelect = require("./_UISelect");
var VRender = require("../../v-render");
var TabbarRender = require("../../static/js/render/tabbar");


var UITabbar = _UISelect.extend(module, {

	render: function (output) {
		UITabbar.__super__.render.call(this, output);
		var renderer = new TabbarRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
