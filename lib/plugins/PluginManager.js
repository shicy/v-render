// ========================================================
// 插件管理类
// @author shicy <shicy85@163.com>
// Create on 2017-08-08
// ========================================================

var Path = require("path");
var Utils = require("../util/Utils");


///////////////////////////////////////////////////////////
var PluginManager = module.exports = {};

///////////////////////////////////////////////////////////
var VRender = require("../v-render");

// 插件列表，【{plugin, target}】
var pluginList = [];

// 添加插件，重复添加的组件将被多次执行
// @param plugin 插件对象
// @param forTarget 该属性可以使得插件只针对某个视图有效
PluginManager.add = function (plugin, params, forTarget) {
	if (plugin) {
		if (typeof plugin === "string")
			plugin = require(plugin);
		if (Utils.isFunction(plugin))
			plugin = {install: plugin};
		pluginList.push({plugin: plugin, target: forTarget});
		if (Utils.isFunction(plugin.install)) {
			if (forTarget)
				plugin.install.call(forTarget, params);
			else
				plugin.install(params);
		}
	}
	return plugin;
};

// 移除插件
// @param plugin 想要删除的插件
PluginManager.remove = function (plugin) {
	for (var i = pluginList.length - 1; i >= 0; i--) {
		var temp = pluginList[i];
		if (temp.plugin == plugin || temp.plugin.install == plugin)
			pluginList.splice(i, 1);
	}
};

PluginManager.routeBefore = function (params, callback) {
	var self = this;
	doRouteLoop("routeBefore", callback, function (handler, next) {
		var result = false;
		var callbackWarnTimerId = 0;
		result = handler.call(self, params.pathname, params.params, function (err, state, data) {
			setTimeout(function () {
				if (callbackWarnTimerId)
					clearTimeout(callbackWarnTimerId);
				if (result === true) {
					if (err) {
						callback(err);
					}
					else if (typeof state == "string") {
						params.pathname = state;
						next();
					}
					else if (data) {
						callback(false, state || VRender.RouterStatus.OK, data);
					}
					else if (typeof state == "object") {
						callback(false, VRender.RouterStatus.OK, state);
					}
					else {
						next();
					}
				}
			});
		});
		if (result !== true) {
			if (typeof result == "object") {
				callback(false, VRender.RouterStatus.OK, result);
			}
			else {
				if (typeof result == "string")
					params.pathname = result;
				next();
			}
		}
		else {
			callbackWarnTimerId = setTimeout(function () {
				VRender.logger.warn("The routeBefore() function may not callback in plugin.");
			}, 2000);
		}
	});
};

PluginManager.routeAfter = function (params, callback) {
	var self = this;
	doRouteLoop("routeAfter", callback, function (handler, next) {
		var result = false;
		var callbackWarnTimerId = 0;
		result = handler.call(self, params.pathname, params.params, function (err, ret) {
			setTimeout(function () {
				if (callbackWarnTimerId)
					clearTimeout(callbackWarnTimerId);
				if (result === true) {
					if (err)
						callback(err, ret);
					else
						next();
				}
			});
		});
		if (result === true) {
			callbackWarnTimerId = setTimeout(function () {
				VRender.logger.warn("The routeAfter() function may not callback in plugin.");
			}, 2000);
		}
		else {
			next();
		}
	});
};

PluginManager.routeApi = function (name, params, callback) {
	doRouteHanderDefault.call(this, "routeApi", name, params, callback);
};

PluginManager.routeFile = function (filepath, params, callback) {
	doRouteHanderDefault.call(this, "routeFile", filepath, params, callback);
};

PluginManager.routeView = function (name, params, callback) {
	doRouteHanderDefault.call(this, "routeView", name, params, callback);
};

PluginManager.initView = function () {
	doPlugins.call(this, this.__self__, "initView");
};

PluginManager.initPageView = function () {
	doPlugins.call(this, this.__self__, "initPageView");
}

PluginManager.renderBefore = function (output) {
	doPlugins.call(this, this.__self__, "renderBefore", [output]);
};

PluginManager.renderAfter = function (output) {
	doPlugins.call(this, this.__self__, "renderAfter", [output]);
};

PluginManager.renderHeadBefore = function (head) {
	doPlugins.call(this, this.__self__, "renderHeadBefore", [head]);
};

PluginManager.renderHeadAfter = function (head) {
	doPlugins.call(this, this.__self__, "renderHeadAfter", [head]);
};

PluginManager.renderBodyBefore = function (body) {
	doPlugins.call(this, this.__self__, "renderBodyBefore", [body]);
};

PluginManager.renderBodyAfter = function (body) {
	doPlugins.call(this, this.__self__, "renderBodyAfter", [body]);
};

PluginManager.renderViewBefore = function (target) {
	doPlugins.call(this, this.__self__, "renderViewBefore", [target]);
};

PluginManager.renderViewAfter = function (target) {
	doPlugins.call(this, this.__self__, "renderViewAfter", [target]);
};

///////////////////////////////////////////////////////////
var doPlugins = function (target, name, args) {
	for (var i = 0, l = pluginList.length; i < l; i++) {
		var plugin = pluginList[i];
		if (!plugin.target || plugin.target == target) {
			if (Utils.isFunction(plugin.plugin[name])) {
				plugin.plugin[name].apply(this, args);
			}
		}
	}
};

var doPluginLoop = function (callback) {
	var count = pluginList.length;
	var loop = function (index) {
		if (index < count) {
			var plugin = pluginList[index];
			callback(plugin, function () {
				loop(index + 1);
			});
		}
		else {
			callback("end");
		}
	};
	loop(0);
};

var doRouteLoop = function (name, endHandler, callback) {
	doPluginLoop(function (plugin, next) {
		if (plugin == "end") {
			endHandler();
		}
		else if (!plugin.target && Utils.isFunction(plugin.plugin[name])) {
			callback(plugin.plugin[name], function () {
				next();
			});
		}
		else {
			next();
		}
	});
};

var doRouteHanderDefault = function (routeName, pathname, params, callback) {
	var self = this;
	doRouteLoop(routeName, callback, function (handler, next) {
		var result = false;
		var callbackWarnTimerId = 0;
		result = handler.call(self, pathname, params, function (err, state, data) {
			setTimeout(function () {
				if (callbackWarnTimerId)
					clearTimeout(callbackWarnTimerId);
				if (result !== false) {
					if (err)
						callback(err);
					else if (Utils.isNotBlank(data))
						callback(false, state || VRender.RouterStatus.OK, data);
					else if (state && typeof state !== "number")
						callback(false, VRender.RouterStatus.OK, state);
					else
						next();
				}
			});
		});
		if (result === false) {
			next();
		}
		else {
			callbackWarnTimerId = setTimeout(function () {
				VRender.logger.warn("The " + routeName + "() function may not callback in plugin.");
			}, 2000);
		}
	});
};
