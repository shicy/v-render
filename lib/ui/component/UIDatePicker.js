// ========================================================
// 日历
// 可选属性：date, min, max
// @author shicy <shicy85@163.com>
// Create on 2016-12-22
// ========================================================

var UIView = require("../UIView");
var VRender = require("../../v-render");
var DatepickerHolder = require("../../static/js/ui/datepicker");


var UIDatePicker = UIView.extend(module, {
	doInit: function () {
		UIDatePicker.__super__.doInit.call(this);
		this.holder = new DatepickerHolder(this, this.options);
	},

	getDate: function () {
		return this.holder.getDate();
	},
	setDate: function (value) {
		this.options.date = value;
	},

	getMinDate: function () {
		return this.holder.getMinDate();
	},
	setMinDate: function (value) {
		this.options.min = value;
	},

	getMaxDate: function () {
		return this.holder.getMaxDate();
	},
	setMaxDate: function (value) {
		this.options.max = value;
	},

	render: function (output) {
		UIDatePicker.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
