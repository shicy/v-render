// ========================================================
// 组件视图基础类，实现了视图的属性、功能、及扩展等机制。
// 一个视图通常包含网页、样式和脚本，同时视图也可以包含其他视图。
// 由于现实中存在大量的异步过程，视图分为2个部分：初始化和渲染。
// 在初始化过程可以用来准备数据，比如读取/存储数据；而渲染过程则将最终结果返回给客户端。
// 其中初始化可以是一个异步过程，而渲染则必须是同步的，初始化完成必须执行响应的ready()方法。
// 
// 视图的“ready”机制
// 由于视图可以被继承和嵌套，同时视图存在异步性，为保证多视图共同参与设计页面，引入了“ready”机制。
// 要求每个视图定义一个准备完成标志(readyCode，即待渲染标志)，在视图准备完成可以进行渲染时执行ready(readyCode)方法。
// 具有继承关系的父子视图不能使用相同的readyCode，使用ready(function)方法注册视图“ready”监听器，仅当视图的所有父视图完成时，监听器被执行。
// 注：没有异步过程的视图不需要定义readyCode，以及不需要执行ready()方法。
// 
// @author shicy <shicy85@163.com>
// Create on 2016-10-10
// ========================================================

var Path = require("path");
var FileSys = require("fs");
var Utils = require("../util/Utils");
var ArrayUtils = require("../util/ArrayUtils");
var StringUtils = require("../util/StringUtils");
var FileMinifier = require("./builder/FileMinifier");


///////////////////////////////////////////////////////////
var View = module.exports = function (context, options, session) {
	if (context === View.CONTEXT_AS_PARENT)
		return ;

	this.context = context;
	this.options = Utils.extend({}, options); // 视图内部 Options 与外部隔离
	this.session = session || this.options._session || this.options.session;

	this.initialize(this.options);

	if (context instanceof View)
		this.setViewOwner(context);
};
View.prototype = new Object();

// 标志视图将作为父类创建，此时创建视图的一些初始化过程忽略
View.CONTEXT_AS_PARENT = "contextAsParent";

