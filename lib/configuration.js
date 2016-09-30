// ========================================================
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Configs = module.exports = {
	// 框架基本路径，文件处理基于该路径
	cwd: "./",

	// 日志文件输出目录
	logdir: "./logs/",

	// 日志输出文件设置，框架使用的是 Log4js 插件，详见 Log4js 开发文档
	// 框架默认会输出所有日志到“vr.log”文件
	// 该属性可以是字符串，作为日志文件名称，所有日志会输出到改文件
	// logfiles: "app.log",

	// 也可以是一个对象，同时配置多个日志文件，比如想要把“error”，“debug”等日志文件分开
	// 获取相应日志对象方法是“VRender.log(name)”
	// logfiles: {
	// 	// 配置系统出错时的日志文件
	// 	"error": "err.log",
	// 	// “all”作为一个关键字使用，所有的日志信息将输出到该日志文件中
	// 	"all": "app.log"
	// },

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
			age: 2592000000, // 30 * 24 * 60 * 60 * 1000,
			// 需要缓存的文件类型
			files: [".html", ".js", ".css", ".gif", ".png", ".jpg"]
		},

		// 真实域名转发，当对接后台服务器时，可以进行域名替换
		// 比如：用户访问域名“www.xxx.cn”映射到后台域名“www.xxx.com”
		hosts: {
			// "www.xxx.cn":       "www.xxx.com"
		}
	},

	// 数据服务器，即后台服务器配置
	dataServer: {
		// 默认的服务器域名或IP，如：“www.xxx.com:port”，“127.0.0.1:8080”
		server: "127.0.0.1:8080",

		// 数据接口上下文（可选），当使用相对路径访问接口时，自动加上contextPath
		// 比如访问“human/info?id=1”，则自动变为“/api/human/info?id=1”
		// 而像“/data/human/info?id=1”或“http://www.xxx.com/data/human/info?id=1”，则安原接口访问
		// contextPath: "/api",

		// 使用 v-render 框架定义的数据格式，如下：
		// {code: 0, msg: "", data: {}}，其中“code”表示数据错误码，0是正确码（接口无异常），其他值表示接口异常，
		// 异常编码可自定义；“msg”一般指接口异常时的异常信息；“data”是接口返回的数据集。
		// useVRenderData: true, // 默认为 true

		// 服务器存活检测接口，也叫心跳接口。系统将持续访问该接口
		// 如果接口不可用，说明后台服务不可用
		// liveApi: "/api/initApi",

		// 该设置配合服务器存活检测接口，当接口不可用时，停止 Web 服务（Node 仍会持续运行）
		// 当使用 Nginx(类似的) + Node(多实例) 这样的运行环境时，该设置可以保证 Nginx 访问正确的 Node
		// stopOnServerDown: true, // 默认为 false

		// 是否使用 POST 请求执行 fetch() 方法
		// fetchAsPost: true, // 默认为 false

		// 同一域名下，不同接口(支持正则表达式)，可以选用不同的后台服务
		// "/others": {
		// 	server: "127.0.0.1:8081"
		// },

		// "/others2": {
		// 	server: "127.0.0.1:8082"
		// },

		// 以上配置可以统一放到“default”属性里，功能等同
		// "default": {
		// 	server: "127.0.0.1:8089",
		// 	// contextPath: "",
		// 	// liveApi: "",
		// 	// stopOnServerDown: true,
		// 	// "/others": {},
		// 	"/others2": {}
		// },

		// 针对不同域名配置后台数据服务
		"xxx": {
			// // 以下域名（请用完整域名）将使用该后台数据服务，多个域名使用逗号(,)分隔
			// domain: "www.xxx.com, www.xxx2.com",
			// // // server 必填
			// server: "127.0.0.1:8082",
			// // // 默认接口上下文
			// // contextPath: "/api",
			// // // 存活接口
			// // liveApi: "",
			// // // 服务器不可用时是否停止服务
			// // stopOnServerDown: false,
			// "/others": {
			// 	server: "127.0.0.1:8083"
			// }
		}
	},

	// 路由配置
	router: {
		// 自定义路由适配器
		// adapter: "the router adapter path name to use",

		// 路由映射关系，顺序匹配，即从前到后逐项匹配，直到匹配成功
		map: {
			"^/$":          "./WebContent/index.html"
		},

		// 禁止浏览器缓存设置，表达式同上
		no_cache: [
			// "/mobile"
		]
	}
};
