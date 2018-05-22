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

	getTagName: function () {
		return "label";
	},

	getName: function () {
		// 这里不用name，将会在input上设置
	},
	setName: function (value) {
		this.options.name = value;
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
		var renderer = new CheckboxRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
