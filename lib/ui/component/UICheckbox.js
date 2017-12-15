// ========================================================
// 复选框
// 可选属性：label, value, checked
// @author shicy <shicy85@163.com>
// Create on 2016-12-02
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var CheckboxRender = require("../../static/js/render/checkbox");


var UICheckbox = UIView.extend(module, {
	doInit: function () {
		UICheckbox.__super__.doInit.call(this);
		this.holder = new CheckboxRender(this, this.options);
	},

	getTagName: function () {
		return "label";
	},

	getLabel: function () {
		return this.options.label;
	},
	setLabel: function (value) {
		this.options.label = value;
	},

	getValue: function () {
		return this.options.value;
	},
	setValue: function (value) {
		this.options.value = value;
	},

	isChecked: function () {
		return Utils.isTrue(this.options.checked);
	},
	setChecked: function (bool) {
		this.options.checked = bool;
	},

	render: function (output) {
		UICheckbox.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
	
});
