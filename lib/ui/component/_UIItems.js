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
	// setViewData: function (data) {
	// 	this.options.data = data;
	// },

	getIdField: function () {
		return this.options.idField;
	},
	setIdField: function (value) {
		this.options.idField = value;
	},

	getLabelField: function () {
		return this.options.labelField;
	},
	setLabelField: function (value) {
		this.options.labelField = value;
	},

	getLabelFunction: function () {
		return this.options.labelFunction;
	},
	setLabelFunction: function (value) {
		this.options.labelFunction = value;
	},

	getSelectedIndex: function () {
		return this.options.selectedIndex;
	},
	setSelectedIndex: function (value) {
		this.options.selectedIndex = value;
	},

	getSelectedId: function () {
		return this.options.selectedId;
	},
	setSelectedId: function (value) {
		this.options.selectedId = value;
	}
});
