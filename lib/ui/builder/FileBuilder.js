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

var Utils = require("../../util/Utils");
var ArrayUtils = require("../../util/ArrayUtils");

var FileBuilder = module.exports;

///////////////////////////////////////////////////////////
// 构建脚本和样式
// @param context 当前实例上下文
// @param srcFiles 原生文件列表，如：[{path, attributes: {group, index, ...others}}]
FileBuilder.build = function (context, srcFiles, type) {
	// console.log("1111111 >>", type, context.config("mode"), srcFiles);
	var jsFiles = [], cssFiles = []; // {group: "", files: [], attributes: {}}
	ArrayUtils.each(srcFiles, function (srcFile) {
		var filePath = srcFile.path.split("?")[0];
		var groups = (/\.js$/.test(filePath)) ? jsFiles : cssFiles;

		var groupName = srcFile.attributes && srcFile.attributes.group;
		if (groupName === false)
			groupName = "_nogroup";
		else if (!groupName || groupName === true)
			groupName = "_default";

		var group = ArrayUtils.findBy(groups, "group", groupName);
		if (!group) {
			group = {group: groupName, files: [], attributes: {}};
			groups.push(group);
		}

		if (group.files.indexOf(filePath) < 0) {
			group.files.push(filePath);
		}

		if (srcFile.attributes) {
			group.attributes = Utils.extend(group.attributes, srcFile.attributes);
		}
	});
	console.log("2222 >>", jsFiles, cssFiles);
	
	var results = [];
	if (jsFiles.length > 0) {
		jsFiles = buildJsFiles(context, jsFiles);
		if (jsFiles && jsFiles.length > 0)
			results = results.concat(jsFiles);
	}
	if (cssFiles.length > 0) {
		cssFiles = buildCssFiles(context, cssFiles);
		if (cssFiles && cssFiles.length > 0)
			results = results.concat(cssFiles);
	}
	console.log(">>>>>>>", results);
	console.log("=========================================================");
	return jsFiles;
};

// ========================================================
var buildJsFiles = function (context, jsFiles) {

};

var buildCssFiles = function (context, cssFiles) {

};
