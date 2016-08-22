// ========================================================
// 路由控制器，负责系统功能模块业务导向
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var Path = require("path");
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

	this.staticFilePath = Path.resolve(__dirname, "../static");
	this.dynamicFilePath = Path.resolve(this.context.base, "./bin/_work_");

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
	else if (Path.extname(pathname)) {
		doFileMap.call(this, url, params, callback);
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
	if (typeof state === "object") {
		data = state;
		state = VRender.RouterStatus.OK;
	}
	if (state === VRender.RouterStatus.ERROR) {
		callback(data || true, null);
	}
	else {
		var result = {status: state, data: data};
		if (state === VRender.RouterStatus.FILE) {
			result.filepath = StringUtils.trimToEmpty(data);
			if (StringUtils.isBlank(result.filepath))
				return callback("文件名称不能为空");
			if (!Path.isAbsolute(result.filepath)) {
				var webRoot = this.httpServ.getWebRoot();
				result.filepath = Path.resolve(webRoot, result.filepath);
			}
		}
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

		var self = this;
		var resultHandler = function (state, data) {
			routerResultHandler.call(self, state, data, callback);
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

// 静态文件资源获取
var doFileMap = function (url, params, callback) {
	var filepath = url.pathname;

	// 文件路径检验，防止文件系统攻击，如：“/webroot/../../../usr/local/..”这样的路径将访问操作系统文件，这是不允许的
	// 其实大多数浏览器默认就有这样的保护措施
	var self = this;
	var validateAndBack = function (root, path) { console.log(root, path);
		if (StringUtils.startWith(path, root))
			routerResultHandler.call(self, VRender.RouterStatus.FILE, path, callback);
		else
			callback("不存在网络资源：" + path);
	};

	if (/^\/VRender\./.test(filepath)) { // 获取框架前端静态资源
		filepath = Path.resolve(this.staticFilePath, filepath.substr(1));
		validateAndBack(this.staticFilePath, filepath);
	}
	else if (/^\/VRender\//.test(filepath)) { // 获取由框架生成的样式、脚本文件
		filepath = Path.resolve(this.dynamicFilePath, filepath.substr(1));
		validateAndBack(this.dynamicFilePath, filepath);
	}
	else {
		var webRoot = this.httpServ.getWebRoot();
		if (/^\/webroot\//.test(filepath)) { // 指定获取 Web Service Root(WebContent) 下的资源文件
			filepath = Path.resolve(webRoot, filepath.substr(9)); // 已经是绝对地址了
			validateAndBack(webRoot, filepath);
		}
		else {
			var accept = false;
			if (Utils.isFunction(this.adapter.file)) {
				accept = this.adapter.file(filepath, params, function (state, data) {
					// 由于是开发设计返回的结果，这里不做安全检查，需要设计者自行检验。不排除确实需要返回系统外资源的情况
					// 开发者不一定是返回文件路径，也可以返回文件内容或其他东西
					routerResultHandler.call(self, state, data, callback);
				});
			}
			if (!accept) { // 默认获取 Web Service Root 下的资源文件
				filepath = Path.resolve(webRoot, filepath.replace(/^\/+/g, ""));
				validateAndBack(webRoot, filepath);
			}
		}
	}
};
