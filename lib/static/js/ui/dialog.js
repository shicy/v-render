// ========================================================
// 对话框
// @author shicy <shicy85@163.com>
// Create on 2017-01-11
// ========================================================

(function () {
	if (VRender.Component.Dialog)
		return ;

	var Utils = VRender.Utils;
	var Component = VRender.Component;
	var DialogRenderer = Component.Render.dialog;

	var openedDialogs = [];

	///////////////////////////////////////////////////////
	var UIDialog = window.UIDialog = Component.Dialog = function (view, options) {
		if (this.init(view, options) !== this)
			return Component.get(view);

		// if (this.options.module)
		// 	this.load(this.options.module);

		// this.$el.find(".dialog-view").css("maxHeight", ($(window).height() - 50));

		// var self = this;
		// this.$el.tap(".dialog-view > header > .closebtn", function (e) { closeBtnHandler.call(self, e); });
		// this.$el.tap(".dialog-view > footer .ui-btn", function (e) { buttonClickHandler.call(self, e); });
		
		// if (this.$el.parent().is(".ui-dialog-wrap")) {
		// 	$(window).on("resize", function () {
		// 		if (!windowResizeHandler.call(self))
		// 			$(window).off("resize", arguments.callee);
		// 	});
		// }
	};
	var _UIDialog = UIDialog.prototype = new Component.base();

	UIDialog.find = function (view) {
		return Component.find(view, ".ui-dialog", UIDialog);
	};

	UIDialog.create = function (options) {
		options = options || {};
		if (!options.target) {
			var target = $("body").children(".ui-dialog-wrap");
			if (!(target && target.length > 0))
				target = $("<div class='ui-dialog-wrap'></div>").appendTo($("body"));
			options.target = target;
		}
		return Component.create(options, UIDialog, DialogRenderer);
	};

	// UIDialog.close = function (view) {
	// 	if (!view.is(".ui-dialog"))
	// 		view = Utils.parentUntil(view, ".ui-dialog");
	// 	if (view && view.length > 0) {
	// 		var dialog = Component.get(view);
	// 		if (dialog && (dialog instanceof UIDialog))
	// 			dialog.close();
	// 	}
	// };

	// ====================================================
	_UIDialog.setTitle = function (value) {
		value = Utils.isBlank(value) ? "&nbsp;" : value;
		this.$el.find(".dialog-view > header > .title").html(value);
	};

	_UIDialog.setContent = function (view) {
		DialogRenderer.renderContentView.call(this, $, this.$el, view);
	};

	_UIDialog.setButtons = function (buttons) {
		DialogRenderer.renderFootButtons.call(this, $, this.$el, buttons);
	};

	_UIDialog.open = function () {
		if (this.isOpen())
			return ;
		var body = $("body").addClass("ui-scrollless");
		if (body.children(".ui-dialog-mask").length == 0)
			body.append("<div class='ui-dialog-mask'></div>");
		this.$el.css("display", "").addClass("show-dialog");
		openedDialogs.push(this);
	};

	_UIDialog.close = function () {
		// var wrapper = this.$el.parent();
		// this.$el.remove();
		// if (wrapper.is(".ui-dialog-wrap")) {
		// 	if (wrapper.children().length === 0) {
		// 		wrapper.remove();
		// 		$("body").removeClass("ui-scrollless");
		// 	}
		// }
		// this.trigger("closed");
	};

	_UIDialog.remove = function () {

	};

	_UIDialog.isOpen = function () {
		return this.$el.is(".show-dialog");
	};

	// ====================================================
	// 模块，异步加载
	// _UIDialog.load = function (pathname, params, callback) {
	// 	if (Utils.isBlank(pathname))
	// 		return ;

	// 	var self = this;
	// 	if (params)
 //            pathname += (pathname.indexOf("?") < 0 ? "?" : "&") + $.param(params);

	// 	VRender.require(pathname, function (err, ret) {
	// 		self.setContent(err ? (err.msg || err) : ret);

	// 		var contentView = self.$el.find(".dialog-view > section").children();
	// 		if (contentView && contentView.length > 0) {
	// 			contentView.on("submit submit_to_dialog", function (e, data) {
	// 				self.trigger("view_submit", data);
	// 				self.close();
	// 			});
	// 			self.on("btnclick", function (e, name, btn) {
	// 				contentView.trigger(("dialog_" + name), self, btn);
	// 				if (["cancel", "close"].indexOf(name) >= 0) {
	// 					self.close();
	// 				}
	// 			});
	// 		}

	// 		if (Utils.isFunction(callback))
	// 			callback(err, ret);
	// 	});
	// };

	// ====================================================
	var closeBtnHandler = function (e) {
		this.close(true);
	};

	var buttonClickHandler = function (e) {
		var btn = $(e.currentTarget);
		if (this.hasListen("btnclick"))
			this.trigger("btnclick", btn.attr("name"), btn);
		else {
			if (this.$el.parent().is(".ui-dialog-wrap"))
				this.close();
		}
	};

	var windowResizeHandler = function () {
		if ($("body").find(this.$el).length > 0) {
			this.$el.find(".dialog-view").css("maxHeight", ($(window).height() - 50));
			return true;
		}
	};

	// ====================================================
	var checkOpenDialogs = function () {
		var body = $("body");
		for (var i = openedDialogs.length - 1; i >= 0; i--) {
			var dialog = openedDialogs[i];
			if (!dialog.isOpen() || body.find(dialog.$el).length == 0)
				openedDialogs.splice(i, 1);
		}
		if (openedDialogs.length == 0) {
			body.children(".ui-dialog-mask").remove();
		}
	};

	// ====================================================
	Component.register(".ui-dialog", UIDialog);

})();
