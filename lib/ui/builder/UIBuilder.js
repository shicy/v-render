// ========================================================
// 视图网页生成器，构建并生成网页代码
// @author shicy <shicy85@163.com>
// Create on 2016-10-10
// ========================================================

var FileSys = require("fs");
var VRender = require("../../v-render");
var Utils = require("../../util/Utils");
var StringUtils = require("../../util/StringUtils");
var PluginManager = require("../../plugins/PluginManager");
var DomHelper = require("../dom/DomHelper");


// 网页构建方法，将视图对象转化成网页代码
// @param context 当前框架实例
// @param view 视图所在路径，路径相对于“config.cwd”
// @param params 构建网页的相关参数信息
// @param callback 网页构建完成时的回调方法，如：function (err, html) {};
exports.build = function (context, view, params, callback) {
	setImmediate(function () {
		new Builder(context, view, params).ready(function (html) {
			if (Utils.isFunction(callback))
				callback(null, html);
		}).onerror(function (msg) {
			if (Utils.isFunction(callback))
				callback(msg || "服务器错误");
		}).build();
	});
};

///////////////////////////////////////////////////////////
var Builder = function (context, view, params) {
	this.context = context;
	this.viewpath = view;
	this.params = params;
};

// 开始构建网页
Builder.prototype.build = function () {
	var view = this.getViewInstance();
	if (view) {
		if (Utils.isFunction(view.ready)) {
			var self = this;
			view.ready(function () {
				var dhelper = DomHelper.create();
				if (Utils.isFunction(view.render)) {
					PluginManager.renderBefore.call(view, dhelper);
					view.render(dhelper);
					PluginManager.renderAfter.call(view, dhelper);
				}
				self.ready(dhelper.html());
			});
		}
		else {
			VRender.logger.error("<UIBuilder.build> 无法构建网页：" + this.viewpath);
			this.ready("");
		}
	}
	return this;
};

// 视图构建完成方法
Builder.prototype.ready = function (value) {
	if (Utils.isFunction(value))
		this.readyHandler = value;
	else if (Utils.isFunction(this.readyHandler)) {
		this.readyHandler(value);
	}
	return this;
};

// 注册视图构建错误回调方法
Builder.prototype.onerror = function (value) {
	if (Utils.isFunction(value))
		this.errorHandler = value;
	else if (Utils.isFunction(this.errorHandler)) {
		VRender.logger.error("<UIBuilder.onerror> 网页构建错误：", value);
		this.errorHandler(value);
	}
	return this;
};

// 创建当前视图实例
Builder.prototype.getViewInstance = function () {
	if (StringUtils.isBlank(this.viewpath)) {
		this.onerror("无效的视图null");
	}
	else {
		var viewpath = this.context.getBasedPath(this.viewpath);
		try {
			var ViewClass = require(viewpath);
			if (Utils.isFunction(ViewClass))
				return new ViewClass(this.context, this.params);
			this.onerror("无法构建视图：" + viewpath);
		}
		catch (e) {
			if (e.code === "MODULE_NOT_FOUND")
				this.onerror("试图构建的视图不存在“" + viewpath + "”");
			else 
				this.onerror(e.toString());
		}
	}
};
