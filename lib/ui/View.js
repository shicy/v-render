// ========================================================
// 组件视图基础类，实现了视图的属性、功能、及扩展等机制。
// 一个视图通常包含网页、样式和脚本，同时视图也可以包含其他视图。
// 由于现实中存在大量的异步过程，视图分为2个部分：初始化和渲染。
// 在初始化过程可以用来准备数据，比如读取/存储数据；而渲染过程则将最终结果返回给客户端。
// 其中初始化可以是一个异步过程，而渲染则必须是同步的，初始化完成必须执行响应的ready()方法。
// 
// 异步视图机制
// 视图的 doInit(done) 方法默认作为异步执行，方法内部必须执行 done() 来结束异步。
// 用户可以通过 ready(function) 方法来监听视图是否已完成异步。View.allReady([views], function) 同时监听多个视图。
// 只有视图完成异步之后才会执行该视图的 render() 方法 
// 
// @author shicy <shicy85@163.com>
// Create on 2016-10-10
// ========================================================

var Path = require("path");
var FileSys = require("fs");
var Utils = require("../util/Utils");
var ArrayUtils = require("../util/ArrayUtils");
var StringUtils = require("../util/StringUtils");
var PluginManager = require("../plugins/PluginManager");
var FileBuilder = require("./builder/FileBuilder");


// 标志视图将作为父类创建，此时创建视图的一些初始化过程忽略
var CONTEXT_AS_PARENT = "contextAsParent";
// 禁止方法继承覆盖，以下方法不允许继承
var NOEXTEND_WHITELIST = ["super", "ready", "isReady", "import", "component"];

var FILE_EXTS = ".fe.js,.front.js,.css,.p.css,.m.css,.scss,.p.scss,.m.scsss,.sass,.p.sass,.m.sass".split(",");
var FILE_EXTS_SCRIPT = ".fe.js,.front.js".split(",");
var FILE_EXTS_STYLE = ".css,.p.css,.m.css,.scss,.p.scss,.m.scss,.sass,.p.sass,.m.sass".split(",");

///////////////////////////////////////////////////////////
var View = module.exports = function (context, options, session) {
	this.VRENDERCLSID = "View";
	this.context = context;
	if (context === CONTEXT_AS_PARENT)
		return ;

	this.options = Utils.extend({}, options); // 视图内部 Options 与外部隔离
	this.session = session || this.options._session || this.options.session;

	initialize.call(this, this.options);

	if (context instanceof View)
		this.setViewOwner(context);
};
View.prototype = new Object();

// 视图扩展，通过该方法创建子视图，子视图拥有当前视图及以上级视图的属性和方法，
// @param module 子视图所在的module对象（由NodeJS提供）
// @param props 扩展或者覆盖父类属性和方法
View.extend = function (module, props) {
	if (!props) {
		props = module;
		module = null;
	}

	var parent = this; // A View or ChildView class
	var child = function () {
		// 继承类的时候，参数 context=CONTEXT_AS_PARENT 会跳过初始化方法
		// 用户 new 创建实例时 context 为实际上下文对象
		parent.apply(this, arguments);
	};
	child.prototype = new parent(CONTEXT_AS_PARENT);
	child.prototype.constructor = child;

	// 静态方法（类方法）赋值
	for (var n in View) {
		child[n] = View[n];
	}

	for (var n in props) {
		if (NOEXTEND_WHITELIST.indexOf(n) >= 0) {
			console.warn("[Warn]: %s() 为 v-render 视图预留方法，禁止使用！", n);
		}
		else {
			child.prototype[n] = props[n];
		}
	}

	child.__super__ = parent.prototype; // 相当于父类，可以通过该对象调用父类的方法
	child.prototype.__self__ = child; // 相当于本类构造方法

	if (module) {
		child.__module__ = module; // NodeJS的模块信息
		module.exports = child;
	}

	return child;
};

