// ========================================================
// Http 代理（支持https get方法），当系统需要连接一个后台服务（如java），可以通过代理访问
// 代理方法：new HttpProxy().fetch(session, url, params, callback);
// @author shicy <shicy85@163.com>
// Create on 2016-08-23
// ========================================================

var Http = require("http");
var Https = require("https");
var URL = require("url");
var QueryString = require("querystring");
var Utils = require("../util/Utils");
var StringUtils = require("../util/StringUtils");


///////////////////////////////////////////////////////////
var HttpProxy = module.exports = function (context, options) {
	this.context = context;
	// 后台数据服务配置
	this.ds = new DataService(options);
};

HttpProxy.nextRequestHeaders = null;
var headersMap = {contentType: "Content-Type"};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");
var HttpServer = require("../server/HttpServer");
var DataService = require("./DataService");


///////////////////////////////////////////////////////////
// 访问后台服务器，获取接口数据信息，默认使用 GET 方法请求，设置 fetchAsPost=true 变为 POST 方法请求
// @param session 当前用户持有信息，可选
// @param url 后台数据接口访问地址，如：“human/info”, "http://www.xxx.com/api/human/info"
// @param params 请求参数，如：{id: 1}
// @param callback 回调方法，第一个参数总是错误信息，第二个参数是返回的数据集
HttpProxy.prototype.fetch = function (session, url, params, callback) {
	doRequest.call(this, "FETCH", session, url, params, callback);
};

HttpProxy.prototype.get = function (session, url, params, callback) {
	doRequest.call(this, "GET", session, url, params, callback);
};

HttpProxy.prototype.post = function (session, url, params, callback) {
	doRequest.call(this, "POST", session, url, params, callback);
};

HttpProxy.prototype.put = function (session, url, params, callback) {
	doRequest.call(this, "PUT", session, url, params, callback);
};

HttpProxy.prototype.delete = function (session, url, params, callback) {
	doRequest.call(this, "DELETE", session, url, params, callback);
};

// 文件上传
HttpProxy.prototype.upload = function (session, url, params, callback) {
	doRequest.call(this, "UPLOAD", session, url, params, callback);
};


///////////////////////////////////////////////////////////
var doRequest = function (method, session, url, params, callback) {
	if (typeof session === "string") {
		callback = params;
		params = url;
		url = session;
		session = null;
	}

	if (StringUtils.isBlank(url))
		return onRequestError("url参数不能为空", url, params, callback);

	if (session && !session.__isSession_)
		session = null;

	var _params = {requestData: params, seqno: Date.now()};

	var server = this.ds.getService((session && session.getUserHost()), url);
	var requestUrl = getRequestUrl.call(this, url, server);
	if (!requestUrl)
		return onRequestError("没有相应的数据服务配置信息", url, params, callback);
	requestUrl += (requestUrl.indexOf("?") < 0 ? "?" : "&") + "_seqno_=" + _params.seqno;

	if (method == "UPLOAD") {
		uploadInner.call(this, method, session, server, requestUrl, _params, callback);
	}
	else {
		requestInner.call(this, method, session, server, requestUrl, _params, callback);
	}

	return true;
};

var requestInner = function (method, session, server, url, params, callback) {
	if (method == "FETCH") {
		method = (server && server.fetchAsPost) ? "POST" : "GET";
	}
	else if (method == "SEND") {
		method = "POST";
	}

	var requestData = params.requestData;
	if (method == "GET") {
		requestData = QueryString.stringify(requestData);
		if (requestData) {
			url += (url.indexOf("?") < 0 ? "?" : "&") + requestData;
			requestData = "";
		}
		params.requestData = null;
	}

	var options = getRequestOptions.call(this, server, session, method, url);
	if (requestData && typeof requestData != "string") {
		if (/json/.test(options.headers["Content-Type"]))
			requestData = JSON.stringify(requestData);
		else
			requestData = QueryString.stringify(requestData);
	}

	var self = this;
	var handler = function (response) {
		response.on("end", function () {
			var seqno = params.seqno;
			// 发现有的 Node 版本 Date.now() 精度是微妙
			var times = (Date.now() - seqno) / (seqno > 9999999999999 ? 1000 : 1);
			VRender.logger.debug("<HttpProxy.requestInner> %s %s (%s) [%dms]", 
				method, url, decodeURIComponent(requestData), times);
		});
		responseHandler.call(self, response, session, server, url, params, callback);
	};

	var request = /^https/.test(options.protocol) ? Https.get(options, handler) 
		: Http.request(options, handler);

	request.on("error", function (e) {
		if (e.code == "ENOTFOUND") {
			e = {code: HttpServer.StatusCode.STOPED, msg: e.code, data: "服务器不可用"};
		}
		else if (e.code == "ECONNREFUSED") {
			e = {code: HttpServer.StatusCode.INVALID, msg: e.code, data: "服务器拒绝访问"};
		}
		onRequestError(e, url, params, callback);
	});

	if (requestData)
		request.write(requestData);

	request.end();
};

