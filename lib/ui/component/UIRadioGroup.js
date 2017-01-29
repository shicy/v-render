// ========================================================
// 单选组，确保组内只有一个被选中
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require("../../v-render");
var RadgrpHolder = require("../../static/js/ui/radiogroup");


var UIRadioGroup = _UIItems.extend(module, {
	doInit: function () {
		UIRadioGroup.__super__.doInit.call(this);
		this.holder = new RadgrpHolder(this, this.options);
	},

	render: function (output) {
		UIRadioGroup.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
