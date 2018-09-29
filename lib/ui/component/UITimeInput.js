// ========================================================
// 时间输入框
// 可选属性：date, min, max, format/dateFormat
// @author shicy <shicy85@163.com>
// Create on 2018-09-29
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var TimeInputRender = require("../../static/js/render/timeinput");


var UITimeInput = UIView.extend(module, {

	render: function (output) {
		UITimeInput.__super__.render.call(this, output);
		var renderer = new TimeInputRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
