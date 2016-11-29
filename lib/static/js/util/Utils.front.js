// ========================================================
// 常用工具类
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

(function () {
	var Utils = (typeof VRender === "undefined") ? exports : VRender.Utils;

	var randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

	// 判断2个对象是否相等，只要对象中的“id”, “code”或“value”相等及判定为对象相等
	Utils.equal = function (d1, d2) {
		if (d1 == d2)
			return true;
		if (Utils.isNull(d1))
			return Utils.isNull(d2);
		else if (Utils.isNull(d2))
			return false;
		if ((typeof d1 !== "object") || (typeof d2 !== "object"))
			return d1 === d2;
		if (d1 instanceof Array) {
			if (d2 instanceof Array) {
				if (d1.length !== d2.length)
					return false;
				for (var i = 0, l = d1.length; i < l; i++) {
					if (!Utils.equal(d1[i], d2[i]))
						return false;
				}
				return true;
			}
			else
				return false;
		}
		if (d1.hasOwnProperty("id"))
			return d1.id == d2.id;
		if (d1.hasOwnProperty("code"))
			return d1.code == d2.code;
		if (d1.hasOwnProperty("value"))
			return d1.value == d2.value;
		return false;
	};

	// 链式执行回调方法，让程序看上去是同步的编程方式
	Utils.exec = function (scope, funcs, data, finalHandler, async) {
		if (Utils.isFunction(scope)) {
			finalHandler = scope;
			async = funcs;
			scope = funcs = data = null;
		}
		else if (scope instanceof Array) {
			async = finalHandler;
			finalHandler = data;
			data = funcs;
			funcs = scope; 
			scope = null;
		}
		if (funcs) {
			if (Utils.isFunction(funcs)) {
				async = data;
				finalHandler = funcs;
				funcs = data = null;
			}
			else if (!(funcs instanceof Array)) {
				async = finalHandler;
				finalHandler = data;
				data = funcs;
				funcs = null;
			}
		}
		if (data && Utils.isFunction(data)) {
			async = finalHandler;
			finalHandler = data;
			data = null;
		}

		if (!scope)
			scope = this;
		if (!Utils.isFunction(finalHandler))
			finalHandler = function () {};

		if (!funcs || funcs.length === 0) {
			finalHandler.call(scope, false, data);
		}
		else {
			var i = 0, len = funcs.length;
			if (async) {
				var errs = [];
				for (i = 0; i < funcs.length; i++) {
					funcs[i].call(scope, data, function (err, result) {
						len -= 1;
						if (err)
							errs.push(err);
						if (len <= 0)
							finalHandler.call(scope, (errs.join("") || false), result || data);
					});
				}
			}
			else {
				var wrap = function (err, result) {
					if (err) {
						finalHandler.call(scope, err, data);
					}
					else {
						i += 1;
						if (i < len)
							funcs[i].call(scope, (result || data), wrap);
						else
							finalHandler.call(scope, false, result || data);
					}
				};
				funcs[0].call(scope, data, wrap);
			}
		}
	};

	Utils.getSelection = function () {
		return window.getSelection ? window.getSelection() : (document.getSelection ? document.getSelection() : document.selection);
	};

	Utils.getSelectionRange = function () {
		var selection = Utils.getSelection();
		return (selection && selection.createRange) ? selection.createRange() : selection.getRangeAt(0);
	};

	// 是否存在节点(指节点在界面上，仅前端可用)
	Utils.isDomExist = function (selector) {
		return selector && $("body").find(selector).length > 0;
	};

	// 判断对象是否是空对象
	Utils.isEmpty = function (obj) {
		if (typeof obj === "undefined")
			return true;
		if (obj === null)
			return true;
		if (obj === "")
			return true;
		for (var n in obj) {
			return false;
		}
		return true;
	};

	// 判断对象是不是一个方法
	Utils.isFunction = function (obj) {
		return obj && (typeof obj === "function");
	};

	// 判断是不是手机号码
	Utils.isMobile = function (value) {
		return /^1\d{10}$/.test("" + value);
	};

	// 判断对象是否为null或undefined
	Utils.isNull = function (obj) {
		return (typeof obj === "undefined") || (obj === null);
	};

	// 判断对象是否为空，当对象不为空时返回true，否则返回false
	Utils.isNotNull = function (obj) {
		return !Utils.isNull(obj);
	};

	// 判断是否数字
	Utils.isNumberic = function (obj) {
		if (Utils.isNull(obj))
			return false;
		if (typeof obj === "number")
			return true;
		return !isNaN(obj);
	};

	// 判断对象是否为真
	// 以下判断为 true: true, "true", "yes", "string", "1", 1, 2, ..
	// 以下判断为 false: false, "false", "no", "", 0, "0", null
	Utils.isTrue = function (v) {
		if (!v) // null, false, 0, ""
			return false;
		if (v === true || v === 1)
			return true;
		v = String(v).toLowerCase();
		return !(v === "false" || v === "no" || v === "0");
	};

	Utils.notNull = Utils.isNotNull;

	// 查找上级节点（仅前端可用）
	Utils.parentUntil = function (target, selector, limit) {
		var target = $(target);
		while (target != null && target.length > 0) {
			if (target.is(selector)) 
				return target; 
			if (limit && target.is(limit)) 
				return $(""); 
			target = target.parent();
		}
		return $("");
	};

	// 解析url获取URL对象（仅前端可用）
	Utils.parseUrl = function (url) {
		var lnk = document.createElement("a");
		lnk.href = url || "";
		var URL = {};
		URL.origin = url;
		URL.href = lnk.href;
		URL.protocol = lnk.protocol.replace(":", "");
		URL.host = lnk.host;
		URL.hostname = lnk.hostname;
		URL.port = lnk.port;
		URL.pathname = lnk.pathname;
		URL.search = lnk.search;
		URL.hash = lnk.hash;
		URL.params = {};
		if (lnk.search) {
			var params = lnk.search.substr(1).split("&");
			for (var i = 0, l = params.length; i < l; i++) {
				var tmps = params[i].split("=");
				URL.params[tmps[0]] = tmps[1];
			}
		}
		return URL;
	};

	// 生成一个随机字符串
	Utils.randomTxt = function (len) {
		var s = [], chars = randomChars;
		for (var i = 0; i < len; i++) { 
			s.push(chars[Math.ceil(Math.random() * 61)]); 
		}
		return s.join("");
	};

	// 格式化手机号码，如：+86 138 8888 8888
	Utils.toLocalMobile = function (mobile, countryCode) {
		if (!Utils.isMobile(mobile))
			return mobile;
		var parts = [];
		if (countryCode)
			parts.push("+86");
		parts.push(mobile.substr(0, 3));
		parts.push(mobile.substr(3, 4));
		parts.push(mobile.substr(7, 4));
		return parts.join(" ");
	};
})();
