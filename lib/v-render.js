// ========================================================
// v-render 是一个 Node.js 的 Web 框架，提倡以组件化方式开发 Web 应用程序。(包含一个 Node Web 服务器)
// 使用 Node 和 Browser 两端组件设计模式，尽量在 Node 端输出完整的 DOM 结构，以达到前端渲染的最快速度。
// @author shicy <shicy85@163.com>
// Create on 2016-08-15
// ========================================================

var Node = require("util");
var Events = require("events");
var Path = require("path");
var Log4js = require("log4js");
var Utils = require("./util/Utils");
var FileUtils = require("./util/FileUtils");
var DefaultConfigs = require("./configuration");


var CURRENT_UID = new Date().getTime();

// 定义“VRender”全局变量
global.__vrender__ = __dirname + "/v-render";


///////////////////////////////////////////////////////////
var VRender = module.exports = function () {
	this.VRENDERCLSID = "ROOT";
	Events.EventEmitter.call(this);
};

Node.inherits(VRender, Events.EventEmitter);

VRender.root = Path.resolve(__dirname, "../");

VRender.RouterStatus = {
	OK:         0,      // 所有对象、字符型的正常数据返回
	ERROR:      1,      // 出错时返回状态
	NOAUTH:     2,      // 用户未登录，或没有权限
	REDIREDT:   3,      // 重定向路由
	FORWARD:    4,      // 服务器内部转发
	FILE:       5,      // 返回文件数据流
	NOTFOUND:   6       // 资源未找到
};

VRender.logger = Log4js.getLogger("vrender");

VRender.Utils = Utils._public; // 向外公开的工具类

VRender.View              = require("./ui/View");
VRender.PageView          = require("./ui/PageView");
VRender.AppPageView       = require("./ui/AppPageView");
VRender.WebPageView       = require("./ui/WebPageView");
VRender.Fragment          = require("./ui/Fragment");
VRender.UIView            = require("./ui/UIView");
VRender.UIGroup           = require("./ui/layout/UIGroup");
VRender.UIHGroup          = require("./ui/layout/UIHGroup");
VRender.UIVGroup          = require("./ui/layout/UIVGroup");
VRender.UIContainer       = require("./ui/layout/UIContainer");
VRender.UIButton          = require("./ui/component/UIButton");
VRender.UICheckbox        = require("./ui/component/UICheckbox");
VRender.UICheckGroup      = require("./ui/component/UICheckGroup");
VRender.UICombobox        = require("./ui/component/UICombobox");
VRender.UIDatagrid        = require("./ui/component/UIDatagrid");
VRender.UIDateInput       = require("./ui/component/UIDateInput");
VRender.UIDatePicker      = require("./ui/component/UIDatePicker");
VRender.UIDateRange       = require("./ui/component/UIDateRange");
VRender.UIDialog          = require("./ui/component/UIDialog");
VRender.UIFileUpload      = require("./ui/component/UIFileUpload");
VRender.UIFormView        = require("./ui/component/UIFormView");
VRender.UIListView        = require("./ui/component/UIListView");
VRender.UINotice          = require("./ui/component/UINotice");
VRender.UIPaginator       = require("./ui/component/UIPaginator");
VRender.UIPanel           = require("./ui/component/UIPanel");
VRender.UIPopupMenu       = require("./ui/component/UIPopupMenu");
VRender.UIRadiobox        = require("./ui/component/UIRadiobox");
VRender.UIRadioGroup      = require("./ui/component/UIRadioGroup");
VRender.UIScrollBox       = require("./ui/component/UIScrollBox");
VRender.UITabbar          = require("./ui/component/UITabbar");
VRender.UIText            = require("./ui/component/UIText");
VRender.UITextView        = require("./ui/component/UITextView");
VRender.UITooltip         = require("./ui/component/UITooltip");
VRender.UITreeView        = require("./ui/component/UITreeView");


VRender.plugins = {};
VRender.plugins.SinglePage = require("./plugins/singlepage");


///////////////////////////////////////////////////////////
var HttpProxy = require("./proxy/HttpProxy");
var HttpServer = require("./server/HttpServer");
var DomHelper = require("./ui/dom/DomHelper");
var Router = require("./router/Router");


///////////////////////////////////////////////////////////
// 创建一个新框架实例
VRender.create = function () {
	return new VRender();
};

// 获取一个唯一编号
VRender.uuid = function () {
	return CURRENT_UID++;
};

// 获取相应的日志输出
VRender.log = function (category) {
	return Log4js.getLogger(category);
};

// DOM操作对象
VRender.$ = function (options) {
	return DomHelper.create(options);
};

// 视图、文件相关路由
VRender.router = function (pattern) {
	return Router.staticRouter("view", pattern);
};

// api相关路由
VRender.api = function (pattern) {
	return Router.staticRouter("api", pattern);
};