// 执行父类方法
View.super = function (scope, args) {
	if (!(scope instanceof View))
		throw new Error("super(scope, ...args) 方法，参数 scope 必须是一个 View 实例对象！");

	var methodName = arguments.callee.caller.name;
	if (this.__super__ && (typeof methodName === "string")) {
		var method = this.__super__[methodName];
		if (Utils.isFunction(method)) {
			var params = Array.prototype.slice.call(arguments, 1);
			if (methodName == "doInit" && !Utils.isFunction(params[0])) {
				params.unshift(function () {});
			}
			return method.apply(scope, params);
		}
	}
};

// 导入样式(CSS)和脚本(SCRIPT)文件，attributes指定生成标签时的额外属性
// 为当前视图静态绑定脚本和样式文件，即在开发阶段确定的脚本和样式文件
// 注：当前视图导入了什么就是什么，跟其他视图无关
// @param filepath 想要导入的样式或脚本文件，可以是一个数组同时导入多个文件
// 		使用相对路径时则相对于当前视图，使用绝对路径时则是webroot里的路径
// @param attributes 文件属性，其中：group-文件分组名称(为false文件时不合并)
View.import = function (filepath, attributes) {
	var imports = this.__imports;
	if (!ArrayUtils.isArray(imports))
		imports = this.__imports = [];
	var ViewClass = this;
	ArrayUtils.each(ArrayUtils.toArray(filepath), function (path) {
		addOneImport(ViewClass, imports, path, attributes, true);
	});
};

// 引用模块，同时导入模块的脚本和样式文件
// 注：仅仅可以导入被引用模块的静态脚本和样式
// @param dir 想要引用模块的所在目录，可选，默认是当前视图所在目录
// @param pathname 想要引用的模块文件名称，使用绝对路径或相对路径，相对dir的路径
View.component = function (dir, pathname) {
	var Module = require(getUseAbsolutePath(this.__module__, dir, pathname));

	var imports = this.__imports;
	if (!ArrayUtils.isArray(imports))
		imports = this.__imports = [];
	doClassImport.call(this, imports, Module);

	return Module;
};

// 插件，组件渲染时使用插件
// @param plugin 插件对象
View.use = function (plugin, params) {
	PluginManager.add(plugin, params, this);
};

// 多视图全部准备完成后执行回调方法
View.allReady = function (views, callback) {
	if (Utils.isFunction(callback)) {
		if (views && views.length > 0) {
			var count = views.length;
			var complete = function () {
				count -= 1;
				if (count === 0)
					callback();
			};
			ArrayUtils.each(views, function (view) {
				if (view && Utils.isFunction(view.ready))
					view.ready(complete);
				else
					complete();
			});
		}
		else {
			callback();
		}
	}
};


///////////////////////////////////////////////////////////
// 视图初始化，供子类实现，子类初始化完成后必须执行 done() 方法
View.prototype.doInit = function (done) {
	if (Utils.isFunction(done))
		done();
};

// 构建视图，生成视图网页代码
// 注意：异步在该方法内不可用，方法完成后即返回客户端了，因此异步无效，异步过程请在doInit()方法中执行
// @param output 是当前视图输出位置，类似于jQuery的用法（做了精简）
View.prototype.render = function (output) {
	// 这里输出视图文档结构（包括子视图）
};

// 注册一个 ready 监听方法，当视图初始化完成后执行
// 如果视图已初始化完成则立即执行
View.prototype.ready = function (callback) {
	if (Utils.isFunction(callback)) {
		if (this.isReady()) {
			callback();
		}
		else if (this.__readyCallbacks) {
			this.__readyCallbacks.push(callback);
		}
		else {
			this.__readyCallbacks = [callback];
		}
	}
};

// 判断当前视图是否已完成
View.prototype.isReady = function () {
	return this.__readyFlag;
};

// 动态方式导入样式和脚本文件，同View.import()方法，区别是在运行时添加
// 注意：尽量在doInit()方法中执行，否则可能无效
View.prototype.import = function (filepath, attributes) {
	var imports = this.__imports;
	if (!ArrayUtils.isArray(imports))
		imports = this.__imports = [];
	var ViewClass = this.__self__;
	ArrayUtils.each(ArrayUtils.toArray(filepath), function (path) {
		addOneImport(ViewClass, imports, path, attributes, true);
	});
};

