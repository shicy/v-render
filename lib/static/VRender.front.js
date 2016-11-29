// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-10-17
// ========================================================

(function () {
	if (window.VRender)
		return ;

	///////////////////////////////////////////////////////
	var VRender = window.VRender = function () {};

	VRender.event_defined = "vrender_defined"; 		// 前端模块 define() 完成事件
	VRender.event_statepush = "vrender_statepush";			// 地址栏变更
	VRender.event_statereplace = "vrender_statereplace";	// 地址栏替换
	VRender.event_statepop = "vrender_statepop";			// 地址栏还原
	VRender.event_routerbefore = "vrender_router_before";
	VRender.event_routerchange = "vrender_router_change";

	var documentReadyFlag = false;

	// 前端模块定义，define()方法定义的前端脚本
	// 结构如：{key: name, definition: define()方法返回的对象}
	var definitions = {};

	// 前端工具类，包含：isFunction()
	var Utils = VRender.Utils = function () {};

	///////////////////////////////////////////////////////
	// 前端模块定义
	window.define = function (name, deps, definition) {
		if (Utils.isFunction(name)) {
			definition = name;
			deps = null;
			name = null;
		}
		else if (Utils.isArray(name)) {
			definition = deps;
			deps = name;
			name = null;
		}
		else if (Utils.isFunction(deps)) {
			definition = deps;
			deps = null;
		}

		if (Utils.isFunction(definition)) {
			if (Utils.isBlank(name))
				name = Utils.randomTxt(32);
			if (hasDefinition(name))
				return ;
			if (documentReadyFlag)
				initDefinition(name, definition, deps);
			else {
				if (!VRender.cacheDefine)
					VRender.cacheDefine = {};
				VRender.cacheDefine[name] = {definition: definition, deps: deps};
			}
		}
	};

	var initDefinition = function (name, definition, dependents) {
		dependents = Utils.toArray(dependents);

		var readyHandler = function () {
			if (Utils.isFunction(definition))
				definition = definition($, VRender) || definition;
			definitions[name] = definition;
			VRender.trigger(VRender.event_defined, name, definition);
		};

		if (dependents.length > 0) {
			var isAllReady = function () {
				return !Utils.find(dependents, function (tmp) {
					return !hasDefinition(tmp);
				});
			};
			if (isAllReady()) {
				readyHandler();
			}
			else {
				VRender.on(VRender.event_defined, function () {
					if (isAllReady()) {
						VRender.off(VRender.event_defined, arguments.callee);
						readyHandler();
					}
				});
			}
		}
		else {
			readyHandler();
		}
	};

	var hasDefinition = function (name) {
		return definitions.hasOwnProperty(name);
	};

	///////////////////////////////////////////////////////
	window.requirejs = function (name, callback) {

	};

	///////////////////////////////////////////////////////
	// 页面跳转，默认是刷新页面。如果是“单页应用”请使用“SinglePageView”视图
	// @param url 新页面地址
	// @param options 参数：replace-是否替换当前网页 trigger-是否派发事件 animate-是否执行动画效果
	VRender.navigate = function (url, options) {
		if (Utils.isNotBlank(url)) {
			var state = {router: url, replace: false, trigger: true, animate: false};
			if (options)
				state = $.extend(state, options);
			VRender.trigger(VRender.event_routerbefore, state);
			if (state.isDefaultPrevented !== true) {
				if (Utils.isTrue(state.replace))
					window.location.replace(url);
				else
					window.location = url;
			}
		}
	};

	///////////////////////////////////////////////////////
	// 动态获取网页内容
	VRender.require = function (pathname, callback) {
		if (Utils.isFunction(callback)) {
			if (Utils.isBlank(pathname)) {
				callback(false, null);
			}
			else {
				loadHTML(pathname, null, function (path, type, err, data) {
					callback(err, data);
				});
			}
		}
	};

	///////////////////////////////////////////////////////
	VRender.fetch = function (name, data, callback, ignoreError, method) {

	};

	VRender.post = function (name, data, callback, ignoreError) {

	};

	///////////////////////////////////////////////////////
	// 动态加载样式、脚本和网页信息
	// @param view 
	VRender.load = function (view, files, callback) {

	};

	var loadJS = function (view, pathname, attributes, callback) {

	};

	var loadCSS = function (view, pathname, attributes, callback) {

	};

	var loadHTML = function (pathname, params, callback) {
		if (Utils.isNotBlank(pathname) && Utils.isFunction(callback)) {
			$.ajax({
				type: "POST", cache: false, url: pathname, data: params,
				success: function (result) {
					callback(pathname, "html", false, result);
				},
				error: function (e) { console.error(e);
					if (Utils.isFunction(VRender.onAjaxError))
						VRender.onAjaxError("html load error", e);
					callback(pathname, "html", e, null);
				}
			});
		}
		else if (Utils.isFunction(callback)) {
			callback(pathname, "html", false, null);
		}
	};

	///////////////////////////////////////////////////////
	// 浏览器端数据存储，前端数据持久化，使用 jStorage 插件
	// 当 value=null 时删除数据
	VRender.cache = function (name, value) {
		if (Utils.isBlank(name))
			return null;
		if (value === null) {
			$.jStorage.deleteKey(name);
			return null;
		}
		if (typeof value !== "undefined")
			$.jStorage.set(name, value);
		return $.jStorage.get(name);
	};

	///////////////////////////////////////////////////////
	// 派发全局事件，依次执行已绑定的事件监听方法
	VRender.trigger = function (name, data) {
		if (VRender.emitter)
			VRender.emitter.trigger(name, data);
	};

	// 注册全局事件监听方法，data可选
	VRender.on = function (name, data, callback) {
		if (!VRender.emitter && VRender.EventEmitter)
			VRender.emitter = new VRender.EventEmitter();
		if (VRender.emitter)
			VRender.emitter.on(name, data, callback);
	};

	// 注册一次性的全局事件监听方法，只会执行1次，之后就被移除
	VRender.one = function (name, data, callback) {
		if (!VRender.emitter && VRender.EventEmitter)
			VRender.emitter = new VRender.EventEmitter();
		if (VRender.emitter)
			VRender.emitter.one(name, data, callback);
	};

	// 移除全局监听方法，callback为空时移除所有name的事件方法
	VRender.off = function (name, callback) {
		if (VRender.emitter)
			VRender.emitter.off(name, callback);
	};

	// 监听回车事件，callback 为空时删除事件
	VRender.onenter = function (target, selector, callback) {
		if (Utils.isFunction(selector)) {
			callback = selector;
			selector = null;
		}
		target = $(target);
		if (Utils.isFunction(callback)) {
			var enterHandler = function (e) {
				if (e.which === 13)
					callback();
			};
			if (Utils.isBlank(selector))
				target.on("keydown", enterHandler);
			else
				target.on("keydown", selector, enterHandler);
		}
		else {
			target.off("keydown", selector);
		}
	};

	///////////////////////////////////////////////////////
	// 插件设计
	VRender.plugins = {};

	///////////////////////////////////////////////////////
	// 前端组件定义，基本与 Node 端的组件一致，配合使用
	var Component = VRender.Component = function () {};

	Component.build = function (view) {

	};

	///////////////////////////////////////////////////////
	$(function () { // document ready handler
		documentReadyFlag =  true;

		for (var name in VRender.cacheDefine) {
			var module = VRender.cacheDefine[name];
			initDefinition(name, module.definition, module.deps);
		}
		delete VRender.cacheDefine;
	});
})();
