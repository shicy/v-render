// ========================================================
// 组视图使用说明文档
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

var ModuleBase = require("./module_base");


var ModuleGroup = ModuleBase.extend(module, {
	className: "mod-group",

	renderView: function () {
		ModuleGroup.__super__.renderView.call(this);
		this.$el.write("jsdjfiofdsjofej");
	}
});
