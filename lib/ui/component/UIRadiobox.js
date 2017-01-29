// ========================================================
// 单选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var RadboxHolder = require("../../static/js/ui/radiobox");


var UIRadiobox = UIView.extend(module, {
	doInit: function () {
		UIRadiobox.__super__.doInit.call(this);
		this.holder = new RadboxHolder(this, this.options);
	},

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
		UIRadiobox.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
