// ========================================================
// 一个 Web 服务器。
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Http = require("http");
var Path = require("path");

///////////////////////////////////////////////////////////
var HttpServer = module.exports = function (context) {
	// Web 服务上下文，即 VRender 实例
	this.context = context;
	// 服务是否处于运行状态，当状态为 false 时返回的是系统维护界面
	this.running = false;
	this.bInit = false;
};


///////////////////////////////////////////////////////////
var Utils = require("../util/Utils");
var VRender = require("../v-render");


///////////////////////////////////////////////////////////
// 初始化，传递 Web 服务器启动参数
// 注：初始化只能执行一次，只有第一次执行有效，之后再执行则无效
HttpServer.prototype.init = function (options) {
	if (this.bInit)
		return this;

	this.options = options || {};
	this.port = parseInt(this.options.port);

	this.webRoot = Path.resolve(this.context.base, (this.options.root || "./"));
	VRender.logger.info("Web Service 根目录：" + this.webRoot);

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
			VRender.logger.info("Web 服务已开启，端口：%d，浏览：http://localhost:%d", port, port);
			if (Utils.isFunction(readyHandler))
				readyHandler(true);
		});
	}
	else {
		VRender.logger.error("Web 服务器创建失败!");
	}
};

///////////////////////////////////////////////////////////
var newServer = function () {
	var server = Http.createServer(function (request, response) {
		console.log("================");
		response.end();
	});

	return server;
};
