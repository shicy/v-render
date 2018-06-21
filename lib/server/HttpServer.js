// ========================================================
// 一个 Web 服务器。
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Http = require("http");
var Path = require("path");
var Utils = require("../util/Utils");

///////////////////////////////////////////////////////////
var HttpServer = module.exports = function (context) {
	// Web 服务上下文，即 VRender 实例
	this.context = context;
	// 服务是否处于运行状态，当状态为 false 时返回的是系统维护界面
	this.running = false;
	this.bInit = false;
};

// HTTP 状态编码
HttpServer.StatusCode = {
	OK: 			200,
	REDIRECT: 		302,
	CACHED: 		304,
	NOAUTH: 		401,
	FORBID: 		403,
	NOTFOUND: 		404,
	SERVERERROR: 	500,
	INVALID: 		502,
	STOPED: 		503
};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");
var Router = require("../router/Router");
var HttpListener = require("./HttpListener");


///////////////////////////////////////////////////////////
// 初始化，传递 Web 服务器启动参数
// 注：初始化只能执行一次，只有第一次执行有效，之后再执行则无效
HttpServer.prototype.init = function (options) {
	if (this.bInit)
		return this;

	this.options = options || {};
	var serverCfg = this.options.server || {};

	this.port = parseInt(serverCfg.port);

	this.webRoot = Path.resolve(this.context.base, (serverCfg.root || "./"));
	VRender.logger.info("Web Service 根目录：" + this.webRoot);

	if (this.options.router && this.options.router.adapter) {
		var adapter = Path.resolve(this.context.base, this.options.router.adapter);
		try {
			var RouterAdapter = require(adapter);
			this.routerAdapter = new RouterAdapter(this.context);
		}
		catch (e) {}
	}

	this.expires = serverCfg.expires;

	this.bInit = true;
	return this;
};

// 开启服务，或者服务停止后重新开启服务
HttpServer.prototype.start = function (readyHandler) {
	if (this.running)
		return ;
	this.running = true;

	if (!this.server) {
		this.server = newServer.call(this);
	}

	if (this.server) {
		var port = this.port || 8888;
		this.server.listen(port, function () {
			VRender.logger.info("服务已开启，端口：%d，现在您可以访问：http://localhost:%d", port, port);
			if (Utils.isFunction(readyHandler))
				readyHandler(true);
		});
	}
	else {
		VRender.logger.error("Web 服务器创建失败!");
	}
};

// 暂停服务
HttpServer.prototype.stop = function (callback) {
	if (this.running && this.server) {
		this.running = false;
		this.server.close(function () {
			VRender.logger.info("Web 服务停止！");
			if (Utils.isFunction(callback))
				callback();
		});
	}
	else if (Utils.isFunction(callback)) {
		callback();
	}
};

// 设置路由适配器
HttpServer.prototype.setRouterAdapter = function (adapter) {
	this.routerAdapter = adapter;
	if (this.router)
		this.router.setAdapter(this.routerAdapter);
};

// 获取 Web Service 根目录
HttpServer.prototype.getWebRoot = function () {
	return this.webRoot || this.context.base;
};

// 获取静态文件缓存策略
HttpServer.prototype.getExpires = function () {
	return this.expires || {};
};

///////////////////////////////////////////////////////////
var newServer = function () {
	this.router = new Router(this.context, this, this.options.router);
	if (this.routerAdapter)
		this.router.setAdapter(this.routerAdapter);

	var listener = new HttpListener(this, this.router);

	var server = Http.createServer(function (request, response) {
		if (/^\/upload($|\?)/.test(request.url))
			listener.doUpload(request, response);
		else if (request.method.toLowerCase() == "get")
			listener.doGet(request, response);
		else
			listener.doPost(request, response);
	});

	var waitTimeout = parseInt(this.options.server && this.options.server.waitTimeout);
	if (waitTimeout)
		this.server.setTimeout(waitTimeout);

	return server;
};
