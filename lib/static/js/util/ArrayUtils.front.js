// ========================================================
// 数组相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

(function (isFront) {
	var ArrayUtils = isFront ? VRender.Utils : exports;

	// 依次执行代码
	ArrayUtils.each = function (arr, callback) {
		if (isFunction(callback) && arr && arr.length > 0) {
			var hasEqual = isFunction(arr.eq);
			for (var i = 0, l = arr.length; i < l; i++) {
				var temp = hasEqual ? arr.eq(i) : arr[i];
				if (callback(temp, i) === false)
					break;
			}
		}
	};

	// 数组对象过滤，去掉某些条件的对象，返回新数组
	ArrayUtils.filter = function (arr, callback) {
		var results = [];
		if (isFunction(callback) && arr && arr.length > 0) {
			var hasEqual = isFunction(arr.eq);
			for (var i = 0, l = arr.length; i < l; i++) {
				var temp = hasEqual ? arr.eq(i) : arr[i];
				if (callback(temp, i))
					results.push(temp);
			}
		}
		return results;
	};

	ArrayUtils.filterBy = function (arr, field, value) {
		if (field) {
			return ArrayUtils.filter(arr, function (temp, i) {
				return temp && temp[field] == value;
			});
		}
		return [];
	};

	// 查找对象
	ArrayUtils.find = function (arr, callback) {
		if (isFunction(callback) && arr && arr.length > 0) {
			var hasEqual = isFunction(arr.eq);
			for (var i = 0, l = arr.length; i < l; i++) {
				var temp = hasEqual ? arr.eq(i) : arr[i];
				if (callback(temp, i))
					return temp;
			}
		}
		return null;
	};

	ArrayUtils.findBy = function (arr, field, value) {
		if (field) {
			return ArrayUtils.find(arr, function (temp, i) {
				return temp && temp[field] == value;
			});
		}
		return null;
	};

	// 获取对象在数组中的索引
	ArrayUtils.index = function (arr, callback) {
		if (isFunction(callback) && arr && arr.length > 0) {
			var hasEqual = isFunction(arr.eq);
			for (var i = 0, l = arr.length; i < l; i++) {
				var temp = hasEqual ? arr.eq(i) : arr[i];
				if (callback(temp, i))
					return i;
			}
		}
		return -1;
	};

	ArrayUtils.indexBy = function (arr, field, value) {
		if (field) {
			return ArrayUtils.index(arr, function (temp, i) {
				return temp && temp[field] == value;
			});
		}
		return -1;
	};

	// 判断对象是不是数组
	ArrayUtils.isArray = function (o) {
		return o && (o instanceof Array);
	};

	// 对象映射（转换），返回一个新的对象数组
	ArrayUtils.map = function (arr, callback) {
		var results = [];
		if (isFunction(callback)) {
			if (ArrayUtils.isArray(arr)) {
				for (var i = 0, l = arr.length; i < l; i++) {
					results.push(callback(arr[i], i));
				}
			}
			else if (isFront && (arr instanceof $)) {
				for (var i = 0, l = arr.length; i < l; i++) {
					results.push(callback(arr.eq(i), i));
				}
			};
		}
		return results;
	};

	// 删除数组中的对象
	ArrayUtils.remove = function (arr, callback) {
		var removedItems = [];
		if (isFunction(callback) && arr && arr.length > 0) {
			var hasEqual = isFunction(arr.eq);
			for (var i = arr.length - 1; i >= 0; i--) {
				var temp = hasEqual ? arr.eq(i) : arr[i];
				if (callback(temp, i)) {
					removedItems.unshift(temp);
					if (isFunction(temp.remove))
						temp.remove();
					else if (isFunction(arr.splice))
						arr.splice(i, 1);
				}
			}
		}
		return removedItems;
	};

	ArrayUtils.removeBy = function (arr, field, value) {
		if (field) {
			return ArrayUtils.remove(arr, function (temp, i) {
				return temp && temp[field] == value;
			});
		}
		return [];
	};

	// 将对象封装成数组，如果原来是个数组就直接返回，否则包装一个数组
	ArrayUtils.toArray = function (o) {
		if ((typeof o === "undefined") || o === null || o === false)
			return [];
		if (o instanceof Array)
			return o;
		return [o];
	};

	///////////////////////////////////////////////////////
	var isFunction = function (obj) {
		return typeof obj === "function";
	};
})(typeof VRender !== "undefined");
