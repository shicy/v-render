// ========================================================
// 字符相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var StringUtils = module.exports = {};

// 判断字符串是否为空，包括空字符
StringUtils.isBlank = function (str) {
	if (!str)
		return str !== "0" && str !== 0 && str !== false;
	return String(str).replace(/\s+/g, "").length === 0;
};

// 判断字符串是不是空字符串
StringUtils.isEmpty = function (str) {
	return StringUtils.isNull(str) || str.length === 0;
};

// 判断字符串是否为 null
StringUtils.isNull = function (str) {
	return (typeof str === "undefined") || str === null;
};

// 判断字符串不为空
StringUtils.isNotBlank = function (str) {
	return !StringUtils.isBlank(str);
};

// 字符串转换，去除两边空白字符，无内容时返回空字符串
StringUtils.trimToEmpty = function (str) {
	return StringUtils.isBlank(str) ? "" : ("" + str).trim();
};

// 字符串转换，去除两边空白字符，无内容时返回null
StringUtils.trimToNull = function (str) {
	return StringUtils.isBlank(str) ? null : ("" + str).trim();
};

// 判断字符串是否以某个子串开始
StringUtils.startWith = function (str, sub) {
	if (StringUtils.isEmpty(str) || StringUtils.isEmpty(sub))
		return false;
	if (str.length < sub.length)
		return false;
	return str.substr(0, sub.length) === sub;
};
