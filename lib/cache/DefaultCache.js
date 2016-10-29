// ========================================================
// 默认缓存对象，先进先出
// @author shicy <shicy85@163.com>
// Create on 2016-10-27
// ========================================================

var Utils = require("../util/Utils");
var ArrayUtils = require("../util/ArrayUtils");


var DefaultCache = module.exports = function () {
	this.max_size = 10;
	this.items = [];
};

DefaultCache.prototype.clear = function () {
	this.items = [];
};

DefaultCache.prototype.get = function (name) {
	var item = ArrayUtils.find(this.items, function (tmp) {
		return tmp.key === name;
	});
	if (item) {
		if (item.expires && item.expires < new Date().getTime()) {
			this.items.splice(this.items.indexOf(item), 1);
			item = null;
		}
	}
	return item && item.value;
};

DefaultCache.prototype.set = function (name, obj, expires) {
	ArrayUtils.remove(this.items, function (tmp) {
		return tmp.key === name;
	});
	if (Utils.notNull(obj)) {
		this.items.push({key: name, value: obj, expires: expires});
		this.gg();
	}
};

DefaultCache.prototype.size = function (value) {
	value = parseInt(value) || 0;
	if (value > 0)
		this.max_size = value;
	this.gg();
	return this.items.length;
};

// 回收
DefaultCache.prototype.gg = function () {
	while (this.items.length > this.max_size) {
		this.items.shift();
	}
};
