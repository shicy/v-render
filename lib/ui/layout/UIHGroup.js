// ========================================================
// 水平方向布局的组视图容器
// @author shicy <shicy85@163.com>
// Create on 2016-11-13
// ========================================================

var Utils = require("../../util/Utils");
var UIGroup = require("./UIGroup");


var UIHGroup = UIGroup.extend(module, {
	doInit: function (done) {
		UIHGroup.super(this, (function () {
			this.setOrientation();
			if (Utils.isFunction(done))
				done();
		}).bind(this));
	},

	setOrientation: function (value) {
		this.options.orientation = UIGroup.HORIZONTIAL;
	}
});
