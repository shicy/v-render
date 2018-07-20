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

	var EventEmitter = VRender.EventEmitter = function () {};
	var proto = EventEmitter.prototype = new Object();

	// 派发事件
	proto.trigger = function (name, data) {
		var e = (typeof name === "string") ? {type: name} : name;
		if (e && Utils.isNotBlank(e.type) && Utils.isArray(this.events)) {
			var datas = Array.prototype.slice.call(arguments, 1);
			for (var i = this.events.length - 1; i >= 0; i--) {
				var event = this.events[i];
				if (event.name === e.type) {
					e.data = event.data;
					e.preventDefault = function () { e.isPreventDefault = true; };
					event.listener.apply(this, [e].concat(datas));
					delete e.data;
					delete e.preventDefault;
					if (event.once)
						this.events.splice(i, 1);
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
			if (event.name === name) {
				if (Utils.isNotNull(callback))
					return event.listener == callback;
				return true;
			}
		});
		return this;
	};

	// 判断是否注册事件
	proto.hasListen = function (name) {
		return !!Utils.findBy(this.events, "name", name);
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
				this.events.push({name: name, data: data, listener: callback, once: !!once});
			}
		}
	};

})();
