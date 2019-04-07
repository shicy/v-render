// ========================================================
// 脚本、样式等资源文件构建
// 
// 输入：[{path: "原路径", attributes: {group, index, ..}}]
//   其中：path为构建前的原路径，如“/VRender...”，“webroot:///images/..”，“file:///var/..”
// 
// 输出：[{path: "目录路径", uri: "", attributes: {}}]
// 
// @author shicy <shicy85@163.com>
// Create on 2019-04-02
// ========================================================

var Crypto = require("crypto");
var Path = require("path");
var FileSys = require("fs");
var CleanCss = require("clean-css");
var UglifyJS = require("uglify-js");
var Babel = require("@babel/core");
var Sass = require("node-sass");
var Utils = require("../../util/Utils");
var ArrayUtils = require("../../util/ArrayUtils");
var FileUtils = require("../../util/FileUtils");
var CacheManager = require("../../cache/CacheManager");

var FileBuilder = module.exports;

// 合并压缩文件路径缓存，缓存有效期请查看“config.fileCacheExpires”配置参数
var file_cache = CacheManager.cache("FileBuilder.file", null, 2000);

///////////////////////////////////////////////////////////
// 构建脚本和样式
// @param context 当前实例上下文
// @param srcFiles 原生文件列表，如：[{path, attributes: {group, index, ...others}}]
FileBuilder.build = function (context, srcFiles, type) {
	// console.log("build:\n ", type, context.mode, context.base);
	// console.log("buildSourceFiles:\n ", srcFiles);
	var fileGroups = []; // {name: "", type: "js|css", files: [], attributes: {}}
	ArrayUtils.each(srcFiles, function (srcFile, index) {
		var paths = srcFile.path.split("?");
		var filePath = paths[0];
		var fileType = (/\.js$/.test(filePath)) ? "js" : "css";

		var groupName = srcFile.attributes && srcFile.attributes.group;
		if (groupName === false)
			groupName = "_nogroup";
		else if (context.mode === "development") // 开发模式不分组
			groupName = "_dev_" + index;
		else if (!groupName || groupName === true) // 默认分组
			groupName = "_default";
		groupName += /\.js$/.test(filePath) ? "-js" : "-css";

		var group = ArrayUtils.findBy(fileGroups, "name", groupName);
		if (!group) {
			group = {name: groupName, type: fileType, files: [], attributes: {}};
			fileGroups.push(group);
		}

		var file = ArrayUtils.findBy(fileGroups.files, "path", filePath);
		if (!file) {
			group.files.push({path: filePath, search: paths[1]});
		}

		if (!Utils.isEmpty(srcFile.attributes)) {
			group.attributes = Utils.extend(group.attributes, srcFile.attributes);
		}
	});
	// console.log("build:\n %j", fileGroups);

	var results = doFilesBuild(context, fileGroups) || [];
	// console.log("results\n  %j", results);
	// console.log("=========================================================");
	return results;
};

// ========================================================
// 按文件组构建文件
// fileGroups: [{group, type, files, attributes}]
var doFilesBuild = function (context, fileGroups) {
	var results = [];

	ArrayUtils.each(fileGroups, function (group) {
		if (/^_nogroup/.test(group.name)) {
			ArrayUtils.each(group.files, function (file) {
				var uri = file.path + (file.search ? ("?" + file.search) : "");
				results.push({type: group.type, uri: uri, attributes: group.attributes});
			});
		}
		else {
			var filePaths = ArrayUtils.map(group.files, function (file) {
				return getFileAbsolutePath(context, file.path);
			});

			// 根据原文件路径获取一个全局唯一的目标文件编号
			var fileId = getFileId(context, filePaths.join(","));
			// console.log("doFilesBuild:\n ", fileId);

			// 通过缓存获取URI，开发模式没有缓存
			var targetFileUri = file_cache.get(fileId);
			if (!targetFileUri) {
				// 构建并获取文件URI
				targetFileUri = buildInner(context, filePaths, fileId, group.type);
				// 设置缓存
				if (context.mode !== "development") {
					var expires = parseInt(context.config("fileCacheExpires")) || 0;
					file_cache.set(fileId, targetFileUri, expires);
				}
			}

			results.push({type: group.type, uri: targetFileUri, attributes: group.attributes});
		}
	});

	results.sort(function (a, b) {
		if (a.type != b.type)
			return a.type == "js" ? 1 : -1;
		var index1 = parseInt(a.attributes.index);
		var index2 = parseInt(b.attributes.index);
		if (isNaN(index1) && isNaN(index2))
			return 0;
		if (isNaN(index1))
			return 1;
		if (isNaN(index2))
			return -1;
		return index1 - index2;
	});

	ArrayUtils.each(results, function (temp) {
		delete temp.attributes.index;
		delete temp.attributes.group;
	});

	return results;
};

