// ========================================================
// 事件收发对象，实现对象的"trigger()", "on()", "off()"功能
// @author shicy <shicy85@163.com>
// Create on 2016-11-16
// ========================================================

(function () {
	if (typeof VRender === "undefine")
		return ;

	if (VRender.EventEmitter)
		return ;

	var Utils = VRender.Utils;

	var EventEmitter = VRender.EventEmitter = function () {};

	// 派发事件
	EventEmitter.prototype.trigger = function (name, data) {
		var self = this;
		var datas = [];
		for (var i = 1, l = arguments.length; i < l; i++) {
			datas.push(arguments[i]);
		}
		Utils.each(this.events, function (event) {
			if (event.name === name) {
				var _data = [{type: name, data: event.data}].concat(datas);
				event.listener.apply(self, _data);
			}
		});
		Utils.removeItems(this.events, function (event) {
			return event.once && event.name === name;
		});
		return this;
	};

	// 注册事件
	EventEmitter.prototype.on = function (name, data, callback) {
		if ((typeof name === "string") && Utils.isNotBlank(name)) {
			if (Utils.isFunction(data) && !Utils.isFunction(callback)) {
				callback = data;
				data = null;
			}
			if (Utils.isFunction(callback)) {
				if (!Utils.isArray(this.events))
					this.events = [];
				this.events.push({name: name, data: data, listener: callback});
			}
		}
		return this;
	};

	// 注册一次性事件
	EventEmitter.prototype.one = function (name, data, callback) {
		if ((typeof name === "string") && Utils.isNotBlank(name)) {
			if (Utils.isFunction(data) && !Utils.isFunction(callback)) {
				callback = data;
				data = null;
			}
			if (Utils.isFunction(callback)) {
				if (!Utils.isArray(this.events))
					this.events = [];
				this.events.push({name: name, data: data, listener: callback, once: true});
			}
		}
		return this;
	};

	// 删除事件
	EventEmitter.prototype.off = function (name, callback) {
		Utils.removeItems(this.events, function (event) {
			if (event.name === name) {
				if (Utils.isNotNull(callback))
					return event.listener == callback;
				return true;
			}
		});
		return this;
	};

	// 判断是否注册事件
	EventEmitter.prototype.hasListen = function (name) {
		var event = Utils.find(this.events, function (temp) {
			return temp.name === name;
		});
		return !!event;
	};

})();
