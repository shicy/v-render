// ========================================================
// 插件管理类
// @author shicy <shicy85@163.com>
// Create on 2017-08-08
// ========================================================

var Path = require("path");
var Utils = require("../util/Utils");


///////////////////////////////////////////////////////////
var PluginManager = module.exports = {};

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

PluginManager.initView = function () {
	doPlugins.call(this, this.__self__, "initView");
};

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