var uploadInner = function (method, session, server, url, params, callback) {
	var self = this;
	var requestData = params.requestData;
	var handler = function (response) {
		var _params = Utils.extend({}, requestData);
		delete _params.stream;
		_params = QueryString.stringify(_params);
		response.on("end", function () {
			var seqno = params.seqno;
			// 发现有的 Node 版本 Date.now() 精度是微妙
			var times = (Date.now() - seqno) / (seqno > 9999999999999 ? 1000 : 1);
			VRender.logger.debug("<HttpProxy.doRequest> %s (%s) [%dms]", url, _params, times);
		});
		responseHandler.call(self, response, session, server, url, _params, callback);
	};

	var options = getRequestOptions.call(this, server, session, "POST", url);
	if (requestData.stream) {
		options.headers["Content-Type"] = requestData.stream.headers["content-type"];
		options.headers["Content-Length"] = requestData.stream.headers["content-length"];
	}
	else {
		options.headers["Content-Type"] = "multipart/form-data";
	}
	var request = /^https/.test(options.protocol) ? Https.get(options, handler) 
		: Http.request(options, handler);

	request.on("error", function (e) {
		onRequestError(e, url, requestData, callback);
	});

	if (requestData.stream) {
		requestData.stream.pipe(request);
	}
	else { // 这个没测过，估计不行的
		request.write(QueryString.stringify(requestData));
		request.end();
	}
};

// Http 请求回调监听方法
var responseHandler = function (response, session, server, url, params, callback) {
	if (session) {
		var cookies = response.headers["set-cookie"];
		if (cookies && cookies.length > 0)
			session.setCookies(cookies);
	}

	var self = this;
	var results = [];

	response.setEncoding("utf-8");

	response.on("data", function (data) {
		results.push(data);
	});

	response.on("end", function () {
		results = results.join("");
		var status = response.statusCode;
		if (status === HttpServer.StatusCode.NOTFOUND) {
			onRequestError({code: 404, msg: "服务器连接错误：接口不可访问", detail: results},
				url, params, callback);
		}
		else if (status === HttpServer.StatusCode.NOAUTH) {
			onRequestError({code: 401, msg: "您还未登录或无权限访问"}, url, params, callback);
		}
		else if (status >= 400) {
			onRequestError({code: status, msg: "出错啦！", detail: results}, url, params, callback);
		}
		else if (status === HttpServer.StatusCode.REDIRECT) {
			var redirectUrl = response.headers["location"] || "";
			if (server && server.contextPath && !/^http:/.test(redirectUrl)) {
				if (redirectUrl.indexOf(server.contextPath) == 0)
				redirectUrl = redirectUrl.substr(server.contextPath.length);
			}
			VRender.logger.debug("<HttpProxy.responseHandler> 302 => %s", redirectUrl);
			self.fetch(session, redirectUrl, null, callback);
		}
		else {
			onRequestSuccess(results, server, url, params, callback);
		}
	});
};

