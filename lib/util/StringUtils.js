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

// 判断字符串不为空
StringUtils.isNotBlank = function (str) {
	return !StringUtils.isBlank(str);
};
