// ========================================================
// 字符相关工具类
// @author shicy <shicy85@163.com>
// Create on 2016-08-18
// ========================================================

var Path = require("path");
var FileSys = require("fs");

var FileUtils = module.exports = {};

// 创建层级目录(同步)
FileUtils.mkdirsSync = function (pathname) {
	if (!pathname)
		return ;
	pathname = Path.normalize(pathname);
	if (Path.extname(pathname))
		pathname = Path.dirname(pathname);
	var paths = pathname.split(Path.sep);
	var currentPath = "";
	for (var i = 1, l = paths.length; i < l; i++) {
		currentPath += Path.sep + paths[i];
		if (!FileSys.existsSync(currentPath)) {
			FileSys.mkdirSync(currentPath);
		}
	}
};

// 删除目录(同步)
FileUtils.rmdirSync = function (pathname) {
	if (FileSys.existsSync(pathname)) {
		var files = FileSys.readdirSync(pathname);
		if (files) {
			files.forEach(function (file, index) {
				var path = pathname + "/" + file;
				if (FileSys.statSync(path).isDirectory()) {
					FileUtils.rmdirSync(path);
				}
				else {
					FileSys.unlinkSync(path);
				}
			});
		}
		FileSys.rmdirSync(pathname);
	}
};
