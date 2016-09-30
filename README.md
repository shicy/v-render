# v-render
A web framework, which is run in NodeJS. You can use it as a web service, and render views at server side by components.

> 本框架设计以组件化的思想在服务器端构建网页，网页中的每一个部分都可以设计为一个小小的组件，提高代码的重用性，以及模块之间合理分层。 你不需要担心太多的碎片化组件会影响客户端请求效率，框架会负责组件打包，处理组件依赖关联，作为一个整体返回给客户端。

### 获取 v-render
```
npm install v-render
```

### 启动框架
```javascript
// 引入框架
var VRender = require("v-render");
// 创建一个实例，初始化并运行
VRender.create().initialize().run();
```
启动成功后按提示打开网页`http://localhost:8888/`，更多的帮助信息将在这里找到。  
端口`8888`是框架启动 WebService 的默认端口号，自定义端口号如`8080`，如下所示：

```javascript
VRender.create().initialize({server: {port: 8080}}).run();
```

### 相关配置
类似于端口号的设置，本框架还提供了一些其他配置信息，在框架启动的时候你可以输入配置信息。

```javascript
VRender.create().initialize(config).run();
```

#### - config.cwd
类型：`String`，默认值：`"./"`，即框架所在目录。  
框架运行时的基本路径，在项目中使用的相对路径将基于该路径。通常您需要切换到项目所在目录，请设置为：`__dirname`或者使用绝对路径如`"/root/project/"`。

#### - config.logdir
类型：`String`，默认值：`"./logs"`，基于`config.cwd`目录的logs子目录。  
系统日志输出文件目录，使用相对路径时基于`config.cwd`，参见`config.logfiles`了解日志配置信息。

#### - config.logfiles
类型：`String`或`Object`，默认值：`无`，文件基于`config.logdir`。  
系统日志输出文件名称定义，如<code>"app.log"</code>将所有日志信息输出到`"./logs/app.log"`文件（基于`config.cwd`）。想要分类型输出到不同的日志文件，可以使用下面的方式配置：

```javascript
{
	logfiles: {
		"error": "err.log", // 错误日志
		"debug": "dev.log", // 调试、开发日志
		"all": "app.log" // “all”作为关键字使用，所有的日志信息都会输出到该文件
	}
}
```
框架默认还会输出日志文件`"vr.log"`，获取相应日志对象的方法是`VRender.log(name)`，其中`name`即日志类型。默认还可以使用`VRender.logger`作为日志输出。

#### - config.server
WEB 服务器相关配置信息

#### - config.server.expires
WEB 静态资源缓存策略，包含`age`和`files`属性。

#### - config.server.expires.age
类型：`Number`，默认值：`2592000000`，即30天。  
资源文件在客户端的有效期缓存时间，默认30天。

#### - config.server.expires.files
类型：`Array`，默认值：`[".html", ".js", ".css", ".gif", ".png", ".jpg"]`  
启用客户端缓存的文件类型，当该属性为空时，所有文件不使用缓存。

#### - config.server.hosts
类型：`Object`，默认值：`无`。  
域名替换，可以将用户访问的公开域名替换成内部域名，该项配置在对接后台服务器是很有用。比如：用户访问域名`www.xxx.cn`可替换成`www.xxx.com`，参见`config.dataServer`根据域名对接后台服务器。

```javascript
{
    "www.xxx.cn": "www.xxx.com", // 将www.xxx.cn替换成www.xxx.com
    "localhost": "www.xxx.com"
}
```

#### - config.server.port
类型：`Number`，默认值：`8888`。   
WEB 服务器端口号。

#### - config.server.root
类型：`String`，默认值：`"./WebContent"`，基于`config.cwd`目录的WebContent子目录。  
WEB 静态资源根目录，是图片、脚本、样式等文件的存放目录。该目录下的文件是公开的，可以被用户直接访问到，访问资源文件如`http://localhost/test/sample.html`。**为防止路由冲突，使用关键字`webroot`强制访问，上述可以是`http://localhost/webroot/test/sample.html`**。

#### - config.server.waitTimeout
类型：`Number`，默认值：`120000`，即2分钟。  
WEB 服务器超时等待时间，默认2分钟。

#### - config.router
路由相关配置

#### - config.router.adapter
类型：`String`，默认值：`无`。   
路由适配器，指向一个自定义的路由模块，实现相应的路由转换。

#### - config.router.map
类型：`Object`，默认值：`{'^/$':'./WebContent/index.html'}`。   
路由映射表，配置路由和网页（或视图）之间的映射关系。映射表的`key`是路由名称，`value`指向一个网页或视图。其中路由支持**伪正则表达式**，可以使用`"../.."`代表匹配任意多级目录，`".."`可以匹配任意一个子目录。   
_注：路由映射表的优先级要次于路由适配器，如果适配器受理了某个路由就不会再使用路由映射表了。_

#### - config.router.no_cache
类型：`Array`，默认值：`无`。   
禁止某些路由的浏览器缓存，被禁止缓存的路由会在其响应头上设置：`Pragma=no-cache`、 `Expires=0`、 `Cache-Control=no-cache,no-store,must-revalidate,max-age=0`。该属性同路由映射表中的路由配置，支持**伪正则表达式**。

#### - config.dataServer
数据源服务器配置，即后台数据服务器，比如：JAVA服务。

#### - config.dataServer.server
类型：`String`，默认值：`127.0.0.1:8080`。









