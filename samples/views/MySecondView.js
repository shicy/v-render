// ========================================================
// 多层类继承结构设计，本视图继承自另一个自定义视图(MyFirstView)
// 
// @author shicy <shicy85@163.com>
// Create on 2016-10-31
// ========================================================

var MyFirstView = require("./MyFirstView");


var MySecondView = MyFirstView.extend(module, {

	doInit: function () {
		MySecondView.__super__.doInit.call(this);
	}

});