// 动态引用模块，同View.component()方法，区别是在允许时引用
// 注意：尽量在doInit()方法中执行，否则可能导致前端显示无效（样式和脚本导入有问题）
View.prototype.component = function (dir, pathname) {
	var Module = require(getUseAbsolutePath(this.__self__.__module__, dir, pathname));

	var imports = this.__imports;
	if (!ArrayUtils.isArray(imports))
		imports = this.__imports = [];
	doClassImport.call(this, imports, Module);

	return Module;
};

// ========================================================
// 获取当前视图的上下文信息，即当前VRender实例
View.prototype.getContext = function () {
	if (this.context === CONTEXT_AS_PARENT)
		return null;
	if (this.context instanceof View)
		return this.context.getContext();
	return this.context;
};

// 获取当前用户session对象
View.prototype.getSession = function () {
	if (Utils.isNull(this.session) && this.context) {
		if (this.context === View.contextAsParent)
			return null;
		if (Utils.isFunction(this.context.getSession))
			return this.context.getSession();
	}
	return this.session;
};

View.prototype.isRenderAsApp = function () {
	if (this.context) {
		if (this.context instanceof View)
			return this.context.isRenderAsApp();
		var userState = this.session && this.session.getUAState();
		return userState && userState.isMobile;
	}
	return false;
};

View.prototype.isRenderAsIphone = function () {
	if (this.context) {
		if (this.context instanceof View)
			return this.context.isRenderAsIphone();
		var userState = this.session && this.session.getUAState();
		return userState && userState.isIphone;
	}
	return false;
};

View.prototype.isRenderAsRem = function () {
	if (this.context) {
		if (this.context instanceof View)
			return this.context.isRenderAsRem();
		if (this.isRenderAsApp()) {
			if (Utils.isFunction(this.context.config))
				return Utils.isTrue(this.context.config("useREM"));
		}
	}
	return false;
};

// 获取视图相关的样式定义
View.prototype.getStyleFiles = function (isApp) {
	return getImportFiles.call(this, "style", isApp);
};

// 获取视图相关的脚本定义
View.prototype.getScriptFiles = function (isApp) {
	return getImportFiles.call(this, "script", isApp);
};

View.prototype.getImportFiles = function (type, isApp) {
	return getImportFiles.call(this, type, isApp);
};

// 获取合并压缩后的样式文件
View.prototype.getMergedStyleFiles = function (isApp) {
	var cssFiles = this.getStyleFiles(isApp);
	return getMergedFilesInner.call(this, cssFiles, "style");
};

// 获取合并压缩后的脚本文件
View.prototype.getMergedScriptFiles = function (isApp) {
	var scriptFiles = this.getScriptFiles(isApp);
	return getMergedFilesInner.call(this, scriptFiles, "script");
};

// 获取所有压缩合并之后的样式和脚本文件
View.prototype.getMergedImportFiles = function (isApp) {
	var importFiles = this.getImportFiles("all", isApp); // 获取全部
	return getMergedFilesInner.call(this, importFiles, "all");
};

// ========================================================
// 获取当前视图所嵌套的上级视图
// 
View.prototype.getViewOwner = function () {
	return this.__owner__;
};

// 设置当前视图的嵌套上级视图
View.prototype.setViewOwner = function (parent) {
	if (parent && !(parent instanceof View))
		throw new Error("设置视图的父视图必须是一个视图类(View)");

	var owner = this.__owner__;

	if (owner) {
		if (owner == parent)
			return ;

		var children = owner.__children__;
		for (var i = children.length - 1; i >= 0; i--) {
			if (children[i] === this) {
				children.splice(i, 1);
				break;
			}
		}
	}

	owner = this.__owner__ = parent || null;
	if (owner) {
		if (!owner.__children__)
			owner.__children__ = [];
		owner.__children__.push(this);
	}
};


///////////////////////////////////////////////////////////
// 视图初始化，新建视图的时候被执行，该方法不能被子类覆盖
// 子类的异步过程请在“doInit()”方法中执行
var initialize = function (options) {
	var self = this;
	this.ready(function () {
		PluginManager.initView.call(self);
	});
	this.doInit(function () {
		self.__readyFlag = true;
		ArrayUtils.each(self.__readyCallbacks, function (callback) {
			callback();
		});
		delete self.__readyCallbacks;
	});
};

