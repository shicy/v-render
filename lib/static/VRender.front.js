// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-10-17
// ========================================================

(function () {
	if (window.VRender)
		return ;

	///////////////////////////////////////////////////////
	var VRender = window.VRender = function () {};

	VRender.$ = $;
	VRender.ENV = {}; // 存储环境变量

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
	var cssFiles = {};

	var scheduleTasks = [];
	var scheduleTaskTimerId = 0;

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
			if (hasDefinition(name)) {
				if (Utils.isFunction(definitions[name]))
					definitions[name]($, VRender, Utils);
				return ;
			}
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
				definition = definition($, VRender, Utils) || definition;
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
        if (definitions.hasOwnProperty(name)) {
        	if (Utils.isFunction(callback))
            	callback(definitions[name]);
        	return definitions[name];
        }
        else {
            VRender.on(VRender.event_defined, function (_name, value) {
                if (name === _name) {
                    VRender.off(VRender.event_defined, arguments.callee);
                    if (Utils.isFunction(callback))
                    	callback(value);
                }
            });
        }
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
	VRender.fetch = function (name, data, callback, ignoreError) {
		doAjax("GET", name, data, callback, ignoreError);
	};

	VRender.post = function (name, data, callback, ignoreError) {
		doAjax("POST", name, data, callback, ignoreError);
	};

	var doAjax = function (method, url, params, callback, ignoreError) {
		if (Utils.isFunction(params)) {
			ignoreError = callback;
			callback = params;
			params = null;
		}

		if (!Utils.isFunction(callback))
			callback = function () {};

		if (Utils.isBlank(url)) {
			callback("服务请求失败：url不能为空");
			return false;
		}

		if (Utils.isNotBlank(params)) {
			var _params = {};
			for (var n in params) {
				if (Utils.isNotNull(params[n]))
					_params[n] = params[n];
			}
			params = _params;
		}

		if (!/^(\/|http)/.test(url)) {
			url = "/api?n=" + url;
			params = Utils.isBlank(params) ? null : {data: JSON.stringify(params)};
			method = "POST";
		}

		if (method === "GET" && Utils.isNotBlank(params)) {
			url += (url.indexOf("?") < 0 ? "?" : "&") + $.param(params);
			params = null;
		}

		return $.ajax({
			type: method, cache: false, url: url, dataType: "json", data: params,
			success: function (result) {
				if (result && result.hasOwnProperty("code")) {
					if (result.code === 0)
						callback(false, result.data);
					else { console.error(result);
						var errormsg = result.hasOwnProperty("msg") ? result.msg : result;
						if (!ignoreError && Utils.isFunction(VRender.onAjaxError))
							VRender.onAjaxError(errormsg || "");
						callback((errormsg || true), result);
					}
				}
				else
					callback(false, result);
			},
			error: function (e) {
				var errormsg = e.responseText || true;
				if (e.status === 401) 
					errormsg = "请登录";
				else if (e.status === 404) 
					errormsg = "请求错误，请稍候重试..";
				else if (e.status === 500) {
					try {
						errormsg = JSON.parse(errormsg);
					}
					catch (e) {}
					errormsg = "服务器错误，请重试. " + ((errormsg && errormsg.hasOwnProperty("msg")) ? errormsg.msg : errormsg);
				}
				if (!ignoreError && Utils.isFunction(VRender.onAjaxError))
					VRender.onAjaxError(errormsg, e);
				callback(errormsg);
			}
		});
	};

	///////////////////////////////////////////////////////
	// 动态加载样式、脚本和网页信息
	// @param view 被加载样式和脚本所关联的视图
	// @param files 需要加载的样式或脚本文件，[{path, uri}]
	VRender.load = function (view, files, callback) {
		if (Utils.isNull(files) && Utils.isNull(callback)) {
			files = view;
			view = null;
		}
		if (Utils.isFunction(files)) {
			callback = files;
			files = view;
			view = null;
		}

		if (view && typeof view === "string")
			view = $(view);

		files = Utils.toArray(files);
		if (files.length === 0) {
			if (Utils.isFunction(callback))
				callback(null);
		}
		else {
			var count = files.length;
			var results = [];

			var complete = function (pathname, type, err, ret) {
				if (!err && ret)
					Utils.pushAll(results, ret);
				count -= 1;
				if (count <= 0 && Utils.isFunction(callback))
					callback(results);
			};

			Utils.each(files, function (file) {
				if (typeof file === "string")
					file = {uri: file};
				if (Utils.isBlank(file.uri)) {
					complete(null, "none");
				}
				else {
					var pathname = file.uri.toLowerCase();
					if (/\.js$/.test(pathname))
						loadJS(file.uri, file.attributes, complete);
					else if (/\.css$/.test(pathname))
						loadCSS(view, file.uri, file.attributes, complete);
					else
						loadHTML(file.uri, file.attributes, complete);
				}
			});
		}
	};

	var loadJS = function (pathname, callback) {
		$.getScript(pathname).done(function (data) {
			if (Utils.isFunction(callback)) {
				var results = [];
				if (data) {
					var defines = data.match(/define\(["'][\w-]+["']\)/g);
					Utils.each(defines, function (define) {
						define = define.substring(8, define.length - 1);
						if (definitions.hasOwnProperty(define))
							results.push(definitions[define]);
					});
				}
				callback(pathname, "js", false, results);
			}

		}).fail(function (e) {
			console.error("js load error", (e.responseText || e));
			if (Utils.isFunction(VRender.onAjaxError))
				VRender.onAjaxError("js load error", e);
			if (Utils.isFunction(callback))
				callback(pathname, "js", e);
		});
	};

	var loadCSS = function (view, pathname, attributes, callback) {
		var data = cssFiles[pathname];
		if (!data) {
			var styles = $("<link href='" + pathname + "' rel='stylesheet' type='text/css'>").appendTo("head");
			data = cssFiles[pathname] = {$el: styles};
		}

		if (attributes)
			data.$el.attr(attributes);

		if (view) { // 本次加载样式绑定的视图
			if (!Utils.isArray(data.views))
				data.views = [];
			data.views.push(view);
		}

		if (Utils.isFunction(callback))
			callback(pathname, "css");
	};

	var loadHTML = function (pathname, params, callback) {
		if (Utils.isNotBlank(pathname) && Utils.isFunction(callback)) {
			$.ajax({
				type: "POST", cache: false, url: pathname, data: params,
				success: function (result) {
					callback(pathname, "html", false, result);
				},
				error: function (e) {
					console.error("html load error", (e.responseText || e));
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

	VRender.onInputChange = function (input, callback) {
		var target = $(input);
		if (!target.is("input, textarea"))
			target = target.find("input, textarea");

		if (Utils.isFunction(callback)) {
			target.on("focusin", function (e) {
				var input = $(e.currentTarget);
				var data = input.data("vrender-inputchange");
				if (data && data.timer)
					clearInterval(data.timer);
				data = {lastValue: input.val()};
				data.timer = setInterval(function () {
					checkChange(input, data);
				}, 100);
				input.data("vrender-inputchange", data);
			});

			target.on("focusout", function (e) {
				var input = $(e.currentTarget);
				var data = input.data("vrender-inputchange");
				if (data && data.timer)
					clearInterval(data.timer);
				input.removeData("vrender-inputchange");
				checkChange(input, data);
			});

			var checkChange = function (input, data) {
				var value = input.val();
				if (value != data.lastValue) {
					data.lastValue = value;
					if (Utils.isFunction(callback))
						callback(input, value);
				}
			};
		}
		else {
			target.off("focusin");
			target.off("focusout");
		}
	};

	///////////////////////////////////////////////////////
	// 注册一个周期任务，周期任务会被定时(400ms)执行一次
	VRender.scheduleTask = function (name, task) {
		if (Utils.isBlank(name))
			return ;
		if (Utils.isFunction(task)) {
			var data = Utils.find(scheduleTasks, function (tmp) {
				return tmp.name === name;
			});
			if (data)
				data.task = task;
			else 
				scheduleTasks.push({name: name, task: task});
		}
		else {
			Utils.removeItems(scheduleTasks, function (tmp) {
				return tmp.name === name;
			});
		}
		if (scheduleTasks.length === 0) {
			if (scheduleTaskTimerId)
				clearInterval(scheduleTaskTimerId);
			scheduleTaskTimerId = 0;
		}
		else if (!scheduleTaskTimerId) {
			scheduleTaskTimerId = setInterval(function () {
				Utils.each(scheduleTasks, function (data) {
					data.task();
				});
			}, 400);
		}
	};

	// 样式文件监听，当样式绑定的视图移除时删除样式
	var cssFileMonitorTask = function () {
		for (var name in cssFiles) {
			var data = cssFiles[name];
			if (Utils.isArray(data.views)) {
				for (var i = data.views.length - 1; i >= 0; i--) {
					if (!Utils.isDomExist(data.views[i]))
						data.views.splice(i, 1);
				}
				if (data.views.length === 0) {
					data.$el.remove();
					delete cssFiles[name];
				}
			}
		}
	};

	///////////////////////////////////////////////////////
	// 插件设计
	VRender.plugins = {};

	///////////////////////////////////////////////////////
	// 前端组件定义，基本与 Node 端的组件一致，配合使用
	var Component = VRender.Component = function () {};

	Component.bindName = "vrender-component";
	Component.registerList = []; // 已注册的组件信息
	Component.dataAdapter = function (data) { return data; };
	Component.errorHandler = function (err) { console.error(err); };

	Component.register = function (selector, ComponentClass) {
		if (Utils.isNotBlank(selector) && Utils.isFunction(ComponentClass))
			Component.registerList.push({s: selector, fun: ComponentClass});
	};

	Component.build = function (view) {
		if (Utils.isBlank(view))
			return [];

		view = $(view);
		if (!view || view.length === 0)
			return [];

		var components = [];
		Utils.each(Component.registerList, function (Comp) {
			view.find(Comp.s).each(function () {
				var target = $(this);
				var component = target.data(Component.bindName);
				if (!component)
					component = new Comp.fun(target);
				components.push(component);
			});
		});
		return components;
	};

	Component.get = function (view) {
		return $(view).data(Component.bindName);
	};

	Component.find = function (view, selector, Comp) {
		view = $(view);
		if (!view || view.length === 0)
			return [];

		if (Utils.isBlank(selector))
			return Component.build(view);
		
		return Utils.map(view.find(selector), function (item) {
			if (Utils.isFunction(Comp))
				return new Comp(item);
			return Component.get(item);
		});
	};

	Component.create = function (options, UIComponent, Renderer) {
		options = $.extend({}, options);
		
		var target = options.tagName || options.tag || "div";
		if (/img|input|br/.test(target))
			target = $("<" + target + "/>");
		else
			target = $("<" + target + "></" + target + ">");

		if (Utils.isNotBlank(options.id))
			target.attr("id", options.id);
		if (Utils.isNotBlank(options.name))
			target.attr("name", options.name);
		if (Utils.isNotBlank(options.clsName))
			target.addClass(options.clsName);
		if (Utils.isNotBlank(options.style))
			target.addClass(options.style);
		if (options.target)
			target.appendTo(options.target);

		var renderer = Renderer && (new Renderer(options));
		if (renderer && Utils.isFunction(renderer.render))
			renderer.render($, target);

		var width = Utils.getFormatSize(options.width, VRender.ENV.useRem);
		var height = Utils.getFormatSize(options.height, VRender.ENV.useRem);
		if (UIComponent && Utils.isFunction(UIComponent)) {
			var comp =  new UIComponent(target, options, renderer);
			if (width && (!Utils.isFunction(comp.isWidthEnabled) || comp.isWidthEnabled()))
				target.css("width", width);
			if (height && (!Utils.isFunction(comp.isHeightEnabled) || comp.isHeightEnabled()))
				target.css("height", height);
		}
		else {
			if (width)
				target.css("width", width);
			if (height)
				target.css("height", height);
		}
		return target;
	};

	Component.load = function (api, params, callback) {
		if (Utils.isBlank(api)) {
			Component.errorHandler("组件试图加载数据错误：api不能为空");
			return false;
		}

		params = $.extend({}, params);
		this.lastLoadApi = api;
		this.lastLoadParams = params;

		var self = this;
		VRender.fetch(api, params, function (err, ret) {
			if (!err) {
				ret = Component.dataAdapter(ret);
				if (ret && Utils.isArray(ret))
					ret = {total: ret.length, data: ret};
				self._totalSize = Math.max(0, parseInt(ret && ret.total)) || 0;
				ret = (ret && ret.hasOwnProperty("data")) ? ret.data : ret;
			}
			self._pageNo = parseInt(params.p_no) || 1;
			self._pageSize = parseInt(params.p_size) || 20;
			var pager = Utils.isFunction(self.getPaginator) && self.getPaginator();
			if (pager && Utils.isFunction(pager.set)) {
				pager.set(self._totalSize, self._pageNo, self._pageSize);
			}
			if (Utils.isFunction(callback))
				callback(err, ret);
		});
	};

	///////////////////////////////////////////////////////
	VRender.$ref = function (name) {
		var ref = $("[ref='" + name + "']");
		if (ref && ref.length > 0) {
			if (ref.length > 1)
				ref = ref.eq(0);
			return Component.get(ref) || ref;
		}
		return null;
	};

	window.$ref = VRender.$ref;

	///////////////////////////////////////////////////////
	$.ajaxSetup({cache: true});

	$(function () { // document ready handler
		documentReadyFlag =  true;

		// $.ajaxPrefilter("script", function(e){	e.cache = true;});

		Component.isMobile = Utils.getUAState(navigator.userAgent).isMobile;

		for (var name in VRender.cacheDefine) {
			var module = VRender.cacheDefine[name];
			initDefinition(name, module.definition, module.deps);
		}
		delete VRender.cacheDefine;

		VRender.scheduleTask("EasyWeb.cssfilemonitor", cssFileMonitorTask);
	});
})();
