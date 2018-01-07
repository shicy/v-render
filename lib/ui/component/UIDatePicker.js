// ========================================================
// 日历
// 可选属性：date, min, max
// @author shicy <shicy85@163.com>
// Create on 2016-12-22
// ========================================================

var Utils = require("../../util/Utils");
var DateUtils = require("../../util/DateUtils");
var UIView = require("../UIView");
var VRender = require("../../v-render");
var DatepickerRender = require("../../static/js/render/datepicker");


var UIDatePicker = UIView.extend(module, {
	doInit: function () {
		UIDatePicker.__super__.doInit.call(this);
		this.holder = new DatepickerRender(this, this.options);
	},

	getDate: function () {
		return DateUtils.toDate(this.options.date);
	},
	setDate: function (value) {
		this.options.date = value;
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

	isRangeDate: function () {
		return Utils.isTrue(this.options.range);
	},
	setRangeFlag: function (value) {
		this.options.range = Utils.isNull(value) ? true : Utils.isTrue(value);
	},

	render: function (output) {
		UIDatePicker.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