///////////////////////////////////////////////////////////
// 初始化，设置框架运行环境
VRender.prototype.initialize = function (options) {
	// 拷贝覆盖参数配置信息
	this.options = Utils.extend(true, DefaultConfigs, options);

	// 配置基本路径
	this.base = Path.resolve(__dirname, "../", this.options.cwd);
	var logdir = initLog4sjConfigs.call(this, this.options);

	this.staticFilePath = Path.resolve(__dirname, "./static");
	this.dynamicFilePath = Path.resolve(this.base, "./bin/_work");

	VRender.logger.info("VRender初始化...");
	VRender.logger.info("系统基本路径：" + this.base);
	VRender.logger.info("日志输出目录：" + logdir);

	// 创建一个 Web 服务器
	this.httpServ = new HttpServer(this).init(this.options);

	// 后台数据服务器代理设置
	this.httpProxy = new HttpProxy(this, this.options.dataServer);

	return this;
};

// 开始运行 Web 服务，重复调用无效
VRender.prototype.run = function () {
	if (!this.httpServ) {
		this.initialize();
		// VRender.logger.error("服务开启失败：还未初始化，请先执行initialize(options)方法");
	}
	else {
		var self = this;
		this.httpServ.start(function () {
			self.emit("ready");
		});
	}
	return this;
};

// 停止、关闭 Web 服务
VRender.prototype.stop = function () {
	if (this.httpServ) {
		this.httpServ.stop();
	}
	return this;
};

// 设置 Web 服务路由适配器
VRender.prototype.setRouterAdapter = function (adapter) {
	if (this.httpServ) {
		if (adapter && Utils.isFunction(adapter.setContext))
			adapter.setContext(this);
		this.httpServ.setRouterAdapter(adapter);
	}
	else {
		VRender.logger.warn("设置路由适配器失败：还未初始化");
	}
};

// 通过 GET 方式获取后台数据，“fetchAsPost=true”可以改为 POST 方式
VRender.prototype.fetch = function (session, url, params, callback) {
	this.httpProxy.fetch(session, url, params, callback);
};
 
// 通过 POST 方式获取后台数据
VRender.prototype.send = function (session, url, params, callback) {
	this.httpProxy.send(session, url, params, callback);
};

VRender.prototype.get = function (session, url, params, callback) {
	this.httpProxy.get(session, url, params, callback);
};

VRender.prototype.post = function (session, url, params, callback) {
	this.httpProxy.post(session, url, params, callback);
};

VRender.prototype.put = function (session, url, params, callback) {
	this.httpProxy.put(session, url, params, callback);
};

VRender.prototype.delete = function (session, url, params, callback) {
	this.httpProxy.delete(session, url, params, callback);
};

VRender.prototype.upload = function (session, url, params, callback) {
	this.httpProxy.upload(session, url, params, callback);
};

// 获取系统运行时配置信息
VRender.prototype.config = function (name) {
	if (name)
		return this.options[name];
	return this.options;
};

// 获取基于 config.cwd 的绝对路径
VRender.prototype.getBasedPath = function (path) {
	return Path.resolve(this.base, path);
};

// 获取基于 WebRoot 的绝对路径
VRender.prototype.getContextPath = function (path) {
	return Path.resolve(this.httpServ.getWebRoot(), path);
};

// 执行一个 api
VRender.prototype.doApi = function (session, apiName, apiParams, callback) {
	this.httpServ.router.doApi(session, apiName, apiParams, callback);
};


///////////////////////////////////////////////////////////
// ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF
var initLog4sjConfigs = function (config) {
	var appenders = {access: {type: "console"}};
	var categories = {default: {appenders: ["access"], level: "all"}};

	var logSize = 10 * 1024 * 1024; // 10M
	var logDir = Path.resolve(this.base, (config.logdir || "./")) + Path.sep;
	FileUtils.mkdirsSync(logDir);

	appenders.vr = {type: "file", filename: logDir + "vr.log", maxLogSize: logSize, backups: 5};
	categories.default.appenders.push("vr");

	var files = config.logfiles;
	if (files) {
		if (typeof files === "string") {
			appenders.app = {type: "file", filename: logDir + files, maxLogSize: logSize, backups: 5};
			categories.debugs = {appenders: ["app"], level: "debug"};
		}
		else {
			for (var n in files) {
				var temp = {type: "file", filename: logDir + files[n], maxLogSize: logSize, backups: 3};
				if (typeof n !== "string")
					n = "log" + n;
				appenders[n] = temp;
				if (/error|fatal|mark/i.test(n)) {
					categories.errors = categories.errors || {appenders: [], level: "error"};
					categories.errors.appenders.push(n);
				}
				else if (/warn/i.test(n)) {
					categories.warns = categories.warns || {appenders: [], level: "warn"};
					categories.warns.appenders.push(n);
				}
				else if (/info/i.test(n)) {
					categories.infos = categories.infos || {appenders: [], level: "info"};
					categories.infos.appenders.push(n);
				}
				else if (/debug|trace/i.test(n)) {
					categories.debugs = categories.debugs || {appenders: [], level: "debug"};
					categories.debugs.appenders.push(n);
				}
				else 
					categories.default.appenders.push(n);
			}
		}
	}

	Log4js.configure({appenders: appenders, categories: categories});

	VRender.logger = Log4js.getLogger("vrender");

	return logDir;
};
