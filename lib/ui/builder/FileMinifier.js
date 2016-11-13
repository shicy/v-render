// ========================================================
// 合并压缩脚本和样式文件
// @author shicy <shicy85@163.com>
// Create on 2016-10-26
// ========================================================

var Crypto = require("crypto");
var Path = require("path");
var FileSys = require("fs");
var CleanCss = require("clean-css");
var UglifyJS = require("uglify-js");
var ArrayUtils = require("../../util/ArrayUtils");
var FileUtils = require("../../util/FileUtils");
var CacheManager = require("../../cache/CacheManager");
var VRender = require("../../v-render");


var FileMinifier = module.exports;

// 合并压缩文件路径缓存，缓存有效期请查看“config.uplifyExpires”配置参数
var file_cache = CacheManager.cache("FileMinifier.file", null, 1000);

///////////////////////////////////////////////////////////
// 合并压缩文件，expires 设置缓存时间，默认永久缓存
FileMinifier.minifier = function (context, files, extname, expires) {
	if (ArrayUtils.isArray(files) && files.length > 0) {
		// 获取文件合并后的新文件名称
		var minifierName = getMinifierFileName(files);
		// 首先从缓存中获取
		var minifierFile = file_cache.get(minifierName);
		if (!minifierFile) {
			// 如果缓存中没有记录，获取文件并加入缓存
			var minifierFile = doFilesMinifier(context, files, minifierName , extname);
			file_cache.set(minifierName, minifierFile, expires);
		}
		return minifierFile;
	}

	return null;
};

// 根据文件名称获取文件绝对路径
FileMinifier.getPath = function (context, fileName) {
	return context.dynamicFilePath + fileName.replace("/VRender", "");
};

///////////////////////////////////////////////////////////
// 合并压缩，返回合并后台的文件相对路径
var doFilesMinifier = function (context, files, minifierName, extname) {
	var minifierDir = context.dynamicFilePath;

	// 相关文件的合并压缩信息
	var minifiedInfo = getFilesMinifiedInfo(minifierDir, files, extname);
	// 获取文件的相对路径
	var minifierFilePath = getMinifierFilePath(minifierName);
	// 获取曾经压缩的文件名称
	var minifiedFilePath = minifierDir + minifierFilePath + "/";
	var minifiedFileName = findMinifiedFileName(minifiedFilePath, minifierName);

	// 如果文件已修改，需要重新合并压缩文件
	if (isMinifierFileModified(minifiedFileName, minifiedInfo.modifyFlag)) {
		if (minifiedFileName)
			FileSys.unlinkSync(minifiedFilePath + minifiedFileName);
		minifiedFileName = minifierName + "-" + minifiedInfo.modifyFlag + "." + extname;
		mergeMinifierToFile(files, minifiedInfo.files, (minifiedFilePath + minifiedFileName));
	}

	// return Path.normalize(minifiedFilePath + minifiedFileName);
	return "/VRender" + minifierFilePath + minifiedFileName;
};

// 获取相关文件的合并压缩信息
var getFilesMinifiedInfo = function (dir, files, extname) {
	var modifyTimes = 0;
	var minifiedFiles = [];
	ArrayUtils.each(files, function (file) {
		var pathname = (typeof file === "string") ? file : (file.hasOwnProperty("path") ? file.path : ("" + file));
		try {
			var lastModifyTime = FileSys.statSync(pathname).mtime.getTime();
			modifyTimes += lastModifyTime;

			// 单个文件压缩
			var minifierName = getMinifierFileName([file]);
			var minifierFilePath = getMinifierFilePath(minifierName);
			// 获取压缩后文件路径名称
			var minifiedFilePath = dir + minifierFilePath + "/";
			var minifiedFileName = findMinifiedFileName(minifiedFilePath, minifierName);

			// 如果文件已修改，重新合并压缩
			if (isMinifierFileModified(minifiedFileName, lastModifyTime)) {
				if (minifiedFileName)
					FileSys.unlinkSync(minifiedFilePath + minifiedFileName);
				minifiedFileName = minifierName + "-" + lastModifyTime + "." + extname;
				saveAsMinifierFile(pathname, (minifiedFilePath + minifiedFileName), extname);
			}

			minifiedFiles.push(minifiedFilePath + minifiedFileName);
		}
		catch (e) {
			VRender.logger.warn("<FileMinifier.getFilesMinifiedInfo>", pathname, e.code);
		}
	});
	return {modifyFlag: modifyTimes, files: minifiedFiles};
};

// 查找某合并压缩文件的实际文件名称
var findMinifiedFileName = function (dir, minifierName) {
	if (FileSys.existsSync(dir)) {
		return ArrayUtils.find(FileSys.readdirSync(dir), function (file) {
			return file.split("-")[0] === minifierName;
		});
	}
	return null;
};

// 判断合并压缩文件是否已修改
var isMinifierFileModified = function (minifiedFileName, lastModifyTime) {
	if (!minifiedFileName)
		return true;
	var fileModifyTime = parseInt(minifiedFileName.split("-")[1].split(".")[0]);
	return fileModifyTime != lastModifyTime;
};

// ========================================================
// 合并文件，将几个压缩过的文件合并到一个文件
var mergeMinifierToFile = function (srcFiles, minifiedFiles, mergeFileName) {
	if (FileSys.existsSync(mergeFileName))
		FileSys.unlinkSync(mergeFileName);
	FileUtils.mkdirsSync(mergeFileName);

	ArrayUtils.each(minifiedFiles, function (minifiedFile) {
		try {
			var filedata = FileSys.readFileSync(minifiedFile);
			FileSys.appendFileSync(mergeFileName, filedata);
		}
		catch (e) {
			VRender.logger.warn("<FileMinifier.mergeMinifierToFile", e);
		}
	});
};

// 压缩文件并保存
var saveAsMinifierFile = function (pathname, minifierFileName, extname) {
	FileUtils.mkdirsSync(minifierFileName);

	var minifyResult = FileSys.readFileSync(pathname, {encoding: "utf-8"});
	if (extname === "css") {
		minifyResult = new CleanCss().minify(minifyResult).styles;
	}
	else if (extname === "js") {
		var minifierName = Path.basename(minifierFileName).split(".")[0];
		minifyResult = UglifyJS.minify(minifyResult, {fromString: true}).code;
		minifyResult = minifyResult.replace("define(function(", ("define('" + minifierName + "',function("));
		minifyResult = minifyResult.replace("define([", ("define('" + minifierName + "',["));
	}

	FileSys.writeFileSync(minifierFileName, minifyResult);
};

// ========================================================
// 获取文件合并后的文件名称，使用MD5压缩算法生成文件名称
var getMinifierFileName = function (files) {
	var pathnames = ArrayUtils.map(files, function (file) {
		if (typeof file === "string")
			return file;
		return file.hasOwnProperty("path") ? file.path : ("" + file);
	}).join(",");
	return Crypto.createHash("md5").update(pathnames).digest("hex").toLowerCase();
};

// 获取合并压缩文件路径（相对）
var getMinifierFilePath = function (minifierName) {
	return "/" + minifierName.substr(0, 3).split("").join("/") + "/";
};
