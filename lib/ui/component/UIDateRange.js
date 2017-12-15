// ========================================================
// 日期范围选择框
// 可选属性：start, end, min, max, prompt, format/dateFormat,
// 	quickDates|shortcuts, quickDef, dropdown
// @author shicy <shicy85@163.com>
// Create on 2016-12-24
// ========================================================

var Utils = require("../../util/Utils");
var DateUtils = require("../../util/DateUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var DateRangeRender = require("../../static/js/render/daterange");


var UIDateRange = UIView.extend(module, {
	doInit: function () {
		UIDateRange.__super__.doInit.call(this);
		this.holder = new DateRangeRender(this, this.options);
	},

	getStartDate: function () {
		return DateUtils.toDate(this.options.start);
	},
	setStartDate: function (value) {
		this.options.start = value;
	},

	getEndDate: function () {
		return DateUtils.toDate(this.options.end);
	},
	setEndDate: function (value) {
		this.options.end = value;
	},

	getMinDate: function () {
		return DateUtils.toDate(this.options.min);
	},
	setMinDate: function (value) {
		this.options.min = value;
	},

	getMaxDate: function () {
		return DateUtils.toDate(this.options.max);
	},
	setMaxDate: function (value) {
		this.options.max = value;
	},

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
	},

	getDateFormat: function () {
		return this.holder.getDateFormat();
	},
	setDateFormat: function (value) {
		this.options.format = value;
		delete this.options.dateFormat;
	},

	getQuickDates: function () {
		return this.holder.getQuickDates();
	},
	setQuickDates: function (value) {
		this.options.shortcuts = value;
		delete this.options.quickDates;
	},

	getQuickDefault: function () {
		return parseInt(this.options.quickDef) || 0;
	},
	setQuickDefault: function (value) {
		this.options.quickDef = value;
	},

	isQuickDropdown: function () {
		return Utils.isTrue(this.options.dropdown);
	},

	setQuickDropdown: function (bool) {
		this.options.dropdown = bool;
	},

	render: function (output) {
		UIDateRange.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
