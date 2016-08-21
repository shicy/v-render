// ========================================================
// 路由控制器，负责系统功能模块业务导向
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var Utils = require("../util/Utils");
var StringUtils = require("../util/StringUtils");
var ArrayUtils = require("../util/ArrayUtils");


///////////////////////////////////////////////////////////
var Router = module.exports = function (context, server, options) {
	// Web 服务上下文，即 VRender 实例
	this.context = context;
	// 当前 Web 服务器
	this.httpServ = server;
	// 设置路由配置信息
	this.configurate(options);
};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");
var ApiFactory = require("../apis/ApiFactory");
var RouterAdapter = require("./RouterAdapter");


///////////////////////////////////////////////////////////
// 路由配置初始化
Router.prototype.configurate = function (config) {
	// 路由规则配置信息
	this.routerMap = [];
	var map = config && config.map;
	for (var name in map) {
		var regExp = getRegExp(name);
		if (regExp)
			this.routerMap.push({name: name, reg: regExp, path: map[name]});
	}

	// 路由禁用缓存设置
	var noCacheRouters = this.noCacheRouters = [];
	ArrayUtils.each((config && config.no_cache), function (value) {
		var exgExp = getRegExp(value);
		if (exgExp)
			noCacheRouters.push(exgExp);
	});

	this.setAdapter(null);
};

// 路由方法，结合路由规则处理当前路由，返回最终路由结果
// @param url 是解析后的 Node URL 对象
// @param params 包含当前用户环境变量，和请求参数
// @param request 需要辅助获取请求信息时会用到，暂无用，只做保留
// @param response 原则上路由不进行数据回写，这里也只做保留
// @param callback 结果回调方法，第一个参数是错误信息对象，第二个参数是路由结果对象
Router.prototype.map = function (url, params, request, response, callback) {
	var pathname = url.pathname;
	if (pathname === "/api") {
		doApiMap.call(this, url, params, callback);
	}
	else {
		callback();
	}
};

// 设置当前路由适配器
Router.prototype.setAdapter = function (adapter) {
	this.adapter = adapter || new RouterAdapter(this.context);
};


///////////////////////////////////////////////////////////
// 路由表达式转化成标准正则表达式
var getRegExp = function (pattern) {
	pattern = StringUtils.trimToEmpty(pattern);
	if (pattern)
		return new RegExp(pattern.replace("../..", ".+").replace("..", "[^\\/]+"));
	return null;
};

// 路由完成后回调方法
var routerResultHandler = function (state, data, callback) {
	if (state === VRender.RouterStatus.ERROR) {
		callback(data || true, null);
	}
	else {
		var result = {status: state, data: data};
		if (state === VRender.RouterStatus.FILE)
			result.filepath = StringUtils.trimToEmpty(data);
		else if (state === VRender.RouterStatus.REDIREDT)
			result.url = StringUtils.trimToEmpty(data);
		else if (state === VRender.RouterStatus.NOAUTH)
			result.errormsg = data;
		callback(false, result);
	}
};

// api 服务受理
// 如：~/api?n=login&data={name: "", pwd: ""}&version=1.0
var doApiMap = function (url, params, callback) {
	var requestData = params.requestData || {};
	var apiName = requestData.n || requestData.name;
	if (StringUtils.isBlank(apiName)) {
		callback("无效的请求，参数name(或n)不能为空");
	}
	else {
		try {
			requestData = params.data = JSON.parse(requestData.data);
		}
		catch (e) {
			requestData = params.data = requestData.data || null;
		}

		delete params.requestData;

		var resultHandler = function (state, data) {
			routerResultHandler(state, data, callback);
		};

		var accept = false;
		if (Utils.isFunction(this.adapter.action))
			accept = this.adapter.action(apiName, params, resultHandler);
		if (!accept)
			accept = ApiFactory.do(apiName, null, requestData, resultHandler);
		if (!accept)
			callback("无效的请求：未知服务“" + apiName + "”");
	}
};
