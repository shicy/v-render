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

	getTime: function () {
		return this.options.time;
	},
	setTime: function (value) {
		this.options.time = value;
	},

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
	},

	getMinTime: function () {
		return this.options.min;
	},
	setMinTime: function (value) {
		this.options.min = value;
	},

	getMaxTime: function () {
		return this.options.max;
	},
	setMaxTime: function (value) {
		this.options.max = value;
	},

	isSecondVisible: function () {
		return Utils.isTrue(this.options.showSecond);
	},
	setSecondVisible: function (value) {
		this.options.showSecond = value;
	},

	isUse12Hour: function () {
		return Utils.isTrue(this.options.use12Hour);
	},
	setUse12Hour: function (value) {
		this.options.use12Hour = value;
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

	isReadonly: function () {
		return Utils.isTrue(this.options.readonly);
	},
	setReadonly: function (bool) {
		this.options.readonly = bool;
	},

	render: function (output) {
		UITimeInput.__super__.render.call(this, output);
		var renderer = new TimeInputRender(this, this.options);
		renderer.render(VRender.$, this.$el);
	}
	
});
