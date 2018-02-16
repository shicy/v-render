// ========================================================
// 提供一些框架相关的 api，使用ApiFactory.do(name, version, data, callback)执行方法。
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var FileSys = require("fs");
var VRender = require("../v-render");
var DateUtils = require("../util/DateUtils");
var RestartHook = require("./restarthook");


///////////////////////////////////////////////////////////
var ApiFactory = module.exports = {};

// 执行API
// @param name api 名称
// @param data api 相关的参数信息
// @param version 客户端版本号，暂无效
// @param callback 回调方法，第一个参数总是 error 信息
// 注：当方法返回 false 时，表示 api 未受理，此时不再执行 callback
ApiFactory.do = function (name, data, version, callback) {
	if (name === "server.restart")
		restart(callback);
	else if (name === "server.log")
		showClientLog(data, callback);
	else if (name === "server.cache.clear")
		clearCache(callback);
	else 
		return false;
	return true;
};


///////////////////////////////////////////////////////////
// 重启 Node 服务进程
var restart = function (callback) {
	// 必须先返回了，否则客户端看不到提示信息
	callback(null, "success");
	// 使用 Node 守护进程原理重启服务
	var log = "\n// [" + DateUtils.toDateString(new Date(), "yyyy-MM-dd HH:mm:ss") + "] -restart.";
	FileSys.appendFile(__dirname + "/restarthook.js", log);
};

// 记录浏览器日志信息
var showClientLog = function (text, callback) {
	VRender.logger.debug("<ApiFactory.showClientLog>", data);
	callback();
};

// 清除 Node 缓存信息
var clearCache = function (callback) {
	callback(null, "success");
};
