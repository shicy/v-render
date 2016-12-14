// ========================================================
// 下拉选择列表
// @author shicy <shicy85@163.com>
// Create on 2016-12-10
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var DropdownListHolder = require("../../static/js/ui/dropdownlist");


var UIDropdownList = _UIItems.extend(module, {
	doInit: function () {
		UIDropdownList.__super__.doInit.call(this);
		this.holder = new DropdownListHolder(this.options);
		this.holder.context = this.getContext();
	},

	render: function (output) {
		UIDropdownList.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
