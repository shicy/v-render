// ========================================================
// 水平方向布局的组视图容器
// @author shicy <shicy85@163.com>
// Create on 2016-11-13
// ========================================================

var UIGroup = require("./UIGroup");


var UIHGroup = UIGroup.extend(module, {
	getOrientation: function () {
		return UIGroup.HORIZONTIAL;
	}
});
