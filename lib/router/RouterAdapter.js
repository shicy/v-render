// ========================================================
// 路由适配器，该适配器作为默认适配器，实际项目中需要自定义路由适配器。
// 自定义路由适配器通过 vRender.setRouterAdapter(adaper)方法
// 或者配置参数{router: {adapter: "your/path/based/cwd/RouterAdapter"}}
// @author shicy <shicy85@163.com>
// Create on 2016-08-19
// ========================================================

var RouterAdapter = module.exports = function (context) {
	this.context = context;
};


///////////////////////////////////////////////////////////
var VRender = require("../v-render");


// 客户端数据服务接口处理方法，如：“~/api?n=?&data={}”的请求会执行该方法
// @param name 服务或接口名称
// @param params 参数集，包含：session, data等
// @param callback 回调方法，型如：function (state, data) {}，
//        原则上只返回接口数据，允许返回 html 文档或文件路径
// @return 为 true 时表示接口请求被接管，必须执行callback()方法；为 false 时表示请求未受理
RouterAdapter.prototype.action = function (name, params, callback) {
	if (name == "test") {
		// 返回测试接口数据
		callback({code: 0, data: {name: "join", age: 26}});
		// 返回 true，说明 test 已受理
		return true;
	}
	return false;
};

// 文件资源获取方法，如：“/index.html”，“/login.js”，“/main.css”等
// @param filepath 客户端请求路径，如：“/a/b/c/test.html”
// @param params 参数集，包含：session, data等
// @param callback 回调方法，型如：function (state, data) {}
// @return 为 true 时表示文件请求被接管，必须执行callback()方法；为 false 时表示请求未受理
RouterAdapter.prototype.file = function (filepath, params, callback) {
	if (filepath == "/test.html") {
		callback(VRender.RouterStatus.OK, "<h1>路由适配器 file() 方法受理结果</h1>");
		return true;
	}
	return false;
};
