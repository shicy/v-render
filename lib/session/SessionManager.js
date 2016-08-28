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

	var sid = SessionManager.getCookie(request, "sid");
	// EasyWeb.logger.debug("<SessionManager.get>", request.url, sid);
	if (sid) {
		session = ArrayUtils.find(sessionList, function (tmp, i) {
			return tmp.id === sid;
		});
		// EasyWeb.logger.debug("<SessionManager.get>", session);
		if (session) {
			if (session.isValidate()) {
				session.active();
				return session;
			}
			else 
				session.id = ""; // 等待回收
		}
	}

	// EasyWeb.logger.debug("<SessionManager.get>", request.headers);
	session = new Session(context, sid || SessionManager.guid());
	session._userAgent = request.headers["user-agent"];
	session._userHost = request.headers["host"];
	session.jSessionID = SessionManager.getCookie(request, "jsid", "");
	sessionList.push(session);
	return session;
};

// 将 Session 回写入用户请求
SessionManager.set = function (response, session) {
	if (!session || session.hasCookieSendToClient)
		return ;

	session.hasCookieSendToClient = true;
	// EasyWeb.logger.debug("<SessionManager.set>", session.id);

	var expires = new Date(session.lastActiveTime + sessionTimeout).toGMTString();

	var results = [];
	results.push("sid=" + session.id + ";Path=/;Expires=" + expires);

	if (session.cookies && session.cookies.length > 0) {
		results = results.concat(session.cookies); // 这是后台服务器给的 cookie 信息
		for (var i = session.cookies.length - 1; i >= 0; i--) {
			var cookie = session.cookies[i];
			if (StringUtils.startWith(cookie, "JSESSIONID=")) {
				session.jSessionID = cookie.split(";")[0].split("=")[1];
				if (session.isCookieValid(cookie))
					results.push("jsid=" + session.jSessionID + ";Path=/;Expires=" + expires);
				else 
					results.push("jsid=deleteMe;Path=/;Expires=" + (new Date(2000, 1, 1).toGMTString()));
			}
			else if (!session.isCookieValid(cookie)) {
				session.cookies.splice(i, 1);
			}
		}
	}
	else if (session.jSessionID) {
		results.push("JSESSIONID=" + session.jSessionID + ";Path=/;Expires=" + expires);
		results.push("jsid=" + session.jSessionID + ";Path=/;Expires=" + expires);
	}

	// EasyWeb.logger.debug("<SessionManager.set>", results);
	response.setHeader("Set-Cookie", results)
};

// 获取 Cookie 信息
SessionManager.getCookie = function (request, name, defVal) {
	var cookies = QueryString.parse(request.headers.cookie, "; ");
	return cookies[name] || defVal;
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

// 每次用户访问需要激活一下，记录下最后访问时间
Session.prototype.active = function () {
	this.lastActiveTime = new Date().getTime();
};

// 验证Session是否有效，过期即失效
Session.prototype.isValidate = function (now) {
	if (!this.id)
		return false;
	if (!now)
		now = new Date().getTime();
	return now - this.lastActiveTime < sessionTimeout;
};

// 通过当前用户获取服务器数据，带上用户 SessionID
Session.prototype.fetch = function (url, params, callback) {
	if (Utils.isFunction(params)) {
		callback = params;
		params = null;
	}
	this.context.fetch(this, url, params, callback);
};

// post 方式请求后台数据服务器，带上用户 SessionID
Session.prototype.send = function (url, params, callback) {
	if (Utils.isFunction(params)) {
		callback = params;
		params = null;
	}
	this.context.send(this, url, params, callback);
};

// ========================================================
// 获取当前 cookie 信息，过滤已失效的 cookie
Session.prototype.getCookies = function () {
	var results = [];
	if (this.cookies && this.cookies.length > 0) {
		ArrayUtils.each(this.cookies, function (cookie) {
			if (isCookieValid(cookie)) {
				results.push(cookie.split(";")[0]);
			}
		});
	}
	else if (this.jSessionID) {
		results.push("JSESSIONID=" + this.jSessionID);
	}
	return results;
};

// 设置 cookie 信息
Session.prototype.setCookies = function (cookies) {
	this.cookies = cookies;
	// 是否已经将 Cookies 发送给客户端（浏览器）
	this.hasCookieSendToClient = false;
};

// ========================================================
// 存取用户信息
Session.prototype.get = function (key, defVal) {
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

Session.prototype.set = function (key, value, expires) {
	if (!this._userData)
		this._userData = {};
	if (expires) {
		expires = new Date((new Date().getTime()) + expires).getTime();
	}
	this._userData[key] = {value: value, expires: expires};
};

// ========================================================
Session.prototype.getUserHost = function () {
	return this._userHost || "";
};

Session.prototype.getUserAgent = function () {
	return this._userAgent || "";
};

Session.prototype.getUAState = function () {
	var state = {ie: false, chrome: false, firefox: false, opera: false, safari: false};
	var ua = this.getUserAgent().toLowerCase();
	if (/micromessenger/.test(ua))
		state.wx = true;
	else if (/msie ([\d.]+)/.test(ua))
		state.ie = true;
	else if (/firefox\/([\d.]+)/.test(ua))
		state.firefox = true;
	else if (/chrome\/([\d.]+)/.test(ua))
		state.chrome = true;
	else if (/opera.([\d.]+)/.test(ua))
		state.opera = true;
	else if (/safari/.test(ua) && /version\/([\d.]+)/.test(ua))
		state.safari = true;
	state.isMobile = /mobile/.test(ua);
	state.isIphone = /iphone/.test(ua);
	return state;
};


///////////////////////////////////////////////////////////
// 判断 Cookie 是否有效
var isCookieValid = function (cookie) {
	var temps = cookie.split(";");
	for (var i = 0; i < temps.length; i++) {
		if (StringUtils.startWith(temps[i].trim().toLowerCase(), "expires=")) {
			return Date.parse(temps[i].split("=")[1]) > new Date().getTime();
		}
	}
	return true;
};
