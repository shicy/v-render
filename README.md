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
端口<code>8888</code>是框架启动 WebService 的默认端口号，想要自定义端口号，比如：<code>8080</code>，如下所示：

```javascript
VRender.create().initialize({server: {port: 8080}}).run();
```

### 相关配置
类似于端口号的设置，本框架还提供了一些其他配置信息，在框架启动的时候你可以输入配置信息。

```javascript
VRender.create().initialize(config).run();
```

#### - config.cwd
类型：<code>String</code>，默认值：<code>./</code>。  
框架运行时的基本路径，在项目中使用的相对路径将基于该路径。默认值<code>./</code>即<code>v-render</code>框架所在的目录，通常您需要切换到项目所在目录，请设置为：<code>__dirname</code>或者使用绝对路径如<code>/root/project/</code>。

#### - config.logdir

