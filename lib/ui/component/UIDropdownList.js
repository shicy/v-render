// ========================================================
// 下拉选择列表
// 可用属性：data, idField, labelField, labelFunction, selectedIndex, selectedId
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var DropdownListRender = require("../../static/js/render/dropdownlist");


var UIDropdownList = _UIItems.extend(module, {

	render: function (output) {
		UIDropdownList.__super__.render.call(this, output);
		var renderer = new DropdownListRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
