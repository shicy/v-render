// ========================================================
// 数组相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var ArrayUtils = module.exports = {};

// 依次执行代码
ArrayUtils.each = function (arr, callback) {
	if (ArrayUtils.isArray(arr) && isFunction(callback)) {
		for (var i = 0, l = arr.length; i < l; i++) {
			callback(arr[i], i);
		}
	}
};

// 判断对象是不是数组
ArrayUtils.isArray = function (o) {
	return o && o instanceof Array;
};

// 对象映射（转换），返回一个新的对象数组
ArrayUtils.map = function (arr, callback) {
	if (!ArrayUtils.isArray(arr))
		return [];
	if (!isFunction(callback))
		return [];
	var result = [];
	for (var i = 0, l = arr.length; i < l; i++) {
		result.push(callback(arr[i], i));
	}
	return result;
};

///////////////////////////////////////////////////////////
var isFunction = function (obj) {
	return typeof obj === "function";
};
