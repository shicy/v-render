// ========================================================
// 常用工具类
// @author shicy <shicy85@163.com>
// Create on 2016-11-15
// ========================================================

(function (isFront) {
	var Utils = isFront ? VRender.Utils : exports;

	var randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
	var urlReg = new RegExp("^((https|http|ftp|rtsp|mms)?://)?(([0-9a-z_!~*'().&=+$%-]+: )" +
		"?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*" +
		"([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((/?)|(/[0-9a-z_!~*'().;?" +
		":@&=+$,%#-]+)+/?)$");

	var debounceHandlers = [];

	Utils.debounce = function (name, handler, wait, params) {
		if (Utils.isFunction(name)) {
			params = wait;
			wait = handler;
			handler = name;
			name = null;
		}
		if (Utils.isFunction(handler)) {
			// name = name || handler._name;
			var item = Utils.find(debounceHandlers, function (temp) {
				return temp.handler == handler || temp.name == name;
			});
			if (!item) {
				item = {handler: handler, name: name, timerId: 0};
				debounceHandlers.push(item);
			}
			if (item.timerId) {
				clearTimeout(item.timerId);
			}
			var self = this;
			var _params = item.params = Array.prototype.slice.call(arguments, (!name ? 2 : 3));
			item.timerId = setTimeout(function () {
				handler.apply(self, _params);
				Utils.remove(debounceHandlers, function (temp) {
					return temp.handler == handler || temp.name == name;
				});
			}, Math.max(0, (parseInt(wait) || 0)));
		}
	};

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

	Utils.extend = (typeof $ != "undefined") ? $.extend : null;

	Utils.getIndexValue = function (value) {
		if (value || value === 0) {
			if (isNaN(value))
				return -1;
			value = parseInt(value);
			return value >= 0 ? value : -1;
		}
		return -1;
	};

	Utils.getFormatSize = function (size, useREM) {
		if (size || size === 0) {
			if (isNaN(size)) { // 非数字，px, em, rem, pt, %, cm, mm, in, ex, ch等结尾
				return size; // 不用干预太多，直接返回好了
			}
			else {
				size = parseFloat(size) || 0;
				if (useREM)
					return (size / 100) + "rem";
				return size + "px";
			}
		}
		return null;
	};

	Utils.getSelection = function () {
		return window.getSelection ? window.getSelection() : (document.getSelection ? document.getSelection() : document.selection);
	};

	Utils.getSelectionRange = function () {
		var selection = Utils.getSelection();
		return (selection && selection.createRange) ? selection.createRange() : selection.getRangeAt(0);
	};

	// 获取用户浏览器代理头部信息
	Utils.getUAState = function (userAgent) {
		var state = {ie: false, chrome: false, firefox: false, opera: false, safari: false};
		var ua = userAgent.toLowerCase();
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
		state.isIphone = /iphone/.test(ua);
		state.isAndroid = /android/.test(ua);
		state.isMobile = /mobile/.test(ua) || state.isIphone || state.isAndroid;
		return state;
	};

	// 获取URL参数
	Utils.getUrlParams = function (name) {
		var params = window.location.search.substr(1).split("&");
		if (Utils.isBlank(name)) {
			var _params = {};
			for (var i = 0; i < params.length; i++) {
				var param = params[i].split("=");
				if (param[0])
					_params[param[0]] = param[1] || "";
			}
			return _params;
		}
		else {
			for (var i = 0; i < params.length; i++) {
				var param = params[i].split("=");
				if (param[0] == name)
					return param[1] || "";
			}
			return null;
		}
	};

	// 判断是否是字母 a-z A-Z
	Utils.isAlphaKey = function (e, isPressEvent) {
		if (e.which >= 65 && e.which <= 90)
			return true; // A - Z
		if (isPressEvent) {
			if (e.which >= 97 && e.which <= 122)
				return true; // a - z
		}
		return false;
	};

	// 判断是否控制按键
	Utils.isControlKey = function (e) {
		if (e.ctrlKey || e.metaKey || e.shiftKey)
			return true;
		// Backspace, “左”, "上", “右”, "下", F5, tab, Ctrl, shift, enter, CapsLock
		var keys = [8, 37, 38, 39, 40, 116, 9, 17, 16, 13, 20];
		return (keys.indexOf(e.which) >= 0);
	};

	// 是否存在节点(指节点在界面上，仅前端可用)
	Utils.isDomExist = function (selector) {
		return selector && $("body").find(selector).length > 0;
	};

	// 判断是否是电子邮箱地址(email)
	Utils.isEmail = function (value) {
		return value && emailReg.test("" + value);
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
		return value && /^1\d{10}$/.test("" + value);
	};

	// 判断对象是否为null或undefined
	Utils.isNull = function (obj) {
		return (typeof obj === "undefined") || (obj === null);
	};

	// 判断是否为数字按键
	Utils.isNumberKey = function (e) {
		if (e.shiftKey) 
			return false;
		if (e.which >= 48 && e.which <= 57) 
			return true; // 0 - 9
		if (e.which >= 96 && e.which <= 105) 
			return true; // 小键盘0 - 9
		// if (e.which == 190 || e.which == 110) 
		// 	return true; // “.”, 小键盘“.”
		// if (e.which === 189 || e.which === 109)
		// 	return true; // “-”, 小键盘“-”
		return false;
	};

	// 判断对象是不是非空对象
	Utils.isNotEmpty = function (obj) {
		return !Utils.isEmpty(obj);
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

	// 判断是不是电话号码
	Utils.isPhone = function (value) {
		return value && /^(0(10|2\d|[3-9]\d{2})-)?\d{7,8}(-\d{1,8})?$/.test("" + value);
	};

	// 判断是否原生对象（不包括null, undefined）
	Utils.isPrimitive = function (value) {
		if (typeof value === "string")
			return true;
		if (typeof value === "number")
			return true;
		return false;
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

	// 判断是不是URL地址
	Utils.isUrl = function (value) {
		return value && urlReg.test("" + value);
	};

	Utils.nextTick = function (callback) {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(callback);
		}
		else {
			setTimeout(callback, 0);
		}
	};

	Utils.notNull = Utils.isNotNull;

	// 获取元素相对容器的位置
	Utils.offset = function (target, container, targetWidth, targetHeight) {
		if (!(target instanceof $))
			target = $(target);

		var offset = Utils.offsetToWindow(target);
		offset.width = parseInt(targetWidth);
		offset.width = offset.width > 0 ? offset.width : target.outerWidth();
		offset.height = parseInt(targetHeight);
		offset.height = offset.height > 0 ? offset.height : target.outerHeight();

		var _window = $(window);
		offset.windowLeft = offset.left;
		offset.windowTop = offset.top;
		offset.windowWidth = _window.width();
		offset.windowHeight = _window.height();

		offset.overflowX = offset.left < 0 || (offset.left + offset.width > offset.windowWidth);
		offset.overflowY = offset.top < 0 || (offset.top + offset.height > offset.windowHeight);

		offset.overflowWindowX = offset.overflowX;
		offset.overflowWindowY = offset.overflowY;

		if (container && !(container instanceof $))
			container = $(container);
		if (container && container.length > 0) {
			var containerOffset = Utils.offsetToWindow(container);
			offset.containerLeft = containerOffset.left;
			offset.containerTop = containerOffset.top;
			offset.containerWidth = container.width();
			offset.containerHeight = container.height();

			offset.left -= containerOffset.left;
			offset.top -= containerOffset.top;

			offset.overflowX = offset.left < 0 || (offset.left + offset.width > offset.containerWidth);
			offset.overflowY = offset.top < 0 || (offset.top + offset.height > offset.containerHeight);

			offset.overflowContainerX = offset.overflowX;
			offset.overflowContainerY = offset.overflowY;
		}

		offset.isOverflowX = offset.overflowWindowX || !!offset.overflowContainerX;
		offset.isOverflowY = offset.overflowWindowY || !!offset.overflowContainerY;

		return offset;
	};

	Utils.offsetToHtml = function (target) {
		target = $(target);
		var offset = target.offset();
		while (true) {
			target = target.parent();
			if (!target || target.length == 0)
				break;
			offset.top -= target.scrollTop();
			offset.left -= target.scrollLeft();
			if (target.is("html"))
				break;
		}
		return offset;
	};

	Utils.offsetToWindow = function (target) {
		if (target instanceof $)
			target = target.get(0);
		if (target) {
			var rect = target.getBoundingClientRect();
			return {left: rect.x, top: rect.y};
		}
		return {left: 0, top: 0};
	};

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

	// 实际像素转换成 px 值
	Utils.toPx = function (value) {
		if (value) {
			var isRem = /rem$/.test("" + value);
			value = parseFloat(value);
			if (isNaN(value))
				return NaN;
			if (value && isRem) {
				var baseSize = parseFloat($("html").attr("data-fs"));
				if (!baseSize)
					baseSize = parseFloat($("html").css("fontSize"));
				if (baseSize)
					value = value * baseSize;
			}
			return value;
		}
		return value === 0 ? 0 : NaN;
	};

	// 实际像素转换成 rem 值
	Utils.toRem = function (value) {
		if (value) {
			var isRem = /rem$/.test("" + value);
			value = parseFloat(value);
			if (isNaN(value))
				return NaN;
			if (value && !isRem) {
				var baseSize = parseFloat($("html").attr("data-fs"));
				if (!baseSize)
					baseSize = parseFloat($("html").css("fontSize"));
				if (baseSize)
					value = value / baseSize;
			}
			return value;
		}
		return value === 0 ? 0 : NaN;
	};

})(typeof VRender !== "undefined");