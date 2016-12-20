// ========================================================
// 下拉选择框
// @author shicy <shicy85@163.com>
// Create on 2016-12-14
// ========================================================

var _UIItems = require("./_UIItems");
var VRender = require(__vrender__);
var ComboHolder = require("../../static/js/ui/combobox");


var UICombobox = _UIItems.extend(module, {
	doInit: function () {
		UICombobox.__super__.doInit.call(this);
		this.holder = new ComboHolder(this.options);
		this.holder.context = this.getContext();
	},

	getWidth: function () {
		return this.holder.getWidth();
	},
	setWidth: function (value) {
		this.holder.setWidth(value);
	},

	getPrompt: function () {
		return this.holder.getPrompt();
	},
	setPrompt: function (value) {
		this.holder.setPrompt(value);
	},

	isEditable: function () {
		return this.holder.isEditable();
	},
	setEditable: function (bool) {
		this.holder.setEditable(bool);
	},

	render: function (output) {
		UICombobox.__super__.render.call(this, output);
		this.holder.render(VRender.$, this.$el);
	}
});
