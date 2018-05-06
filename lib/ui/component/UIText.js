// ========================================================
// 显示一个文本信息，使用“span”标签，HTML特殊字符转义
// @author shicy <shicy85@163.com>
// Create on 2016-11-29
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");


var UIText = UIView.extend(module, {
	tagName: "span",

	doInit: function () {
		UIText.__super__.doInit.call(this);
		this.setText(this.options.text);
	},

	getText: function () {
		return this._text;
	},
	setText: function (value) {
		this._text = value;
	},

	render: function (output) {
		UIText.__super__.render.call(this, output);
		var text = this.getText();
		if (Utils.isNotNull(text))
			this.$el.text(text);
	}
});
