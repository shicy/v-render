// ========================================================
// 单选组，确保组内只有一个被选中
// @author shicy <shicy85@163.com>
// Create on 2016-12-09
// ========================================================

var UIView = require("../UIView");
var RadgrpHolder = require("../../static/js/ui/radiogroup");
var VRender = require(__vrender__);


var UIRadioGroup = UIView.extend(module, {
	doInit: function () {
		UIRadioGroup.__super__.doInit.call(this);
		this.holder = new RadgrpHolder(this.options);
		this.holder.context = this;
	},

	getViewData: function () {
		// no use
	},
	setViewData: function (data) {
		if (this.holder)
			this.holder.setData(data);
	},

	getIdField: function () {
		return this.holder.getIdField();
	},
	setIdField: function (value) {
		this.holder.setIdField(value);
	},

	getLabelField: function () {
		return this.holder.getLabelField();
	},
	setLabelField: function (value) {
		this.holder.setLabelField(value);
	},

	getLabelFunction: function () {
		return this.holder.getLabelFunction();
	},
	setLabelFunction: function (value) {
		this.holder.setLabelFunction(value);
	},

	getSelectedIndex: function () {
		return this.holder.getSelectedIndex();
	},
	setSelectedIndex: function (value) {
		this.holder.setSelectedIndex(value);
	},

	getSelectedId: function () {
		return this.holder.getSelectedId();
	},
	setSelectedId: function (value) {
		this.holder.setSelectedId(value);
	},

	render: function (output) {
		UIRadioGroup.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
