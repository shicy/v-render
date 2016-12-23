// ========================================================
// 日期输入框
// @author shicy <shicy85@163.com>
// Create on 2016-12-23
// ========================================================

var UIView = require("../UIView");
var VRender = require(__vrender__);
var DateInputHolder = require("../../static/js/ui/dateinput");


var UIDateInput = UIView.extend(module, {
	doInit: function () {
		UIDateInput.__super__.doInit.call(this);
		this.holder = new DateInputHolder(this.options);
	},

	getDate: function () {
		return this.holder.getDate();
	},
	setDate: function (value) {
		this.holder.setDate(value);
	},

	getMinDate: function () {
		return this.holder.getMinDate();
	},
	setMinDate: function (value) {
		this.holder.setMinDate(value);
	},

	getMaxData: function () {
		return this.holder.getMaxData();
	},
	setMaxData: function (value) {
		this.holder.setMaxData(value);
	},

	getDataFormat: function () {
		return this.holder.getDataFormat();
	},
	setDataFormat: function (value) {
		this.holder.setDataFormat(value);
	},

	render: function (output) {
		UIDateInput.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
