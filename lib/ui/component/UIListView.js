// ========================================================
// 列表
// @author shicy <shicy85@163.com>
// Create on 2018-01-07
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var ListViewRenderer = require("../../static/js/render/listview");


var UIDropdownList = _UIItems.extend(module, {

	render: function (output) {
		UIDropdownList.__super__.render.call(this, output);
		var renderer = new ListViewRenderer(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