var addOneImport = function (ViewClass, imports, filepath, attributes, format) {
	if (StringUtils.isBlank(filepath))
		return ;

	if (Path.isAbsolute(filepath)) {
		if (format && !/^\/VRender/.test(filepath))
			filepath = "webroot://" + filepath;
	}
	else if (ViewClass && ViewClass.__module__) {
		if (!/^(webroot|file|http(s)?):\/\//.test(filepath)) {
			var dir = Path.dirname(ViewClass.__module__.filename)
			filepath = Path.resolve(dir, filepath);
		}
	}

	var data = ArrayUtils.find(imports, function (temp) {
		return temp.path === filepath;
	});

	if (data) {
		if (attributes)
			data.attributes = Utils.extend(data.attributes, attributes);
	}
	else
		imports.push({path: filepath, attributes: attributes});
};

var doClassImport = function (imports, ViewClass, pushOnly, type) {
	if (ViewClass.__super__ && ViewClass.__super__.__self__)
		doClassImport.call(this, imports, ViewClass.__super__.__self__, pushOnly, type);
	var add = function (temp) {
		if (pushOnly)
			imports.push(temp);
		else
			addOneImport(ViewClass, imports, temp.path, temp.attributes);
	};
	ArrayUtils.each(ViewClass.__imports, function (temp) {
		add(temp);
	});
	if (ViewClass.__module__) {
		var filename = ViewClass.__module__.filename;
		filename = filename.replace(/\.js$/i, "");
		var exts = (type == "script") ? FILE_EXTS_SCRIPT : (type == "style" ? FILE_EXTS_STYLE : FILE_EXTS);
		ArrayUtils.each(exts, function (ext) {
			var file = filename + ext;
			if (FileSys.existsSync(file))
				add({path: file});
		});
	}
};

// 获取引用视图模块的绝对路径
var getUseAbsolutePath = function (module, dir, pathname) {
	if (StringUtils.isBlank(pathname)) {
		pathname = dir;
		dir = null;
	}
	if (StringUtils.isNotBlank(pathname)) {
		if (!dir && module)
			dir = Path.dirname(module.filename);
		if (dir)
			return Path.resolve(dir, pathname);
		return pathname;
	}
	return false;
};

// 获取当前视图导入的文件集(脚本和样式)
// 包括静态和动态导入的文件，以及继承视图的静态导入文件，以及被嵌套视图的脚本和样式文件
// 返回文件已去重
var getImportFiles = function (type, isApp) {
	var _imports = [];

	ArrayUtils.each(this.__children__, function (child) {
		ArrayUtils.pushAll(_imports, child.getImportFiles(type, isApp));
	});

	doClassImport.call(this, _imports, this.__self__, true, type);
	ArrayUtils.pushAll(_imports, this.__imports);

	var imports = []; // 去重结果集
	ArrayUtils.each(_imports, function (data) {
		var filename = data.path.split("?")[0].toLowerCase();
		if (type != "all") {
			if (type == "script") {
				if (!/\.js$/.test(filename))
					return ;
			}
			else {
				if (!/\.(c|sc|sa)ss$/.test(filename))
					return ;
			}
		}
		if (/js$/.test(filename)) {
			if (isApp) {
				if (/\.p\.js$/.test(filename))
					return ;
			}
			else if (/\.m\.js$/.test(filename))
				return ;
		}
		else {
			if (isApp) {
				if (/\.p\.(c|sc|sa)ss$/.test(filename))
					return ;
			}
			else if (/\.m\.(c|sc|sa)ss$/.test(filename))
				return ;
		}
		var temp = ArrayUtils.findBy(imports, "path", data.path);
		if (temp) {
			if (data.attributes)
				temp.attributes = Utils.extend(temp.attributes, data.attributes);
		}
		else {
			imports.push(data);
		}
	});
	return imports;
};

// 按分组(group)合并和压缩脚本或样式文件，返回分组的压缩文件
// 注：gourp为false时不需要分组，即不与其他文件合并
var getMergedFilesInner = function (srcFiles, type) {
	return FileBuilder.build(this.context, srcFiles, type);
};
