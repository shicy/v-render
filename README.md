# v-render
> VRender 是一个 Node.js 的 web 开发框架，基于框架 jQuery。

### 获取 v-render
```
npm install v-render --save
```

### 启动框架
```javascript
// 引入框架
var VRender = require("v-render");
// 创建一个实例，初始化并运行
new VRender({});
```
现在，打开浏览器输入`http://localhost:8888/`，更多的帮助信息将在这里找到。  
端口`8888`是默认端口号，自定义端口号如`8080`，如下所示：

```javascript
new VRender({server: {port: 8080}});
```

### 相关配置

#### - config.cwd
类型：`String`，默认值：`"./"`，即框架所在目录。  
框架运行时的基本路径，在项目中使用的相对路径将基于该路径。通常您需要切换到项目所在目录，请设置为：`__dirname`或者使用绝对路径如`"/root/project/"`。

#### - config.logdir
类型：`String`，默认值：`"./logs"`，基于`config.cwd`目录的logs子目录。  
系统日志输出文件目录，使用相对路径时基于`config.cwd`，参见`config.logfiles`了解日志配置信息。

#### - config.logfiles
类型：`String`或`Object`，默认值：`无`，文件基于`config.logdir`。  
系统日志输出文件名称定义，如`"app.log"`将所有日志信息输出到`"./logs/app.log"`文件（基于`config.cwd`）。   
想要分类型输出到不同的日志文件，可以使用下面的方式配置：

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

#### - config.uglify
类型：`Boolean`，默认值：`true`。
是否合并以及压缩脚本、样式文件。

#### - config.fileCacheExpires
类型：`Number`，默认值：`0`。
脚本、样式相应的压缩文件缓存，为`0`时缓存永不失效。服务重启将清除缓存。

#### - config.babel
类型：`Boolean`，默认值：`false`。
是否启用前端 ES6 脚本转换，使用 babel 插件将 ES6 脚本转换成 ES5。

### - config.useREM
类型：`Boolean`，默认值：`true`。
移动端页面，是否启用`rem`度量方式。

### - config.designDraftSize
类型：`Number`，默认值：`750`。
针对于`useREM`配置项，指定设计稿的宽度，方便页面中大小尺寸的转换（width/100rem）。

#### - config.server
web 服务器相关配置信息

#### - config.server.expires
web 静态资源缓存策略，包含`age`和`files`属性。

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
web 服务器端口号。

#### - config.server.root
类型：`String`，默认值：`"./WebContent"`，基于`config.cwd`目录的WebContent子目录。  
web 静态资源根目录，是图片、脚本、样式等文件的存放目录。该目录下的文件是公开的，可以被用户直接访问到，访问资源文件如：`http://localhost/test/sample.html`。**为防止路由冲突，使用关键字`webroot`强制访问，上述可以是`http://localhost/webroot/test/sample.html`**。

#### - config.server.waitTimeout
类型：`Number`，默认值：`120000`，即2分钟。  
web 服务器超时等待时间，默认2分钟。

#### - config.router
路由相关配置

#### - config.router.adapter
类型：`String`，默认值：`无`。   
路由适配器，指向一个自定义的路由模块，实现相应的路由转换。

#### - config.router.homepage
类型：`String`，默认值：`./WebContent/index.html`，基于`config.cwd`。  
首页路由配置，进系统首页打开的页面或视图。

#### - config.router.map
类型：`Object`，默认值：`无`。   
路由映射表，配置路由和网页（或视图）之间的映射关系。映射表的`key`是路由名称，`value`指向一个网页或视图。其中路由支持**伪正则表达式**，可以使用`"../.."`代表匹配任意多级目录，`".."`可以匹配任意一个子目录。   
_注：路由映射表的优先级要次于路由适配器，如果适配器受理了某个路由就不会再使用路由映射表了。_

#### - config.router.no_cache
类型：`Array`，默认值：`无`。   
禁止某些路由的浏览器缓存，被禁止缓存的路由会在其响应头上设置：`Pragma=no-cache`、 `Expires=0`、 `Cache-Control=no-cache,no-store,must-revalidate,max-age=0`。该属性同路由映射表中的路由配置，支持**伪正则表达式**。

