// ========================================================
// 日期输入框
// 可选属性：date, min, max, format/dateFormat
// @author shicy <shicy85@163.com>
// Create on 2016-12-23
// ========================================================

var UIView = require("../UIView");
var VRender = require("../../v-render");
var DateInputRender = require("../../static/js/render/dateinput");


var UIDateInput = UIView.extend(module, {
	doInit: function () {
		UIDateInput.__super__.doInit.call(this);
		this.holder = new DateInputRender(this, this.options);
	},

	getDate: function () {
		return this.holder.getDate();
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
		return this.holder.getDateFormat();
	},
	setDateFormat: function (value) {
		this.options.format = value;
		delete this.options.dateFormat;
	},

	getPrompt: function () {
		return this.options.prompt;
	},
	setPrompt: function (value) {
		this.options.prompt = value;
	},

	render: function (output) {
		UIDateInput.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
