// ========================================================
// 视图的可继承模式设计，视图继承方法：View.extend(module, {newProps});
// 
// 继承的视图又可以被其他视图继承，请查看“MySecondView”
// 
// @author shicy <shicy85@163.com>
// Create on 2016-10-31
// ========================================================

var VRender = require("../../lib/v-render");


var MyFirstView = VRender.View.extend(module, {

	doInit: function () {
		MyFirstView.__super__.doInit.call(this);
	}

});