// 获取完整的 Http 请求地址，以“http”开头
var getRequestUrl = function (url, server) {
	if (/^http/.test(url)) {
		return url;
	}
	if (/^\/\//.test(url)) {
		return "http:" + url;
	}
	if (server) {
		if (/^~/.test(url)) {
			url = url.substr(1);
		} else {
			if (!/^\//.test(url)) {
				url = "/" + url;
			}
			if (server.contextPath) {
				url = server.contextPath + url;
			}
		}
		url = server.server + url;
		return /^http/.test(url) ? url : ("http://" + url);
	}
	return false;
};

// 获取“Http”模块标准的请求参数
var getRequestOptions = function (server, session, method, url) {
	url = URL.parse(url);

	var options = {};
	options.method = method || "POST";
	options.protocol = url.protocol;
	options.hostname = url.hostname;
	options.port = url.port;
	options.path = url.path;
	options.headers = {};

	if (server && server.contentType)
		options.headers["Content-Type"] = server.contentType;
	else
		options.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";

	if (HttpProxy.nextRequestHeaders) {
		for (let name in HttpProxy.nextRequestHeaders) {
			var _name = headersMap[name] || name;
			options.headers[_name] = HttpProxy.nextRequestHeaders[name];
		}
		HttpProxy.nextRequestHeaders = null;
	}
	if (options.headers["Content-Type"] == "json")
		options.headers["Content-Type"] = "application/json;charset=UTF-8";

	if (session) {
		options.headers["Cookie"] = session.getCookies(true).join("; ");

		var userAgent = session.getUserAgent();
		if (StringUtils.isNotBlank(userAgent))
			options.headers["user-agent"] = userAgent;

		var proxyHost = getProxyHost.call(this, server, options.hostname, session.getUserHost());
		if (StringUtils.isNotBlank(proxyHost))
			options.headers["host"] = proxyHost;
	}

	// console.log("getRequestOptions: ", options);
	return options;
};

///////////////////////////////////////////////////////////
// Http 请求错误，记录错误日志并返回错误信息（这里属于异常性错误，而非业务逻辑错误）
var onRequestError = function (err, url, params, callback) {
	var errmsg = err.message || err.msg || err;
	VRender.logger.error("<HttpProxy.onRequestError> 错误[%s]: %s", url, errmsg);
	if (err.detail)
		VRender.logger.error("<HttpProxy.onRequestError> 详情：%s", err.detail);
	if (Utils.isFunction(callback))
		callback(err);
	return false;
};

// Http 请求成功
var onRequestSuccess = function (responseData, server, url, params, callback) {
	if (StringUtils.isNotBlank(responseData)) {
		try {
			responseData = responseData.trim().replace(/\n/g, "\\n");
			responseData = JSON.parse(responseData);
		}
		catch (e) {
			// VRender.logger.warn("<HttpProxy.onRequestSuccess> 解析失败：", responseData, e);
			if (Utils.isFunction(callback))
				callback(null, responseData);
			return ;
		}
	}
	
	if (server && server.beDataFormat) {
		if (responseData && responseData.hasOwnProperty("code")) {
			if (responseData.code == server.validCode) {
				if (Utils.isFunction(callback))
					callback(null, responseData.data || null);
			}
			else {
				onRequestError(responseData, url, params, callback);
			}
			return ;
		}
	}

	if (Utils.isFunction(callback))
		callback(null, responseData);
};

// 使用代理时，实际的用户访问域名
var getProxyHost = function (server, requestHost, userHost) {
	userHost = userHost ? userHost.split(":")[0] : null;
	requestHost = requestHost || null;
	if (userHost == requestHost)
		return null;

	var hosts = this.context.config("server").hosts || {};

	if (requestHost) {
		if (hosts[requestHost])
			return hosts[requestHost];
		// 请求非IP并且不需要代理时，使用请求域名
		if (!Utils.isIP(requestHost)) {
			if (requestHost != server.proxyHost) {
				var proxyHosts = this.context.config("proxyHosts") || [];
				if (proxyHosts.indexOf(requestHost) < 0)
					return null;
			}
		}
	}

	if (userHost) {
		if (hosts[userHost]) {
			if (hosts[userHost] == requestHost)
				return null;
			return hosts[userHost];
		}
		if (!Utils.isIP(userHost) && userHost != "localhost")
			return userHost;
	}
};
