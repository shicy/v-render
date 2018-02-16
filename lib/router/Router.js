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

var staticApiRouters = [];
var staticViewRouters = [];

// 注册一个静态路由
// @param type 路由类型：api, view
// @param pattern 路由前缀（可选），
Router.staticRouter = function (type, pattern) {
	var _isSameRouter = function (pattern1, pattern2) {
		if (pattern1 instanceof RegExp)
			return (pattern2 instanceof RegExp) ? (pattern1.source == pattern2.source) : false;
		return pattern1 == pattern2;
	};

	var _getRegExp = function (pattern) {
		return (pattern instanceof RegExp) ? pattern : (pattern ? getRegExp("^" + pattern) : null);
	};

	var routers = type == "api" ? staticApiRouters : staticViewRouters;
	if (!(pattern instanceof RegExp)) {
		pattern = StringUtils.trimToEmpty(pattern);
		if (pattern) { // 去掉末尾“.”和“/”
			if (type == "api")
				pattern = pattern.replace(/(\.)+$/, "");
			else 
				pattern = pattern.replace(/(\/)+$/, "");
		}
	}

	var router = ArrayUtils.find(routers, function (temp) {
		return _isSameRouter(temp.pattern, pattern);
	});

	if (!router) {
		router = {pattern: pattern, reg: _getRegExp(pattern), routers: []};
		routers.push(router);

		router.set = function (path, handler) {
			if (!(path instanceof RegExp)) {
				path = StringUtils.trimToEmpty(path);
				if (path) {
					if (type == "api") {
						if (!(/^./.test(path)))
							path = "." + path;
					}
					else {
						if (!(/^\//.test(path)))
							path = "/" + path;
					}
				}
			}
			if (StringUtils.isBlank(handler)) {
				ArrayUtils.remove(router.routers, function (temp) {
					return _isSameRouter(temp.path, path);
				});
			}
			else {
				var _router = ArrayUtils.find(router.routers, function (temp) {
					return _isSameRouter(temp.path, path);
				});
				if (_router)
					_router.handler = handler;
				else
					router.routers.push({path: path, reg: _getRegExp(path), handler: handler});
			}
		};
	}

	return router.set;
};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");
var ApiFactory = require("../apis/ApiFactory");
var RouterAdapter = require("./RouterAdapter");
var UIBuilder = require("../ui/builder/UIBuilder");


///////////////////////////////////////////////////////////
// 路由配置初始化
Router.prototype.configurate = function (config) {
	// 首页配置
	this.homePage = config && config.homepage;

	// 路由规则配置信息
	var routerMap = this.routerMap = [];
	var map = config && config.map || {};
	for (var name in map) {
		var regExp = getRegExp(name);
		if (regExp)
			routerMap.push({name: name, reg: regExp, path: map[name]});
	}

	// 路由禁用缓存设置
	var noCacheRouters = this.noCacheRouters = [];
	ArrayUtils.each((config && config.no_cache), function (value) {
		var exgExp = getRegExp(value);
		if (exgExp)
			noCacheRouters.push(exgExp);
	});

	this.staticFilePath = this.context.staticFilePath;
	this.dynamicFilePath = this.context.dynamicFilePath;

	this.setAdapter(null);
};

// 路由方法，结合路由规则处理当前路由，返回最终路由结果
// @param url 是解析后的 Node URL 对象
// @param params 包含当前用户环境变量，和请求参数
// @param request 需要辅助获取请求信息时会用到，暂无用，只做保留
// @param response 原则上路由不进行数据回写，这里也只做保留
// @param callback 结果回调方法，第一个参数是错误信息对象，第二个参数是路由结果对象
Router.prototype.map = function (url, params, request, response, callback) {
	var _params = {pathname: url.pathname, params: params, request: request, response: response};
	Utils.exec(this, [doBefore, doMap, doAfter], _params, function (err, ret) {
		if (!!err) {
			callback(err, ret);
		}
		else if (ret && ret.result) {
			var state = ret.result.state, data = ret.result.data;
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
					if (!Path.isAbsolute(result.filepath))
						result.filepath = this.context.getBasedPath(result.filepath);
				}
				else if (state === VRender.RouterStatus.REDIREDT)
					result.url = StringUtils.trimToEmpty(data);
				else if (state === VRender.RouterStatus.NOAUTH)
					result.errmsg = data;
				else if (state === VRender.RouterStatus.NOTFOUND)
					result.errmsg = data;
				callback(false, result);
			}
		}
		else {
			callback(false, null);
		}
	});
};

// 设置当前路由适配器
Router.prototype.setAdapter = function (adapter) {
	this.adapter = adapter || new RouterAdapter(this.context);
};


