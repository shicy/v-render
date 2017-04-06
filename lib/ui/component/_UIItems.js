// ========================================================
// 数据集（数据列表、多值）相关的组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-12-11
// ========================================================

var Utils = require("../../util/Utils");
var ArrayUtils = require("../../util/ArrayUtils");
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
	},

	getItemAt: function (index) {
		index = parseInt(index);
		if (isNaN(index) || index < 0)
			return null;
		var datas = ArrayUtils.toArray(this.options.data);
		return index < datas.length ? datas[index] : null;
	},

	getItemById: function (id) {
		var idField = this.getIdField() || "id";
		var datas = ArrayUtils.toArray(this.options.data);
		return ArrayUtils.find(datas, function (temp) {
			return temp[idField] == id;
		});
	},

	getItemIndex: function (item) {
		if (Utils.isNull(item))
			return -1;
		var idField = this.getIdField() || "id";
		var datas = ArrayUtils.toArray(this.options.data);
		return ArrayUtils.index(datas, function (temp) {
			if (item == temp)
				return true;
			if (item[idField] == temp[idField])
				return true;
		});
	},

	addItem: function (item, index) {
		if (!ArrayUtils.isArray(this.options.data))
			this.options.data = ArrayUtils.toArray(this.options.data);
		index = parseInt(index);
		if (isNaN(index) || index < 0 || index >= this.options.data.length)
			this.options.data.push(item);
		else 
			this.options.data.splice(index, 0, item);
	},

	updateItem: function (item, index) {
		index = parseInt(index);
		if (isNaN(index)) {
			if (Utils.isNull(item))
				return ;
			index = this.getItemIndex(item);
		}
		var datas = ArrayUtils.toArray(this.options.data);
		if (index >= 0 && index < datas.length)
			datas[index] = item;
	},

	removeItem: function (item) {
		return this.removeItemAt(this.getItemIndex(item));
	},

	removeItemAt: function (index) {
		index = parseInt(index);
		var item = null;
		var datas = ArrayUtils.toArray(this.options.data);
		if (!isNaN(index) && index >= 0 && index < datas.length) {
			item = datas[index];
			datas.splice(index, 1);
		}
		return item;
	}
});
