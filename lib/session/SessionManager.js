// ========================================================
// Http Session 管理器
// @author shicy <shicy85@163.com>
// Create on 2016-08-22
// ========================================================

var QueryString = require("querystring");
var Utils = require("../util/Utils");
var StringUtils = require("../util/StringUtils");
var ArrayUtils = require("../util/ArrayUtils");


///////////////////////////////////////////////////////////
var SessionManager = module.exports = {};

var sessionList = [];
var sessionTimeout = 6 * 60 * 60 * 1000; // 默认Session有效期6小时

// 获取用户Session信息
SessionManager.get = function (context, request) {
	var session = null;

	var cookies = QueryString.parse(request.headers.cookie, "; ") || {};

	var sid = cookies["sid"];
	if (sid) {
		session = ArrayUtils.find(sessionList, function (tmp) {
			return tmp.id === sid;
		});
		if (session) {
			if (session.isValidate()) {
				session.active();
			}
			else {
				session.id = null; // 等待回收
				session = null;
			}
		}
	}

	if (!session) {
		session = new Session(context, (sid || getGuid()));
		sessionList.push(session);
		session.cookies = [];
		for (var name in cookies) {
			if (name != "sid")
				session.cookies.push(name + "=" + cookies[name]);
		}
		if (cookies["jsid"] && cookies["jsid"] != "deleteMe")
			session.jSessionID = cookies["jsid"];
	}
	session._userAgent = request.headers["user-agent"];
	session._userHost = request.headers["host"];

	return session;
};

// 将 Session 回写入用户请求
SessionManager.set = function (response, session) {
	if (!session || session.hasCookieSendToClient)
		return ;

	session.hasCookieSendToClient = true;

	var results = session.getCookies(false, true);
	session.clearCookies();

	response.setHeader("Set-Cookie", results)
};

// 设置Session失效时长，为0时设置为默认值6小时
SessionManager.setTimeout = function (value) {
	sessionTimeout = value || 6 * 60 * 60 * 1000;
};


///////////////////////////////////////////////////////////
var Session = function (context, id) {
	this.context = context;
	this.__isSession_ = true;
	this.id = id;
	// 最后访问时间
	this.lastActiveTime = new Date().getTime();
	// 用户在后台的 SessionID
	this.jSessionID = null;
	// 用户数据
	this._userData = null;
};

// 根据已有的 JESSIONID 初始化 Session 对象
Session.prototype.initByJSESSIONID = function (value) {
	this.jSessionID = value;
	this._userData = null;
};

// 每次用户访问需要激活一下，记录下最后访问时间
Session.prototype.active = function () {
	this.lastActiveTime = new Date().getTime();
};

// 验证 Session 是否有效，过期即失效
Session.prototype.isValidate = function (now) {
	if (!this.id)
		return false;
	if (!now)
		now = new Date().getTime();
	return now - this.lastActiveTime < sessionTimeout;
};

// ========================================================
// 通过当前用户获取服务器数据，带上用户 SessionID
Session.prototype.fetch = function (url, params, callback) {
	var args = formatRequestParams(params, callback);
	this.context.fetch(this, url, args.params, args.callback);
};

Session.prototype.get = function (url, params, callback) {
	var args = formatRequestParams(params, callback);
	this.context.get(this, url, args.params, args.callback);
};

Session.prototype.post = function (url, params, callback) {
	var args = formatRequestParams(params, callback);
	this.context.post(this, url, args.params, args.callback);
};

Session.prototype.put = function (url, params, callback) {
	var args = formatRequestParams(params, callback);
	this.context.put(this, url, args.params, args.callback);
};

Session.prototype.delete = function (url, params, callback) {
	var args = formatRequestParams(params, callback);
	this.context.delete(this, url, args.params, args.callback);
};

Session.prototype.upload = function (url, params, callback) {
	var args = formatRequestParams(params, callback);
	this.context.upload(this, url, args.params, args.callback);
};

