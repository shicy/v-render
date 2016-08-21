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


// 客户端数据服务接口处理方法，如：“~/api?n=?&data={}”的请求会执行该方法
// @param name 服务或接口名称
// @param params 参数集，包含：session, data等
// @param callback 回调方法，型如：function (state, data) {}
// @return 返回为 false 时，表示接口未受理
// callback 方法，原则上只返回接口数据，允许返回 html 文档或文件路径
RouterAdapter.prototype.action = function (name, params, callback) {
	return false;
};