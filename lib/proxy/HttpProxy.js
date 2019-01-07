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

// 使用 POST 方法请求后台服务器
HttpProxy.prototype.send = function (session, url, params, callback) {
	doRequest.call(this, "SEND", session, url, params, callback);
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

	params = params || {};
	params._seqno_ = Date.now();

	var server = this.ds.getService((session && session.getUserHost()), url);
	var requestUrl = getRequestUrl.call(this, url, server);
	if (!requestUrl)
		return onRequestError("没有相应的数据服务配置信息", url, params, callback);

	if (method == "UPLOAD") {
		uploadInner.call(this, method, session, server, requestUrl, params, callback);
	}
	else {
		requestInner.call(this, method, session, server, requestUrl, params, callback);
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

	var seqno = params._seqno_;
	var requestData = QueryString.stringify(params) || "";
	if (method == "GET") {
		if (requestData) {
			url += (url.indexOf("?") < 0 ? "?" : "&") + requestData;
			requestData = "";
		}
		params = null;
	}

	var self = this;
	var handler = function (response) {
		response.on("end", function () {
			var _url = url + (requestData ? ((url.indexOf("?") < 0 ? "?" : "&") + requestData) : "");
			VRender.logger.debug("<HttpProxy.doRequest> %s %s [%dms]", method, _url, (Date.now() - seqno));
		});
		responseHandler.call(self, response, session, server, url, params, callback);
	};

	var options = getRequestOptions.call(this, session, method, url);
	var request = /^https/.test(options.protocol) ? Https.get(options, handler) : Http.request(options, handler);

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
	var handler = function (response) {
		var _params = Utils.extend({}, params);
		delete _params.stream;
		_params = QueryString.stringify(_params);
		response.on("end", function () {
			var _url = url + (url.indexOf("?") < 0 ? "?" : "&") + _params;
			var times = (Date.now() - params._seqno_) / (String(params._seqno_) > 13 ? 1000 : 1);
			VRender.logger.debug("<HttpProxy.doRequest> %s [%dms]", _url, times);
		});
		responseHandler.call(self, response, session, server, url, _params, callback);
	};

	var options = getRequestOptions.call(this, session, "POST", url);
	if (params.stream) {
		options.headers["Content-Type"] = params.stream.headers["content-type"];
		options.headers["Content-Length"] = params.stream.headers["content-length"];
	}
	else {
		options.headers["Content-Type"] = "multipart/form-data";
	}
	var request = /^https/.test(options.protocol) ? Https.get(options, handler) : Http.request(options, handler);

	request.on("error", function (e) {
		onRequestError(e, url, params, callback);
	});

	if (params.stream) {
		params.stream.pipe(request);
	}
	else { // 这个没测过，估计不行的
		request.write(QueryString.stringify(params));
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
			onRequestError({code: 404, msg: "服务器连接错误：接口不可访问", detail: results}, url, params, callback);
		}
		else if (status === HttpServer.StatusCode.NOAUTH) {
			onRequestError({code: 401, msg: "您还未登录或无权限访问"}, url, params, callback);
		}
		else if (status >= 400) {
			onRequestError({code: status, msg: "出错啦！", detail: results}, url, params, callback);
		}
		else if (status === HttpServer.StatusCode.REDIRECT) {
			self.fetch(session, response.headers["location"], null, callback);
		}
		else {
			onRequestSuccess(results, server, url, params, callback);
		}
	});
};

// 获取完整的 Http 请求地址，以“http”开头
var getRequestUrl = function (url, server) {
	if (StringUtils.startWith(url, "http"))
		return url;
	if (server) {
		if (!/^\//.test(url))
			url = "/" + url;
		if (/^\/\//.test(url))
			url = url.substr(1);
		else if (server.contextPath)
			url = server.contextPath + url;
		url = server.server + url;
		return /^http/.test(url) ? url : ("http://" + url);
	}
	return false;
};

// 获取“Http”模块标准的请求参数
var getRequestOptions = function (session, method, url) {
	url = URL.parse(url);

	var options = {};
	options.method = method || "POST";
	options.protocol = url.protocol;
	options.hostname = url.hostname;
	options.port = url.port;
	options.path = url.path;
	options.headers = {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"};

	if (session) {
		options.headers["Cookie"] = session.getCookies(true).join("; ");

		var userAgent = session.getUserAgent();
		if (StringUtils.isNotBlank(userAgent))
			options.headers["user-agent"] = userAgent;

		var proxyHost = getProxyHost.call(this, options.hostname, session.getUserHost());
		if (StringUtils.isNotBlank(proxyHost))
			options.headers["host"] = proxyHost;
	}

	// console.log(options);
	return options;
};

///////////////////////////////////////////////////////////
// Http 请求错误，记录错误日志并返回错误信息（这里属于异常性错误，而非业务逻辑错误）
var onRequestError = function (err, url, params, callback) {
	var errmsg = err.message || err.msg || err;
	params = (params && (typeof params != "string")) ? JSON.stringify(params) : (params || "");
	VRender.logger.error("<HttpProxy.onRequestError> 错误[%s](%s): %s", url, params, errmsg);
	if (Utils.isFunction(callback))
		callback(err);
	return false;
};

// Http 请求成功
var onRequestSuccess = function (responseData, server, url, params, callback) {
	if (StringUtils.isNotBlank(responseData)) {
		try {
			responseData = responseData.replace(/\n/g, "\\n");
			responseData = JSON.parse(responseData);
		}
		catch (e) {
			VRender.logger.warn("<HttpProxy.onRequestSuccess> 解析失败：", responseData, e);
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
var getProxyHost = function (requestHost, userHost) {
	var hosts = this.context.config("server").hosts;
	if (hosts) {
		if (userHost)
			userHost = userHost.split(":")[0];
		if (requestHost) {
			// requestHost = requestHost.split(":")[0];
			if (hosts.hasOwnProperty(requestHost))
				return hosts[requestHost];
			if (requestHost != userHost && !isIP(requestHost)) 
				return requestHost;
		}
		if (userHost) {
			if (hosts.hasOwnProperty(userHost))
				return hosts[userHost];
		}
	}
	return null;
};

var isIP = function (host) {
	return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
};