// 视图扩展，通过该方法创建子视图，子视图拥有当前视图及以上级视图的属性和方法，
// @param module 子视图所在的module对象（由NodeJS提供）
// @param props 扩展或者覆盖父类属性和方法
View.extend = function (module, props) {
	if (!props) {
		props = module;
		module = null;
	}

	var parent = this;
	var child = function () {
		parent.apply(this, arguments);
	};
	child.prototype = new parent(View.CONTEXT_AS_PARENT);

	for (var n in View) {
		child[n] = View[n];
	}

	for (var n in props) {
		var value = props[n];
		if (n === "readyCode")
			child.prototype[n] = ArrayUtils.toArray(child.prototype[n]).concat(value || []);
		else if (n === "initialize")
			continue; // 视图创建初始化方法不可覆盖，请用“doInit()”方法
		else
			child.prototype[n] = value;
	}

	child.__super__ = parent.prototype; // 相当于父类，可以通过该对象调用父类的方法
	child.prototype.__self__ = child; // 相当于本类构造方法

	if (module) {
		child.__module__ = module; // NodeJS的模块信息
		module.exports = child;
	}

	return child;
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
View.use = function (dir, pathname) {
	var Module = require(getUseAbsolutePath(this.__module__, dir, pathname));

	var imports = this.__imports;
	if (!ArrayUtils.isArray(imports))
		imports = this.__imports = [];
	doClassImport.call(this, imports, Module);

	return Module;
};


///////////////////////////////////////////////////////////
// 视图的“ready”编码，每一个异步的视图需要有“readyCode”，子类不能与父类相同
View.prototype.readyCode = "VRender.View";

// 视图初始化，新建视图的时候被执行，该方法不能被子类覆盖
// 子类的异步过程请在“doInit()”方法中执行
View.prototype.initialize = function (options) {
	this.__readyCode = [].concat(this.readyCode); // 防止修改原始定义
	this.doInit();
};

// 视图初始化，供子类实现，子类异步过程需要在该方法中实现，需要做异步处理的视图必须要有“readyCode”
// 仅当所有异步过程完成后，调用“ready(readyCode)”方法视图才能生效
View.prototype.doInit = function () {
	this.ready("VRender.View");
};

// 构建视图，生成视图网页代码
// 注意：异步在该方法内不可用，方法完成后即返回客户端了，因此异步无效，异步过程请在doInit()方法中执行
// @param output 是当前视图输出位置，类似于jQuery的用法（做了精简）
View.prototype.render = function (output) {
	// 这里输出视图文档结构（包括子视图）
};

// 使用方法一：ready(readyCode)标记该视图已准备完成，可以进行渲染了。
// 使用方法二：ready(function)注册ready监听方法，当前视图准备完成时执行回调方法
View.prototype.ready = function (type, callback) {
	if (Utils.isFunction(type)) {
		callback = type;
		type = null;
	}

	if (Utils.isFunction(callback)) {
		if (this.isready())
			callback();
		else if (this.__readyCallbacks)
			this.__readyCallbacks.push(callback);
		else
			this.__readyCallbacks = [callback];
	}

	if (StringUtils.isNotBlank(type)) {
		for (var i = this.__readyCode.length; i >= 0; i--) {
			if (this.__readyCode[i] == type)
				this.__readyCode.splice(i, 1);
		}
		if (this.__readyCode.length === 0) {
			this.view_ready_flag = true;
			ArrayUtils.each(this.__readyCallbacks, function (callback) {
				callback();
			});
			this.__readyCallbacks = null;
		}
	}
};

// 多视图全部准备完成后执行回调方法
View.prototype.allReady = function (views, callback) {
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

// 判断当前视图是否已完成
View.prototype.isready = function () {
	return this.view_ready_flag;
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

// 动态引用模块，同View.use()方法，区别是在允许时引用
// 注意：尽量在doInit()方法中执行，否则可能导致前端显示无效（样式和脚本导入有问题）
View.prototype.use = function (dir, pathname) {
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
	if (this.context === View.CONTEXT_AS_PARENT)
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

// 获取视图相关的样式定义
View.prototype.getStyleFiles = function () {
	return getImportFiles.call(this, ".css");
};

// 获取视图相关的脚本定义
View.prototype.getScriptFiles = function () {
	return getImportFiles.call(this, ".js");
};

View.prototype.getImportFiles = function (type) {
	return getImportFiles.call(this, type);
};

// 获取合并压缩后的样式文件
View.prototype.getMergedStyleFiles = function () {
	var cssFiles = this.getStyleFiles();
	return getMergedFilesInner.call(this, cssFiles, "css");
};

// 获取合并压缩后的脚本文件
View.prototype.getMergedScriptFiles = function () {
	var scriptFiles = this.getScriptFiles();
	return getMergedFilesInner.call(this, scriptFiles, "js");
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

	if (this.__owner__) {
		var children = this.__owner__.__children__;
		for (var i = children.length - 1; i >= 0; i--) {
			if (children[i] === this) {
				children.splice(i, 1);
				break;
			}
		}
	}

	this.__owner__ = parent || null;
	if (this.__owner__) {
		if (!this.__owner__.__children__)
			this.__owner__.__children__ = [];
		this.__owner__.__children__.push(this);
	}
};


///////////////////////////////////////////////////////////
var addOneImport = function (ViewClass, imports, filepath, attributes, format) {
	if (StringUtils.isBlank(filepath))
		return ;

	if (Path.isAbsolute(filepath)) {
		if (format && !/^\/VRender/.test(filepath))
			filepath = "[webroot]" + filepath;
	}
	else if (ViewClass && ViewClass.__module__) {
		if (!/^\[webroot\]/.test(filepath)) {
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

var doClassImport = function (imports, ViewClass, pushOnly) {
	if (ViewClass.__super__ && ViewClass.__super__.__self__)
		doClassImport.call(this, imports, ViewClass.__super__.__self__, pushOnly);
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
		var jsFilename = filename.replace(/\.js$/, ".front.js");
		if (FileSys.existsSync(jsFilename))
			add({path: jsFilename});
		var cssFilename = filename.replace(/\.js$/, ".css");
		if (FileSys.existsSync(cssFilename))
			add({path: cssFilename});
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
var getImportFiles = function (type) {
	var _imports = [];

	ArrayUtils.each(this.__children__, function (child) {
		ArrayUtils.pushAll(_imports, child.getImportFiles(type));
	});

	doClassImport.call(this, _imports, this.__self__, true);
	ArrayUtils.pushAll(_imports, this.__imports);

	var imports = []; // 去重结果集
	ArrayUtils.each(_imports, function (data) {
		if (type === Path.extname(data.path.split("?")[0]).toLowerCase()) {
			var temp = ArrayUtils.find(imports, function (tmp) {
				return tmp.path === data.path;
			});
			if (temp) {
				if (data.attributes)
					temp.attributes = Utils.extend(temp.attributes, data.attributes);
			}
			else
				imports.push(data);
		}
	});
	return imports;
};

// 按分组(group)合并和压缩脚本或样式文件，返回分组的压缩文件
// 注：gourp为false时不需要分组，即不与其他文件合并
var getMergedFilesInner = function (srcFiles, type) {
	var context = this.getContext();
	if (Utils.isTrue(context.config("uglify"))) {
		var results = [];

		var groups = []; // 合并分组
		ArrayUtils.each(srcFiles, function (file) {
			var path = file.path;
			var grp = file.attributes && file.attributes.group;
			if (grp === false) { // 不合并，不压缩
				var attributes = Utils.extend({}, file.attributes);
				results.push({path: getSrcFileAbsolutePath(context, path),
					attributes: attributes, uri: getSrcFileURI(context, path)});
			}
			else {
				grp = (!grp || grp === true) ? "default" : grp;
				var temp = groups[grp] = (groups[grp] || {files: [], attributes: {}});
				temp.files.push({path: getSrcFileAbsolutePath(context, path), uri: getSrcFileURI(context, path)});
				temp.attributes = Utils.extend(temp.attributes, file.attributes);
			}
		});

		var expires = parseInt(context.config("uplifyExpires")) || 0;
		for (var grp in groups) {
			var mergeFiles = groups[grp];
			var minifierFile = FileMinifier.minifier(context, mergeFiles.files, type, expires);
			if (minifierFile) {
				var minifierFilePath = FileMinifier.getPath(context, minifierFile);
				results.push({path: minifierFilePath, attributes: mergeFiles.attributes, uri: minifierFile});
			}
		}
		
		results.sort(function (o1, o2) {
			var index1 = parseInt(o1.attributes.index);
			var index2 = parseInt(o2.attributes.index);
			if (isNaN(index1) && isNaN(index2))
				return 0;
			else if (isNaN(index1))
				return 1;
			else if (isNaN(index2))
				return -1;
			return index1 - index2;
		});

		ArrayUtils.each(results, function (temp) {
			delete temp.attributes.group;
			delete temp.attributes.index;
		});

		return results;
	}
	else {
		return Utils.map(srcFiles, function (file) {
			return {path: getSrcFileAbsolutePath(context, file.path), 
				attributes: file.attributes, uri: getSrcFileURI(context, file.path)};
		});
	}
};

// 获取前端脚本、样式文件的绝对路径
var getSrcFileAbsolutePath = function (context, path) {
	if (Path.isAbsolute(path)) {
		if (/^\/VRender\./.test(path))
			return Path.resolve(context.staticFilePath, path.substr(1));
		if (/^\/VRender\//.test(path))
			return Path.resolve(context.staticFilePath, path.substr(9));
		return path;
	}
	if (/^\[webroot\]/.test(path))
		return context.getContextPath(path.substr(10));
	return path;
};

var getSrcFileURI = function (context, path) {
	return /^\[webroot\]/.test(path) ? path.substr(9) : path;
};
