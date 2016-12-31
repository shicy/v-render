// ========================================================
// 日期范围选择框
// @author shicy <shicy85@163.com>
// Create on 2016-12-24
// ========================================================

var UIView = require("../UIView");
var VRender = require(__vrender__);
var DateRangeHolder = require("../../static/js/ui/daterange");


var UIDateRange = UIView.extend(module, {
	doInit: function () {
		UIDateRange.__super__.doInit.call(this);
		this.holder = new DateRangeHolder(this.options);
	},

	getStartDate: function () {
		return this.holder.getStartDate();
	},
	setStartDate: function (value) {
		this.holder.setStartDate(value);
	},

	getEndDate: function () {
		return this.holder.getEndDate();
	},
	setEndDate: function (value) {
		this.holder.setEndDate(value);
	},

	getMinDate: function () {
		return this.holder.getMinDate();
	},
	setMinDate: function (value) {
		this.holder.setMinDate(value);
	},

	getMaxDate: function () {
		return this.holder.getMaxDate();
	},
	setMaxDate: function (value) {
		this.holder.setMaxDate(value);
	},

	getPrompt: function () {
		return this.holder.getPrompt();
	},
	setPrompt: function (value) {
		this.holder.setPrompt(value);
	},

	getDateFormat: function () {
		return this.holder.getDateFormat();
	},
	setDateFormat: function (value) {
		this.holder.setDateFormat(value);
	},

	getQuickDates: function () {
		return this.holder.getQuickDates();
	},
	setQuickDates: function (value) {
		this.holder.setQuickDates(value);
	},

	getQuickDefault: function () {
		return this.holder.getQuickDefault();
	},
	setQuickDefault: function (value) {
		this.holder.setQuickDefault(value);
	},

	isQuickDropdown: function () {
		return this.holder.isQuickDropdown();
	},

	setQuickDropdown: function (bool) {
		this.holder.setQuickDropdown(bool);
	},

	render: function (output) {
		UIDateRange.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