// 构建文件，生成目标文件，返回目标文件的URI
var buildInner = function (context, filePaths, fileId, fileType) {
	var filesValue = 0; // 文件组更新标志
	var buildFiles = []; // 所有单个构建后的目标文件

	ArrayUtils.each(filePaths, function (file) {
		var _fileId = getFileId(null, file);
		var _fileValue = getFileValue(file);
		var _buildFile = getBuildPathName(context, _fileId, _fileValue, fileType);
		// console.log("buildInner:\n ", _fileId, _fileValue, _buildFile);

		filesValue += _fileValue;
		buildFiles.push(_buildFile);

		if (checkFile(context, _fileId, _fileValue)) {
			buildFile(context, file, _fileId, fileType, _buildFile);
		}
	});

	var filesBuildPathName = getBuildPathName(context, fileId, filesValue, fileType);
	// console.log("buildInner:\n ", fileId, filesValue, filesBuildPathName);
	if (checkFile(context, fileId, filesValue)) {
		mergeFiles(context, buildFiles, filesBuildPathName);
	}

	return "/VRender" + getFileUri(context, fileId, filesValue, fileType);
};

// 检查文件是否修改，如果已修改则删除历史文件，并返回true
// 没有历史文件也会返回true
var checkFile = function (context, fileId, fileValue) {
	// console.log("checkFile:\n ", fileId, fileValue);
	if (/^\//.test(fileId)) // 开发文件
		return true;
	var fileBuildPath = getFileBuildPath(context, fileId);
	if (FileSys.existsSync(fileBuildPath)) {
		var file = ArrayUtils.find(FileSys.readdirSync(fileBuildPath), function (file) {
			return file.split("-")[0] === fileId;
		});
		if (file) {
			// console.log("checkFile:\n has file ->", file);
			var mode = context.mode;
			if (mode !== "development") {
				var values = file.split("-")[1].split(".");
				if (fileValue == values[0]) {
					// if ((mode === "production" && values[1] === "1") || mode === values[1])
						return false;
				}
			}
			// console.log("checkFile:\n file delete ->", file);
			FileSys.unlinkSync(Path.resolve(fileBuildPath, file));
		}
	}
	return true;
};

var buildFile = function (context, filePath, fileId, fileType, targetFile) {
	// console.log("buildFile:\n ", filePath, fileType, targetFile);

	var buildResult = null;
	if (fileType === "js")
		buildResult = buildAsJsFile(context, filePath, fileId);
	else /*if (fileType === "css")*/
		buildResult = buildAsCssFile(context, filePath, fileId);

	FileUtils.mkdirsSync(targetFile);
	FileSys.writeFileSync(targetFile, buildResult);
};

var buildAsJsFile = function (context, filePath, fileId) {
	var isDev = context.mode === "development";

	var buildResult = FileSys.readFileSync(filePath, {encoding: "utf-8"});

	if (!!context.config("babel")) {
		// ES6语法转换，新增类方法需要 polyfill
		buildResult = Babel.transformSync(buildResult, {configFile: false, babelrc: false});
		buildResult = buildResult.code;
	}

	if (!/(^|\s)define(\s*)\(/.test(buildResult)) {
		buildResult = "define('" + fileId + "',function($,VR,Utils){\n" + buildResult+ "\n});";
	}

	var options = {toplevel: true};
	if (isDev) {
		options.sourceMap = {};
		options.sourceMap.includeSources = true;
	}
	buildResult = UglifyJS.minify(buildResult, options);

	var code = buildResult.code;
	if (/^define\(function\(/.test(code)) {
		code = code.replace(/^define\(function\(/, ("define('" + fileId + "',function("));
	}
	else if (/^define\(\[/.test(code)) {
		code = code.replace(/^define\(\[/, ("define('" + fileId + "',["));
	}
	else if (!/^define\(/.test(code)) {
		code = "define('" + fileId + "',function($,VR,Utils){" + code + "});";
	}

	var map = buildResult.map;
	if (map) {
		map = JSON.parse(map);
		map.sources[0] = Path.basename(filePath);
		map = JSON.stringify(map);
		map = new Buffer(map).toString("base64");
		code += "\n//# sourceMappingURL=data:application/json;charset=utf-8;base64," + map;
	}

	// console.log("buildAsJsFile:\n code: %j\n map: %j", code, map);
	return code;
};

var buildAsCssFile = function (context, filePath, fileId) {
	var isDev = context.mode === "development";

	var buildResult = FileSys.readFileSync(filePath, {encoding: "utf-8"});

	if (/\.(scss|sass|less)$/.test(filePath)) {
		buildResult = Sass.renderSync({data: buildResult, outputStyle: "compressed", sourceMap: !!isDev});
		buildResult = buildResult.css;
	}
	else {
		buildResult = new CleanCss().minify(buildResult);
		buildResult = buildResult.styles;
		buildResult = buildResult.replace(/\@charset\s\"utf-8\";/ig, "");
	}

	// console.log("buildAsCssFile:\n code: %j", buildResult);
	return buildResult;
};

var mergeFiles = function (context, filePaths, targetFile) {
	// console.log("mergeFiles:\n ", filePaths.join(","), targetFile);
	if (FileSys.existsSync(targetFile))
		FileSys.unlinkSync(targetFile);
	FileUtils.mkdirsSync(targetFile);
	ArrayUtils.each(filePaths, function (file) {
		var data = FileSys.readFileSync(file);
		if (data)
			FileSys.appendFileSync(targetFile, data);
	});
};

// ========================================================
// 获取文件绝对路径
var getFileAbsolutePath = function (context, path) {
	if (Path.isAbsolute(path)) {
		if (/^\/VRender\./.test(path)) // vrender 样式和脚本文件
			return Path.resolve(context.staticFilePath, path.substr(1));
		if (/^\/VRender\//.test(path)) // vrender 静态目录子目录下的文件
			return Path.resolve(context.staticFilePath, path.substr(9));
	}
	else if (/^webroot:\/\//.test(path)) { // WebContent 下的文件
		return context.getContextPath(path.substr(11));
	}
	else if (/^file:\/\//.test(path)) { // 由程序指定的系统中的任意文件
		return Path.resolve(path.substr(7));
	}
	return path;
};

var getFileId = function (context, filePaths) {
	// 开发模式文件不合并，并且保留原始文件目录结构
	if (context && context.mode === "development") {
		var fileId = Path.relative(context.base, filePaths);
		fileId = fileId.replace(/^(\.\.\/)*/g, "/");
		fileId = fileId.replace(/\.(scss|sass|less)$/, ".css");
		return fileId;
	}
	return Crypto.createHash("md5").update(filePaths).digest("hex").toLowerCase();
};

var getFileValue = function (filePath) {
	return FileSys.statSync(filePath).mtime.getTime();
};

var getFileUri = function (context, fileId, fileValue, fileType) {
	if (/^\//.test(fileId))
		return fileId;
	var uri = "/" + fileId.substr(0, 3).split("").join("/") + "/";
	uri += fileId + "-" + fileValue;
	// uri += "." + (context.mode === "production" ? 1 : (context.mode === "development" ? 0 : context.mode));
	uri += "." + fileType;
	return uri;
};

var getFileBuildPath = function (context, fileId) {
	if (/^\//.test(fileId)) {
		fileId = Path.dirname(fileId);
	}
	else {
		fileId = "/" + fileId.substr(0, 3).split("").join("/") + "/";
	}
	return context.dynamicFilePath + fileId;
};

var getBuildPathName = function (context, fileId, fileValue, fileType) {
	return context.dynamicFilePath + getFileUri(context, fileId, fileValue, fileType);
};
