// ========================================================
// 事件收发对象，实现对象的"trigger()", "on()", "off()"功能
// @author shicy <shicy85@163.com>
// Create on 2016-11-16
// ========================================================

(function () {
	if (typeof VRender === "undefined")
		return ;

	if (VRender.EventEmitter)
		return ;

	var Utils = VRender.Utils;
	var uuid = 1;

	var EventEmitter = VRender.EventEmitter = function () {};
	var proto = EventEmitter.prototype = new Object();

	// 派发事件
	proto.trigger = function (name, data) {
		var e = (typeof name === "string") ? {type: name} : name;
		if (e && Utils.isNotBlank(e.type) && Utils.isArray(this.events)) {
			var datas = Array.prototype.slice.call(arguments, 1);
			var events = [].concat(this.events); // 在事件中也会动态的注册、删除事件
			for (var i = 0; i < events.length; i++) {
				var event = events[i];
				if (event && (event.name == e.type || event.fullName == e.type)) {
					// 需要检查一下事件是否被删除
					if (Utils.indexBy(this.events, "uuid", event.uuid) >= 0) {
						e.data = event.data;
						e.preventDefault = function () { e.isPreventDefault = true; };
						event.listener.apply(this, [e].concat(datas));
						delete e.data;
						delete e.preventDefault;
						if (event.once)
							Utils.removeBy(this.events, "uuid", event.uuid);
					}
				}
			}
		}
		return this;
	};

	// 注册事件
	proto.on = function (name, data, callback) {
		addEvent.call(this, false, name, data, callback);
		return this;
	};

	// 注册一次性事件
	proto.one = function (name, data, callback) {
		addEvent.call(this, true, name, data, callback);
		return this;
	};

	// 删除事件
	proto.off = function (name, callback) {
		Utils.remove(this.events, function (event) {
			if (event.name == name || event.fullName == name) {
				if (Utils.isNotNull(callback))
					return event.listener == callback;
				return true;
			}
		});
		return this;
	};

	// 判断是否注册事件
	proto.hasListen = function (name) {
		return Utils.index(this.events, function (event) {
			return event.name == name || event.fullName == name;
		}) >= 0;
	};

	///////////////////////////////////////////////////////
	var addEvent = function (once, name, data, callback) {
		if ((typeof name == "string") && Utils.isNotBlank(name)) {
			if (Utils.isFunction(data) && !Utils.isFunction(callback)) {
				callback = data;
				data = null;
			}
			if (Utils.isFunction(callback)) {
				if (!Utils.isArray(this.events))
					this.events = [];
				var names = /\./.test(name) ? name.split(".") : [name];
				this.events.push({
					uuid: uuid++,
					name: names.shift(),
					namespace: names.join("."),
					fullName: name,
					data: data,
					listener: callback,
					once: !!once
				});
			}
		}
	};

})();