#### - config.dataServer
数据源服务器配置，即后台数据服务器，比如：JAVA服务。

#### - config.dataServer.beDataFormat
类型：`Boolean`，默认值：`true`。  
数据接口是否返回数据格式：`{code: 0, msg: "", data: {}}`，框架默认接口返回这样的数据格式，其中：`code`表示接口返回的错误码，0是正确码，说明接口执行正确（无异常），其他编码值均表示接口异常，编码值自定义；`msg`一般指接口执行异常时的错误信息；`data`是接口返回的数据集。

#### - config.dataServer.contextPath
类型：`String`，默认值：`无`。   
数据接口调用的上下文（可选），当使用相对路径访问接口时，框架自动加上`contextPath`。比如访问接口`human/list`则自动转化为`{contextPath}/human/list`。

#### - config.dataServer.server
类型：`String`，默认值：`127.0.0.1:8080`。  
数据服务器IP地址和端口号，其中IP地址也可以用域名代替，如：`www.xxx.com:8080`。

### 路由
应用初始化时的路由配置可以查看`config.router`配置说明。其中，`config.router.map`为静态路由，`config.router.adapter`为自定义路由适配器，可以实现动态路由。

另一种更灵活的动态路由方式：分为 视图路由 和 API路由

```javascript
// 创建一个视图路由
var viewRouter = VRender.router();

// 页面视图，继承自 VRender.PageView，是一个完整的网页
viewRouter("/admin/settings", function (name, params, callback) {
  if (/profile$/.test(name))
    callback(false, "admin/settings/ProfileSettingsView");
  else if (/account$/.test(name))
    callback(false, "admin/settings/AccountSettingsView");
  else 
    callback({code: 404, msg: "视图不存在"});
});

// 模块视图，继承自 VRender.Fragment，内容不包含 html/head/body 标签，适用于单页应用
viewRouter("/module/customer", function (name, params, callback) {
  callback(false, "modules/customer/CustomerMainView");
});
```
上例中，网址`http://www.xxx.com/admin/settings/profile`返回的是`ProfileSettingsView`视图（_视图可以是一个网页或网页片段_）

```javascript
// 创建一个API路由
var apiRouter = VRender.api();

apiRouter("user.info.getbyid", function (name, params, callback) {
  callback(false, {id: 1, name: "admin", mobile: ""});
});
```
API路由返回接口数据

### 视图
#### 新建一个页面
一个页面即是一个完整的网页，继承自`VRender.PageView`。

```javascript
var VRender = require("v-render");

var IndexView = VRender.PageView.extend(module, {
  renderBody: function (body) {
    IndexView.super(this, body);
    body.append("Web Content.");
  }
});
```

#### 新建一个模块
一个模块只是网页的一个片段，继承自`VRender.Fragment`，不包含 html/head/body 等标签，但相对于普通视图，模块将自动加载样式和脚本。   
注：前端可以通过 `VRender.loadModule()` 加载模块视图

```javascript
var VRender = require("v-render");

var ModuleView = VRender.Fragment.extend(module, {
  render: function (output) {
    ModuleView.super(this, output);
    output.text("Module Content");
  }
});
```

#### 新建自定义视图
```javascript
var VRender = require("v-render");

var MyView = VRender.UIView.extend(module, {
  className: "my-view-class",
  
  doInit: function (done) {
    MyView.super(this, () => {
      done();
    });
    // something init
  },
  
  renderView: function () {
    MyView.super(this);
    this.$el.append("<div>my view content.</div>");
    // or
    // VRender.$("div").appendTo(this.$el).text("my view content.");

    // 添加组件
    // 需安装"v-render-ui"(npm install v-render-ui --save)
    new VRender.UIDateInput(this, {date: new Date()}).render(this.$el);
  }
});
```

#### 使用自定义视图
```javascript
var VRender = require("v-render");
var MyView = require("./MyView");

var MyView2 = VRender.UIView.extend(module, {
  renderView: function () {
    MyView2.super(this);
    new MyView(this).render(this.$el);
  }
});
```

### 组件
安装 [v-render-ui](https://github.com/shicy/v-render-ui) 组件

```
npm install v-render-ui --save
```




