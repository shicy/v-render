// ========================================================
// 数据集（数据列表、多值）相关的组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-12-11
// ========================================================

var Utils = require("../../util/Utils");
var UIView = require("../UIView");


var _UIItems = UIView.extend(module, {
	getViewData: function () {
		// 数据为数据集，一般为数组，用作子选项显示
	},
	setViewData: function (data) {
		if (this.holder && Utils.isFunction(this.holder.setData))
			this.holder.setData(data);
	},

	getIdField: function () {
		if (this.holder && Utils.isFunction(this.holder.getIdField))
			return this.holder.getIdField();
	},
	setIdField: function (value) {
		if (this.holder && Utils.isFunction(this.holder.setIdField))
			this.holder.setIdField(value);
	},

	getLabelField: function () {
		if (this.holder && Utils.isFunction(this.holder.getLabelField))
		return this.holder.getLabelField();
	},
	setLabelField: function (value) {
		if (this.holder && Utils.isFunction(this.holder.setLabelField))
			this.holder.setLabelField(value);
	},

	getLabelFunction: function () {
		if (this.holder && Utils.isFunction(this.holder.getLabelFunction))
			return this.holder.getLabelFunction();
	},
	setLabelFunction: function (value) {
		if (this.holder && Utils.isFunction(this.holder.setLabelFunction))
			this.holder.setLabelFunction(value);
	},

	getSelectedIndex: function () {
		if (this.holder && Utils.isFunction(this.holder.getSelectedIndex))
			return this.holder.getSelectedIndex();
	},
	setSelectedIndex: function (value) {
		if (this.holder && Utils.isFunction(this.holder.setSelectedIndex))
			this.holder.setSelectedIndex(value);
	},

	getSelectedId: function () {
		if (this.holder && Utils.isFunction(this.holder.getSelectedId))
			return this.holder.getSelectedId();
	},
	setSelectedId: function (value) {
		if (this.holder && Utils.isFunction(this.holder.setSelectedId))
			this.holder.setSelectedId(value);
	}
});
