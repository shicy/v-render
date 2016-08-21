// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Configs = module.exports = {
	// 框架基本路径，文件处理基于该路径
	cwd: "./",

	// 日志文件输出目录
	logdir: "./logs/",

	server: {
		// 开启服务器使用端口号
		port: 8888,

		// 网站根目录，基于cwd。（该目录下的文件用户可以访问）
		root: "./WebContent",

		// 超时等待时间，为0时使用默认值120000(2分钟)
		waitTimeout: 0,

		// 静态文件缓存策略
		expires: {
			// 文件有效期30天
			age: 30 * 24 * 60 * 60 * 1000,
			// 需要缓存的文件类型
			files: [".gif", ".png", ".jpg", ".html", ".js", ".css"]
		}
	},

	// 路由配置
	router: {
		// 自定义路由适配器
		// adapter: "the router adapter path name to use",

		// 路由映射关系，顺序匹配，即从前到后逐项匹配，直到匹配成功
		map: {
			"/":          "./WebContent/index.html"
		},

		// 禁止浏览器缓存设置，表达式同上
		no_cache: [
			// "/mobile"
		]
	}
};
