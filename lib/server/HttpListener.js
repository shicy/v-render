// ========================================================
// Http 服务监听器，接收客户端请求，并响应客户端请求
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var Path = require("path");
var URL = require("url");
var ZLib = require("zlib");
var FileSys = require("fs");
var QueryString = require("querystring");
var Utils = require("../util/Utils");
var StringUtils = require("../util/StringUtils");


///////////////////////////////////////////////////////////
var HttpListener = module.exports = function (server, router) {
	this.context = server && server.context;
	// 当前 Web 服务器
	this.httpServ = server;
	// 路由，负责业务导向，获取业务信息
	this.router = router;
};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");
var HttpServer = require("./HttpServer");
var ContentType = require("./ContentType");
var SessionManager = require("../session/SessionManager");


///////////////////////////////////////////////////////////
// 处理GET请求
HttpListener.prototype.doGet = function (request, response) {
	// url 解析并获取参数信息
	var url = URL.parse(request.url, true);
	doRequest.call(this, request, response, url, url.query);
};

// 处理POST请求
HttpListener.prototype.doPost = function (request, response) {
	// url 解析并获取url后面的参数信息
	var url = URL.parse(request.url, true);
	var params = url.query || {};

	var self = this, postData = "";
	// 接收 POST 请求数据块
	request.addListener("data", function (data) {
		postData += data;
	});
	// 数据接收完成
	request.addListener("end", function () {
		params = Utils.extend(params, QueryString.parse(postData));
		doRequest.call(self, request, response, url, params);
	});
};


///////////////////////////////////////////////////////////
// 请求处理，这里将统一处理 GET 和 POST 请求
var doRequest = function (request, response, url, params) {
	var self = this;
	params = {requestData: params || {}};
	params.requestMethod = request.method.toLowerCase();
	params.pathname = url.pathname;
	params.session = SessionManager.get(this.context, request);
	if (params.requestData.JSESSIONID)
		params.session.initByJSESSIONID(params.requestData.JSESSIONID);
	this.router.map(url, params, request, response, function (err, ret) {
		SessionManager.set(response, params.session);
		if (params.browserCacheDisabled)
			setResponseNoCache(response);
		if (err) {
			// 出错、报错、异常等情况，一般指非设计型错误，比如参数为空。
			// 比如需要会员才能访问的页面，而当前用户不是会员，这属于设计范围的错误，不应在这里处理
			responseError(err, response, (ret && ret.responseType));
		}
		else if (Utils.notNull(ret)) {
			if (typeof ret !== "object")
				ret = {status: VRender.RouterStatus.OK, data: ret};
			if (ret.status === VRender.RouterStatus.FILE)
				responseFile.call(self, ret.filepath, request, response);
			else if (ret.status === VRender.RouterStatus.REDIREDT)
				responseRedirect(ret.url, response);
			else if (ret.status === VRender.RouterStatus.NOAUTH)
				responseError(ret.errmsg, response, HttpServer.StatusCode.NOAUTH);
			else if (ret.status === VRender.RouterStatus.NOTFOUND)
				responseError(ret.errmsg, response, HttpServer.StatusCode.NOTFOUND);
			else {
				data = ret.hasOwnProperty("data") ? ret.data : ret;
				if (typeof data === "object")
					responseJson(data, response);
				else
					responseHtml(String(data), response);
			}
		}
		else {
			response.end();
		}
	});
};

// 返回错误信息
var responseError = function (err, response, responseType) {
	if (err === true || StringUtils.isBlank(err))
		err = "未知错误";
	if (typeof err !== "object")
		err = {code: -1, msg: err};
	responseType = responseType || HttpServer.StatusCode.SERVERERROR;
	response.writeHead(responseType, {"Content-Type": ContentType.getJsonContent()});
	response.end(JSON.stringify(err));
};

// 返回 JSON 数据
var responseJson = function (data, response) {
	response.writeHead(HttpServer.StatusCode.OK, {"Content-Type": ContentType.getJsonContent()});
	response.end(JSON.stringify(data));
};

// 返回 HTML 文档
var responseHtml = function (html, response) {
	response.writeHead(HttpServer.StatusCode.OK, {"Content-Type": ContentType.getHtmlContent()});
	response.end(html);
};

// 页面重定向
var responseRedirect = function (url, response) {
	response.writeHead(HttpServer.StatusCode.REDIRECT, {"Location": url});
	response.end();
};

// 返回文件数据流
var responseFile = function (filepath, request, response) {
	var self = this;
	filepath = QueryString.unescape(filepath);
	FileSys.exists(filepath, function (exists) {
		if (exists) {
			FileSys.stat(filepath, function (err, stat) {
				var lastModified = stat.mtime.toUTCString();
				response.setHeader("Last-Modified", lastModified);

				var expires = self.httpServ.getExpires();
				if (expires.files && expires.files.indexOf(Path.extname(filepath)) >= 0) {
					var maxAge = expires.age || 0;
					var expires = new Date();
					expires.setTime(expires.getTime() + maxAge);
					response.setHeader("Expires", expires.toUTCString());
					response.setHeader("Cache-Control", "max-age=" + maxAge);
				}

				if (request.headers["if-modified-since"] == lastModified) {
					response.writeHead(HttpServer.StatusCode.CACHED, "Not Modified");
					response.end();
				}
				else {
					var encoding = request.headers["accept-encoding"] || "";
					writeFileData(response, filepath, encoding);
				}
			});
		}
		else {
			writeFileNotFound(response, filepath);
		}
	});
};

// 响应文件内容
var writeFileData = function (response, filepath, encoding) {
	var stream = FileSys.createReadStream(filepath);
	if (encoding.match(/\bgzip\b/)) {
		response.writeHead(HttpServer.StatusCode.OK, {"Content-Type": ContentType.get(filepath), "Content-Encoding": "gzip"});
		stream.pipe(ZLib.createGzip()).pipe(response);
	}
	else if (encoding.match(/\bdeflate\b/)) {
		response.writeHead(HttpServer.StatusCode.OK, {"Content-Type": ContentType.get(filepath), "Content-Encoding": "deflate"});
		stream.pipe(ZLib.createDeflate()).pipe(response);
	}
	else {
		response.writeHead(HttpServer.StatusCode.OK, {"Content-Type": ContentType.get(filepath)});
		stream.pipe(response);
	}
};

// 响应文件不存在信息
var writeFileNotFound = function (response, filepath) {
	VRender.logger.warn("<HttpListener.writeFileNotFound>", filepath);
	response.writeHead(HttpServer.StatusCode.NOTFOUND, {"Content-Type": ContentType.getTextContent()});
	response.write("This request URL was not found on the server.");
	response.end();
};

// 禁止浏览器缓存设置
var setResponseNoCache = function (response) {
	response.setHeader("Cache-Control", "no-cache,no-store,must-revalidate,max-age=0");
	response.setHeader("Pragma", "no-cache");
	response.setHeader("Expires", "0");
};
