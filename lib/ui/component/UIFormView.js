// ========================================================
// 表单
// @author shicy <shicy85@163.com>
// Create on 2018-06-10
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var FormViewRender = require("../../static/js/render/formview");


var UIFormView = UIView.extend(module, {

	doInit: function () {
		UIFormView.__super__.doInit.call(this);
		this.renderer = new FormViewRender(this, this.options);
	},

	add: function (name, label, index) {
		return this.renderer.add(name, label, index);
	},

	delete: function (name) {
		this.renderer.delete(name);
	},

	deleteAt: function (index) {
		this.renderer.deleteAt(index);
	},

	setButtons: function (value) {
		this.options.buttons = value;
	},

	renderView: function () {
		UIFormView.__super__.renderView.call(this);
		this.renderer.render(VRender.$, this.$el);
	}

});
