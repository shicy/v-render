// ========================================================
// 系统缓存管理器，默认为先进先出
// @author shicy <shicy85@163.com>
// Create on 2016-10-27
// ========================================================

var Utils = require("../util/Utils");
var DefaultCache = require("./DefaultCache");
var FileCache = require("./FileCache");


var managers = {};

exports.cache_types = [];
exports.cache_types["default"] = DefaultCache;
exports.cache_types["file"] = FileCache;

// 获取或者新建一个缓存管理器，如果已经存在 name 对象缓存器则返回该缓存器，否则新建缓存器并返回
// @param name 缓存器名称
// @param type 缓存器类型，可选：default(默认)、file(文件缓存)
exports.cache = function (name, type, size) {
	if (!name)
		name = "default";
	var manager = managers[name];
	if (!manager) {
		manager = managers[name] = new CacheManager(name, type, size);
	}
	return manager;
};

// 移除相应名称的缓存管理器
exports.remove = function (name) {
	if (!name)
		name = "default";
	if (managers[name]) {
		managers[name].clear();
		managers[name] = null;
		delete managers[name];
	}
};

// 清理缓存，删除缓存对象
exports.clear = function () {
	for (var n in managers) {
		managers[n].clear();
	}
};


///////////////////////////////////////////////////////////
var CacheManager = function (name, type, size) {
	this.name = name;
	this.type = type;

	var CacheClass = exports.cache_types && exports.cache_types[this.name];
	if (!CacheClass)
		CacheClass = DefaultCache;
	this.cache = new CacheClass();

	if (Utils.notNull(size))
		this.size(size);
};

// 获取缓存对象
CacheManager.prototype.get = function (name) {
	if (Utils.isFunction(this.cache.get))
		return this.cache.get(name);
};

// 设置缓存对象，可以指定对象的有效时间
CacheManager.prototype.set = function (name, obj, expires) {
	if (expires) {
		if (typeof expires === "number") {
			expires = new Date(new Date().getTime() + expires);
		}
		if (!(expires instanceof Date))
			expires = null;
		expires = expires && expires.getTime();
	}
	if (Utils.isFunction(this.cache.set))
		this.cache.set(name, obj, expires);
};

// 获取当前缓存大小，参数可以设置缓存大小
CacheManager.prototype.size = function (value) {
	if (Utils.isFunction(this.cache.size))
		return this.cache.size(value);
};

CacheManager.prototype.clear = function () {
	if (Utils.isFunction(this.cache.clear))
		this.cache.clear();
};
