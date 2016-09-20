# v-render
A web framework, which is run in NodeJS. You can use it as a web service, and render views at server side by components.

--
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
启动成功后按提示打开网页<code>http://localhost:8888/</code>，更多的帮助信息将在这里找到。  
端口<code>8888</code>是框架启动 WebService 的默认端口号，自定义端口号如<code>8080</code>，如下所示：

```javascript
VRender.create().initialize({server: {port: 8080}}).run();
```

### 相关配置
类似于端口号的设置，本框架还提供了一些其他配置信息，在框架启动的时候你可以输入配置信息。

```javascript
VRender.create().initialize(config).run();
```

#### - config.cwd
类型：<code>String</code>，默认值：<code>"./"</code>，即框架所在目录。  
框架运行时的基本路径，在项目中使用的相对路径将基于该路径。通常您需要切换到项目所在目录，请设置为：<code>__dirname</code>或者使用绝对路径如<code>"/root/project/"</code>。

#### - config.logdir
类型：<code>String</code>，默认值：<code>"./logs"</code>，基于<code>config.cwd</code>目录的logs子目录。  
系统日志输出文件目录，使用相对路径时基于<code>config.cwd</code>，参见<code>config.logfiles</code>了解日志配置信息。

#### - config.logfiles
类型：<code>String</code>或<code>Object</code>，默认值：<code>无</code>，文件基于<code>config.logdir</code>。  
系统日志输出文件名称定义，如<code>"app.log"</code>将所有日志信息输出到<code>"./logs/app.log"</code>文件（基于<code>config.cwd</code>）。想要分类型输出到不同的日志文件，可以使用下面的方式配置：

```javascript
{
	logfiles: {
		"error": "err.log", // 错误日志
		"debug": "dev.log", // 调试、开发日志
		"all": "app.log" // “all”作为关键字使用，所有的日志信息都会输出到该文件
	}
}
```
框架默认还会输出日志文件<code>"vr.log"</code>，获取相应日志对象的方法是<code>VRender.log(name)</code>，其中<code>name</code>即日志类型。默认还可以使用<code>VRender.logger</code>作为日志输出。

#### - config.server
WEB 服务器相关配置信息

#### - config.server.port
类型：<code>Number</code>，默认值：<code>8888</code>。   
WEB 服务器端口号。

#### - config.server.root














