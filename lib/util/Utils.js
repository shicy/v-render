// ========================================================
// 常用工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Utils = module.exports = {};

var ENCODE_REGX = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
var randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// 复制对象
Utils.clone = function (obj, deep) {
	return Utils.extend(deep, {}, obj);
};

// html 特殊字符转义
Utils.encodeHtml = function (text) {
	if (!text) return text;
	return ("" + text).replace(ENCODE_REGX, function (c) {
		c = c.charCodeAt(0), r = ["&#"];
		c = (c == 0x20) ? 0xA0 : c;
		r.push(c);
		r.push(";");
		return r.join("");
	});
};

// 链式执行回调方法，让程序看上去是同步的编程方式
Utils.exec = function (scope, funcs, data, finalHandler, async) {
	if (Utils.isFunction(scope)) {
		finalHandler = scope;
		async = funcs;
		scope = funcs = data = null;
	}
	else if (scope instanceof Array) {
		async = finalHandler;
		finalHandler = data;
		data = funcs;
		funcs = scope; 
		scope = null;
	}
	if (funcs) {
		if (Utils.isFunction(funcs)) {
			async = data;
			finalHandler = funcs;
			funcs = data = null;
		}
		else if (!(funcs instanceof Array)) {
			async = finalHandler;
			finalHandler = data;
			data = funcs;
			funcs = null;
		}
	}
	if (data && Utils.isFunction(data)) {
		async = finalHandler;
		finalHandler = data;
		data = null;
	}

	if (!scope)
		scope = this;
	if (!Utils.isFunction(finalHandler))
		finalHandler = function () {};

	if (!funcs || funcs.length === 0) {
		finalHandler.call(scope, false, data);
	}
	else {
		var i = 0, len = funcs.length;
		if (async) {
			var errs = [];
			for (i = 0; i < funcs.length; i++) {
				funcs[i].call(scope, data, function (err, result) {
					len -= 1;
					if (err)
						errs.push(err);
					if (len <= 0)
						finalHandler.call(scope, (errs.join("") || false), result || data);
				});
			}
		}
		else {
			var wrap = function (err, result) {
				if (err) {
					finalHandler.call(scope, err, data);
				}
				else {
					i += 1;
					if (i < len)
						funcs[i].call(scope, (result || data), wrap);
					else
						finalHandler.call(scope, false, result || data);
				}
			};
			funcs[0].call(scope, data, wrap);
		}
	}
};

// 同步执行方法
Utils.execAsync = function (scope, funcs, data, finalHandler) {
	Utils.exec(scope, funcs, data, finalHandler, true)
};

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

// 判断对象是否是空对象
Utils.isEmpty = function (obj) {
	if (StringUtils.isBlank(obj))
		return true;
	for (var n in obj) {
		return false;
	}
	return true;
};

// 判断对象是不是一个方法
Utils.isFunction = function (obj) {
	return obj && (typeof obj === "function");
};

// 判断是不是手机号码
Utils.isMobile = function (value) {
	return /^1\d{10}$/.test("" + value);
};

// 判断对象是否为null或undefined
Utils.isNull = function (obj) {
	return (typeof obj === "undefined") || (obj === null);
};

// 判断对象是否为空，当对象不为空时返回true，否则返回false
Utils.isNotNull = function (obj) {
	return !Utils.isNull(obj);
};

// 判断是否数字
Utils.isNumberic = function (obj) {
	if (Utils.isNull(obj))
		return false;
	if (typeof obj === "number")
		return true;
	return !isNaN(obj);
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
	var s = [], chars = randomChars;
	for (var i = 0; i < len; i++) { 
		s.push(chars[Math.ceil(Math.random() * 61)]); 
	}
	return s.join("");
};

// 将对象转换成Dom节点的属性字符串
Utils.toDomStringAttrs = function (obj) {
	var result = [];
	if (typeof obj === "object") {
		for (var n in obj) {
			var value = Utils.isNull(obj[n]) ? "" : obj[n];
			result.push(n + "=\"" + value + "\"");
		}
	}
	return result.join(" ");
};

// 格式化手机号码，如：+86 138 8888 8888
Utils.toLocalMobile = function (mobile, countryCode) {
	if (!Utils.isMobile(mobile))
		return mobile;
	var parts = [];
	if (countryCode)
		parts.push("+86");
	parts.push(mobile.substr(0, 3));
	parts.push(mobile.substr(3, 4));
	parts.push(mobile.substr(7, 4));
	return parts.join(" ");
};

// 转换成URL参数字符串
Utils.toUrlParams = function (data) {
	if (StringUtils.isBlank(data))
		return "";
	var params = [];
	for (var n in data) {
		params.push(n + "=" + encodeURIComponent(data[n]));
	}
	return params.join("&");
};

// 全局唯一标识符（GUID，Globally Unique Identifier）也称作 UUID(Universally Unique IDentifier) 
Utils.uuid = function () {
	var s = [], chars = "0123456789abcdef".split("");
	for (var i = 0; i < 36; i++) {
		s[i] = chars[Math.floor(Math.random() * 16)];
	}
	s[14] = "4"; // time_hi_and_version
	s[19] = chars.charAt((s[19] & 0x3) | 0x8); // clock_seq_hi_and_reserved
	s[8] = s[13] = s[18] = s[23] = "-";
	return s.join("");
};


///////////////////////////////////////////////////////////
// extend
var StringUtils = require("./StringUtils");
var DateUtils = require("./DateUtils");
var ArrayUtils = require("./ArrayUtils");

Utils._public = {
	extend: Utils.extend,
	clone: Utils.clone,
	
	exec: Utils.exec,
	execAsync: Utils.execAsync,
	encodeHtml: Utils.encodeHtml,
	
	isEmpty: Utils.isEmpty,
	isBlank: StringUtils.isBlank,
	isNotBlank: StringUtils.isNotBlank,
	isNull: Utils.isNull,
	isNotNull: Utils.notNull,
	isFunction: Utils.isFunction,
	isNumberic: Utils.isNumberic,
	isTrue: Utils.isTrue,
	isArray: ArrayUtils.isArray,
	
	notNull: Utils.notNull,
	randomTxt: Utils.randomTxt,
	formatTxt: StringUtils.format,
	toUrlParams: Utils.toUrlParams,
	
	startWith: StringUtils.startWith,
	endWith: StringUtils.endWith,
	trimToEmpty: StringUtils.trimToEmpty,
	trimToNull: StringUtils.trimToNull,

	toDate: DateUtils.toDate,
	toDateString: DateUtils.toDateString,
	toLocalDateString: DateUtils.toLocalDateString,
	compareDate: DateUtils.compare,
	getMinutes: DateUtils.getMinutes,
	isSameDay: DateUtils.isSameDay,
	
	toArray: ArrayUtils.toArray,
	each: ArrayUtils.each,
	find: ArrayUtils.find,
	filter: ArrayUtils.filter,
	map: ArrayUtils.map,
	index: ArrayUtils.index,
	group: ArrayUtils.group,
	removeItems: ArrayUtils.remove
};