///////////////////////////////////////////////////////////
var doBefore = function (params, callback) {
	if (Utils.isFunction(this.adapter.before)) {
		var self = this;
		var resultHandler = function (err, state, data) {
			if (!!err) { // 错误
				callback(err);
			}
			else if (typeof state == "string") { // 新路由
				params.pathname = state;
				callback(false, params);
			}
			else if (Utils.isNotNull(state)) { // 直接返回结果
				if (typeof state != "number") {
					data = state;
					state = null; // VRender.RouterStatus.OK;
				}
				params.result = {state: state, data: data};
				callback(false, params);
			}
			else { // 跳过 before
				callback(false, params);
			}
		};

		var result = false;
		result = this.adapter.before(params.pathname, params.params, function (err, state, data) {
			setTimeout(function () {
				if (result === true)
					resultHandler(err, state, data);
			}, 0);
		});

		if (result !== true) { // 直接出来结果
			resultHandler(false, result);
		}
	}
	else { // 跳过
		callback(false, params);
	}
};

var doMap = function (params, callback) {
	if (params.result) { // doBefore() 中已返回结果
		callback(false, params);
	}
	else {
		var resultHandler = function (err, state, data) {
			if (!!err) {
				callback(err);
			}
			else {
				params.result = {state: state, data: data};
				callback(false, params);
			}
		};

		var pathname = params.pathname;
		if (pathname == "/api") { // 接口
			doApiMap.call(this, pathname, params, resultHandler);
		}
		else if (Path.extname(pathname)) { // 文件
			doFileMap.call(this, pathname, params, resultHandler);
		}
		else { // 视图
			doViewMap.call(this, pathname, params, resultHandler);
		}
	}
};

var doAfter = function (params, callback) {
	if (Utils.isFunction(this.adapter.after)) {
		var self = this;
		var resultHandler = function (err, ret) {
			callback(err, (!err ? params : ret));
		};

		var result = false;
		result = this.adapter.after(params.pathname, params.params, function (err, ret) {
			setTimeout(function () {
				if (result === true)
					resultHandler(err, ret);
			}, 0);
		});

		if (result !== true) {
			resultHandler(false, params);
		}
	}
	else {
		callback(false, params);
	}
};

// api 服务受理
// 如：~/api?n=login&data={name: "", pwd: ""}&version=1.0
var doApiMap = function (pathname, params, callback) {
	params.params.browserCacheDisabled = true; // 接口禁用缓存

	var requestData = params.params.requestData || {};
	var apiName = requestData.n || requestData.name; // 接口名称
	if (StringUtils.isBlank(apiName)) {
		callback("无效的请求，参数name(或n)不能为空");
	}
	else {
		var apiParams = requestData.data, apiVersion = requestData.version;
		if (StringUtils.isNotBlank(apiParams)) {
			try {
				apiParams = JSON.parse(apiParams);
			}
			catch (e) {}
		}

		var resultHandler = function (err, state, data) {
			if (!err) {
				if ((typeof state != "number") || arguments.length == 2) {
					data = state;
					state = null; // VRender.RouterStatus.OK;
				}
			}
			callback(err, state, data);
		};

		var router = findRouter(staticApiRouters, apiName);
		if (router && Utils.isFunction(router.handler)) {
			var scope = {api: apiName, params: apiParams, version: apiVersion, session: params.params.session};
			scope.fetch = function (_url, _params, _callback) {
				return scope.session.fetch(_url, _params, _callback);
			};
			scope.send = function (_url, _params, _callback) {
				return scope.session.send(_url, _params, _callback);
			};
			router.handler.call(scope, apiName, apiParams, resultHandler);
		}
		else {
			var result = false;
			if (Utils.isFunction(this.adapter.api)) {
				var _params = {session: params.session, data: requestData, version: apiVersion};
				result = this.adapter.api(apiName, _params, function (err, state, data) {
					setTimeout(function () {
						if (result !== false)
							resultHandler(err, state, data);
					}, 0);
				});
			}
			if (result === false)
				result = ApiFactory.do(apiName, apiVersion, requestData, resultHandler);
			if (result === false)
				callback("无效的请求：未知服务“" + apiName + "”");
		}
	}
};

