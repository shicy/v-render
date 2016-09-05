// ========================================================
// 常用工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Utils = module.exports = {};

// 对象扩展，或者合并对象
// @param deep - 是否深度合并，true 为深度合并
Utils.extend = function (deep) {
	if (arguments.length <= 0)
	 return null;

	var isDeep = false, start = 0;
	if (typeof deep == "boolean") { // true, false
		if (arguments.length <= 1)
			return null;
		isDeep = Utils.isTrue(deep);
		start = 1;
	}

	var extendInner = function (dest, src) {
		if (!src)
			return dest;
		if (!dest || (typeof src != "object") || (typeof dest != "object"))
			return src;

		if (src instanceof Array) {
			if (!(dest instanceof Array))
				return src;
			dest = [];
		}
		for (var k in src) {
			if (isDeep) {
				dest[k] = extendInner(dest[k], src[k]);
			}
			else {
				dest[k] = src[k];
			}
		}
		return dest;
	};

	var result = {};
	for (var i = start; i < arguments.length; i++) {
		result = extendInner(result, arguments[i]);
	}
	return result;
};

// 判断对象是不是一个方法
Utils.isFunction = function (obj) {
	return obj && (typeof obj === "function");
};

// 判断对象是否为null或undefined
Utils.isNull = function (obj) {
	return (typeof obj === "undefined") || (obj === null);
};

// 判断对象是否为真
// 以下判断为 true: true, "true", "yes", "string", "1", 1, 2, ..
// 以下判断为 false: false, "false", "no", "", 0, "0", null
Utils.isTrue = function (v) {
	if (!v) // null, false, 0, ""
		return false;
	if (v === true || v === 1)
		return true;
	v = String(v).toLowerCase();
	return !(v === "false" || v === "no" || v === "0");
};

// 判断对象是否为空，当对象不为空时返回true，否则返回false
Utils.notNull = function (obj) {
	return !Utils.isNull(obj);
};

// 生成一个随机字符串
Utils.randomTxt = function (len) {
	var s = [], chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	for (var i = 0; i < len; i++) { 
		s.push(chars[Math.ceil(Math.random() * 61)]); 
	}
	return s.join("");
};

///////////////////////////////////////////////////////////
var FileUtils = require("./FileUtils");

Utils.mkdirsSync = FileUtils.mkdirsSync;
Utils.rmdirSync = FileUtils.rmdirSync;
