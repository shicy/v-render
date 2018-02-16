// ========================================================
// 路由适配器，该适配器作为默认适配器，实际项目中需要自定义路由适配器。
// 自定义路由适配器通过 vRender.setRouterAdapter(adaper)方法
// 或者配置参数{router: {adapter: "your/path/based/cwd/RouterAdapter"}}
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var Path = require("path");
var StringUtils = require("../util/StringUtils");


var RouterAdapter = module.exports = function (context) {
	this.context = context;
};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");


// 执行在所有路由之前，用于初始化，或改变路由
// @param pathname 当前的路由名称，实际就是 url 地址中的 pathname (host 和 search 之间的部分)
// @param params 当前请求信息，包含用户和 url 参数信息
RouterAdapter.prototype.before = function (pathname, params, callback) {
	// 出错、异常
	// callback(true);
	// callback("errormsg");

	// 正确，不做任何处理
	// callback();
	// callback(false);

	// 正确，改变路由
	// callback(false, "[newpath]");
	// callback(false, "/admin/login");
	// callback(false, VRender.RouterStatus.FORWARD, "/admin/newpath");

	// 正确，结束路由，并返回结果
	// callback(false, {});
	// callback(false, VRender.RouterStatus.OK, "<html></html>");
	// callback(false, VRender.RouterStatus.FILE, "[filepath]");

	// return true; // 返回为true时 callback 才有效
	// return "[newpath]"; // 返回新路由，即改变路由
	// return {}; // 返回结果，将结束路由
};

RouterAdapter.prototype.after = function (pathname, params, callback) {
	// 出错、异常
	// callback(true);
	// callback("errormsg");

	// 正确，
	// callback();
	// callback(false);

	// return true; // 返回为true时 callback 才有效
};

// 客户端数据服务接口处理方法，如：“~/api?n=?&data={}”的请求会执行该方法
// @param name 服务或接口名称
// @param params 参数集，包含：session, data等
RouterAdapter.prototype.api = function (name, params, callback) {
	// 出错、异常
	// callback(true);
	// callback("errormsg");

	// 正确，返回结果数据
	// callback(false, {});

	// 正确，其他
	// callback(false, VRender.RouterStatus.OK, "文本信息");
	// callback(false, VRender.RouterStatus.OK, {});
	// callback(false, VRender.RouterStatus.FILE, "[filepath]");

	return false; // 返回false时 callback 无效，将使用系统内置接口
};

// 文件资源获取方法，如：“/index.html”，“/login.js”，“/main.css”等
// @param filepath 客户端请求路径，如：“/a/b/c/test.html”
// @param params 参数集，包含：session, data等
RouterAdapter.prototype.file = function (filepath, params, callback) {
	// 出错、异常
	// callback(true);
	// callback("errormsg");

	// 正确，返回新文件地址
	// callback(false, "/a/b/c/test.ext"); // 绝对地址，允许返回系统上的任意文件
	// callback(false, "a/b/c/test.ext"); // 相对地址，返回相对 WebRoot 目录中的文件
	// callback(false, "/webroot/a/b/test.ext"); // 同上

	// 正确，其他
	// callback(false, VRender.RouterStatus.OK, "文本信息");
	// callback(false, VRender.RouterStatus.OK, {});
	// callback(false, VRender.RouterStatus.FILE, "[filepath]");

	return false; // 返回false时 callback 无效，将使用默认逻辑，即从 WebRoot 中获取文件
};

// 路由方法，根据路由名称获取视图文件路径，路径相对于config.cwd
// @param name 当前路由名称，已经过 before() 方法转换
// @param params 参数集，包含session, data等
// @param path 在config.router.map配置中获得的视图路径，该方法可以做进一步处理
RouterAdapter.prototype.view = function (name, params, path, callback) {
	// 出错、异常
	// callback(true);
	// callback("errormsg");

	// 正确，返回视图文件地址
	// callback(false, "a/b/c"); // 相对地址，返回相对于 config.cwd 目录的视图文件
	// callback(false, "/a/b/c"); // 绝对地址，允许返回系统上的任意文件

	// 正确，其他
	// callback(false, VRender.RouterStatus.OK, "文本信息");
	// callback(false, VRender.RouterStatus.OK, {});
	// callback(false, VRender.RouterStatus.FILE, "[filepath]");

	return false; // 返回false时 callback 无效
};
