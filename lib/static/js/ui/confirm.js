// ========================================================
// 确认对话框
// @author shicy <shicy85@163.com>
// Create on 2018-07-30
// ========================================================

(function () {
	if (VRender.Component.Confirm)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var Renderer = Component.Render;
	var ConfirmRender = Renderer.confirm;

	///////////////////////////////////////////////////////
	var UIConfirm = window.UIConfirm = Component.Confirm = function (view, options) {
		if (!Component.base.isElement(view))
			return UIConfirm.create(view);

		if (this.init(view, options) !== this)
			return Component.get(view);

		this.open();
	};
	var _UIConfirm = UIConfirm.prototype = new Component.base();

	UIConfirm.find = function (view) {
		return Component.find(view, ".ui-confirm", UIConfirm);
	};

	UIConfirm.create = function (options) {
		return Component.create(options, UIConfirm, ConfirmRender);
	};

	// ====================================================
	_UIConfirm.open = function () {
		doOpen.call(this);
	};

	_UIConfirm.close = function () {
		doClose.call(this);
	};

	_UIConfirm.onSubmit = function (handler) {
		return this;
	};

	_UIConfirm.onCancel = function (handler) {
		return this;
	};

	// ====================================================
	

	// ====================================================
	var doOpen = function () {
		var wrapper = $("body").children(".ui-confirm-wrap");
		if (!wrapper || wrapper.length == 0)
			wrapper = $("<div class='ui-confirm-wrap'></div>").appendTo("body");

		var target = this.$el.appendTo(wrapper);
		
		setTimeout(function () {
			target.addClass("animate-in");
		}, 50);
	};

	var doClose = function () {
		var target = this.$el.addClass("animate-out");
		setTimeout(function () {
			target.removeClass("animate-in").removeClass("animate-out");
			target.remove();
			var wrapper = $("body").children(".ui-tooltip-wrap");
			if (wrapper.children().length == 0)
				wrapper.remove();
		}, 500);
		this.trigger("close");
	};
	

	// ====================================================
	Component.register(".ui-confirm", UIConfirm);

})();