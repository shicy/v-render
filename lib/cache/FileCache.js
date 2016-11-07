// ========================================================
// 文件缓存对象，先进先出，如果文件修改了自动失效
// @author shicy <shicy85@163.com>
// Create on 2016-10-27
// ========================================================

var FileSys = require("fs");
var VRender = require("../v-render");
var ArrayUtils = require("../util/ArrayUtils");


var FileCache = module.exports = function () {
	this.max_size = 50;
	this.items = [];
};

FileCache.prototype.clear = function () {
	this.items = [];
};

FileCache.prototype.get = function (name) {
	var item = ArrayUtils.find(this.items, function (tmp) {
		return tmp.key === name;
	});
	if (item) {
		var invalid = !!item.expires ? (item.expires < new Date().getTime()) : false;
		if (!invalid) {
			try {
				var stat = FileSys.statSync(name);
				invalid = (stat.mtime.getTime() !== item.filetime);
			}
			catch (e) {
				return null;
			}
		}
		if (invalid) {
			ArrayUtils.remove(this.items, function (tmp) {
				return tmp.key === name;
			});
			item = null;
		}
	}
	return item && item.data;
};

FileCache.prototype.set = function (name, obj, expires) {
	ArrayUtils.remove(this.items, function (tmp) {
		return tmp.key === name;
	});
	try {
		var stat = FileSys.statSync(name);
		var lastModified = stat.mtime.getTime();
		var filedata = obj || FileSys.readFileSync(name, "utf-8");
		this.items.push({key: name, data: filedata, filetime: lastModified, expires: expires});
		this.gg();
	}
	catch (e) {
		VRender.logger.warn("<CacheManager.FileCache.set>", e);
	}
};

FileCache.prototype.size = function (value) {
	value = parseInt(value) || 0;
	if (value > 0)
		this.max_size = value;
	this.gg();
	return this.items.length;
};

FileCache.prototype.gg = function () {
	while (this.items.length > this.max_size) {
		this.items.shift();
	}
};
