// ========================================================
// 多选组
// @author shicy <shicy85@163.com>
// Create on 2018-06-20
// ========================================================

var _UISelect = require("./_UISelect");
var VRender = require("../../v-render");
var ChkgrpRenderer = require("../../static/js/render/checkgroup");


var UICheckGroup = _UISelect.extend(module, {

	isMultiple: function () {
		return true;
	},

	render: function (output) {
		UICheckGroup.__super__.render.call(this, output);
		var renderer = new ChkgrpRenderer(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
