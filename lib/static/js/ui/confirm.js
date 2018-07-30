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

		this.$el.on("tap", ".closebtn", onCloseBtnHandler.bind(this));
		this.$el.on("tap", ".btnbar .ui-btn", onButtonClickHandler.bind(this));
	};

	_UIConfirm.close = function () {
		doClose.call(this);
	};

	_UIConfirm.onSubmit = function (handler) {
		this.submitHandler = handler;
		return this;
	};

	_UIConfirm.onCancel = function (handler) {
		this.cancelHandler = handler;
		return this;
	};

	// ====================================================
	var onCloseBtnHandler = function (e) {
		doCancel.call(this);
	};

	var onButtonClickHandler = function (e) {
		if ($(e.currentTarget).attr("name") == "ok") {
			doSubmit.call(this);
		}
		else {
			doCancel.call(this);
		}
	};
	

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
			var wrapper = $("body").children(".ui-confirm-wrap");
			if (wrapper.children().length == 0)
				wrapper.remove();
		}, 500);
		this.trigger("close");
	};

	var doSubmit = function () {
		doClose.call(this);
		if (Utils.isFunction(this.submitHandler))
			this.submitHandler();
		this.trigger("submit");
	};

	var doCancel = function () {
		doClose.call(this);
		if (Utils.isFunction(this.cancelHandler))
			this.cancelHandler();
		this.trigger("cancel");
	};
	

	// ====================================================
	Component.register(".ui-confirm", UIConfirm);

})();