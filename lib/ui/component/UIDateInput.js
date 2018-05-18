// ========================================================
// 日期输入框
// 可选属性：date, min, max, format/dateFormat
// @author shicy <shicy85@163.com>
// Create on 2016-12-23
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var DateInputRender = require("../../static/js/render/dateinput");


var UIDateInput = UIView.extend(module, {

	getDate: function () {
		return this.options.date;
	},
	setDate: function (value) {
		this.options.date = value;
	},

	getMinDate: function () {
		return this.options.min;
	},
	setMinDate: function (value) {
		this.options.min = value;
	},

	getMaxData: function () {
		return this.options.max;
	},
	setMaxData: function (value) {
		this.options.max = value;
	},

	getDateFormat: function () {
		return this.options.dateFormat || this.options.format;
	},
	setDateFormat: function (value) {
		this.options.dateFormat = value;
		delete this.options.format;
	},

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
	},

	isNative: function () {
		return Utils.isTrue(this.options.native);
	},
	setNative: function (value) {
		this.options.native = value;
	},

	render: function (output) {
		UIDateInput.__super__.render.call(this, output);
		var renderer = new DateInputRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
});
