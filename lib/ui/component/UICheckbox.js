// ========================================================
// 复选框
// @author shicy <shicy85@163.com>
// Create on 2016-12-02
// ========================================================

var UIView = require("../UIView");
var ChkboxHolder = require("../../static/js/ui/checkbox");
var VRender = require(__vrender__);


var UICheckbox = UIView.extend(module, {
	doInit: function () {
		UICheckbox.__super__.doInit.call(this);
		this.holder = new ChkboxHolder(this.options);
	},

	getTagName: function () {
		return "label";
	},

	getName: function () {
		// 这里不用name，将会在input上设置
	},
	setName: function (value) {
		if (this.holder)
			this.holder.setName(value);
	},

	getLabel: function () {
		return this.holder.getLabel();
	},
	setLabel: function (value) {
		this.holder.setLabel(value);
	},

	getValue: function () {
		return this.holder.getValue();
	},
	setValue: function (value) {
		this.holder.setValue(value);
	},

	isChecked: function () {
		return this.holder.isChecked();
	},
	setChecked: function (bool) {
		this.holder.setChecked(bool);
	},

	render: function (output) {
		UICheckbox.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
