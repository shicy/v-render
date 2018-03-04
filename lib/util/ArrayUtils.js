// ========================================================
// 数组相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var _ArrayUtils = require("../static/js/util/ArrayUtils.front.js");


var ArrayUtils = module.exports = {};

// 依次执行代码
ArrayUtils.each = _ArrayUtils.each;

// 数组对象过滤，去掉某些条件的对象，返回新数组
ArrayUtils.filter = _ArrayUtils.filter;
ArrayUtils.filterBy = _ArrayUtils.filterBy;

// 查找对象
ArrayUtils.find = _ArrayUtils.find;
ArrayUtils.findBy = _ArrayUtils.findBy;

// 将对象集分组，callback返回组名称
ArrayUtils.group = function (arr, callback) {
	if (!ArrayUtils.isArray(arr))
		return {};
	if (!isFunction(callback))
		return {};
	var result = {};
	for (var i = 0, l = arr.length; i < l; i++) {
		var temp = arr[i];
		var groupName = callback(temp, i);
		if (result[groupName])
			result[groupName].push(temp);
		else
			result[groupName] = [temp];
	}
	return result;
};

// 获取对象在数组中的索引
ArrayUtils.index = _ArrayUtils.index;
ArrayUtils.indexBy = _ArrayUtils.indexBy;

// 判断对象是不是数组
ArrayUtils.isArray = _ArrayUtils.isArray;

// 对象映射（转换），返回一个新的对象数组
ArrayUtils.map = _ArrayUtils.map;

// 将所有对象添加到数组
ArrayUtils.pushAll = function (origin, others) {
	for (var i = 1, l = arguments.length; i < l; i++) {
		var temp = arguments[i];
		if (ArrayUtils.isArray(temp)) {
			for (var m = 0, n = temp.length; m < n; m++) {
				origin.push(temp[m]);
			}
		}
		else if ((typeof temp !== "undefined" && temp !== null)) {
			origin.push(temp);
		}
	}
	return origin;
};

// 删除数组中的对象
ArrayUtils.remove = _ArrayUtils.remove;
ArrayUtils.removeBy = _ArrayUtils.removeBy;

// 将对象封装成数组，如果原来是个数组就直接返回，否则包装一个数组
ArrayUtils.toArray = _ArrayUtils.toArray;

// 去除重复对象，返回新数组
ArrayUtils.unique = function (arr, callback) {
	if (ArrayUtils.isArray(arr)) {
		if (!isFunction(callback))
			callback = function (v) { return v; };
		var results = [], values = [];
		for (var i = 0, l = arr.length; i < l; i++) {
			var value = callback(arr[i]);
			var hasValue = false;
			for (var m = 0, n = values.length; m < n; m++) {
				if (value === values[m]) {
					hasValue = true;
					break;
				}
			}
			if (!hasValue) {
				results.push(arr[i]);
				values.push(value);
			}
		}
		return results;
	}
	return arr;
};

///////////////////////////////////////////////////////////
var isFunction = function (obj) {
	return typeof obj === "function";
};
