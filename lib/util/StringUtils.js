// ========================================================
// 字符相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var StringUtils = module.exports = {};


// 判断字符串是否以某个子串结尾
StringUtils.endWith = function (str, sub) {
	if (StringUtils.isEmpty(str) || StringUtils.isEmpty(sub))
		return false;
	if (str.length < sub.length)
		return false;
	return str.substring(str.length - sub.length) == sub;
};

/**
 * 格式化字符串。解析字符串，转换字符串中大括号“{}”所包含的内容为实际数据的相应值。
 * 如：有data是“{name: '张三', age: 16, type: '学生'}”，格式化字符串“{data.name}是个{data.type}, 他已经{data.age}岁了.”。
 * 结果就是：张三是个学生, 他已经16岁了.
 * 注意：如果格式化字符串本身包含“{”，则用“{{”替代。
 * @param text 想要格式化的字符串
 * @param data 用于格式化的数据对象
 */
StringUtils.format = function (text, data) {
	var chars = String(text).split("");
	var length = chars.length, param = null, result = "";
	for (var i = 0; i < length; i++) {
		var ch = chars[i];
		if (ch === "{") {
			if (param === null)
				param = "";
			else if (param === "") {
				result += "{";
				param = null;
			}
			else
				break;
		}
		else if (ch === "}") {
			if (param === null)
				result += "}";
			else {
				try {
					var value = eval(param);
					result += (value || value === 0) ? value : "";
				}
				catch (e) {}
				param = null;
			}
		}
		else if (param === null)
			result += ch;
		else
			param += ch;
	}
	return result;
};

// 判断字符串是否为空，包括空字符
StringUtils.isBlank = function (str) {
	if (!str)
		return str !== "0" && str !== 0 && str !== false;
	if (typeof str !== "string")
		return false;
	return String(str).replace(/\s+/g, "").length === 0;
};

// 判断字符串是不是空字符串
StringUtils.isEmpty = function (str) {
	return (typeof str === "undefined") || str === null || str.length === 0;
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
