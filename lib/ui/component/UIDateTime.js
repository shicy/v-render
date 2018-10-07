// ========================================================
// 日期和时间输入框
// @author shicy <shicy85@163.com>
// Create on 2018-10-06
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var DateTimeRender = require("../../static/js/render/datetime");

var UIDateTime = UIView.extend(module, {

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

	isSecondVisible: function () {
		return Utils.isTrue(this.options.showSecond);
	},
	setSecondVisible: function (value) {
		this.options.showSecond = value;
	},

	getHours: function () {
		return this.options.hours;
	},
	setHours: function (value) {
		this.options.hours = value;
	},

	getMinutes: function () {
		return this.options.minutes;
	},
	setMinutes: function (value) {
		this.options.minutes = value;
	},

	getSeconds: function () {
		return this.options.seconds;
	},
	setSeconds: function (value) {
		this.options.seconds = value;
	},

	render: function (output) {
		UIDateTime.__super__.render.call(this, output);
		var renderer = new DateTimeRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}

});
