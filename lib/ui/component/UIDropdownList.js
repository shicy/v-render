// ========================================================
// 下拉选择列表
// 可用属性：data, idField, labelField, labelFunction, selectedIndex, selectedId
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var DropdownListHolder = require("../../static/js/ui/dropdownlist");


var UIDropdownList = _UIItems.extend(module, {

	render: function (output) {
		UIDropdownList.__super__.render.call(this, output);
		var holder = new DropdownListHolder(this, this.options);
		holder.render(VRender.$, this.$el);
	}
	
});
