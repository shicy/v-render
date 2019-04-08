// ========================================================
// 网页视图，构建一个完整的网页内容，即包含：html, head, body, meta, link, script 等信息
// @author shicy <shicy85@163.com>
// Create on 2016-11-06
// ========================================================

var Utils = require("../util/Utils");
var ArrayUtils = require("../util/ArrayUtils");
var PluginManager = require("../plugins/PluginManager");
var VRender = require("../v-render");
var View = require("./View");


var PageView = View.extend(module, {
	doInit: function (done) {
		PageView.super(this, (function () {
			this._isRenderAsApp = this.isRenderAsApp();
			this.doFileImport();
			if (Utils.isFunction(done))
				done();
		}).bind(this));
	},

	// 动态添加资源文件，防止一次性写死，子类可继承覆盖
	doFileImport: function () {
		if (this.getContext().config("babel")) {
			// this.import("https://cdn.polyfill.io/v3/polyfill.min.js?features=es5,es6,es7&flags=gated", {group: false, index: -2});
			this.import("/VRender/babel/polyfill.js", {group: false, index: -2});
		}
		this.import("/VRender.core.js?v=190407", {group: false, index: -1});
		if (this._isRenderAsApp) {
			this.import("/VRender.front.mobile.min.css?v=190407", {group: false, index: -1});
			this.import("/VRender.front.mobile.min.js?v=190407", {group: false, index: -1});
		}
		else {
			this.import("/VRender.front.min.css?v=190407", {group: false, index: -1});
			this.import("/VRender.front.min.js?v=190407", {group: false, index: -1});
		}
	},

	render: function (output) {
		PageView.super(this, output);

		output.write("<!DOCTYPE html>");
		var html = VRender.$("<html><head></head><body></body></html>").appendTo(output);

		// 先构建 body 这样一些动态的脚本和样式才能正确的添加
		var body = html.children("body");
		PluginManager.renderBodyBefore.call(this, body);
		this.renderBody(html.children("body"));
		PluginManager.renderBodyAfter.call(this, body);

		var head = html.children("head");
		PluginManager.renderHeadBefore.call(this, head);
		this.renderHeader(html.children("head"));
		PluginManager.renderHeadAfter.call(this, head);

		if (this._isRenderAsApp) {
			var context = this.getContext();
			if (Utils.isTrue(context.config("useREM"))) {
				html.attr("data-dpr", "1");
				var designSize = parseInt(context.config("designDraftSize")) || 0;
				html.attr("data-mw", (designSize > 0 ? designSize : 640));
			}
		}
	},

	// 构建网页 head 部分
	renderHeader: function (head) {
		// 设置网页字符集
		head.write("<meta charset='" + this.getCharset() + "'>");

		// 设置网页 meta 信息
		ArrayUtils.each(this.getMetaTypes(), function (meta) {
			if (meta.name)
				head.write("<meta name='" + meta.name + "' content='" + meta.content + "'>");
			else if (meta.equiv)
				head.write("<meta http-equiv='" + meta.equiv + "' content='" + meta.content + "'>");
		});

		// 网页标题和logo设置
		var pageTitle = this.getPageTitle();
		if (Utils.notNull(pageTitle))
			head.append("<title>" + pageTitle + "</title>");
		var pageLogo = this.getPageLogo();
		if (Utils.notNull(pageLogo))
			head.write("<link href='" + pageLogo + "' rel='shortcut icon' type='image/x-icon'>");

		// 添加样式和脚本
		ArrayUtils.each(this.getMergedImportFiles(this._isRenderAsApp), function (file) {
			var attributes = Utils.toDomStringAttrs(file.attributes);
			if (file.type === "css") {
				head.write("<link href='" + file.uri + "' rel='stylesheet' type='text/css' " + attributes + ">");
			}
			else {
				head.write("<script src='" + file.uri + "' type='text/javascript' " + attributes + "></script>");
			}
		});

		// 构建组件
		var tagid = VRender.uuid();
		var target = head.appendAndGet("<script vid='" + tagid + "' class='vrender-init-script'></script>");
		target.write("$(function(){VRender.Component.build('body');$('[vid=" + tagid + "]').remove();});");
	},

	// 构建网页 body 部分
	renderBody: function (body) {
		if (this._isRenderAsApp) {
			body.attr("device", "app");

			var session = this.getSession();
			var userState = session && session.getUAState() || {};

			if (userState.isIphone) {
				body.attr("iphone", "");
				body.attr("ontouchstart", ""); // 解决了 iphone 里面“:active”不起作用的问题
			}
			if (userState.wx)
				body.attr("wx", "");
		}
		else {
			body.attr("device", "pc");
		}

		// 设置网页主题样式
		body.attr("theme", this.getTheme());

		// 缓存设置
		if (this.options && this.options.browserCacheDisabled)
			body.attr("no-cache", "1");
	},

	///////////////////////////////////////////////////////
	// 获取网页字符集编码，默认“utf-8”
	getCharset: function () {
		return "utf-8";
	},

	// 获取网页 meta 信息，返回数组格式: {name, content} 或 {equiv, content}
	getMetaTypes: function () {
		var metas = [];
		if (this._isRenderAsApp) {
			metas.push({name: "viewport", content: "initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=0"})
			// 全屏模式
			// metas.push({name: "apple-mobile-web-app-capable", content: "yes"});
			// 隐藏状态栏、设置状态栏颜色，只有在开启WebApp全屏模式时有效，可选：default|black|black-translucent
			// metas.push({name: "apple-mobile-web-app-status-bar-style", content: "black-translucent"});
			// 添加到主屏后的标题
			// metas.push({name: "apple-mobile-web-app-title", content: "标题"});
			// 禁止电话号码识别功能
			metas.push({name: "format-detection", content: "telephone=no"});
			// 禁止邮箱识别
			metas.push({name: "format-detection", content: "email=no"});
			// 添加智能app广告条，告诉浏览器这个网站对应的app
			// metas.push({name: "apple-itunes-app", content: "app-id=myAppStoreId, affiliate=myAffiliateData, app-argument=myURL"});
			// 针对手持设备优化，主要是针对一些老的不识别viewport的浏览器
			metas.push({name: "HandheldFriendly", content: "true"});
			// 微软的老式浏览器
			metas.push({name: "MobileOptimized", content: "320"});
			// windows phone点击无高亮
			metas.push({name: "msapplication-tap-highlight", content: "no"});
			// uc强制竖屏
			metas.push({name: "screen-orientation", content: "portrait"});
			// qq强制竖屏
			metas.push({name: "x5-orientation", content: "portrait"});
			// uc强制全屏
			// metas.push({name: "full-screen", content: "yes"});
			// qq强制全屏
			// metas.push({name: "x5-fullscreen", content: "true"});
			// uc应用模式
			// metas.push({name: "browsermode", content: "application"});
			// qq应用模式
			// metas.push({name: "x5-page-mode", content: "app"});
			// 以下禁用浏览器缓存(这个不太有用)
			// metas.push({equiv: "Pragma", content: "no-cache"});
			// metas.push({equiv: "Cache-Control", content: "no-cache,no-store,must-revalidate"});
			// metas.push({equiv: "Expires", content: "0"});
		}
		return metas;
	},

	// 获取网页标题
	getPageTitle: function () {
		return this.pageTitle;
	},

	// 获取网页 logo 图片信息
	getPageLogo: function () {
		return this.pageLogo;
	},

	// 获取网页的主题样式
	getTheme: function () {
	}

});
