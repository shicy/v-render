// ========================================================
// 常用工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var _Utils = require("../static/js/util/Utils.front.js");


var Utils = module.exports = {};

var ENCODE_REGX = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
var randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// 复制对象
Utils.clone = function (obj, deep) {
	return Utils.extend(deep, {}, obj);
};

Utils.debounce = _Utils.debounce;

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
Utils.exec = _Utils.exec;

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
	if (deep === true || deep === false) { // true, false
		if (arguments.length <= 1)
			return null;
		isDeep = Utils.isTrue(deep);
		start = 1;
	}

	var extendInner = function (dest, src) {
		if (!src || Utils.isPrimitive(src))
			return src;

		if (src instanceof Array) {
			dest = [];
		}
		else if (!dest) {
			dest = {};
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
		if (Utils.isNotNull(arguments[i]))
			result = extendInner(result, arguments[i]);
	}
	return result;
};

Utils.getIndexValue = _Utils.getIndexValue;

Utils.getFormatSize = _Utils.getFormatSize;

// 获取用户浏览器代理头部信息
Utils.getUAState = _Utils.getUAState;

// 判断对象是否是空对象
Utils.isEmpty = _Utils.isEmpty;

// 判断对象是不是一个方法
Utils.isFunction = _Utils.isFunction;

// 判断是不是手机号码
Utils.isMobile = _Utils.isMobile;

// 判断对象是否为null或undefined
Utils.isNull = _Utils.isNull;

// 判断对象是不是非空对象
Utils.isNotEmpty = _Utils.isNotEmpty;

// 判断对象是否为空，当对象不为空时返回true，否则返回false
Utils.isNotNull = _Utils.isNotNull;

// 判断是否数字
Utils.isNumberic = _Utils.isNumberic;

// 判断是否为原生对象（不包括null, undefined）
Utils.isPrimitive = _Utils.isPrimitive;

// 判断对象是否为真
// 以下判断为 true: true, "true", "yes", "string", "1", 1, 2, ..
// 以下判断为 false: false, "false", "no", "", 0, "0", null
Utils.isTrue = _Utils.isTrue;

// 判断对象是否为空，当对象不为空时返回true，否则返回false
Utils.notNull = _Utils.isNotNull;

// 生成一个随机字符串
Utils.randomTxt = _Utils.randomTxt;

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
Utils.toLocalMobile = _Utils.toLocalMobile;

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
	
	debounce: Utils.debounce,
	exec: Utils.exec,
	execAsync: Utils.execAsync,
	encodeHtml: Utils.encodeHtml,
	
	isEmpty: Utils.isEmpty,
	isNotEmpty: Utils.isNotEmpty,
	isBlank: StringUtils.isBlank,
	isNotBlank: StringUtils.isNotBlank,
	isNull: Utils.isNull,
	isNotNull: Utils.isNotNull,
	isFunction: Utils.isFunction,
	isNumberic: Utils.isNumberic,
	isPrimitive: Utils.isPrimitive,
	isTrue: Utils.isTrue,
	isArray: ArrayUtils.isArray,
	
	notNull: Utils.notNull,
	randomTxt: Utils.randomTxt,
	formatTxt: StringUtils.format,
	toUrlParams: Utils.toUrlParams,
	getFormatSize: Utils.getFormatSize,
	getIndexValue: Utils.getIndexValue,
	
	startWith: StringUtils.startWith,
	endWith: StringUtils.endWith,
	trimToEmpty: StringUtils.trimToEmpty,
	trimToNull: StringUtils.trimToNull,
	trimToUndefined: StringUtils.trimToUndefined,

	toDate: DateUtils.toDate,
	toDateString: DateUtils.toDateString,
	toLocalDateString: DateUtils.toLocalDateString,
	compareDate: DateUtils.compare,
	getDays: DateUtils.getDays,
	getMinutes: DateUtils.getMinutes,
	isSameDay: DateUtils.isSameDay,
	isToday: DateUtils.isToday,
	isTomorrow: DateUtils.isTomorrow,
	isYesterday: DateUtils.isYesterday,
	
	toArray: ArrayUtils.toArray,
	each: ArrayUtils.each,
	find: ArrayUtils.find,
	findBy: ArrayUtils.findBy,
	filter: ArrayUtils.filter,
	filterBy: ArrayUtils.filterBy,
	map: ArrayUtils.map,
	index: ArrayUtils.index,
	indexBy: ArrayUtils.indexBy,
	group: ArrayUtils.group,
	remove: ArrayUtils.remove,
	removeBy: ArrayUtils.removeBy
};
