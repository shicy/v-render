// ========================================================
// 前端组件基类
// @author shicy <shicy85@163.com>
// Create on 2016-11-30
// ========================================================

(function () {
	if (typeof VRender === "undefined")
		return ;

	if (VRender.Component.base)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;

	var ComponentBase = function (view) {};
	var _ComponentBase = ComponentBase.prototype = new VRender.EventEmitter();

	_ComponentBase.init = function (view, options) {
		var target = this.$el = $(view);

		if (target.data(Component.bindName))
			return target.data(Component.bindName);
		target.data(Component.bindName, this);

		this.options = options || {};
		doInit(target, this.options);

		return this;
	};

	var doInit = function (target, options) {
		if (Utils.isNotBlank(options.id))
			target.attr("id", options.id);

		if (Utils.isNotBlank(options.name))
			target.attr("name", options.name);

		var cls = options.clsname || options.className || options.clsName || options.cls;
		if (Utils.isNotBlank(cls))
			target.addClass(cls);

		if (Utils.isNotBlank(options.style))
			target.addClass(options.style);

		if (options.hasOwnProperty("disabled")) {
			if (Utils.isTrue(options.disabled))
				target.addClass("disabled").attr("disabled", "disabled");
		}
		else if (options.hasOwnProperty("enabled")) {
			if (!Utils.isTrue(options.enabled))
				target.addClass("disabled").attr("disabled", "disabled");
		}
	};


	///////////////////////////////////////////////////////
	Component.base = ComponentBase;

})();
