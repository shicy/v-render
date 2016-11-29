// ========================================================
// 数组相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

(function () {
	var ArrayUtils = (typeof VRender === "undefined") ? exports : VRender.Utils;

	// 依次执行代码
	ArrayUtils.each = function (arr, callback) {
		if (ArrayUtils.isArray(arr) && isFunction(callback)) {
			for (var i = 0, l = arr.length; i < l; i++) {
				if (callback(arr[i], i) === false)
					break;
			}
		}
	};

	// 数组对象过滤，去掉某些条件的对象，返回新数组
	ArrayUtils.filter = function (arr, callback) {
		if (!ArrayUtils.isArray(arr))
			return [];
		if (!isFunction(callback))
			return [];
		var result = [];
		for (var i = 0, l = arr.length; i < l; i++) {
			if (callback(arr[i]))
				result.push(arr[i]);
		}
		return result;
	};

	// 查找对象
	ArrayUtils.find = function (arr, callback) {
		if (!ArrayUtils.isArray(arr))
			return null;
		if (!isFunction(callback))
			return null;
		for (var i = 0, l = arr.length; i < l; i++) {
			if (callback(arr[i], i))
				return arr[i];
		}
		return null;
	};

	// 获取对象在数组中的索引
	ArrayUtils.index = function (arr, callback) {
		if (!ArrayUtils.isArray(arr))
			return -1;
		if (!isFunction(callback))
			return -1;
		for (var i = 0, l = arr.length; i < l; i++) {
			if (callback(arr[i], i))
				return i;
		}
		return -1;
	};

	// 判断对象是不是数组
	ArrayUtils.isArray = function (o) {
		return o && (o instanceof Array);
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

	// 删除数组中的对象
	ArrayUtils.removeItems = function (arr, callback) {
		if (!ArrayUtils.isArray(arr))
			return null;
		if (!isFunction(callback))
			return null;
		for (var i = arr.length - 1; i >= 0; i--) {
			if (callback(arr[i], i))
				arr.splice(i, 1);
		}
	};

	// 将对象封装成数组，如果原来是个数组就直接返回，否则包装一个数组
	ArrayUtils.toArray = function (o) {
		if ((typeof o === "undefined") || o === null)
			return [];
		if (o instanceof Array)
			return o;
		return [o];
	};

	///////////////////////////////////////////////////////
	var isFunction = function (obj) {
		return typeof obj === "function";
	};
})();
