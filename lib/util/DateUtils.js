// ========================================================
// 日期相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var DateUtils = module.exports = {};

// 获取日期字符串
DateUtils.toDateString = function (dt, pattern) {
	pattern = pattern || "yyyy-MM-dd"; dt = dt || new Date();
	var month = dt.getMonth() + 1;
	var date = dt.getDate();
	var hours = dt.getHours();
	var minutes = dt.getMinutes();
	var seconds = dt.getSeconds();
	var millis = dt.getMilliseconds();
	var value = pattern.replace("yyyy", dt.getFullYear());
	if (/M/.test(value))
		value = value.replace(/MM/g, month < 10 ? ("0" + month) : month).replace(/M/g, month);
	if (/d/.test(value))
		value = value.replace(/dd/g, date < 10 ? ("0" + date) : date).replace(/d/g, date);
	if (/H/.test(value))
		value = value.replace(/HH/g, hours < 10 ? ("0" + hours) : hours).replace(/H/g, hours);
	if (/m/.test(value))
		value = value.replace(/mm/g, minutes < 10 ? ("0" + minutes) : minutes).replace(/m/g, minutes);
	if (/s/.test(value))
		value = value.replace(/ss/g, seconds < 10 ? ("0" + seconds) : seconds).replace(/s/g, seconds);
	if (/SSS/.test(value))
		value = value.replace(/SSS/g, millis < 10 ? ("00" + millis) : (millis < 100 ? ("0" + millis) : millis));
	if (/hh/.test(value)) {
		var val = (hours + 12) % 12;
		if (hours < 1)
			val = "午夜" + val;
		else if (hours >= 1 && hours < 5)
			val = "凌晨" + val;
		else if (hours >= 5 && hours < 6)
			val = "清晨" + val;
		else if (hours >= 6 && hours < 8)
			val = "早上" + val;
		else if (hours >= 8 && hours < 11)
			val = "上午" + val;
		else if (hours >= 11 && hours < 13)
			val = "中午" + val;
		else if (hours >= 13 && hours < 17)
			val = "下午" + val;
		else if (hours >= 17 && hours < 18)
			val = "傍晚" + val;
		else if (hours >= 18 && hours <= 23)
			val = "晚上" + val;
		value = value.replace(/hh/g, val);
	}
	return value;
};