// 静态文件资源获取
var doFileMap = function (filepath, params, callback) {
	// 文件路径检验，防止文件系统攻击，如：“/webroot/../../../usr/local/..”这样的路径将访问操作系统文件，这是不允许的
	var self = this;
	var resultHandler = function (err, state, data, root) {
		if (!err) {
			if (typeof state == "string") {
				data = state;
				state = VRender.RouterStatus.FILE;
			}
			else if ((typeof state != "number") || arguments.length == 2) {
				data = state;
				state = null; // VRender.RouterStatus.OK
			}
			if (state == VRender.RouterStatus.FILE) {
				data = StringUtils.trimToEmpty(data);
				if (data && !!root && !StringUtils.startWith(data, root)) {
					err = "不存在网络资源：" + data;
				}
			}
		}
		callback(err, state, data);
	};

	if (/^\/VRender\./.test(filepath)) { // 获取框架前端静态资源
		filepath = Path.resolve(this.staticFilePath, filepath.substr(1));
		resultHandler(false, filepath, null, this.staticFilePath);
	}
	else if (/^\/VRender\/(css|js|icons)\//.test(filepath)) {
		filepath = Path.resolve(this.staticFilePath, filepath.substr(9));
		resultHandler(false, filepath, null, this.staticFilePath);
	}
	else if (/^\/VRender\//.test(filepath)) { // 获取由框架生成的样式、脚本文件
		filepath = Path.resolve(this.dynamicFilePath, filepath.substr(9));
		resultHandler(false, filepath, null, this.dynamicFilePath);
	}
	else {
		var webRoot = this.httpServ.getWebRoot();
		if (/^\/webroot\//.test(filepath)) { // 指定获取 Web Service Root(WebContent) 下的资源文件
			filepath = Path.resolve(webRoot, filepath.substr(9)); // 已经是绝对地址了
			resultHandler(false, filepath, null, webRoot);
		}
		else {
			var result = false;
			if (Utils.isFunction(this.adapter.file)) {
				result = this.adapter.file(filepath, params.params, function (err, state, data) {
					// 由于是开发设计返回的结果，这里不做安全检查，需要设计者自行检验。不排除确实需要返回系统外资源的情况
					// 开发者不一定是返回文件路径，也可以返回文件内容或其他东西
					setTimeout(function () {
						if (result !== false)
							resultHandler(err, state, data); // 没有 root 参数，不做安全检查
					}, 0);
				});
			}
			if (result === false) { // 默认获取 Web Service Root 下的资源文件
				filepath = Path.resolve(webRoot, ("." + filepath));
				resultHandler(false, filepath, null, webRoot);
			}
		}
	}
};

// 动态视图构建渲染方法
var doViewMap = function (pathname, params, callback) {
	if (!/^\//.test(pathname))
		pathname = "/" + pathname;

	params.params.session.currentRouter = pathname;
	params.params.browserCacheDisabled = isRouterCacheDisabled.call(this, pathname);

	var self = this;
	var resultHandler = function (err, state, data) {
		if (!!err) {
			callback(err);
		}
		else {
			if ((typeof state != "number") || arguments.length == 2) {
				data = state;
				state = VRender.RouterStatus.OK;
			}
			if (state === VRender.RouterStatus.OK && (typeof data === "string")) {
				if (StringUtils.isBlank(data))
					callback(false, state, "");
				else {
					UIBuilder.build(self.context, data, params.params, callback);
				}
			}
			else {
				callback(false, state, data);
			}
		}
	};

	var viewParams = params.params.requestData;

	var router = findRouter(staticViewRouters, pathname);
	if (router && Utils.isFunction(router.handler)) {
		var scope = {pathname: pathname, params: viewParams, session: params.params.session};
		scope.fetch = function (_url, _params, _callback) {
			return scope.session.fetch(_url, _params, _callback);
		};
		scope.send = function (_url, _params, _callback) {
			return scope.session.send(_url, _params, _callback);
		};
		router.handler.call(scope, pathname, viewParams, resultHandler);
	}
	else {
		var result = false;
		if (Utils.isFunction(this.adapter.view)) {
			result = this.adapter.view(pathname, params.params, function (err, state, data) {
				setTimeout(function () {
					if (result !== false) {
						resultHandler(err, state, data);
					}
				}, 0);
			});
		}
		if (result === false) {
			var path = (pathname === "/" && !!this.homePage) ? this.homePage : null;
			if (StringUtils.isBlank(path)) {
				router = findRouter(this.routerMap, pathname);
				path = router && router.path;
			}
			if (StringUtils.isBlank(path)) {
				path = "." + pathname;
			}
			var state = Path.extname(path) ? VRender.RouterStatus.FILE : VRender.RouterStatus.OK;
			resultHandler(false, state, path);
		}
	}
};

// ========================================================
// 路由表达式转化成标准正则表达式
var getRegExp = function (pattern) {
	if (pattern instanceof RegExp)
		return pattern;
	pattern = StringUtils.trimToEmpty(pattern);
	if (pattern)
		return new RegExp(pattern.replace("../..", "(.*)").replace("..", "([^\\/]*)"));
	return null;
};

// 查找路由配置信息
var findRouter = function (routers, name) {
	var router = ArrayUtils.find(routers, function (temp) {
		return temp.reg && temp.reg.test(name);
	});
	if (router && router.routers) {
		name = name.replace(router.reg, ""); // 去掉前缀
		router = ArrayUtils.find(router.routers, function (temp) {
			if (temp.reg)
				return temp.reg.test(name);
			return name === "" || name === "/" || name === ".";
		});
	}
	return router;
};

// 判断某个路由是禁止浏览器缓存
var isRouterCacheDisabled = function (name) {
	for (var i = 0, l = this.noCacheRouters.length; i < l; i++) {
		if (this.noCacheRouters[i].test(name))
			return true;
	}
	return false;
};
