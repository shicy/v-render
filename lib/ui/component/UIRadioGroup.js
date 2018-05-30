// ========================================================
// 单选组，确保组内只有一个被选中
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

var _UISelect = require("./_UISelect");
var VRender = require("../../v-render");
var RadgrpRenderer = require("../../static/js/render/radiogroup");


var UIRadioGroup = _UISelect.extend(module, {

	isMultiple: function () {
		return false;
	},

	render: function (output) {
		UIRadioGroup.__super__.render.call(this, output);
		var renderer = new RadgrpRenderer(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