// ========================================================
// 获取当前 cookie 信息，过滤已失效的 cookie
Session.prototype.getCookies = function (validate, pathAndExpires) {
	var results = [];
	
	var jSession = null;
	ArrayUtils.each(this.cookies, function (cookie) {
		if (/^JSESSIONID=/.test(cookie))
			jSession = cookie;
		if (validate && !isCookieValid(cookie))
			return ;
		results.push(pathAndExpires ? cookie : cookie.split(";")[0]);
	});

	var expires = "";
	if (pathAndExpires) {
		expires = new Date(this.lastActiveTime + sessionTimeout).toGMTString();
		expires = ";Path=/;Expires=" + expires;
	}

	results.push("sid=" + this.id + expires);

	if (this.jSessionID || jSession) {
		if (jSession) {
			if (isCookieValid(jSession)) {
				results.push("jsid=" + jSession.split(";")[0].split("=")[1] + expires);
			}
			else {
				results.push("jsid=deleteMe;Path=/;Expires=" + (new Date(2000, 1, 1)).toGMTString());
			}
		}
		else {
			results.push("jsid=" + this.jSessionID + expires);
			results.push("JSESSIONID=" + this.jSessionID + expires);
		}
	}

	ArrayUtils.remove(this.cookies, function (cookie) {
		if (/\=deleteMe$/.test(cookie.split(";")[0]))
			return true;
		return !isCookieValid(cookie);
	});

	return results;
};

// 设置 cookie 信息
Session.prototype.setCookies = function (cookies) {
	this.cookies = cookies;
	// 是否已经将 Cookies 发送给客户端（浏览器）
	this.hasCookieSendToClient = false;

	if (cookies && cookies.length > 0) {
		for (var i = 0, l = cookies.length; i < l; i++) {
			var cookie = cookies[i];
			if (/^JSESSIONID=/.test(cookie)) {
				this.jSessionID = isCookieValid(cookie) ? cookie.split(";")[0].split("=")[1] : null;
			}
		}
	}
};

// 删除过期的 cookie 信息
Session.prototype.clearCookies = function () {
	if (this.cookies && this.cookies.length > 0) {
		for (var i = this.cookies.length - 1; i >= 0; i--) {
			if (!isCookieValid(this.cookies[i]))
				this.cookies.splice(i, 1);
		}
	}
};

// ========================================================
// 存取用户信息
Session.prototype.getData = function (key, defVal) {
	if (this._userData && this._userData.hasOwnProperty(key)) {
		var result = this._userData[key];
		if (!result)
			return defVal;
		if (result.expires && result.expires < new Date().getTime()) {
			delete this._userData[key];
			return defVal;
		}
		return Utils.isNull(result.value) ? defVal : result.value;
	}
	return defVal;
};

Session.prototype.setData = function (key, value, expires) {
	if (!this._userData)
		this._userData = {};
	if (expires) {
		expires = new Date((new Date().getTime()) + expires).getTime();
	}
	if (Utils.isNull(value)) {
		delete this._userData[key];
	}
	else {
		this._userData[key] = {value: value, expires: expires};
	}
};

// ========================================================
Session.prototype.getUserHost = function () {
	return this._userHost || "";
};

Session.prototype.getUserAgent = function () {
	return this._userAgent || "";
};

Session.prototype.getUAState = function () {
	return Utils.getUAState(this.getUserAgent());
};


///////////////////////////////////////////////////////////
// 生成一个SessionId
var getGuid = function () {
	return Utils.randomTxt(32);
};

// 获取 Cookie 信息
var getRequestCookie = function (request, name) {
	var cookies = QueryString.parse(request.headers.cookie, "; ") || {};
	return cookies[name];
};

// 判断 Cookie 是否有效
var isCookieValid = function (cookie) {
	var params = cookie.split(";");
	for (var i = 0, l = params.length; i < l; i++) {
		var property = params[i].split("=");
		if (/expires/i.test(property[0]))
			return Date.parse(property[1]) > Date.now();
	}
	return true;
};

var formatRequestParams = function (params, callback) {
	if (Utils.isFunction(params)) {
		callback = params;
		params = null;
	}
	return {params: params, callback: callback};
};

///////////////////////////////////////////////////////////
// 定时回收失效的Session对象，每1分钟执行一次
var timer = setInterval(function () {
	var now = new Date().getTime()
	for (var i = sessionList.length - 1; i >= 0; i--) {
		if (!sessionList[i].isValidate(now))
			sessionList.splice(i, 1);
	}
}, 60000);
