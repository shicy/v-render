// ========================================================
// 日期相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var _DateUtils = require("../static/js/util/DateUtils.front.js");


var DateUtils = module.exports = {};

// 比较时间大小，dt1 == dt2返回0，dt1 < dt2返回-1， dt1 > dt2返回1
DateUtils.compare = _DateUtils.compare;

// 获取当前时间的总分钟数
DateUtils.getMinutes = _DateUtils.getMinutes;

// 是否是同一天
DateUtils.isSameDay = _DateUtils.isSameDay;

// 判断是否今天
DateUtils.isToday = _DateUtils.isToday;

// 判断是否是明天
DateUtils.isTomorrow = _DateUtils.isTomorrow;

// 判断是否是昨天
DateUtils.isYesterday = _DateUtils.isYesterday;

// 转换成日期对象
DateUtils.toDate = _DateUtils.toDate;

// 获取日期字符串
DateUtils.toDateString = _DateUtils.toDateString;

// 获取年月日格式日期
DateUtils.toLocalDateString = _DateUtils.toLocalDateString;
