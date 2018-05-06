// ========================================================
// 字符相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var _StringUtils = require("../static/js/util/StringUtils.front.js");


var StringUtils = module.exports = {};

// 判断字符串是否以某个子串结尾
StringUtils.endWith = _StringUtils.endWith;

/**
 * 格式化字符串。解析字符串，转换字符串中大括号“{}”所包含的内容为实际数据的相应值。
 * 如：有data是“{name: '张三', age: 16, type: '学生'}”，格式化字符串“{data.name}是个{data.type}, 他已经{data.age}岁了.”。
 * 结果就是：张三是个学生, 他已经16岁了.
 * 注意：如果格式化字符串本身包含“{”，则用“{{”替代。
 * @param text 想要格式化的字符串
 * @param data 用于格式化的数据对象
 */
StringUtils.format = _StringUtils.format;

// 判断字符串是否为空，包括空字符
StringUtils.isBlank = _StringUtils.isBlank;

// 判断字符串是不是空字符串
StringUtils.isEmpty = function (str) {
	return (typeof str === "undefined") || str === null || str.length === 0;
};

// 判断字符串不为空
StringUtils.isNotBlank = _StringUtils.isNotBlank;

// 判断字符串是不是非空字符串
StringUtils.isNotEmpty = function (str) {
	return !StringUtils.isEmpty(str);
};

// 字符串转换，去除两边空白字符，无内容时返回空字符串
StringUtils.trimToEmpty = _StringUtils.trimToEmpty;

// 字符串转换，去除两边空白字符，无内容时返回null
StringUtils.trimToNull = _StringUtils.trimToNull;

StringUtils.trimToUndefined = _StringUtils.trimToUndefined;

// 判断字符串是否以某个子串开始
StringUtils.startWith = _StringUtils.startWith;
